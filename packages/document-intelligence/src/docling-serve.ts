import type { PlatformId } from "@mailmypdf/core";
import type { DocumentKind, PageMetadata, SourceRef } from "@mailmypdf/documents";
import type {
  DocumentExtractionRequest,
  DocumentIntelligenceProvider,
  ExtractedDocument,
  ExtractedTable,
} from "./index.js";

export interface DoclingServeConfig {
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly timeoutMs?: number;
  readonly doOcr?: boolean;
  readonly tableMode?: "fast" | "accurate";
}

interface DoclingResponse {
  readonly document?: {
    readonly text_content?: unknown;
    readonly md_content?: unknown;
    readonly json_content?: unknown;
  };
  readonly status?: unknown;
  readonly errors?: unknown;
  readonly processing_time?: unknown;
}

/**
 * Native adapter for the open-source docling-serve REST API.
 *
 * The platform keeps its own extraction contract; this adapter translates
 * Docling's native response into that contract. No Docling dependency is
 * imported into the TypeScript runtime.
 */
export class DoclingServeProvider implements DocumentIntelligenceProvider {
  readonly name = "docling-serve";
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: DoclingServeConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.timeoutMs = config.timeoutMs ?? 120_000;

    if (!/^https:\/\//.test(this.baseUrl)) {
      throw new Error("Docling service URL must use HTTPS");
    }
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0 || this.timeoutMs > 120_000) {
      throw new Error("Docling service timeout must be between 1ms and 120000ms");
    }
  }

  async extract(request: DocumentExtractionRequest): Promise<ExtractedDocument> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const body = {
        file_sources: [{
          base64_string: toBase64(request.content),
          filename: request.filename,
        }],
        options: {
          do_ocr: this.config.doOcr ?? true,
          table_mode: this.config.tableMode ?? "accurate",
          to_formats: ["text", "json"],
        },
      };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (this.config.apiKey) headers["X-Api-Key"] = this.config.apiKey;

      const response = await fetch(`${this.baseUrl}/v1/convert/source`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => ({})) as DoclingResponse;
      if (!response.ok) {
        throw new Error(`Docling Serve extraction failed with HTTP ${response.status}`);
      }
      if (payload.status === "failure") {
        throw new Error(`Docling Serve extraction failed: ${stringifyErrors(payload.errors)}`);
      }

      const document = payload.document ?? {};
      const text = firstString(document.text_content, document.md_content);
      if (!text) throw new Error("Docling Serve returned no extracted text");

      const pages = extractPages(document.json_content, request.documentId, request.filename);
      const tables = extractTables(document.json_content);
      const sourceRefs: SourceRef[] = pages.map((page) => ({
        documentId: request.documentId,
        documentName: request.filename,
        page: page.pageNumber,
        excerpt: page.text,
      }));

      return {
        documentId: request.documentId,
        kind: inferDocumentKind(text),
        text,
        pages,
        tables,
        sourceRefs,
        warnings: payload.status === "partial_success" ? ["Docling reported a partial conversion"] : [],
        metadata: {
          provider: "docling-serve",
          status: payload.status ?? "success",
          processingTimeSeconds: payload.processing_time,
        },
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function firstString(...values: unknown[]): string {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim() ?? "";
}

function stringifyErrors(errors: unknown): string {
  if (Array.isArray(errors)) return errors.map(String).join("; ");
  return typeof errors === "string" ? errors : "unknown conversion error";
}

function inferDocumentKind(text: string): DocumentKind {
  const sample = text.slice(0, 8000).toLowerCase();
  if (/\bnotice of (violation|hearing|determination)|official notice\b/.test(sample)) return "notice";
  if (/\bdecision|final determination|order of\b/.test(sample)) return "decision";
  if (/\bcontract|agreement between|terms and conditions\b/.test(sample)) return "contract";
  if (/\bapplication|application form|form number\b/.test(sample)) return "form";
  if (/\breceipt|transaction receipt|payment receipt\b/.test(sample)) return "receipt";
  if (/\bdear |sincerely,|to whom it may concern\b/.test(sample)) return "correspondence";
  return "unknown";
}

function extractPages(value: unknown, documentId: PlatformId, filename: string): PageMetadata[] {
  if (!value || typeof value !== "object") return [];
  const root = value as Record<string, unknown>;
  const candidate = root.pages;
  if (!Array.isArray(candidate)) return [];

  return candidate.flatMap((page, index) => {
    if (!page || typeof page !== "object") return [];
    const item = page as Record<string, unknown>;
    const text = firstString(item.text, item.text_content, item.md_content);
    return [{ pageNumber: index + 1, text }];
  });
}

function extractTables(value: unknown): ExtractedTable[] {
  const found: ExtractedTable[] = [];
  walk(value, (node) => {
    if (!node || typeof node !== "object") return;
    const item = node as Record<string, unknown>;
    const rows = Array.isArray(item.rows) ? item.rows : undefined;
    if (!rows || rows.length === 0) return;
    const normalized = rows
      .filter(Array.isArray)
      .map((row) => row.map((cell) => typeof cell === "string" ? cell : JSON.stringify(cell)));
    if (normalized.length === 0) return;
    found.push({
      id: `table-${found.length + 1}`,
      page: typeof item.page === "number" ? item.page : undefined,
      headers: normalized[0] ?? [],
      rows: normalized.slice(1),
    });
  });
  return found;
}

function walk(value: unknown, visit: (value: unknown) => void): void {
  visit(value);
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) walk(item, visit);
  }
}
