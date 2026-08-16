const EMAIL=/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE=/(?<!\d)(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}(?!\d)/g;
const CARD=/(?<!\d)(?:\d[ -]*?){13,19}(?!\d)/g;
const SECRET=/\b(?:sk-|pk_|token[_-]?|bearer\s+)[A-Za-z0-9._-]{12,}\b/gi;
export type RedactionRule={id:string;pattern:RegExp;replacement:string};
export const defaultRedactionRules:RedactionRule[]=[{id:'email',pattern:EMAIL,replacement:'[email redacted]'},{id:'phone',pattern:PHONE,replacement:'[phone redacted]'},{id:'payment',pattern:CARD,replacement:'[payment number redacted]'},{id:'secret',pattern:SECRET,replacement:'[secret redacted]'}];
export function redactText(text:string,rules:RedactionRule[]=defaultRedactionRules):string{return rules.reduce((out,rule)=>out.replace(rule.pattern,rule.replacement),text).slice(0,60_000);}
export function sanitizeUrlForStorage(rawUrl:string):string{try{const url=new URL(rawUrl);url.username='';url.password='';const sensitive=['token','auth','key','secret','password','pass','email','session','code'];for(const key of [...url.searchParams.keys()])if(sensitive.some(s=>key.toLowerCase().includes(s)))url.searchParams.set(key,'[redacted]');return url.toString();}catch{return redactText(rawUrl);}}
