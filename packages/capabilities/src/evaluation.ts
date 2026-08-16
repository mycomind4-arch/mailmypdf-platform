export type EvaluationCase<I,O>={id:string;input:I;expected?:Partial<O>;tags?:string[]};
export type EvaluationResult<O>={caseId:string;output:O;passed:boolean;failures:string[]};
export function compareKeys<T extends Record<string,unknown>>(actual:T,expected:Partial<T>):string[]{return Object.entries(expected).filter(([k,v])=>JSON.stringify(actual[k])!==JSON.stringify(v)).map(([k])=>k);}
