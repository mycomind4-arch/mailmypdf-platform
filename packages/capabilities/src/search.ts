export type SearchSource='web'|'records'|'repository'|'documents'|'email'|'connector';
export type SearchQuery={text:string;sources:SearchSource[];maxResults?:number};
export type SearchEvidence={id:string;source:SearchSource;title:string;uri?:string;excerpt:string;confidence?:number};
export interface SearchProvider{search(query:SearchQuery):Promise<SearchEvidence[]>;}
export async function federatedSearch(providers:SearchProvider[],query:SearchQuery):Promise<SearchEvidence[]>{const results=await Promise.all(providers.map(p=>p.search(query)));return results.flat().slice(0,query.maxResults??50);}
