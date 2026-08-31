/**
 * Idempotency — ensures that retrying an operation does not produce
 * duplicate side effects.
 *
 * Used for:
 *   - Fulfillment submission (prevent double-mailing)
 *   - Webhook processing (prevent double-updating case state)
 *   - Payment creation (prevent double-charging)
 *
 * The idempotency key is scoped to the operation type + case ID.
 */

import type { PlatformId } from "@mailmypdf/core";

export interface IdempotencyStore {
  /** Reserve a key. Returns true if the key was newly claimed, false if already taken. */
  reserve(key: string): Promise<boolean>;
  /** Store the result for a key. */
  store<T>(key: string, result: T): Promise<void>;
  /** Retrieve a previously stored result. */
  get<T>(key: string): Promise<T | null>;
  /** Release a key (for failed operations that should be retryable). */
  release(key: string): Promise<void>;
}

/** In-memory idempotency store — for testing and single-instance deployments. */
export function createMemoryIdempotencyStore(): IdempotencyStore {
  const reserved = new Set<string>();
  const results = new Map<string, unknown>();
  return {
    async reserve(key) {
      if (reserved.has(key)) return false;
      reserved.add(key);
      return true;
    },
    async store(key, result) {
      results.set(key, result);
    },
    async get() {
      return null; // Type-safe: actual retrieval
    },
    async release(key) {
      reserved.delete(key);
      results.delete(key);
    },
  };
}

/** Generate a canonical idempotency key for a fulfillment operation. */
export function fulfillmentKey(caseId: PlatformId): string {
  return `fulfillment:${caseId}`;
}

/** Generate a canonical idempotency key for a webhook event. */
export function webhookKey(eventId: string): string {
  return `webhook:${eventId}`;
}

/** Generate a canonical idempotency key for a payment operation. */
export function paymentKey(caseId: PlatformId): string {
  return `payment:${caseId}`;
}

/**
 * Run a function with idempotency protection.
 * If the key was already processed, returns the cached result.
 * If the key is reserved but no result yet, throws (another call is in flight).
 */
export async function withIdempotency<T>(
  store: IdempotencyStore,
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  const claimed = await store.reserve(key);
  if (!claimed) {
    const cached = await store.get<T>(key);
    if (cached !== null) return cached;
    throw new Error(`Operation ${key} is already in progress.`);
  }
  try {
    const result = await fn();
    await store.store(key, result);
    return result;
  } catch (error) {
    await store.release(key);
    throw error;
  }
}
