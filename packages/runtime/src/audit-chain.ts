/**
 * Audit chain — tamper-evident event recording for case lifecycle.
 *
 * Every state transition, approval, fulfillment, and webhook callback
 * generates an audit event. Events are chained: each event's hash
 * incorporates the previous event's hash, making retroactive
 * modification detectable.
 *
 * The audit chain is append-only. No event is ever deleted.
 */

import type { PlatformId } from "./types.js";

export interface AuditChainEntry {
  id: PlatformId;
  caseId: PlatformId;
  sequence: number;
  eventType: string;
  actor: "user" | "system" | "ai" | "external";
  actorId?: string | undefined;
  payload: Record<string, unknown>;
  /** Hash of: previousHash + caseId + sequence + eventType + payload */
  eventHash: string;
  /** Hash of the previous entry in the chain (genesis = "0".repeat(64)) */
  previousHash: string;
  occurredAt: string;
}

export async function computeEventHash(
  previousHash: string,
  caseId: string,
  sequence: number,
  eventType: string,
  payload: Record<string, unknown>,
  occurredAt: string,
): Promise<string> {
  const input = `${previousHash}|${caseId}|${sequence}|${eventType}|${JSON.stringify(payload)}|${occurredAt}`;
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest), (v) => v.toString(16).padStart(2, "0")).join("");
}

export const GENESIS_HASH = "0".repeat(64);

export async function createAuditEntry(input: {
  caseId: PlatformId;
  sequence: number;
  eventType: string;
  actor: "user" | "system" | "ai" | "external";
  actorId?: string;
  payload: Record<string, unknown>;
  previousHash: string;
}): Promise<AuditChainEntry> {
  const occurredAt = new Date().toISOString();
  const eventHash = await computeEventHash(
    input.previousHash,
    input.caseId,
    input.sequence,
    input.eventType,
    input.payload,
    occurredAt,
  );
  return {
    id: crypto.randomUUID() as PlatformId,
    caseId: input.caseId,
    sequence: input.sequence,
    eventType: input.eventType,
    actor: input.actor,
    actorId: input.actorId,
    payload: input.payload,
    eventHash,
    previousHash: input.previousHash,
    occurredAt,
  };
}

export async function verifyAuditChain(entries: readonly AuditChainEntry[]): Promise<boolean> {
  let previousHash = GENESIS_HASH;
  let expectedSequence = 1;

  for (const entry of entries) {
    if (entry.previousHash !== previousHash) return false;
    if (entry.sequence !== expectedSequence) return false;

    const computedHash = await computeEventHash(
      entry.previousHash,
      entry.caseId,
      entry.sequence,
      entry.eventType,
      entry.payload,
      entry.occurredAt,
    );
    if (computedHash !== entry.eventHash) return false;

    previousHash = entry.eventHash;
    expectedSequence++;
  }

  return true;
}
