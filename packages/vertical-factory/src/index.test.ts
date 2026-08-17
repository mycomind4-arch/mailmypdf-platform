import test from 'node:test';
import assert from 'node:assert/strict';
import { planVerticalBuild, buildVerticalPrompt } from './index.js';
const vertical=(id:string,name:string,requiredCapabilities:string[])=>({id,name,description:'',audience:'public',primaryWorkflow:'respond',requiredCapabilities,mailingEnabled:true,riskProfile:'LOW' as const});
test('vertical factory excludes deprecated capabilities',()=>{const v=vertical('records','Code Enforcement Records',['evidence','correspondence']);const p=planVerticalBuild(v,[{id:'e',capabilities:['evidence completeness'],status:'TRUSTED',risk:'LOW'},{id:'c',capabilities:['correspondence'],status:'DEPRECATED',risk:'LOW'}]);assert.equal(p.selected.length,1);assert.ok(p.missing.includes('correspondence'));assert.equal(p.ready,false)});
test('vertical factory generates a build prompt',()=>{const v=vertical('x','X',['evidence']);const p=planVerticalBuild(v,[{id:'e',capabilities:['evidence'],status:'TRUSTED',risk:'LOW'}]);assert.match(buildVerticalPrompt(v,p),/Build X/)});
