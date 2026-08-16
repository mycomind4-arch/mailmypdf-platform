export type AuditSeverity='critical'|'major'|'minor'|'manual';
export interface AuditFinding{id:string;criterion:string;severity:AuditSeverity;title:string;detail:string;manualReviewRequired?:boolean;source?:string}
export interface AuditCategory{name:string;weight:number;findings:AuditFinding[];score?:number}
export interface AccessibilityAudit{documentId:string;format:'pdf'|'docx'|'pptx'|'xlsx'|'unknown';standard:'WCAG-2.2-AA'|'WCAG-2.1-AA'|'PDF-UA-1';score?:number;grade?:'A'|'B'|'C'|'D'|'F';verdict:'PASS'|'FAIL'|'UNDETERMINED';categories:AuditCategory[];manualReviewRequired:boolean;generatedAt:string}
export function grade(score:number){return score>=90?'A':score>=80?'B':score>=70?'C':score>=60?'D':'F'}
export function calculateWeightedScore(categories:AuditCategory[]){const applicable=categories.filter(x=>x.weight>0);const denominator=applicable.reduce((s,x)=>s+x.weight,0);if(!denominator)return 0;return Math.round(applicable.reduce((s,x)=>s+x.weight*(x.score??0),0)/denominator)}
export function deriveVerdict(categories:AuditCategory[],manualReviewRequired:boolean):AccessibilityAudit['verdict']{if(categories.some(c=>c.findings.some(f=>f.severity==='critical')))return'FAIL';if(manualReviewRequired)return'UNDETERMINED';return'PASS'}
export function createAudit(input:Omit<AccessibilityAudit,'score'|'grade'|'verdict'|'generatedAt'>):AccessibilityAudit{const score=calculateWeightedScore(input.categories);const verdict=deriveVerdict(input.categories,input.manualReviewRequired);return{...input,score,grade:grade(score),verdict,generatedAt:new Date().toISOString()}}
