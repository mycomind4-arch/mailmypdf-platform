import type { AgentExecutor, AgentTask, AgentResult } from './index.js';
import { ToolRegistry } from './tools.js';
import { ToolExecutor } from './tool-executor.js';

export interface SmokeReport {
  planned: boolean;
  agentSucceeded: boolean;
  toolSucceeded: boolean;
  fulfillmentAllowed: boolean;
}

/**
 * Deterministic local smoke harness for CI. It deliberately uses in-memory
 * adapters; live provider configuration is validated separately at deploy time.
 */
export async function runProductionSmoke(): Promise<SmokeReport> {
  const task: AgentTask<{ caseId: string }> = {
    id: 'smoke-task', role: 'case-agent', objective: 'inspect case',
    modelClass: 'REASONING', input: { caseId: 'smoke-case' }, maxAttempts: 1,
  };
  const executor: AgentExecutor = {
    async execute<I, O>(t: AgentTask<I>): Promise<AgentResult<O>> {
      return { taskId: t.id, status: 'succeeded', output: { ok: true } as O, confidence: 1, evidence: ['smoke:evidence'] };
    },
  };
  const result = await executor.execute(task);
  const registry = new ToolRegistry();
  registry.register({
    name: 'smoke.inspect', description: 'CI smoke tool', inputSchema: { type: 'object' },
    risk: 'low', requiresApproval: false, reversible: true, idempotent: true,
    execute: async () => ({ ok: true }),
  });
  const tool = new ToolExecutor(registry);
  const toolResult = await tool.execute('smoke.inspect', {}, { idempotencyKey: 'smoke-1' });
  return {
    planned: true,
    agentSucceeded: result.status === 'succeeded',
    toolSucceeded: toolResult.status === 'succeeded',
    fulfillmentAllowed: result.status === 'succeeded' && toolResult.status === 'succeeded',
  };
}
