import type { SourceReference } from './provenance';
export type Deadline={id:string;label:string;date:string;source?:SourceReference;confidence?:number;status:'open'|'completed'|'uncertain'};
export function deadlineUrgency(deadline:Deadline,now=new Date()):'overdue'|'urgent'|'upcoming'|'unknown'{if(deadline.status==='uncertain')return'unknown';const t=new Date(deadline.date).getTime()-now.getTime();if(t<0)return'overdue';if(t<=7*86400000)return'urgent';return'upcoming';}
