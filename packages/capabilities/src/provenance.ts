export type ExtractionMethod = 'manual'|'ocr'|'native_text'|'api_import'|'ai';
export type SourceReference = { documentId:string; sha256:string; page?:number; quote?:string; extractionMethod:ExtractionMethod; confidence?:number; humanVerified:boolean };
export type VerifiedFact<T> = { value:T; source:SourceReference; verifiedBy?:string; verifiedAt?:string };
export function isVerified<T>(fact:VerifiedFact<T>):boolean { return fact.source.humanVerified === true; }
