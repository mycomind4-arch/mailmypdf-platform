export interface AgentInspectorStep { id: string; kind: string; name: string; status: string; durationMs?: number; error?: string; }
export interface AgentInspectorView { runId: string; status: string; traceId?: string; steps: AgentInspectorStep[]; }
export function buildAgentInspector(input: Record<string, unknown>): AgentInspectorView {
  const raw = Array.isArray(input.steps) ? input.steps : [];
  return { runId: String(input.runId ?? input.id ?? ''), status: String(input.status ?? 'unknown'), traceId: input.traceId == null ? undefined : String(input.traceId), steps: raw.map((s: any, i) => ({ id: String(s.id ?? i), kind: String(s.kind ?? 'step'), name: String(s.name ?? 'Unnamed step'), status: String(s.status ?? 'unknown'), durationMs: s.durationMs == null ? undefined : Number(s.durationMs), error: s.error == null ? undefined : String(s.error) })) };
}
