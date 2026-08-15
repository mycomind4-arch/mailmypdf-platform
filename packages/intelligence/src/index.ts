/**
 * @mailmypdf/intelligence
 *
 * Unified intelligence relationship architecture for the MailMyPDF ecosystem.
 *
 * Public API:
 *   ProvenanceLevel, ProvenanceRecord, createProvenance, verifyProvenance
 *   Entity, createEntity, verifyEntity, validateEntity, addAlias, matchesName
 *   Fact, FactStatus, createFact, verifyFact, supersedeFact, disputeFact, retractFact, validateFact
 *   Relationship, IntelligenceType, createRelationship, verifyRelationship, retractRelationship
 *   validateRelationship, isDuplicate, deduplicateRelationships
 *   traverseBFS, relationshipsFrom, relationshipsTo, relationshipsOfType
 *
 * Re-exports from @mailmypdf/core: PlatformId, Confidence, createId, confidence
 * Re-exports from @mailmypdf/documents: SourceRef, createSourceRef
 */

// ── Provenance (foundation) ───────────────────────────────────────────────────
export type {
  ProvenanceLevel,
  ProvenanceRecord,
  IntelligenceObject,
} from "./provenance.js";
export {
  ALL_PROVENANCE_LEVELS,
  PROVENANCE_STRENGTH,
  isAutoTrusted,
  canPresentWithoutDisclaimer,
  strongerProvenance,
  createProvenance,
  verifyProvenance,
} from "./provenance.js";

// ── Entity ────────────────────────────────────────────────────────────────────
export type { Entity, EntityStatus } from "./entity.js";
export {
  MAX_ENTITY_NAME_LENGTH,
  MAX_ENTITY_TYPE_LENGTH,
  MAX_ALIASES,
  createEntity,
  verifyEntity,
  mergeEntity,
  deprecateEntity,
  validateEntity,
  addAlias,
  matchesName,
  findByType,
} from "./entity.js";

// ── Fact ──────────────────────────────────────────────────────────────────────
export type { Fact, FactStatus } from "./fact.js";
export {
  MAX_SUBJECT_LENGTH,
  MAX_PREDICATE_LENGTH,
  MAX_VALUE_LENGTH,
  createFact,
  verifyFact,
  supersedeFact,
  disputeFact,
  retractFact,
  validateFact,
  isFactActive,
  isFactSuperseded,
  isFactDisputed,
  isFactRetracted,
  factsBySubject,
  factsByPredicate,
  findConflictingFacts,
} from "./fact.js";

// ── Relationship ──────────────────────────────────────────────────────────────
export type { Relationship, RelationshipStatus, IntelligenceType } from "./relationship.js";
export {
  MAX_RELATIONSHIP_TYPE_LENGTH,
  createRelationship,
  verifyRelationship,
  retractRelationship,
  validateRelationship,
  isDuplicate,
  deduplicateRelationships,
  relationshipsFrom,
  relationshipsTo,
  relationshipsOfType,
  traverseBFS,
} from "./relationship.js";

// ── Re-exports from dependencies ──────────────────────────────────────────────
export type { PlatformId, Confidence } from "@mailmypdf/core";
export { createId, confidence } from "@mailmypdf/core";
export type { SourceRef } from "@mailmypdf/documents";
export { createSourceRef } from "@mailmypdf/documents";
