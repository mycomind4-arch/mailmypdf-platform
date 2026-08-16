const DEFAULT_PATTERNS = [/\b\d{3}-\d{2}-\d{4}\b/g,/\b[A-Z0-9]{9}\b/g];
export type RedactionRule = { id:string; pattern:RegExp; replacement:string };
export const defaultRedactionRules:RedactionRule[] = DEFAULT_PATTERNS.map((pattern,i)=>({id:`sensitive-${i+1}`,pattern,replacement:'[REDACTED]'}));
export function redactText(text:string,rules:RedactionRule[]=defaultRedactionRules):string { return rules.reduce((out,rule)=>out.replace(rule.pattern,rule.replacement),text); }
