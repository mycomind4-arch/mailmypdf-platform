import test from 'node:test';
import assert from 'node:assert/strict';
import { AdapterRegistry, buildSearchPlan, clusterSearchEvidence, normalizeObservations } from './index.js';
const observation=(id:string,provider:string,sourceUrl:string)=>({id,provider,sourceUrl,queryJobId:'1',discoveredAt:new Date().toISOString()});
test('search plans are depth bounded',()=>{const plan=buildSearchPlan({id:'1',mode:'text',query:'x',budget:{maxDepth:1}});assert.equal(plan.every(s=>s.depth<=1),true);assert.ok(plan.length>1)});
test('search observations deduplicate by source',()=>{const items=normalizeObservations([observation('a','a','https://x'),observation('b','b','https://x')]);assert.equal(items.length,1)});
test('search evidence clusters corroborating providers',()=>{const clusters=clusterSearchEvidence([observation('a','a','https://x/a'),observation('b','b','https://x/a')]);assert.equal(clusters[0]?.providerCount,2)});
test('adapter registry rejects duplicate ids',()=>{const r=new AdapterRegistry();const a={id:'a',modes:['text'] as const,isAvailable:async()=>true,search:async()=>[]};r.register(a);assert.throws(()=>r.register(a));});
