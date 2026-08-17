import test from 'node:test';
import assert from 'node:assert/strict';
import { AgentPermissionGate, AgentRuntime, scoreCapability } from './index.js';
const task={id:'t1',workflowId:'w1',agentId:'a1',objective:'test',risk:'LOW' as const,budget:{maxToolCalls:2,timeoutMs:1000}};
test('permission gate denies by default',()=>{const gate=new AgentPermissionGate();assert.equal(gate.check('a1','search','GLOBAL'),'DENY')});
test('runtime permits explicitly granted capability',async()=>{const gate=new AgentPermissionGate();gate.grant({agentId:'a1',capability:'search',scope:'GLOBAL',decision:'ALLOW',reason:'test'});const runtime=new AgentRuntime(gate);assert.deepEqual(await runtime.run(task,'search'),'${ok:true}')});
test('runtime requires approval for non-low-risk approval tasks',async()=>{const runtime=new AgentRuntime();const result=await runtime.run({...task,risk:'HIGH',requiresApproval:true},'search');assert.equal(result.ok,false);assert.match(result.error??'','approval')});
test('capability scoring rewards required and trusted matches',()=>{const result=scoreCapability({id:'n',name:'n',required:['search'],preferred:['voice'],forbidden:[],risk:'LOW'},{id:'c',capabilities:['search','voice'],status:'TRUSTED',risk:'LOW'});assert.equal(result.score,0.8)});
