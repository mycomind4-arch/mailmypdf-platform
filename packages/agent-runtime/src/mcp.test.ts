import test from 'node:test';
import assert from 'node:assert/strict';
import { listMcpTools, mcpError, mcpSuccess, toMcpTool } from './mcp.js';
import { ToolRegistry } from './tools.js';

test('projects a governed tool to MCP metadata', () => {
  const tool = {
    name: 'case.inspect',
    description: 'Inspect a case',
    inputSchema: { type: 'object' },
    risk: 'low' as const,
    requiresApproval: false,
    reversible: true,
    idempotent: true,
    execute: async () => ({ ok: true }),
  };
  assert.deepEqual(toMcpTool(tool), {
    name: 'case.inspect',
    description: 'Inspect a case',
    inputSchema: { type: 'object' },
  });
});

test('lists registered tools', () => {
  const registry = new ToolRegistry();
  registry.register({
    name: 'case.inspect', description: 'Inspect', inputSchema: { type: 'object' },
    risk: 'low', requiresApproval: false, reversible: true, idempotent: true,
    execute: async () => ({ ok: true }),
  });
  assert.equal(listMcpTools(registry).length, 1);
});

test('formats MCP success and error results', () => {
  assert.deepEqual(mcpSuccess({ ok: true }), { content: [{ type: 'text', text: '{"ok":true}' }] });
  assert.deepEqual(mcpError('denied'), { content: [{ type: 'text', text: 'denied' }], isError: true });
});
