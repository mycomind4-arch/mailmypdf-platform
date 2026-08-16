import { describe, expect, it } from 'vitest';
import { AdapterRegistry, buildSearchPlan, clusterSearchEvidence, normalizeObservations } from './index';

describe('search capability',()=>{
 it('builds bounded plans',()=>{const plan=buildSearchPlan({id:'1',mode:'text',query:'x',budget:{maxDepth:1}});expect(plan.every(s=>s.depth<=1)).toBe(true);expect(plan.length).toBeGreaterThan(1)});
 it('deduplicates observations by source',()=>{const items=normalizeObservations([{id:'a',provider:'a',sourceUrl:'https://x',queryJobId:'1'},{id:'b',provider:'b',sourceUrl:'https://x',queryJobId:'1'}]);expect(items).toHaveLength(1)});
 it('clusters corroborating evidence',()=>{const clusters=clusterSearchEvidence([{id:'a',provider:'a',sourceUrl:'https://x/a',queryJobId:'1'},{id:'b',provider:'b',sourceUrl:'https://x/a',queryJobId:'1'}]);expect(clusters[0].providerCount).toBe(2)});
 it('rejects duplicate adapter registration',()=>{const r=new AdapterRegistry();const a={id:'a',modes:['text'] as const,isAvailable:async()=>true,search:async()=>[]};r.register(a);expect(()=>r.register(a)).toThrow();});
});
