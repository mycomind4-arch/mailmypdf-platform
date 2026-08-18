import test from 'node:test';
import assert from 'node:assert/strict';
import { unavailableRuntime, uiErrorMessage } from './runtime-adapters.js';

test('all seven UI capabilities fail truthfully when runtime is unavailable', async () => {
  const results = await Promise.all([
    unavailableRuntime.cases.list(),
    unavailableRuntime.documents.list(),
    unavailableRuntime.agents.listRuns(),
    unavailableRuntime.actions.listPending(),
    unavailableRuntime.proof.list(),
    unavailableRuntime.integrations.health(),
    unavailableRuntime.command.execute('analyze case 48291'),
  ]);
  assert.equal(results.length, 7);
  assert.ok(results.every((result) => !result.ok));
  assert.equal(uiErrorMessage(results[0]), 'Case runtime is not connected.');
});
