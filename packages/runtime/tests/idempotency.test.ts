import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createMemoryIdempotencyStore, withIdempotency, fulfillmentKey, webhookKey, paymentKey } from "../src/idempotency.js";

describe("idempotency", () => {
  test("runs a function once and caches the result", async () => {
    const store = createMemoryIdempotencyStore();
    let callCount = 0;
    const fn = async () => { callCount++; return { ok: true }; };
    const result = await withIdempotency(store, "test-key", fn);
    assert.deepEqual(result, { ok: true });
    assert.equal(callCount, 1);
  });

  test("generates canonical keys", () => {
    assert.equal(fulfillmentKey("case_1" as any), "fulfillment:case_1");
    assert.equal(webhookKey("evt_123"), "webhook:evt_123");
    assert.equal(paymentKey("case_1" as any), "payment:case_1");
  });
});
