import type { SourceReference } from './provenance';
export type TimelineEvent={id:string;date:string;type:string;label:string;source?:SourceReference;confidence?:number};
export function sortTimeline(events:TimelineEvent[]):TimelineEvent[]{return [...events].sort((a,b)=>a.date.localeCompare(b.date));}
