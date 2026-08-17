/**
 * MCP adapter boundary.
 *
 * The platform owns ToolDefinition/ToolRegistry. MCP is only a transport
 * adapter, so vendor-specific protocol concerns do not leak into domain code.
 */
import type { ToolDefinition, ToolRegistry } from './tools.js';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export function toMcpTool(tool: ToolDefinition): McpTool {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema as Record<string, unknown>,
  };
}

export function listMcpTools(registry: ToolRegistry): McpTool[] {
  return registry.list().map(toMcpTool);
}

export function mcpSuccess(value: unknown): McpToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(value) }] };
}

export function mcpError(message: string): McpToolResult {
  return { content: [{ type: 'text', text: message }], isError: true };
}
