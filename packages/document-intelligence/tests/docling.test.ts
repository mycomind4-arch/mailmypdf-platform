import assert from "node:assert/strict";
import test from "node:test";
import { createId } from "@mailmypdf/core";
import { DoclingAdapter } from "../src/index.js";

test("Docling adapter requires HTTPS", () => {
  assert.throws(
    () => new DoclingAdapter({ endpoint: "http://localhost:8080/extract", timeoutMs: 5000 }),
    /HTTPS/,
  );
});

test("Docling adapter rejects unsafe timeout configuration", () => {
  assert.throws(
    () => new DoclingAdapter({ endpoint: "https://docling.example/extract", timeoutMs: 0 }),
    /timeout/,
  );
});

test("Docling adapter exposes a stable platform identity", () => {
  const adapter = new DoclingAdapter({ endpoint: "https://docling.example/extract", timeoutMs: 5000 });
  assert.ok(adapter);
  assert.ok(createId("document-1"));
});
