import type { Confidence, PlatformId } from "@mailmypdf/core";

export type DocumentKind = "unknown" | "notice" | "decision" | "correspondence" | "evidence" | "form" | "receipt" | "other";

export interface DocumentProvenance {
  sourceId: PlatformId;
  sourceType: "upload" | "mailing" | "user-entry" | "external";
  page?: number;
  locator?: string;
}

export interface DocumentRecord {
  id: PlatformId;
  name: string;
  kind: DocumentKind;
  mimeType: string;
  sha256?: string;
  extractedText?: string;
  confidence?: Confidence;
  provenance?: DocumentProvenance;
  createdAt: string;
}
