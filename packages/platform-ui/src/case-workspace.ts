export interface CaseWorkspaceView { id: string; title: string; status: string; summary?: string; evidenceCount: number; timelineCount: number; confidence?: number; }
export function buildCaseWorkspace(input: Record<string, unknown>): CaseWorkspaceView {
  return { id: String(input.id ?? ''), title: String(input.title ?? input.name ?? 'Untitled case'), status: String(input.status ?? 'unknown'), summary: input.summary == null ? undefined : String(input.summary), evidenceCount: Number(input.evidenceCount ?? 0), timelineCount: Number(input.timelineCount ?? 0), confidence: input.confidence == null ? undefined : Number(input.confidence) };
}
