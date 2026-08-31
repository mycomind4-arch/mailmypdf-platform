/**
 * Canonical Gold Standard workflow runner.
 *
 * Domain packs own domain intelligence. The runner owns lifecycle semantics,
 * stage ordering, and consequential-action gates. Missing capability is never
 * silently treated as success.
 */
export const GOLD_STANDARD_PIPELINE_STAGES = [
    "security", "classification", "extraction", "provenance", "deadline",
    "contradiction", "findings", "discrepancy", "evidence", "research",
    "risk", "strategy", "draft", "draftProvenance", "validation",
    "blockingGate", "review", "approval", "mailing", "tracking", "proofAudit",
];
const intelligenceStages = GOLD_STANDARD_PIPELINE_STAGES.slice(0, 15);
export async function runGoldStandardPipeline(workflowId, pack, input) {
    const stages = [];
    const run = async (stage, fn) => {
        try {
            const result = await fn();
            if (result.stage !== stage) {
                stages.push({ stage, status: "failed", messages: [`Stage contract mismatch: expected ${stage}, received ${result.stage}.`] });
                return false;
            }
            stages.push(result);
            return result.status !== "failed" && result.status !== "blocked";
        }
        catch (error) {
            stages.push({ stage, status: "failed", messages: [error instanceof Error ? error.message : String(error)] });
            return false;
        }
    };
    const ordered = [
        ["security", () => pack.security(input)],
        ["classification", () => pack.classify(input)],
        ["extraction", () => pack.extract(input)],
        ["provenance", () => pack.provenance(input, stages)],
        ["deadline", () => pack.deadlines(input, stages)],
        ["contradiction", () => pack.contradictions(input, stages)],
        ["findings", () => pack.findings(input, stages)],
        ["discrepancy", () => pack.discrepancies(input, stages)],
        ["evidence", () => pack.evidence(input, stages)],
        ["research", () => pack.research(input, stages)],
        ["risk", () => pack.risk(input, stages)],
        ["strategy", () => pack.strategy(input, stages)],
        ["draft", () => pack.draft(input, stages)],
        ["draftProvenance", () => pack.draftProvenance(input, stages)],
        ["validation", () => pack.validation(input, stages)],
    ];
    // Run intelligence stages sequentially. Stop on first failure, but always
    // add the blockingGate so consumers can see why consequential stages are blocked.
    let intelligenceOk = true;
    for (const [stage, fn] of ordered) {
        if (!(await run(stage, fn))) {
            intelligenceOk = false;
            break;
        }
    }
    const validation = stages.find((s) => s.stage === "validation");
    const blockingGate = {
        stage: "blockingGate",
        status: validation?.status === "passed" ? "passed" : "blocked",
        messages: validation?.status === "passed"
            ? ["All pre-review validation passed; consequential stages may proceed only through their explicit gates."]
            : ["Validation did not pass; review, approval, mailing, tracking, and proof certification are blocked."],
    };
    stages.push(blockingGate);
    if (!intelligenceOk || blockingGate.status !== "passed") {
        return { workflowId, status: "blocked", stages };
    }
    const consequential = [
        ["review", () => pack.review(input, stages)],
        ["approval", () => pack.approval(input, stages)],
        ["mailing", () => pack.mailing(input, stages)],
        ["tracking", () => pack.tracking(input, stages)],
        ["proofAudit", () => pack.proofAudit(input, stages)],
    ];
    for (const [stage, fn] of consequential) {
        if (!(await run(stage, fn)))
            return { workflowId, status: "blocked", stages };
    }
    return { workflowId, status: "completed", stages };
}
export function isGoldStandardPipeline(result) {
    return GOLD_STANDARD_PIPELINE_STAGES.every((stage) => {
        const found = result.stages.find((candidate) => candidate.stage === stage);
        return found?.status === "passed";
    });
}
export function hasCompleteIntelligence(result) {
    return intelligenceStages.every((stage) => result.stages.some((candidate) => candidate.stage === stage && candidate.status === "passed"));
}
