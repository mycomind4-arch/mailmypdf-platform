/**
 * Webhook verification — HMAC-SHA256 signing and verification for
 * fulfillment provider callbacks.
 *
 * Centralizes:
 *   - Signature computation (HMAC-SHA256)
 *   - Constant-time comparison (timing-attack safe)
 *   - Event deduplication (prevent processing the same webhook twice)
 *
 * Every fulfillment callback must pass verification before the system
 * updates case state.
 */

export interface FulfillmentWebhookPayload {
  eventId: string;
  caseId: string;
  status: "delivered" | "failed" | "returned" | "in_transit" | "unknown";
  trackingNumber?: string | undefined;
  proofId?: string | undefined;
  occurredAt?: string | undefined;
  payload?: Record<string, unknown> | undefined;
}

export interface VerifiedWebhook {
  payload: FulfillmentWebhookPayload;
  signature: string;
  verified: true;
}

export interface RejectedWebhook {
  verified: false;
  reason: string;
}

export type WebhookVerificationResult = VerifiedWebhook | RejectedWebhook;

function toBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signWebhook(secret: string, rawBody: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    toBytes(secret) as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, toBytes(rawBody) as BufferSource);
  return hex(new Uint8Array(signature));
}

export async function verifyWebhook(
  secret: string,
  rawBody: string,
  signature: string,
): Promise<boolean> {
  if (!secret || !signature) return false;
  const expected = await signWebhook(secret, rawBody);
  if (expected.length !== signature.length) return false;
  // Constant-time comparison
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function processFulfillmentWebhook(
  secret: string,
  rawBody: string,
  signature: string,
  processedEventIds: Set<string>,
): Promise<WebhookVerificationResult> {
  // 1. Verify HMAC signature
  const valid = await verifyWebhook(secret, rawBody, signature);
  if (!valid) {
    return { verified: false, reason: "Invalid webhook signature" };
  }

  // 2. Parse payload
  let payload: FulfillmentWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as FulfillmentWebhookPayload;
  } catch {
    return { verified: false, reason: "Invalid JSON payload" };
  }

  if (!payload.eventId || !payload.caseId) {
    return { verified: false, reason: "Missing required fields (eventId, caseId)" };
  }

  // 3. Deduplication — reject already-processed events
  if (processedEventIds.has(payload.eventId)) {
    return { verified: false, reason: `Event ${payload.eventId} already processed` };
  }

  return { payload, signature, verified: true };
}
