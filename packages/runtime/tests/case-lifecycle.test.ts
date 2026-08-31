import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { canTransition, isTerminal, isPreApproval, isPostApproval, requiresApprovalGate } from "../src/case-lifecycle.js";

describe("case lifecycle", () => {
  test("enforces the canonical transition graph", () => {
    assert.equal(canTransition("draft", "validated"), true);
    assert.equal(canTransition("validated", "review"), true);
    assert.equal(canTransition("review", "approved"), true);
    assert.equal(canTransition("approved", "queued"), true);
    assert.equal(canTransition("queued", "submitted"), true);
    assert.equal(canTransition("submitted", "tracking"), true);
    assert.equal(canTransition("tracking", "completed"), true);
  });

  test("blocks illegal transitions", () => {
    assert.equal(canTransition("draft", "approved"), false);
    assert.equal(canTransition("draft", "queued"), false);
    assert.equal(canTransition("validated", "queued"), false);
    assert.equal(canTransition("review", "submitted"), false);
    assert.equal(canTransition("completed", "draft"), false);
  });

  test("identifies terminal states", () => {
    assert.equal(isTerminal("completed"), true);
    assert.equal(isTerminal("failed"), true);
    assert.equal(isTerminal("cancelled"), true);
    assert.equal(isTerminal("draft"), false);
    assert.equal(isTerminal("approved"), false);
  });

  test("classifies pre/post approval states", () => {
    assert.equal(isPreApproval("draft"), true);
    assert.equal(isPreApproval("validated"), true);
    assert.equal(isPreApproval("review"), true);
    assert.equal(isPreApproval("approved"), false);
    assert.equal(isPostApproval("queued"), true);
    assert.equal(isPostApproval("submitted"), true);
    assert.equal(isPostApproval("tracking"), true);
    assert.equal(isPostApproval("completed"), true);
    assert.equal(isPostApproval("approved"), false);
  });

  test("enforces approval gate for post-approval transitions", () => {
    assert.equal(requiresApprovalGate("review", "queued"), true);
    assert.equal(requiresApprovalGate("validated", "submitted"), true);
    assert.equal(requiresApprovalGate("approved", "queued"), false);
    assert.equal(requiresApprovalGate("queued", "submitted"), false);
  });

  test("allows cancellation from pre-approval states", () => {
    assert.equal(canTransition("draft", "cancelled"), true);
    assert.equal(canTransition("validated", "cancelled"), true);
    assert.equal(canTransition("review", "cancelled"), true);
    assert.equal(canTransition("approved", "cancelled"), true);
    assert.equal(canTransition("queued", "cancelled"), true);
    assert.equal(canTransition("submitted", "cancelled"), false);
  });
});
