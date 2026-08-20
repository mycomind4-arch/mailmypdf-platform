/**
 * Canonical gold-standard workflow pipeline contract.
 *
 * This runner deliberately delegates domain intelligence to a DomainPack.
 * It does not fabricate results: unsupported stages remain explicit and block
 * certification/execution rather than being silently skipped.
 */

export type PipelineStage =
  | "security"
  | "classification"
  | "extraction"
  | "provenance"
  | "deadline"
  | "contradiction"
  | "findings"
  | "discrepancy"
  | "evidence"
  | "research"
  | "strategy"
  | "draft"
  | "draftProvenance"
  | "validation"
  | "blockingGate"
  | "review"
  | "approval"
  | "mailing"
  | "tracking";

export interface StageResult<T = unknown> {
  stage: PipelineStage;
  status: "passed" | "warning" | "blocked" | "failed";
  data?: T;
  messages: string[];
}

export interface GoldStandardInput {
  documents: readonly unknown[];
  context?: unknown;
}

export interface DomainPack {
  id: string;
  security(input: GoldStandardInput): Promise<StageResult>;
  classify(input: GoldStandardInput): Promise<StageResult>;
  extract(input: GoldStandardInput): Promise<StageResult>;
  provenance(input: GoldStandardInput, prior: readonly StageResult[]): Promise<StageResult>;
  deadlines(input: GoldStandardInput, prior: readonly StageResult[]): Promise<StageResult>;
  contradictions(input: GoldStandardInput, prior: readonly StageResult[]): Promise<StageResult>;
  findings(input: GoldStandardInput, prior: readonly StageResult[]): Promise<StageResult>;
  discrepancies(input: GoldStandardInput, prior: readonly StageResult[]): Promise<StageResult>;
  evidence(input: GoldStandardInput, prior: readonly StageResult[]): Promise<StageResult>;
  research(input: GoldStandardInput, prior: readonly StageResult[]): Promise<StageResult>;
  strategy(input: GoldStandardInput, prior: readonly StageResult[]): Promise<StageResult>;
  draft(input: GoldStandardInput, prior: readonly StageResult[]): Promise<StageResult>;
  draftProvenance(input: GoldStandardInput, prior: readonly StageResult[]): Promise<StageResult>;
  validation(input: GoldStandardInput, prior: readonly StageResult[]): Promise<StageResult>;
}

export interface PipelineResult {
  workflowId: string;
  status: "ready_for_review" | "blocked" | "failed";
  stages: readonly StageResult[];
}

const requiredStages: readonly PipelineStage[] = [
  "security", "classification", "extraction", "provenance", "deadline",
  "contradiction", "findings", "discrepancy", "evidence", "research",
  "strategy", "draft", "draftProvenance", "validation", "blockingGate",
];

export async function runGoldStandardPipeline(
  workflowId: string,
  pack: DomainPack,
  input: GoldStandardInput,
): Promise<PipelineResult> {
  const stages: StageResult[] = [];
  const run = async (fn: () => Promise<StageResult>) => {
    const result = await fn();
    stages.push(result);
    if (result.status === "failed" || result.status === "blocked") return false;
    return true;
  };

  if (!(await run(() => pack.security(input)))) return { workflowId, status: "blocked", stages };
  if (!(await run(() => pack.classify(input)))) return { workflowId, status: "blocked", stages };
  if (!(await run(() => pack.extract(input)))) return { workflowId, status: "blocked", stages };

  for (const fn of [
    pack.provenance, pack.deadlines, pack.contradictions, pack.findings,
    pack.discrepancies, pack.evidence, pack.research, pack.strategy,
    pack.draft, pack.draftProvenance, pack.validation,
  ]) {
    if (!(await run(() => fn(input, stages)))) return { workflowId, status: "blocked", stages };
  }

  const validation = stages.find((s) => s.stage === "validation");
  const blockingGate: StageResult = {
    stage: "blockingGate",
    status: validation?.status === "passed" ? "passed" : "blocked",
    messages: validation?.status === "passed"
      ? ["Validation passed; workflow may enter human review."]
      : ["Validation did not pass; approval and mailing are blocked."],
  };
  stages.push(blockingGate);

  return {
    workflowId,
    status: blockingGate.status === "passed" ? "ready_for_review" : "blocked",
    stages,
  };
}

export function isGoldStandardPipeline(result: PipelineResult): boolean {
  return requiredStages.every((stage) => {
    const found = result.stages.find((candidate) => candidate.stage === stage);
    return found?.status === "passed";
  });
}
