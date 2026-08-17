import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRegistration } from './vertical-factory-contract.js';
import { validateDeploymentManifest } from './deployment-contract.js';
import { reduceVerticalLifecycle,isLaunchable } from './vertical-lifecycle.js';
const vertical=buildRegistration({repository:'mycomind4-arch/immigration-mail',slug:'immigration-mail',name:'Immigration Mail',description:'Immigration correspondence',launchUrl:'https://immigration-mail.pages.dev',capabilities:['documents'],mailingEnabled:true}).vertical;
test('factory registration produces a catalog-ready vertical',()=>{assert.equal(vertical.accountRequired,true);assert.equal(vertical.slug,'immigration-mail')});
test('deployment contract enforces Pages and automatic deployment',()=>{assert.deepEqual(validateDeploymentManifest({repository:'mycomind4-arch/immigration-mail',projectName:'immigration-mail',productionUrl:'https://immigration-mail.pages.dev',previewUrlPattern:'https://*.immigration-mail.pages.dev',automaticOnMain:true,automaticPreviewOnPullRequest:true,healthPath:'/health'}),[])});
test('production lifecycle is launchable only after verification',()=>{const preview=reduceVerticalLifecycle([{id:'1',verticalId:'immigration-mail',state:'preview',deploymentUrl:'https://x.pages.dev',createdAt:'2026-08-17T00:00:00Z'}],vertical);assert.equal(isLaunchable(preview),false);const prod=reduceVerticalLifecycle([{id:'1',verticalId:'immigration-mail',state:'verified',createdAt:'2026-08-17T00:00:00Z'},{id:'2',verticalId:'immigration-mail',state:'production',deploymentUrl:'https://immigration-mail.pages.dev',createdAt:'2026-08-17T01:00:00Z'}],vertical);assert.equal(isLaunchable(prod),true)});
