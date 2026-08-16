import type { VerifiedFact, SourceReference } from './provenance';
export type CorrespondenceStatus='draft'|'submitted'|'acknowledged'|'clarification_requested'|'partially_produced'|'completed'|'closed';
export type CorrespondenceRecord={id:string;caseId?:string;agency:string;status:CorrespondenceStatus;submittedOn?:string;deliveryEvidence?:SourceReference;documentIds:string[];notes?:string};
export type CaseRecord={id:string;ownerId:string;title:string;agency?:string;caseNumber?:VerifiedFact<string>;correspondence:CorrespondenceRecord[];createdAt:string;updatedAt:string};
