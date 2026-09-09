import type { ToolContext, ToolDefinition, ToolRegistry, ToolRisk } from './tools.js'

/**
 * Minimal Model Context Protocol adapter boundary.
 *
 * MCP remains a transport concern: domain packages depend on platform tool
 * contracts, while this adapter translates remote MCP tools into governed
 * ToolDefinitions. Remote tools default to HIGH risk and require approval
 * unless an explicit local policy says otherwise.
 */
export interface McpToolDescriptor {
  name: string
  description?: string
  inputSchema?: unknown
}

export interface McpCallContext {
  runId: string
  caseId?: string
  actorId?: string
  signal?: AbortSignal
}

export interface McpTransport {
  listTools(): Promise<readonly McpToolDescriptor[]>
  callTool(name: string, input: unknown, context: McpCallContext): Promise<unknown>
}

export interface McpToolPolicy {
  risk?: ToolRisk
  requiresApproval?: boolean
  reversible?: boolean
  idempotent?: boolean
}

export type McpToolPolicyResolver = (tool: McpToolDescriptor) => McpToolPolicy

function toMcpContext(context: ToolContext): McpCallContext {
  return {
    runId: context.runId,
    ...(context.caseId !== undefined ? { caseId: context.caseId } : {}),
    ...(context.actorId !== undefined ? { actorId: context.actorId } : {}),
    ...(context.signal !== undefined ? { signal: context.signal } : {}),
  }
}

export function createMcpToolDefinition(
  transport: McpTransport,
  descriptor: McpToolDescriptor,
  policy: McpToolPolicy = {},
): ToolDefinition<unknown, unknown> {
  if (!descriptor.name.trim()) throw new Error('MCP tool name is required')
  return {
    name: descriptor.name,
    description: descriptor.description?.trim() || `Remote MCP tool: ${descriptor.name}`,
    risk: policy.risk ?? 'HIGH',
    requiresApproval: policy.requiresApproval ?? true,
    reversible: policy.reversible ?? false,
    idempotent: policy.idempotent ?? false,
    ...(descriptor.inputSchema !== undefined ? { inputSchema: descriptor.inputSchema } : {}),
    execute(input, context) {
      return transport.callTool(descriptor.name, input, toMcpContext(context))
    },
  }
}

export async function registerMcpTools(
  registry: ToolRegistry,
  transport: McpTransport,
  resolvePolicy: McpToolPolicyResolver = () => ({}),
): Promise<string[]> {
  const descriptors = await transport.listTools()
  const registered: string[] = []
  for (const descriptor of descriptors) {
    registry.register(createMcpToolDefinition(transport, descriptor, resolvePolicy(descriptor)))
    registered.push(descriptor.name)
  }
  return registered
}
