/**
 * @mailmypdf/documents — Reusable document abstraction with security boundaries.
 *
 * Documents are treated as untrusted input. This package defines the
 * canonical document model, lifecycle, security validation contract,
 * and extraction interface.
 *
 * The platform owns the model. Verticals own the extraction implementations.
 */

import type {
  Confidence,
  PlatformId,
  ValidationResult,
  ValidationError,
} from "@mailmypdf/core";
import { confidence, ok, err, validateRange, validateNonEmpty, validateOneOf, validateMaxLength } from "@mailmypdf/core";

// ── Document Kinds ─────────────────────────────────────────────────────────────

export type DocumentKind =
  | "unknown"
  | "notice"
  | "decision"
  | "correspondence"
  | "evidence"
  | "form"
  | "receipt"
  | "contract"
  | "identification"
  | "other";

export const ALL_DOCUMENT_KINDS: readonly DocumentKind[] = [
  "unknown", "notice", "decision", "correspondence", "evidence",
  "form", "receipt", "contract", "identification", "other",
] as const;

// ── Document Lifecycle ────────────────────────────────────────────────────────

export type DocumentStatus =
  | "uploaded"
  | "validating"
  | "processing"
  | "extracted"
  | "analyzed"
  | "ready"
  | "failed";

export const DOCUMENT_TRANSITIONS: Readonly<Record<DocumentStatus, readonly DocumentStatus[]>> = {
  uploaded:    ["validating", "failed"],
  validating:  ["processing", "failed"],
  processing:  ["extracted", "failed"],
  extracted:   ["analyzed", "ready", "failed"],
  analyzed:    ["ready", "failed"],
  ready:       [],
  failed:      ["uploaded"],
} as const;

export function canTransition(from: DocumentStatus, to: DocumentStatus): boolean {
  return DOCUMENT_TRANSITIONS[from].includes(to);
}

export function transition(
  from: DocumentStatus,
  to: DocumentStatus,
): Result<DocumentStatus, ValidationError> {
  if (!canTransition(from, to)) {
    return err(new ValidationError(
      `Invalid document transition: ${from} → ${to}`,
      { from, to, allowed: DOCUMENT_TRANSITIONS[from] },
    ));
  }
  return ok(to);
}

// ── MIME Type Security ────────────────────────────────────────────────────────

export const ALLOWED_MIME_TYPES: readonly string[] = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/tiff",
  "text/plain",
] as const;

export const DANGEROUS_MIME_TYPES: readonly string[] = [
  "application/javascript",
  "text/javascript",
  "application/x-javascript",
  "application/x-executable",
  "application/x-msdos-program",
  "application/x-sh",
  "application/x-bat",
  "text/html",
] as const;

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

export function isDangerousMimeType(mimeType: string): boolean {
  return DANGEROUS_MIME_TYPES.includes(mimeType);
}

// ── PDF Security Tokens ───────────────────────────────────────────────────────

export const FORBIDDEN_PDF_TOKENS: readonly string[] = [
  "/JavaScript",
  "/JS",
  "/Launch",
  "/OpenAction",
  "/RichMedia",
  "/EmbeddedFile",
  "/EmbeddedFiles",
  "/SubmitForm",
  "/ImportData",
  "/GoToE",
] as const;

export const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_PAGES = 10;
export const MAX_FILENAME_LENGTH = 255;

// ── Document Provenance ───────────────────────────────────────────────────────

export type ProvenanceSourceType = "upload" | "mailing" | "user-entry" | "external" | "generated";

export interface DocumentProvenance {
  readonly sourceId: PlatformId;
  readonly sourceType: ProvenanceSourceType;
  readonly uploadedAt: string;
  readonly uploadedBy?: string | undefined;
  readonly originalFilename?: string | undefined;
  readonly sourceUrl?: string | undefined;
}

// ── Page-Level Metadata ───────────────────────────────────────────────────────

export interface PageMetadata {
  readonly pageNumber: number;
  readonly text?: string | undefined;
  readonly width?: number | undefined;
  readonly height?: number | undefined;
}

// ── Document Record ───────────────────────────────────────────────────────────

export interface DocumentRecord {
  readonly id: PlatformId;
  readonly name: string;
  readonly kind: DocumentKind;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly sha256?: string | undefined;
  readonly pageCount?: number | undefined;
  readonly status: DocumentStatus;
  readonly extractedText?: string | undefined;
  readonly pages?: readonly PageMetadata[] | undefined;
  readonly provenance: DocumentProvenance;
  readonly metadata?: Record<string, unknown> | undefined;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ── Document Validation ───────────────────────────────────────────────────────

export interface DocumentValidationInput {
  readonly filename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly pageCount?: number | undefined;
  readonly content?: Uint8Array | undefined;
}

export function validateDocument(input: DocumentValidationInput): ValidationResult {
  // Filename
  const filenameCheck = validateNonEmpty(input.filename, "filename");
  if (!filenameCheck.ok) return filenameCheck;

  const filenameLenCheck = validateMaxLength(input.filename, "filename", MAX_FILENAME_LENGTH);
  if (!filenameLenCheck.ok) return filenameLenCheck;

  // MIME type
  const mimeCheck = validateNonEmpty(input.mimeType, "mimeType");
  if (!mimeCheck.ok) return mimeCheck;

  if (isDangerousMimeType(input.mimeType)) {
    return err(new ValidationError(
      `MIME type "${input.mimeType}" is not allowed — dangerous content type`,
      { mimeType: input.mimeType },
    ));
  }

  if (!isAllowedMimeType(input.mimeType)) {
    return err(new ValidationError(
      `MIME type "${input.mimeType}" is not supported`,
      { mimeType: input.mimeType, allowed: ALLOWED_MIME_TYPES },
    ));
  }

  // Size
  const sizeCheck = validateRange(input.sizeBytes, "sizeBytes", 1, MAX_PDF_BYTES);
  if (!sizeCheck.ok) return sizeCheck;

  // Pages (if provided)
  if (input.pageCount !== undefined) {
    const pageCheck = validateRange(input.pageCount, "pageCount", 1, MAX_PAGES);
    if (!pageCheck.ok) return pageCheck;
  }

  // PDF content scan for forbidden tokens
  if (input.mimeType === "application/pdf" && input.content) {
    const contentStr = new TextDecoder("latin1").decode(input.content);
    for (const token of FORBIDDEN_PDF_TOKENS) {
      if (contentStr.includes(token)) {
        return err(new ValidationError(
          `PDF contains forbidden token: ${token}`,
          { token },
        ));
      }
    }
    if (contentStr.includes("/Encrypt")) {
      return err(new ValidationError("Encrypted PDFs are not supported"));
    }
    if (!contentStr.startsWith("%PDF-")) {
      return err(new ValidationError("File does not have a valid PDF header"));
    }
    if (!contentStr.includes("%%EOF")) {
      return err(new ValidationError("PDF is missing its end-of-file marker"));
    }
  }

  return ok(undefined);
}

// ── Document Classification ───────────────────────────────────────────────────

export interface DocumentClassifier {
  classify(text: string, metadata?: Record<string, unknown>): Promise<DocumentKind>;
}

// ── Document Extractor Interface ──────────────────────────────────────────────

export interface DocumentExtractor {
  extract(document: DocumentRecord): Promise<ExtractionResult>;
}

export interface ExtractionResult {
  readonly text: string;
  readonly pages: readonly PageMetadata[];
  readonly confidence: Confidence;
  readonly warnings: readonly string[];
}

// ── Document Factory ──────────────────────────────────────────────────────────

export function createDocument(input: {
  id: PlatformId;
  name: string;
  kind: DocumentKind;
  mimeType: string;
  sizeBytes: number;
  sha256?: string | undefined;
  pageCount?: number | undefined;
  provenance: DocumentProvenance;
  metadata?: Record<string, unknown> | undefined;
}): DocumentRecord {
  const validation = validateDocument({
    filename: input.name,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    pageCount: input.pageCount,
  });
  if (!validation.ok) {
    throw validation.error;
  }

  const kindCheck = validateOneOf(input.kind, "kind", ALL_DOCUMENT_KINDS);
  if (!kindCheck.ok) throw kindCheck.error;

  const now = new Date().toISOString();
  return {
    id: input.id,
    name: input.name,
    kind: input.kind,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    sha256: input.sha256,
    pageCount: input.pageCount,
    status: "uploaded",
    provenance: input.provenance,
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  };
}

// ── Document Status Update ────────────────────────────────────────────────────

export function updateDocumentStatus(
  document: DocumentRecord,
  newStatus: DocumentStatus,
): Result<DocumentRecord, ValidationError> {
  const result = transition(document.status, newStatus);
  if (!result.ok) return result;
  return ok({
    ...document,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
}

// ── Re-export types from core ──────────────────────────────────────────────────

export type { Confidence, PlatformId, ValidationResult } from "@mailmypdf/core";
