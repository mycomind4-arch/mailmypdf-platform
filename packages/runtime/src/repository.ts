/**
 * Case repository — storage-agnostic persistence for workflow cases.
 *
 * Every case is scoped to an owner (the authenticated user). No query
 * returns another user's data. The repository enforces:
 *   - Owner-scoped reads and writes
 *   - Optimistic concurrency (version field)
 *   - Audit event recording on every state transition
 *   - Fulfillment event deduplication
 */

import type { PlatformId } from "@mailmypdf/core";
import type { CaseState } from "./case-lifecycle.js";

export interface CaseRecord {
  id: PlatformId;
  workflowId: string;
  verticalId: string;
  ownerId: PlatformId;
  status: CaseState;
  title: string;
  /** Arbitrary domain payload — the vertical owns the shape */
  payload: Record<string, unknown>;
  /** Evidence items attached to this case */
  evidence: ReadonlyArray<EvidenceItem>;
  /** The approved packet, set when status reaches "approved" or beyond */
  packet?: ApprovedPacket | undefined;
  /** Optimistic concurrency version */
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceItem {
  id: PlatformId;
  kind: "document" | "correspondence" | "attachment" | "receipt" | "other";
  documentHash?: string | undefined;
  fileName: string;
  sourceId?: PlatformId | undefined;
  uploadedAt: string;
}

export interface ApprovedPacket {
  finalLetter: string;
  evidence: ReadonlyArray<EvidenceItem>;
  recipient: {
    name: string;
    address1: string;
    address2?: string | undefined;
    city: string;
    state: string;
    zip: string;
  };
  mailingMethod: string;
  totalCents: number;
  /** SHA-256 of the final letter bytes — bound at approval time */
  documentHash: string;
  responseSheets: number;
  supportingSheets: number;
}

export interface AuditEvent {
  id: PlatformId;
  caseId: PlatformId;
  eventType: string;
  actor: "user" | "system" | "ai" | "external";
  actorId?: string | undefined;
  payload: Record<string, unknown>;
  /** Cryptographic hash for chain integrity */
  eventHash: string;
  occurredAt: string;
}

export interface CaseRepository {
  create(input: CreateCaseInput): Promise<{ id: PlatformId }>;
  getById(id: PlatformId, ownerId: PlatformId): Promise<CaseRecord | null>;
  listByOwner(
    ownerId: PlatformId,
    options?: { workflowId?: string; status?: CaseState; limit?: number; offset?: number },
  ): Promise<{ records: CaseRecord[]; hasMore: boolean }>;
  updateStatus(
    id: PlatformId,
    ownerId: PlatformId,
    from: CaseState,
    to: CaseState,
    patch?: Partial<CaseRecord>,
  ): Promise<CaseRecord>;
  updatePayload(
    id: PlatformId,
    ownerId: PlatformId,
    payload: Record<string, unknown>,
    expectedVersion: number,
  ): Promise<CaseRecord>;
  addEvidence(id: PlatformId, ownerId: PlatformId, item: EvidenceItem): Promise<void>;
  setPacket(id: PlatformId, ownerId: PlatformId, packet: ApprovedPacket, expectedVersion: number): Promise<CaseRecord>;
  recordAuditEvent(input: Omit<AuditEvent, "id" | "eventHash" | "occurredAt">): Promise<AuditEvent>;
  getAuditTrail(caseId: PlatformId, ownerId: PlatformId): Promise<AuditEvent[]>;
}

export interface CreateCaseInput {
  workflowId: string;
  verticalId: string;
  ownerId: PlatformId;
  title: string;
  payload?: Record<string, unknown>;
}
