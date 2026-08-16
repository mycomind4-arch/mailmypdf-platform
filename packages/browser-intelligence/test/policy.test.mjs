import test from "node:test";
import assert from "node:assert/strict";
import { assertBrowserBudget, assertBrowserUrlAllowed } from "../dist/index.js";

const policy = {
  allowedDomains: ["example.com"],
  maxActions: 3,
  timeoutMs: 10_000,
  maxDownloads: 0,
  allowPrivateNetwork: false,
  requireApprovalFor: ["consequential"],
};

test("allows an explicitly allowlisted HTTPS origin", () => {
  assert.doesNotThrow(() => assertBrowserUrlAllowed("https://example.com/path", policy));
  assert.doesNotThrow(() => assertBrowserUrlAllowed("https://portal.example.com", policy));
});

test("rejects HTTP and non-allowlisted destinations", () => {
  assert.throws(() => assertBrowserUrlAllowed("http://example.com", policy), /HTTPS/);
  assert.throws(() => assertBrowserUrlAllowed("https://evil.example", policy), /allowlisted/);
});

test("rejects local destinations", () => {
  assert.throws(() => assertBrowserUrlAllowed("https://localhost:8443", policy), /local/);
  assert.throws(() => assertBrowserUrlAllowed("https://service.local", policy), /local/);
});

test("enforces the action budget", () => {
  assert.doesNotThrow(() => assertBrowserBudget(2, policy));
  assert.throws(() => assertBrowserBudget(3, policy), /budget/);
});
