import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowRegistry, type WorkflowManifest } from "../src/workflow-registry.js";

const sampleManifest: WorkflowManifest = {
  id: "cp2000-response", name: "CP2000 Response", verticalId: "notice-respond",
  capabilities: ["classification", "extraction", "deadline", "strategy", "draft", "validation", "approval", "mailing"],
  certification: "development", wave: 2,
  routes: ["/workflows/cp2000", "/api/workflows/cp2000"], apiBase: "/api/workflows/cp2000",
};

describe("workflow registry", () => {
  test("registers and retrieves a workflow", () => {
    const registry = createWorkflowRegistry();
    registry.register(sampleManifest);
    const w = registry.get("cp2000-response");
    assert.notEqual(w, null);
    assert.equal(w!.id, "cp2000-response");
  });

  test("prevents duplicate registration", () => {
    const registry = createWorkflowRegistry();
    registry.register(sampleManifest);
    assert.throws(() => registry.register(sampleManifest));
  });

  test("lists by vertical", () => {
    const registry = createWorkflowRegistry();
    registry.register(sampleManifest);
    registry.register({ ...sampleManifest, id: "cp14-response", name: "CP14 Response" });
    const list = registry.list({ verticalId: "notice-respond" });
    assert.equal(list.length, 2);
  });

  test("lists by wave", () => {
    const registry = createWorkflowRegistry();
    registry.register(sampleManifest);
    registry.register({ ...sampleManifest, id: "cp14-response", wave: 2 });
    registry.register({ ...sampleManifest, id: "code-enforcement-records", wave: 1 });
    assert.equal(registry.listByWave(2).length, 2);
    assert.equal(registry.listByWave(1).length, 1);
  });

  test("certifies a development workflow", () => {
    const registry = createWorkflowRegistry();
    registry.register(sampleManifest);
    registry.certify("cp2000-response");
    assert.equal(registry.get("cp2000-response")!.certification, "certified");
  });

  test("promotes certified to production", () => {
    const registry = createWorkflowRegistry();
    registry.register(sampleManifest);
    registry.certify("cp2000-response");
    registry.promoteToProduction("cp2000-response");
    assert.equal(registry.get("cp2000-response")!.certification, "production");
  });

  test("resolves by route", () => {
    const registry = createWorkflowRegistry();
    registry.register(sampleManifest);
    const w = registry.resolveByRoute("/workflows/cp2000");
    assert.notEqual(w, null);
    assert.equal(w!.id, "cp2000-response");
  });
});
