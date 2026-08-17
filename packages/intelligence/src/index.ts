/**
 * @mailmypdf/intelligence
 * Unified intelligence relationship architecture for the MailMyPDF ecosystem.
 */

export type { ProvenanceLevel, ProvenanceRecord, IntelligenceObject } from './provenance.js';
export { ALL_PROVENANCE_LEVELS, PROVENANCE_STRENGTH, isAutoTrusted, canPresentWithoutDisclaimer, strongerProvenance, createProvenance, verifyProvenance } from './provenance.js';
export type { Entity, EntityStatus } from './entity.js';
export { MAX_ENTITY_NAME_LENGTH, MAX_ENTITY_TYPE_LENGTH, MAX_ALIASES, createEntity, verifyEntity, mergeEntity, deprecateEntity, validateEntity, addAlias, matchesName, findByType } from './entity.js';
export type { Fact, FactStatus } from './fact.js';
export { MAX_SUBJECT_LENGTH, MAX_PREDICATE_LENGTH, MAX_VALUE_LENGTH, createFact, verifyFact, supersedeFact, disputeFact, retractFact, validateFact, isFactActive, isFactSuperseded, isFactDisputed, isFactRetracted, factsBySubject, factsByPredicate, findConflictingFacts } from './fact.js';
export type { Relationship, RelationshipStatus, IntelligenceType } from './relationship.js';
export { MAX_RELATIONSHIP_TYPE_LENGTH, createRelationship, verifyRelationship, retractRelationship, validateRelationship, isDuplicate, deduplicateRelationships, relationshipsFrom, relationshipsTo, relationshipsOfType, traverseBFS } from './relationship.js';
export type { EvidenceItem, EvidenceStatus, EvidencePacket, EvidenceEvaluation, EvidenceRelation } from './evidence.js';
export { ALL_EVIDENCE_RELATIONS, RELATION_STRENGTH, MAX_EXPLANATION_LENGTH, MAX_EVIDENCE_ID_LENGTH, createEvidence, verifyEvidence, retractEvidence, supersedeEvidence, validateEvidence, createEvidencePacket, activeItems, supportingItems, contradictingItems, qualifyingItems, missingItems, evaluateEvidence, evidenceForClaim, hasContradictions, hasGaps, PROVENANCE_WEIGHT, MAX_EVIDENCE_ITEMS, isDuplicateEvidence, deduplicateEvidence } from './evidence.js';
export type { Contradiction, ContradictionSeverity, ReviewStatus, Resolution, DetectionType } from './contradiction.js';
export { ALL_SEVERITY_LEVELS, SEVERITY_WEIGHT, MAX_CONTRADICTION_EXPLANATION, MAX_CONFLICT_SUBJECT, MAX_CONFLICT_PREDICATE, MAX_FACTS_FOR_DETECTION, MAX_PAIRS_PER_GROUP, createContradiction, reviewContradiction, resolveContradiction, validateContradiction, isUnreviewed, isReviewed, isResolved, isCritical, isMajor, isMinor, isConfirmed, isPotential, contradictionsForFact, unresolvedContradictions, criticalContradictions, confirmedContradictions, potentialContradictions, classifyPredicate, detectContradictions, sortBySeverity, sortByReviewStatus } from './contradiction.js';
export type { Finding, FindingSeverity, FindingStatus } from './finding.js';
export { ALL_FINDING_SEVERITIES, FINDING_SEVERITY_WEIGHT, MAX_FINDING_TYPE_LENGTH, MAX_FINDING_EXPLANATION_LENGTH, MAX_RECOMMENDED_ACTION_LENGTH, MAX_DERIVATION_REFS, createFinding, verifyFinding, supersedeFinding, retractFinding, validateFinding, isFindingActive, isFindingSuperseded, isFindingRetracted, isFindingCritical, isFindingMajor, isFindingMinor, isFindingInfo, findingsForEntity, findingsForFact, criticalFindings, unresolvedFindings, sortFindingsBySeverity, sortFindingsByConfidence } from './finding.js';
export type { TimelineEvent, EventIntegrity, DatePrecision, Timeline, TimelineGap } from './timeline.js';
export { ALL_EVENT_INTEGRITIES, ALL_DATE_PRECISIONS, INTEGRITY_STRENGTH, MAX_EVENT_TYPE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_CASE_ID_LENGTH, MAX_EVENTS_FOR_TIMELINE, MAX_DATE_LENGTH, createTimelineEvent, verifyTimelineEvent, retractTimelineEvent, validateTimelineEvent, eventIdentityHash, findDuplicateEvents, createTimeline, activeEvents, sortedByDate, eventsByType, eventsOfType, detectGaps, conflictingDates, sortByIntegrity, sortByPrecision } from './timeline.js';
export type { CalendarType, HolidayCalendar, TemporalConstraint, DeadlineRule, DeadlineResult, DeadlineStatus } from './deadline.js';
export { MAX_TRIGGER_EVENT_TYPE, MAX_DAYS, MAX_RULE_NAME, MAX_RULE_DESCRIPTION, MAX_AUTHORITY, MAX_VERSION, createTemporalConstraint, validateTemporalConstraint, createDeadlineRule, validateDeadlineRule, computeDeadline, computeAllDeadlines, getDeadlineStatus, deadlineResultToTimelineEvent } from './deadline.js';
export type { RiskLevel, RiskFactor, RiskAssessment, RiskAssessmentInput } from './risk.js';
export { ALL_RISK_LEVELS, RISK_LEVEL_WEIGHT, MAX_FACTOR_DESCRIPTION, MAX_FACTORS_PER_ASSESSMENT, MAX_SUMMARY_LENGTH, computeRiskAssessment, validateRiskAssessment, isCriticalRisk, isHighRisk, isLowRisk, isUnknownRisk, criticalFactors, highFactors, explainFactor, explainAssessment } from './risk.js';
export type { CaseStatus, ActionPriority, ActionStatus, RecommendedAction, CreateRecommendedActionInput, ReadinessCheck, ReadinessResult, CaseAssessment, CaseAssessmentInput } from './case-assessment.js';
export { ALL_CASE_STATUSES, ALL_ACTION_PRIORITIES, ACTION_PRIORITY_WEIGHT, MAX_ACTION_DESCRIPTION, MAX_EXPECTED_OUTCOME, MAX_ACTION_TYPE, MAX_CHECK_LABEL, MAX_CHECK_DESCRIPTION, READINESS_THRESHOLD, MAX_ASSESSMENT_SUMMARY, createRecommendedAction, completeAction, dismissAction, isActionPending, isActionCompleted, validateRecommendedAction, createReadinessCheck, computeCaseAssessment, validateCaseAssessment, pendingActions, criticalActions, highPriorityActions, failedChecks, warningChecks, isCaseReady, isActionRequired, explainAssessment as explainCaseAssessment } from './case-assessment.js';

// Harvested reusable capabilities from sibling verticals.
export type { MissingInfoCategory, MissingInfoImpact, MissingInfoStatus, MissingInfoItem, MissingInfoInput } from './missing-info.js';
export { createMissingInfo, detectMissingInfo, resolveMissingInfo, missingInfoSummary } from './missing-info.js';
export type { QualityDimension, QualityInput, QualityReport } from './response-quality.js';
export { evaluateResponseQuality } from './response-quality.js';
export type { ExplanationConfidence, ExplanationStep, Explanation } from './explainability.js';
export { createExplanation, explainDeadline, explainFact, explainReadiness } from './explainability.js';

export type { PlatformId, Confidence } from '@mailmypdf/core';
export { createId, confidence } from '@mailmypdf/core';
export type { SourceRef } from '@mailmypdf/documents';
export { createSourceRef } from '@mailmypdf/documents';
