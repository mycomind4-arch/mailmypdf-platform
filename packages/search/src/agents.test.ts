import test from 'node:test';
import assert from 'node:assert/strict';
import { SearchAgentRegistry } from './agents.js';
test('search agent registry discovers capabilities',()=>{const r=new SearchAgentRegistry();const a={id:'archive' as const,capabilities:['archive-search'],run:async()=>[]};r.register(a);assert.equal(r.capable('archive-search').length,1);assert.equal(r.get('archive'),a)});
