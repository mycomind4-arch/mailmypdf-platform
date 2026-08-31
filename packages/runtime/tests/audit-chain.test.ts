import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createAuditEntry, verifyAuditChain, GENESIS_HASH, type AuditChainEntry } from "../src/audit-chain.js";

describe("audit chain", () => {
  test("creates entries with genesis hash for first entry", async () => {
    const entry = await createAuditEntry({
      caseId: "case_1" as any, sequence: 1, eventType: "case_created", actor: "user",
      payload: { title: "Test Case" }, previousHash: GENESIS_HASH,
    });
    assert.equal(entry.previousHash, GENESIS_HASH);
    assert.equal(entry.eventHash.length, 64);
    assert.equal(entry.sequence, 1);
  });

  test("chains entries correctly", async () => {
    const entry1 = await createAuditEntry({
      caseId: "case_1" as any, sequence: 1, eventType: "case_created", actor: "user",
      payload: {}, previousHash: GENESIS_HASH,
    });
    const entry2 = await createAuditEntry({
      caseId: "case_1" as any, sequence: 2, eventType: "case_approved", actor: "user",
      payload: { score: 85 }, previousHash: entry1.eventHash,
    });
    assert.equal(entry2.previousHash, entry1.eventHash);
  });

  test("verifies a valid chain", async () => {
    const entries: AuditChainEntry[] = [];
    let prev = GENESIS_HASH;
    for (let i = 1; i <= 5; i++) {
      const entry = await createAuditEntry({
        caseId: "case_1" as any, sequence: i, eventType: `event_${i}`, actor: "system",
        payload: { index: i }, previousHash: prev,
      });
      entries.push(entry);
      prev = entry.eventHash;
    }
    assert.equal(await verifyAuditChain(entries), true);
  });

  test("detects a broken chain", async () => {
    const entries: AuditChainEntry[] = [];
    let prev = GENESIS_HASH;
    for (let i = 1; i <= 3; i++) {
      const entry = await createAuditEntry({
        caseId: "case_1" as any, sequence: i, eventType: `event_${i}`, actor: "system",
        payload: { index: i }, previousHash: prev,
      });
      entries.push(entry);
      prev = entry.eventHash;
    }
    entries[1] = { ...entries[1]!, payload: { tampered: true } };
    assert.equal(await verifyAuditChain(entries), false);
  });
});
