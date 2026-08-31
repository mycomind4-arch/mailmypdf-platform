const capabilityToMethod = {
    classification: "classify",
    extraction: "extract",
    deadlines: "deadlines",
    findings: "findings",
    discrepancies: "discrepancies",
    evidence: "evidence",
    research: "research",
    risk: "risk",
    strategy: "strategy",
    draft: "draft",
    validation: "validation",
    review: "review",
    approval: "approval",
    mailing: "mailing",
    tracking: "tracking",
    proofAudit: "proofAudit",
};
export function diagnoseDomainPack(pack, manifest) {
    return manifest.capabilities.map((capability) => {
        const method = capabilityToMethod[capability];
        return {
            capability,
            method,
            status: typeof pack[method] === "function" ? "executable" : "missing",
        };
    });
}
export function isExecutableDomainPack(pack, manifest) {
    return diagnoseDomainPack(pack, manifest).every((diagnostic) => diagnostic.status === "executable");
}
export function missingCapabilities(pack, manifest) {
    return diagnoseDomainPack(pack, manifest)
        .filter((diagnostic) => diagnostic.status === "missing")
        .map((diagnostic) => diagnostic.capability);
}
export function isConsequentialStage(stage) {
    return ["review", "approval", "mailing", "tracking", "proofAudit"].includes(stage);
}
