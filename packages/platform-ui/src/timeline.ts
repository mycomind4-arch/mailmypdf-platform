export interface TimelineItem { id: string; at: string; title: string; description?: string; status?: string; sourceRefs?: string[]; }
export function buildTimeline(input: unknown): TimelineItem[] {
  if (!Array.isArray(input)) return [];
  return input.map((x: any, i) => ({ id: String(x.id ?? i), at: String(x.at ?? x.timestamp ?? ''), title: String(x.title ?? x.name ?? 'Event'), description: x.description == null ? undefined : String(x.description), status: x.status == null ? undefined : String(x.status), sourceRefs: Array.isArray(x.sourceRefs) ? x.sourceRefs.map(String) : undefined })).sort((a,b) => a.at.localeCompare(b.at));
}
