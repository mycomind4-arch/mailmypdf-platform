import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { signWebhook, verifyWebhook, processFulfillmentWebhook, type FulfillmentWebhookPayload } from "../src/webhook-verification.js";

const SECRET = "test-secret-key";

describe("webhook verification", () => {
  test("signs and verifies a webhook", async () => {
    const body = JSON.stringify({ eventId: "evt_1", caseId: "case_1", status: "delivered" });
    const signature = await signWebhook(SECRET, body);
    assert.equal(await verifyWebhook(SECRET, body, signature), true);
  });

  test("rejects tampered body", async () => {
    const body = JSON.stringify({ eventId: "evt_1", caseId: "case_1", status: "delivered" });
    const signature = await signWebhook(SECRET, body);
    const tampered = JSON.stringify({ eventId: "evt_1", caseId: "case_1", status: "failed" });
    assert.equal(await verifyWebhook(SECRET, tampered, signature), false);
  });

  test("rejects wrong secret", async () => {
    const body = "test body";
    const signature = await signWebhook(SECRET, body);
    assert.equal(await verifyWebhook("wrong-secret", body, signature), false);
  });

  test("rejects empty secret or signature", async () => {
    assert.equal(await verifyWebhook("", "body", "sig"), false);
    assert.equal(await verifyWebhook(SECRET, "body", ""), false);
  });

  test("processes a valid webhook", async () => {
    const payload: FulfillmentWebhookPayload = {
      eventId: "evt_123", caseId: "case_456", status: "delivered", trackingNumber: "TRACK123",
    };
    const body = JSON.stringify(payload);
    const signature = await signWebhook(SECRET, body);
    const processed = new Set<string>();
    const result = await processFulfillmentWebhook(SECRET, body, signature, processed);
    assert.equal(result.verified, true);
    if (result.verified) assert.equal(result.payload.eventId, "evt_123");
  });

  test("deduplicates already-processed events", async () => {
    const payload: FulfillmentWebhookPayload = { eventId: "evt_dup", caseId: "case_1", status: "delivered" };
    const body = JSON.stringify(payload);
    const signature = await signWebhook(SECRET, body);
    const processed = new Set<string>(["evt_dup"]);
    const result = await processFulfillmentWebhook(SECRET, body, signature, processed);
    assert.equal(result.verified, false);
  });
});
