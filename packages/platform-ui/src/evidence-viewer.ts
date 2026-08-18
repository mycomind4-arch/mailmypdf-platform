export interface EvidenceItem { id: string; label: string; sourceRef?: string; status: 'verified' | 'conflict' | 'unverified'; excerpt?: string; }
export function buildEvidenceItems(input: unknown): EvidenceItem[] {
  if (!Array.isArray(input)) return [];
  return input.map((x: any, i) => ({ id: String(x.id ?? i), label: String(x.label ?? x.name ?? 'Evidence'), sourceRef: x.sourceRef == null ? undefined : String(x.sourceRef), status: x.status === 'conflict' || x.status === 'unverified' ? x.status : 'verified', excerpt: x.excerpt == null ? undefined : String(x.excerpt) }));
}
