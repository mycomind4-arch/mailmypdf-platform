import {describe,expect,it} from 'vitest';
import {SearchAgentRegistry} from './agents';
describe('search agent registry',()=>{it('registers and discovers capabilities',()=>{const r=new SearchAgentRegistry();const a={id:'archive' as const,capabilities:['archive-search'],run:async()=>[]};r.register(a);expect(r.capable('archive-search')).toHaveLength(1);expect(r.get('archive')).toBe(a)});});
