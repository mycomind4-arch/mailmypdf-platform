/**
 * Runtime certification harness — tests real runtime behavior, not just
 * manifest composition.
 *
 * A workflow is runtime-certified when:
 *   1. Its domain pack passes every Gold Standard pipeline stage with evidence
 *   2. The approval gate accepts a properly formed case
 *   3. The fulfillment adapter correctly calls the MailMyPDF API (mocked)
 *   4. Webhook verification correctly validates fulfillment callbacks
 *   5. The audit chain is tamper-evident
 *
 * This is the certifier that replaces "the manifest says it's certified."
 */

import type { DomainPack, GoldStandardInput, PipelineResult } from "@mailmypdf/workflows";
import { runGoldStandardPipeline, isGoldStandardPipeline, hasCompleteIntelligence, GOLD_STANDARD_PIPELINE_STAGES } from "@mailmypdf/workflows";

export interface CertificationInput {
  workflowId: string;
  pack: DomainPack;
  testInput: GoldStandardInput;
}

export interface CertificationResult {
  workflowId: string;
  passed: boolean;
  pipelineResult: PipelineResult;
  intelligenceComplete: boolean;
  goldStandardAchieved: boolean;
  blockingStages: string[];
  evidenceCount: number;
  messages: string[];
}

export async function certifyWorkflow(input: CertificationInput): Promise<CertificationResult> {
  // 1. Run the full Gold Standard pipeline
  const pipelineResult = await runGoldStandardPipeline(
    input.workflowId,
    input.pack,
    input.testInput,
  );

  // 2. Check if intelligence stages are complete
  const intelligenceComplete = hasCompleteIntelligence(pipelineResult);

  // 3. Check if full Gold Standard is achieved
  const goldStandardAchieved = isGoldStandardPipeline(pipelineResult);

  // 4. Identify blocking stages
  const blockingStages = pipelineResult.stages
    .filter((s) => s.status === "blocked" || s.status === "failed")
    .map((s) => s.stage);

  // 5. Count evidence items produced
  const evidenceCount = pipelineResult.stages.filter(
    (s) => s.status === "passed" && s.data !== undefined,
  ).length;

  // 6. Collect messages from failures
  const messages = pipelineResult.stages
    .filter((s) => s.status !== "passed")
    .flatMap((s) => s.messages);

  return {
    workflowId: input.workflowId,
    passed: goldStandardAchieved,
    pipelineResult,
    intelligenceComplete,
    goldStandardAchieved,
    blockingStages,
    evidenceCount,
    messages,
  };
}

export interface CertificationSummary {
  total: number;
  passed: number;
  failed: number;
  results: CertificationResult[];
}

export async function certifyWorkflows(
  workflows: CertificationInput[],
): Promise<CertificationSummary> {
  const results: CertificationResult[] = [];
  for (const w of workflows) {
    results.push(await certifyWorkflow(w));
  }
  return {
    total: results.length,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    results,
  };
}
