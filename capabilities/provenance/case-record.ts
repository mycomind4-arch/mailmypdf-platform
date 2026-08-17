import type { SourceReference, VerifiedFact } from './source-reference';

export interface CaseRecord {
  id: string;
  tenantId: string;
  jurisdiction?: string;
  agency?: string;
  agencyCaseNumber?: VerifiedFact<string>;
  createdAt: string;
}

export interface CorrespondenceRecord {
  id: string;
  caseId?: string;
  agency: string;
  status: 'draft'|'submitted'|'acknowledged'|'clarification_requested'|'partially_produced'|'completed'|'no_response_recorded'|'closed';
  submittedOn?: string;
  deliveryEvidence?: SourceReference;
  correspondenceDocumentIds: string[];
}
