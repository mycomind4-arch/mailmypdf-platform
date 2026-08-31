/**
 * Approval gate — the server-side, hash-bound boundary between
 * intelligence (draft/review) and consequential action (fulfillment).
 *
 * No case can transition to "queued" without:
 *   1. Passing a readiness review (score ≥ threshold, no blocking fails)
 *   2. Having a non-empty draft
 *   3. Having at least one evidence item
 *   4. A complete mailing recipient
 *   5. A SHA-256 hash of the final letter bytes, bound at approval time
 *
 * The hash is stored on the case record and on the audit event. If the
 * letter changes after approval, the hash will not match and fulfillment
 * will refuse to proceed.
 */

import type { PlatformId } from "./types.js";
import type { CaseRepository, CaseRecord, ApprovedPacket } from "./repository.js";

export interface ReadinessReview {
  score: number;
  issuesRequiringAttention: number;
  checks: ReadonlyArray<{
    label: string;
    status: "pass" | "warn" | "fail";
    message: string;
  }>;
}

export interface ApprovalInput {
  caseId: PlatformId;
  ownerId: PlatformId;
  recipient: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  };
  mailingMethod: string;
  totalCents: number;
  /** The review that must pass before approval is granted */
  review: ReadinessReview;
}

export interface ApprovalResult {
  ok: true;
  case: CaseRecord;
  packet: ApprovedPacket;
}

export interface ApprovalConfig {
  /** Minimum readiness score (0-100). Default: 80 */
  minScore: number;
  /** Maximum "warn" checks allowed. Default: 2 */
  maxWarnings: number;
}

export const DEFAULT_APPROVAL_CONFIG: ApprovalConfig = {
  minScore: 80,
  maxWarnings: 2,
};

export async function approveCase(
  repo: CaseRepository,
  input: ApprovalInput,
  config: ApprovalConfig = DEFAULT_APPROVAL_CONFIG,
): Promise<ApprovalResult> {
  const case_ = await repo.getById(input.caseId, input.ownerId);
  if (!case_) throw new Error("Case not found.");
  if (case_.status !== "review" && case_.status !== "draft" && case_.status !== "validated") {
    throw new Error(`Case must be in review/draft/validated state to approve. Current: ${case_.status}`);
  }

  // 1. Readiness review must pass
  if (input.review.score < config.minScore) {
    throw new Error(`Readiness score ${input.review.score} is below minimum ${config.minScore}.`);
  }
  if (input.review.issuesRequiringAttention > config.maxWarnings) {
    throw new Error(`Too many issues requiring attention (${input.review.issuesRequiringAttention}).`);
  }
  const hasFailingCheck = input.review.checks.some((c) => c.status === "fail");
  if (hasFailingCheck) {
    throw new Error("Readiness review has failing checks — cannot approve.");
  }

  // 2. Draft must be non-empty
  const draft = case_.payload?.draft;
  if (typeof draft !== "string" || !draft.trim()) {
    throw new Error("The draft must be created before approval.");
  }

  // 3. Must have at least one evidence item
  if (!case_.evidence || case_.evidence.length === 0) {
    throw new Error("At least one evidence item is required for approval.");
  }

  // 4. Recipient must be complete
  const r = input.recipient;
  if (!r.name || !r.address1 || !r.city || !r.state || !r.zip) {
    throw new Error("A complete mailing recipient is required.");
  }

  // 5. Compute SHA-256 hash of the final letter
  const documentHash = await sha256Hex(new TextEncoder().encode(draft));

  const responseSheets = Math.max(1, Math.ceil(draft.length / 3200));
  const supportingSheets = case_.evidence.filter(
    (e) => e.kind === "document" || e.kind === "attachment",
  ).length;

  const packet: ApprovedPacket = {
    finalLetter: draft,
    evidence: case_.evidence,
    recipient: r,
    mailingMethod: input.mailingMethod,
    totalCents: input.totalCents,
    documentHash,
    responseSheets,
    supportingSheets,
  };

  const updated = await repo.setPacket(input.caseId, input.ownerId, packet, case_.version);
  await repo.updateStatus(input.caseId, input.ownerId, case_.status, "approved", { packet });

  const approved = await repo.getById(input.caseId, input.ownerId);
  if (!approved) throw new Error("Case disappeared after approval.");

  await repo.recordAuditEvent({
    caseId: input.caseId,
    eventType: "case_approved",
    actor: "user",
    actorId: input.ownerId,
    payload: {
      documentHash,
      totalCents: input.totalCents,
      mailingMethod: input.mailingMethod,
      responseSheets,
      supportingSheets,
      reviewScore: input.review.score,
    },
  });

  return { ok: true, case: approved, packet };
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest), (v) => v.toString(16).padStart(2, "0")).join("");
}
