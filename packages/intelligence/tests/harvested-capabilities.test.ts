import test from 'node:test';
import assert from 'node:assert/strict';
import { detectMissingInfo } from '../src/missing-info.js';
import { evaluateResponseQuality } from '../src/response-quality.js';
import { explainDeadline } from '../src/explainability.js';

test('missing-information engine identifies blocking gaps', () => {
  const items = detectMissingInfo({ facts: [], deadline: { certainty: 'missing' }, evidenceCount: 0 });
  assert.ok(items.some(i => i.impact === 'blocking'));
  assert.ok(items.some(i => i.category === 'deadline'));
});

test('quality engine fails incomplete drafts', () => {
  const report = evaluateResponseQuality({ draftContent: '', facts: [], evidence: [], unresolvedPlaceholders: ['recipient'] });
  assert.equal(report.passed, false);
  assert.equal(report.unresolvedPlaceholders, 1);
});

test('explainability preserves deadline uncertainty', () => {
  const explanation = explainDeadline({ date: '2026-09-01', certainty: 'ambiguous', source: 'notice page 2' });
  assert.equal(explanation.verified, false);
  assert.equal(explanation.confidence, 'unverified');
  assert.ok(explanation.assumptions.length > 0);
});
