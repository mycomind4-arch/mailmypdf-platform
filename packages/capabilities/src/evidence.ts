import type { SourceReference } from './provenance';
export type EvidenceItem={id:string;label:string;documentId:string;source:SourceReference;relevance:number;verified:boolean};
export type EvidenceSet={items:EvidenceItem[];generatedAt:string};
export function sortEvidence(items:EvidenceItem[]):EvidenceItem[]{return [...items].sort((a,b)=>b.relevance-a.relevance);}
