/**
 * Static ecosystem certification ledger.
 *
 * This is intentionally metadata-only: the platform repository cannot execute
 * code from sibling vertical repositories at runtime yet. Each entry therefore
 * records the strongest state actually demonstrated in that vertical repo.
 */

export type EcosystemStatus = "catalog" | "domain-ready" | "executable" | "gold";

export type EcosystemCertification = {
  repo: string;
  workflow: string;
  engine: "document-action" | "dispute" | "records" | "appeal" | "jurisdictional";
  status: EcosystemStatus;
  executableCapabilities: readonly string[];
  blockedBy: readonly string[];
  evidence: readonly string[];
};

export const ECOSYSTEM_CERTIFICATIONS: readonly EcosystemCertification[] = [
  {
    repo: "notice-respond",
    workflow: "cp2000-response",
    engine: "document-action",
    status: "executable",
    executableCapabilities: ["classification", "extraction", "deadlines", "discrepancies", "evidence", "research", "strategy", "draft", "validation", "review", "approval", "mailing"],
    blockedBy: ["strict runtime gate still needs wiring into workflow-runtime.ts", "deployed provider/path certification"],
    evidence: ["815 passing tests and successful Cloudflare build were previously documented for the reference implementation"],
  },
  {
    repo: "appeal-mail",
    workflow: "appeal-workflows",
    engine: "appeal",
    status: "executable",
    executableCapabilities: ["document-classification", "fact-extraction", "deadline-analysis", "evidence-analysis", "contradiction-analysis", "drafting", "draft-validation", "readiness-review"],
    blockedBy: ["production submission/tracking/proof certification", "deployed-path verification"],
    evidence: ["factory capability gate and regression tests"],
  },
  {
    repo: "dispute-mail",
    workflow: "credit-report",
    engine: "dispute",
    status: "executable",
    executableCapabilities: ["classification", "extraction", "evidence", "strategy", "validation", "approval", "mailing", "tracking", "proofAudit"],
    blockedBy: ["deployed fulfillment certification", "remote CI status absent"],
    evidence: ["credit-report domain analyzer", "consequential approval/submission regression gates"],
  },
  {
    repo: "immigration-mail",
    workflow: "immigration-response",
    engine: "document-action",
    status: "executable",
    executableCapabilities: ["document", "facts", "deadlines", "evidence", "authority", "strategy", "draft", "validation", "review", "approval", "mailing", "tracking", "proof"],
    blockedBy: ["deployed fulfillment certification", "remote CI status not established in this pass"],
    evidence: ["document-understanding", "preflight", "Gold certification gate and regression coverage"],
  },
  {
    repo: "mailmypdf-smallbusiness",
    workflow: "business-workflows",
    engine: "records",
    status: "executable",
    executableCapabilities: ["scheduling", "approval", "mailing", "tracking", "proof"],
    blockedBy: ["persistent production storage", "authenticated scheduling API", "live MailMyPDF credentials", "carrier webhooks", "permanent proof storage", "team permissions"],
    evidence: ["Trigger.dev v4 durable execute-mail-job", "workflow capability certification", "approval-before-send regression gate"],
  },
  {
    repo: "records-requests",
    workflow: "records-request",
    engine: "records",
    status: "executable",
    executableCapabilities: ["validation", "review", "approval", "PDF rendering", "document hash", "submission", "tracking", "proof callback"],
    blockedBy: ["real D1 provisioning", "live MailMyPDF credentials", "deployed integration test"],
    evidence: ["D1-compatible repository", "state machine", "PDF renderer", "HMAC callback verification"],
  },
  {
    repo: "permit-response",
    workflow: "permit-response",
    engine: "jurisdictional",
    status: "domain-ready",
    executableCapabilities: ["permit-specific requirements", "evidence mapping", "authority checks"],
    blockedBy: ["shared Code Enforcement runtime boundary not verified"],
    evidence: ["permit-specific domain contract and tests"],
  },
  {
    repo: "benefits-appeal",
    workflow: "benefits-appeal",
    engine: "appeal",
    status: "domain-ready",
    executableCapabilities: ["issue extraction", "evidence gating", "authority checks", "appeal validation"],
    blockedBy: ["shared Appeal Mail/FairProcess runtime boundary not verified"],
    evidence: ["benefits-specific contract and tests"],
  },
] as const;

export function getEcosystemCertification(repo: string, workflow: string): EcosystemCertification | undefined {
  return ECOSYSTEM_CERTIFICATIONS.find((entry) => entry.repo === repo && entry.workflow === workflow);
}

export function isEcosystemExecutable(entry: EcosystemCertification): boolean {
  return entry.status === "executable" || entry.status === "gold";
}

export function isEcosystemGold(entry: EcosystemCertification): boolean {
  return entry.status === "gold" && entry.blockedBy.length === 0;
}
