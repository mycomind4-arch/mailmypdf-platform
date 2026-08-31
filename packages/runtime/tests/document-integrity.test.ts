import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { attestDocument, verifyDocumentIntegrity, sha256Hex, type ApprovedDocument } from "../src/document-integrity.js";

describe("document integrity", () => {
  test("attests a valid PDF document", async () => {
    const doc: ApprovedDocument = {
      bytes: new TextEncoder().encode("%PDF-1.4 test content"),
      contentType: "application/pdf",
      fileName: "test.pdf",
    };
    const integrity = await attestDocument(doc);
    assert.equal(integrity.sha256.length, 64);
    assert.equal(integrity.byteLength, doc.bytes.byteLength);
    assert.equal(integrity.contentType, "application/pdf");
    assert.equal(integrity.fileName, "test.pdf");
  });

  test("rejects non-PDF content types", async () => {
    const doc = { bytes: new Uint8Array(1), contentType: "text/plain" as const, fileName: "test.txt" };
    await assert.rejects(() => attestDocument(doc as any));
  });

  test("rejects non-.pdf filenames", async () => {
    const doc: ApprovedDocument = { bytes: new Uint8Array(1), contentType: "application/pdf", fileName: "test.txt" };
    await assert.rejects(() => attestDocument(doc));
  });

  test("rejects empty documents", async () => {
    const doc: ApprovedDocument = { bytes: new Uint8Array(0), contentType: "application/pdf", fileName: "empty.pdf" };
    await assert.rejects(() => attestDocument(doc));
  });

  test("verifies matching hash", async () => {
    const bytes = new TextEncoder().encode("test content");
    const hash = await sha256Hex(bytes);
    assert.equal(await verifyDocumentIntegrity(bytes, hash), true);
  });

  test("detects tampered content", async () => {
    const original = new TextEncoder().encode("original content");
    const tampered = new TextEncoder().encode("tampered content");
    const hash = await sha256Hex(original);
    assert.equal(await verifyDocumentIntegrity(tampered, hash), false);
  });
});
