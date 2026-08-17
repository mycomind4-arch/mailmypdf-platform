export type PolicyDecision={allowed:boolean;reason:string;requiresApproval?:boolean;policyId?:string};
export interface PolicyRule<T=unknown>{id:string;evaluate(input:T):PolicyDecision;}
export class PolicyEngine<T>{constructor(private readonly rules:PolicyRule<T>[]){ } evaluate(input:T):PolicyDecision[]{return this.rules.map(r=>r.evaluate(input));} isAllowed(input:T):boolean{return this.evaluate(input).every(d=>d.allowed);}}
