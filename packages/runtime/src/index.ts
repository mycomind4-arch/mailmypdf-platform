/**
 * @mailmypdf/runtime — shared production substrate for the MailMyPDF ecosystem.
 *
 * Extracted from records-requests and appeal-mail. Contains the canonical
 * contracts that every vertical must implement for: case lifecycle,
 * persistence, approval, fulfillment, webhook verification, document
 * integrity, idempotency, and audit chain.
 */

// Case lifecycle state machine
export {
  CASE_TRANSITIONS,
  canTransition,
  isTerminal,
  isPreApproval,
  isPostApproval,
  requiresApprovalGate,
  type CaseState,
} from "./case-lifecycle.js";

// Repository contract (storage-agnostic)
export {
  type CaseRecord,
  type CaseRepository,
  type EvidenceItem,
  type ApprovedPacket,
  type AuditEvent,
  type CreateCaseInput,
} from "./repository.js";

// Approval gate — server-side, hash-bound
export {
  DEFAULT_APPROVAL_CONFIG,
  approveCase,
  sha256Hex,
  type ReadinessReview,
  type ApprovalInput,
  type ApprovalResult,
  type ApprovalConfig,
} from "./approval-gate.js";

// Fulfillment adapter — MailMyPDF API
export {
  createMailMyPDFFulfillment,
  type FulfillmentRequest,
  type FulfillmentResult,
  type FulfillmentClient,
  type MailMyPDFConfig,
} from "./fulfillment.js";

// Webhook verification — HMAC-SHA256
export {
  signWebhook,
  verifyWebhook,
  processFulfillmentWebhook,
  type FulfillmentWebhookPayload,
  type VerifiedWebhook,
  type RejectedWebhook,
  type WebhookVerificationResult,
} from "./webhook-verification.js";

// Document integrity — SHA-256 attestation
export {
  attestDocument,
  verifyDocumentIntegrity,
  buildFulfillmentMetadata,
  type ApprovedDocument,
  type DocumentIntegrity,
} from "./document-integrity.js";

// Idempotency
export {
  createMemoryIdempotencyStore,
  fulfillmentKey,
  webhookKey,
  paymentKey,
  withIdempotency,
  type IdempotencyStore,
} from "./idempotency.js";

// Audit chain — tamper-evident
export {
  computeEventHash,
  createAuditEntry,
  verifyAuditChain,
  GENESIS_HASH,
  type AuditChainEntry,
} from "./audit-chain.js";

// Workflow registry — canonical certification lifecycle
export {
  createWorkflowRegistry,
  type CertificationStatus,
  type WorkflowManifest,
  type WorkflowRegistry,
} from "./workflow-registry.js";

// Supabase adapter
export {
  createSupabaseRepository,
  type SupabaseLike,
} from "./supabase-repository.js";
