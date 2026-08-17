import type { PlatformId } from "@mailmypdf/core";
import type { DocumentKind, PageMetadata, SourceRef } from "@mailmypdf/documents";

export interface DocumentExtractionRequest { readonly documentId: PlatformId; readonly contentType: string; readonly content: Uint8Array; readonly filename: string; }
export interface ExtractedTable { readonly id: string; readonly page?: number; readonly headers: readonly string[]; readonly rows: readonly (readonly string[])[]; }
export interface ExtractedDocument { readonly documentId: PlatformId; readonly kind: DocumentKind; readonly text: string; readonly pages: readonly PageMetadata[]; readonly tables: readonly ExtractedTable[]; readonly sourceRefs: readonly SourceRef[]; readonly warnings: readonly string[]; readonly metadata: Readonly<Record<string, unknown>>; }
export interface DocumentIntelligenceProvider { readonly name: string; extract(request: DocumentExtractionRequest): Promise<ExtractedDocument>; }
export interface DoclingProviderConfig { readonly endpoint: string; readonly timeoutMs: number; readonly bearerToken?: string; }
export class DoclingHttpProvider implements DocumentIntelligenceProvider {
  readonly name = "docling";
  constructor(private readonly config: DoclingProviderConfig) {
    if (!config.endpoint.startsWith("https://")) throw new Error("Docling endpoint must use HTTPS");
    if (!Number.isFinite(config.timeoutMs) || config.timeoutMs <= 0 || config.timeoutMs > 120_000) throw new Error("Docling timeout must be between 1ms and 120000ms");
  }
  async extract(request: DocumentExtractionRequest): Promise<ExtractedDocument> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const form = new FormData();
      const bytes = new Uint8Array(request.content.byteLength);
      bytes.set(request.content);
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      form.append("file", new Blob([buffer], { type: request.contentType }), request.filename);
      form.append("document_id", request.documentId);
      const headers: Record<string, string> = {};
      if (this.config.bearerToken) headers.Authorization = `Bearer ${this.config.bearerToken}`;
      const response = await fetch(this.config.endpoint, { method: "POST", headers, body: form, signal: controller.signal });
      if (!response.ok) throw new Error(`Docling extraction failed with HTTP ${response.status}`);
      const payload = await response.json() as Partial<ExtractedDocument>;
      if (payload.documentId !== request.documentId || typeof payload.text !== "string") throw new Error("Docling response failed platform schema validation");
      return { documentId: payload.documentId, kind: payload.kind ?? "unknown", text: payload.text, pages: payload.pages ?? [], tables: payload.tables ?? [], sourceRefs: payload.sourceRefs ?? [], warnings: payload.warnings ?? [], metadata: payload.metadata ?? {} };
    } finally { clearTimeout(timeout); }
  }
}
