/**
 * Document integrity — SHA-256 attestation for documents that cross
 * the approval boundary.
 *
 * Every document that enters fulfillment must have:
 *   - A SHA-256 hash computed at approval time
 *   - The hash stored on the case record and audit event
 *   - The hash verified before fulfillment submission
 *
 * This prevents silent document substitution between approval and mailing.
 */

export interface ApprovedDocument {
  bytes: Uint8Array;
  contentType: "application/pdf";
  fileName: string;
}

export interface DocumentIntegrity {
  sha256: string;
  byteLength: number;
  contentType: "application/pdf";
  fileName: string;
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest), (v) => v.toString(16).padStart(2, "0")).join("");
}

export async function attestDocument(document: ApprovedDocument): Promise<DocumentIntegrity> {
  if (document.contentType !== "application/pdf") {
    throw new Error("Only PDF documents may enter the fulfillment boundary.");
  }
  if (!document.fileName.toLowerCase().endsWith(".pdf")) {
    throw new Error("Approved document filename must end with .pdf.");
  }
  if (!document.bytes.byteLength) {
    throw new Error("Approved document cannot be empty.");
  }
  return {
    sha256: await sha256Hex(document.bytes),
    byteLength: document.bytes.byteLength,
    contentType: document.contentType,
    fileName: document.fileName,
  };
}

export function buildFulfillmentMetadata(integrity: DocumentIntegrity) {
  return {
    documentHash: integrity.sha256,
    documentBytes: integrity.byteLength,
    contentType: integrity.contentType,
    fileName: integrity.fileName,
  };
}

export async function verifyDocumentIntegrity(
  bytes: Uint8Array,
  expectedHash: string,
): Promise<boolean> {
  const actualHash = await sha256Hex(bytes);
  if (actualHash.length !== expectedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < actualHash.length; i++) {
    mismatch |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return mismatch === 0;
}
