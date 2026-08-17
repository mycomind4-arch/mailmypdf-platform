export interface DocumentExtractionRequest { documentId: string; filename: string; contentType: string; content: ArrayBuffer | Uint8Array<ArrayBufferLike> }
export interface ExtractedDocument { documentId: string; [key: string]: unknown }
export interface DoclingConfig { endpoint: string; bearerToken?: string; timeoutMs: number }
export class DoclingAdapter {
  constructor(private readonly config: DoclingConfig) {
    if (!config.endpoint.startsWith('https://')) throw new Error('Docling endpoint must use HTTPS');
    if (!Number.isFinite(config.timeoutMs) || config.timeoutMs <= 0 || config.timeoutMs > 120_000) throw new Error('Docling timeout must be between 1ms and 120000ms');
  }
  async extract(request: DocumentExtractionRequest): Promise<ExtractedDocument> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const form = new FormData();
      const bytes = request.content instanceof ArrayBuffer ? new Uint8Array(request.content) : new Uint8Array(request.content);
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      form.append('file', new Blob([buffer], { type: request.contentType }), request.filename);
      form.append('document_id', request.documentId);
      const headers: Record<string, string> = {};
      if (this.config.bearerToken) headers.Authorization = `Bearer ${this.config.bearerToken}`;
      const response = await fetch(this.config.endpoint, {method:'POST',headers,body:form,signal:controller.signal});
      if (!response.ok) throw new Error(`Docling extraction failed: ${response.status}`);
      return await response.json() as ExtractedDocument;
    } finally { clearTimeout(timeout); }
  }
}
