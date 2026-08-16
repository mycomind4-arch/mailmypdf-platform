import type { SourceReference } from './provenance';
export type Explanation={claim:string;why:string;sources:SourceReference[];kind:'fact'|'inference'|'guidance'|'warning'};
export function explain(claim:string,why:string,sources:SourceReference[],kind:Explanation['kind']='fact'):Explanation{return{claim,why,sources,kind};}
