export type Digest = { algorithm:'sha256'; value:string };
export function normalizeSha256(value:string):Digest { if(!/^[a-f0-9]{64}$/i.test(value)) throw new Error('Invalid SHA-256 digest'); return {algorithm:'sha256',value:value.toLowerCase()}; }
export type IntegrityRecord = { subjectId:string; digest:Digest; createdAt:string; source?:string };
