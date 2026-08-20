import { describe, expect, it } from "vitest";
import { isGoldStandardPipeline, runGoldStandardPipeline, type DomainPack } from "./gold-standard-pipeline";

const passed = (stage: any, data?: unknown) => ({ stage, status: "passed" as const, data, messages: [] });

function makePack(): DomainPack {
  const pack: any = {
    id: "fixture",
    security: async () => passed("security"),
    classify: async () => passed("classification"),
    extract: async () => passed("extraction"),
  };
  for (const stage of [
    "provenance", "deadline", "contradiction", "findings", "discrepancy",
    "evidence", "research", "strategy", "draft", "draftProvenance", "validation",
  ]) pack[stage] = async () => passed(stage);
  return pack;
}

describe("gold-standard pipeline", () => {
  it("executes every required intelligence stage in order", async () => {
    const result = await runGoldStandardPipeline("fixture", makePack(), { documents: [] });
    expect(result.status).toBe("ready_for_review");
    expect(result.stages.map((stage) => stage.stage)).toEqual([
      "security", "classification", "extraction", "provenance", "deadline",
      "contradiction", "findings", "discrepancy", "evidence", "research",
      "strategy", "draft", "draftProvenance", "validation", "blockingGate",
    ]);
    expect(isGoldStandardPipeline(result)).toBe(true);
  });

  it("blocks when validation fails", async () => {
    const pack = makePack();
    pack.validation = async () => ({ stage: "validation", status: "blocked", messages: ["missing evidence"] });
    const result = await runGoldStandardPipeline("fixture", pack, { documents: [] });
    expect(result.status).toBe("blocked");
    expect(isGoldStandardPipeline(result)).toBe(false);
  });
});
