import type { Confidence, PlatformId } from "@mailmypdf/core";

export interface SourceRef {
  documentId: PlatformId;
  page?: number;
  locator?: string;
}

export interface Fact {
  id: PlatformId;
  subject: string;
  predicate: string;
  value: string;
  confidence: Confidence;
  sources: readonly SourceRef[];
}

export type EvidenceRelation = "supports" | "contradicts" | "qualifies" | "missing";

export interface EvidenceLink {
  claimId: PlatformId;
  evidenceId: PlatformId;
  relation: EvidenceRelation;
  confidence: Confidence;
  sources: readonly SourceRef[];
}

export interface TimelineEvent {
  id: PlatformId;
  occurredAt: string;
  type: string;
  description: string;
  confidence: Confidence;
  sources: readonly SourceRef[];
  conflict?: boolean;
}

export interface Finding {
  id: PlatformId;
  type: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  title: string;
  explanation: string;
  confidence: Confidence;
  sources: readonly SourceRef[];
  recommendedActions?: readonly string[];
}
