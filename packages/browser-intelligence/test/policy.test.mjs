import test from "node:test";
import assert from "node:assert/strict";
import { assertBrowserBudget, assertBrowserUrlAllowed, requiresApproval, validateBrowserPolicy } from "../dist/index.js";

const policy = { allowedDomains: ["example.com"], maxActions: 3, timeoutMs: 10_000, maxDownloads: 1, allowPrivateNetwork: false, requireApprovalFor: ["consequential"] };

test("allows an explicitly allowlisted HTTPS origin", () => {
  assert.doesNotThrow(() => assertBrowserUrlAllowed("https://example.com/path", policy));
  assert.doesNotThrow(() => assertBrowserUrlAllowed("https://portal.example.com", policy));
});

test("rejects HTTP and non-allowlisted destinations", () => {
  assert.throws(() => assertBrowserUrlAllowed("http://example.com", policy), /HTTPS/);
  assert.throws(() => assertBrowserUrlAllowed("https://evil.example", policy), /allowlisted/);
});

test("rejects local and private destinations", () => {
  assert.throws(() => assertBrowserUrlAllowed("https://localhost:8443", { ...policy, allowedDomains: ["localhost"] }), /local/);
  assert.throws(() => assertBrowserUrlAllowed("https://service.local", { ...policy, allowedDomains: ["service.local"] }), /local/);
  assert.throws(() => assertBrowserUrlAllowed("https://db.internal", { ...policy, allowedDomains: ["db.internal"] }), /private/);
});

test("enforces the action budget", () => {
  assert.doesNotThrow(() => assertBrowserBudget(2, policy));
  assert.throws(() => assertBrowserBudget(3, policy), /budget/);
});

test("requires approval for consequential actions", () => {
  assert.equal(requiresApproval("read", policy), false);
  assert.equal(requiresApproval("consequential", policy), true);
});

test("rejects unsafe policy configuration", () => {
  assert.throws(() => validateBrowserPolicy({ ...policy, maxActions: 0 }), /maxActions/);
  assert.throws(() => validateBrowserPolicy({ ...policy, timeoutMs: 0 }), /timeoutMs/);
  assert.throws(() => validateBrowserPolicy({ ...policy, allowedDomains: ["https://example.com"] }), /domain/);
  assert.throws(() => validateBrowserPolicy({ ...policy, allowPrivateNetwork: true }), /private network/);
});
