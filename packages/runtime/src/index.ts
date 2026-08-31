/**
 * @mailmypdf/runtime — Shared production runtime substrate.
 *
 * The one package every vertical imports for:
 *   - Case lifecycle state machine
 *   - Repository contract (owner-scoped, optimistic concurrency)
 *   - Server-side, hash-bound approval gate
 *   - MailMyPDF fulfillment adapter with idempotency
 *   - HMAC webhook verification with deduplication
 *   - SHA-256 document integrity attestation
 *   - Tamper-evident audit chain
 *   - Canonical workflow registry
 *
 * Import order: core → runtime → vertical-specific code.
 */

// Case lifecycle
export {
  CASE_TRANSITIONS,
  canTransition,
  isTerminal,
  isPreApproval,
  isPostApproval,
  requiresApprovalGate,
  type CaseState,
} from "./case-lifecycle.js";

// Repository contract
export {
  type CaseRecord,
  type EvidenceItem,
  type ApprovedPacket,
  type AuditEvent,
  type CaseRepository,
  type CreateCaseInput,
} from "./repository.js";

// Approval gate
export {
  approveCase,
  sha256Hex,
  DEFAULT_APPROVAL_CONFIG,
  type ApprovalInput,
  type ApprovalResult,
  type ReadinessReview,
  type ApprovalConfig,
} from "./approval-gate.js";

// Fulfillment
export {
  createMailMyPDFFulfillment,
  type FulfillmentRequest,
  type FulfillmentResult,
  type FulfillmentClient,
  type MailMyPDFConfig,
} from "./fulfillment.js";

// Webhook verification
export {
  signWebhook,
  verifyWebhook,
  processFulfillmentWebhook,
  type FulfillmentWebhookPayload,
  type WebhookVerificationResult,
  type VerifiedWebhook,
  type RejectedWebhook,
} from "./webhook-verification.js";

// Document integrity
export {
  attestDocument,
  buildFulfillmentMetadata,
  verifyDocumentIntegrity,
  type ApprovedDocument,
  type DocumentIntegrity,
} from "./document-integrity.js";

// Idempotency
export {
  createMemoryIdempotencyStore,
  withIdempotency,
  fulfillmentKey,
  webhookKey,
  paymentKey,
  type IdempotencyStore,
} from "./idempotency.js";

// Audit chain
export {
  createAuditEntry,
  computeEventHash,
  verifyAuditChain,
  GENESIS_HASH,
  type AuditChainEntry,
} from "./audit-chain.js";

// Workflow registry
export {
  createWorkflowRegistry,
  type WorkflowManifest,
  type WorkflowRegistry,
  type CertificationStatus,
} from "./workflow-registry.js";
