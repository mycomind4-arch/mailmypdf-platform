import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryVoiceToolRegistry } from "../src/index.js";

test("voice registry rejects duplicate tools", () => {
  const registry = new InMemoryVoiceToolRegistry();
  const tool = {
    name: "case.read",
    description: "Read the current case",
    requiresApproval: false,
    execute: async () => ({ ok: true }),
  };
  registry.register(tool);
  assert.throws(() => registry.register(tool), /already registered/);
});

test("voice registry executes a registered tool with session context", async () => {
  const registry = new InMemoryVoiceToolRegistry();
  registry.register({
    name: "case.read",
    description: "Read the current case",
    requiresApproval: false,
    execute: async (_args, context) => ({ caseId: context.caseId }),
  });
  const result = await registry.execute(
    { name: "case.read", arguments: {}, requiresApproval: false },
    { sessionId: "session-1", ownerId: "owner-1", caseId: "case-1", transport: "livekit" },
  );
  assert.deepEqual(result, { caseId: "case-1" });
});
