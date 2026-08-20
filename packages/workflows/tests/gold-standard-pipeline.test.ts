import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  GOLD_STANDARD_PIPELINE_STAGES,
  hasCompleteIntelligence,
  isGoldStandardPipeline,
  runGoldStandardPipeline,
  type DomainPack,
  type StageResult,
} from "../src/index.js";

const passed = (stage: string): StageResult => ({ stage: stage as any, status: "passed", messages: [] });

function makePack(): DomainPack {
  const pack: Record<string, any> = {
    id: "fixture",
    security: async () => passed("security"),
    classify: async () => passed("classification"),
    extract: async () => passed("extraction"),
  };
  for (const stage of GOLD_STANDARD_PIPELINE_STAGES.filter((stage) => !["security", "classification", "extraction", "blockingGate"].includes(stage))) {
    pack[stage] = async () => passed(stage);
  }
  return pack as DomainPack;
}

describe("gold-standard pipeline", () => {
  test("executes the complete lifecycle in canonical order", async () => {
    const result = await runGoldStandardPipeline("fixture", makePack(), { documents: [] });
    assert.equal(result.status, "completed");
    assert.deepEqual(result.stages.map((stage) => stage.stage), GOLD_STANDARD_PIPELINE_STAGES);
    assert.equal(hasCompleteIntelligence(result), true);
    assert.equal(isGoldStandardPipeline(result), true);
  });

  test("blocks before consequential actions when validation fails", async () => {
    const pack = makePack();
    pack.validation = async () => ({ stage: "validation", status: "blocked", messages: ["missing evidence"] });
    const result = await runGoldStandardPipeline("fixture", pack, { documents: [] });
    assert.equal(result.status, "blocked");
    assert.deepEqual(result.stages.map((stage) => stage.stage), [
      ...GOLD_STANDARD_PIPELINE_STAGES.slice(0, 15),
      "blockingGate",
    ]);
  });

  test("rejects adapter stage mismatches", async () => {
    const pack = makePack();
    pack.extract = async () => passed("classification");
    const result = await runGoldStandardPipeline("fixture", pack, { documents: [] });
    assert.equal(result.status, "blocked");
    assert.equal(result.stages.at(-1)?.stage, "extraction");
    assert.equal(result.stages.at(-1)?.status, "failed");
  });

  test("blocks when approval fails", async () => {
    const pack = makePack();
    pack.approval = async () => ({ stage: "approval", status: "blocked", messages: ["human approval required"] });
    const result = await runGoldStandardPipeline("fixture", pack, { documents: [] });
    assert.equal(result.status, "blocked");
    assert.equal(result.stages.at(-1)?.stage, "approval");
    assert.equal(isGoldStandardPipeline(result), false);
  });
});
