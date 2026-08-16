import test from "node:test";
import assert from "node:assert/strict";
import { requiresApproval, validateBrowserPolicy } from "../dist/index.js";

const valid = {
  allowedDomains: ["example.gov"],
  maxActions: 10,
  timeoutMs: 30_000,
  maxDownloads: 1,
  allowPrivateNetwork: false,
  requireApprovalFor: ["consequential"],
};

test("accepts a bounded policy", () => {
  assert.doesNotThrow(() => validateBrowserPolicy(valid));
});

test("requires approval for consequential actions", () => {
  assert.equal(requiresApproval("read", valid), false);
  assert.equal(requiresApproval("consequential", valid), true);
});

test("rejects unbounded or unsafe policy values", () => {
  assert.throws(() => validateBrowserPolicy({ ...valid, maxActions: 0 }), /maxActions/);
  assert.throws(() => validateBrowserPolicy({ ...valid, timeoutMs: 0 }), /timeoutMs/);
  assert.throws(() => validateBrowserPolicy({ ...valid, allowPrivateNetwork: true }), /private network/);
  assert.throws(() => validateBrowserPolicy({ ...valid, allowedDomains: ["https://example.gov"] }), /domain/);
});
