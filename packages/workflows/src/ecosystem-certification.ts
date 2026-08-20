/**
 * Static ecosystem certification ledger.
 *
 * Metadata-only by design: the platform does not dynamically execute sibling
 * vertical repositories. Each entry records the strongest state demonstrated
 * by the vertical's own code/tests, with deployment and external-provider work
 * kept explicitly separate from code-side readiness.
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
    blockedBy: ["deployed provider/path certification"],
    evidence: ["strict sequential runtime gate", "runtime transition regression suite", "reference implementation test/build history"],
  },
  {
    repo: "appeal-mail",
    workflow: "appeal-workflows",
    engine: "appeal",
    status: "executable",
    executableCapabilities: ["document-classification", "fact-extraction", "deadline-analysis", "evidence-analysis", "contradiction-analysis", "drafting", "draft-validation", "readiness-review"],
    blockedBy: ["production submission/tracking/proof certification", "deployed-path verification"],
    evidence: ["factory capability gate", "pack-backed capability resolution", "factory regression tests"],
  },
  {
    repo: "dispute-mail",
    workflow: "credit-report",
    engine: "dispute",
    status: "executable",
    executableCapabilities: ["classification", "extraction", "evidence", "strategy", "validation", "approval", "mailing", "tracking", "proofAudit"],
    blockedBy: ["runtime wiring for all consequential predicates", "deployed fulfillment certification", "remote CI verification"],
    evidence: ["credit-report domain analyzer", "evidence/finding blocking predicates", "consequential submission regression gates"],
  },
  {
    repo: "dispute-mail",
    workflow: "debt-validation,billing-error,unauthorized-charge",
    engine: "dispute",
    status: "catalog",
    executableCapabilities: [],
    blockedBy: ["dedicated domain packs and executable analysis not yet implemented"],
    evidence: ["explicit partial/catalog lifecycle metadata"],
  },
  {
    repo: "immigration-mail",
    workflow: "immigration-response",
    engine: "document-action",
    status: "executable",
    executableCapabilities: ["document", "facts", "deadlines", "evidence", "authority", "strategy", "draft", "validation", "review", "approval", "mailing", "tracking", "proof"],
    blockedBy: ["deployed fulfillment certification", "remote CI verification"],
    evidence: ["document-understanding", "preflight", "Gold certification gate", "consequential regression coverage"],
  },
  {
    repo: "mailmypdf-smallbusiness",
    workflow: "business-workflows",
    engine: "document-action",
    status: "executable",
    executableCapabilities: ["trigger", "document", "validation", "approval", "mailing", "tracking", "proof", "archive"],
    blockedBy: ["persistent production storage", "authenticated scheduling API", "live MailMyPDF credentials", "carrier webhooks", "permanent proof storage", "team permissions", "deployed smoke certification"],
    evidence: ["Trigger.dev durable execution boundary", "approval-before-send certification", "evidence-bearing Gold runner"],
  },
  {
    repo: "gov-reply",
    workflow: "government-response",
    engine: "document-action",
    status: "domain-ready",
    executableCapabilities: ["receive", "understand", "deadline", "evidence", "strategy", "response", "review", "authorization", "submission", "tracking", "proof"],
    blockedBy: ["actual persistence/execution runtime", "MailMyPDF fulfillment integration", "deployed tracking/proof", "live CI verification"],
    evidence: ["evidence-bearing Gold runner", "source-grounded AI analysis worker", "Gold regression tests"],
  },
  {
    repo: "code-enforcement",
    workflow: "code-enforcement-response",
    engine: "jurisdictional",
    status: "domain-ready",
    executableCapabilities: ["secure-ingest", "classify", "extract", "timeline", "evidence", "discrepancies", "strategy", "draft", "validate", "review", "authorization", "submit", "track", "proof"],
    blockedBy: ["actual domain runtime wiring", "property/jurisdiction infrastructure", "MailMyPDF fulfillment", "deployed verification"],
    evidence: ["evidence-bearing Gold runner", "Gold regression tests"],
  },
  {
    repo: "records-requests",
    workflow: "records-request",
    engine: "records",
    status: "executable",
    executableCapabilities: ["validation", "review", "approval", "PDF rendering", "SHA-256 attestation", "idempotent submission", "tracking", "proof callback"],
    blockedBy: ["real D1 provisioning", "live MailMyPDF credentials", "deployed integration test", "authenticated approval actor", "production webhook registration"],
    evidence: ["D1-compatible repository", "database lifecycle constraints", "attested server-side PDF", "idempotent provider request", "HMAC callback verification"],
  },
  {
    repo: "permit-response",
    workflow: "permit-response",
    engine: "jurisdictional",
    status: "domain-ready",
    executableCapabilities: ["permit-specific requirements", "evidence mapping", "authority checks"],
    blockedBy: ["shared Code Enforcement runtime boundary", "actual execution path", "fulfillment/tracking/proof"],
    evidence: ["permit-specific domain contract and tests"],
  },
  {
    repo: "benefits-appeal",
    workflow: "benefits-appeal",
    engine: "appeal",
    status: "domain-ready",
    executableCapabilities: ["issue extraction", "evidence gating", "authority checks", "appeal validation"],
    blockedBy: ["shared Appeal Mail/FairProcess runtime boundary", "actual execution path", "filing/mail/proof integration"],
    evidence: ["benefits-specific contract and tests"],
  },
  {
    repo: "debt-defense",
    workflow: "debt-defense",
    engine: "dispute",
    status: "catalog",
    executableCapabilities: [],
    blockedBy: ["dedicated repo contains architecture/SEO decisions only", "must first validate reuse inside Dispute Mail"],
    evidence: ["execution decision explicitly defers implementation until reuse is proven"],
  },
  {
    repo: "tenant-reply",
    workflow: "tenant-reply",
    engine: "document-action",
    status: "catalog",
    executableCapabilities: [],
    blockedBy: ["planned vertical; dedicated repo contains architecture/SEO decisions only", "shared infrastructure runtime not connected"],
    evidence: ["execution decision explicitly defers implementation"],
  },
  {
    repo: "insurance-claims",
    workflow: "insurance-claims",
    engine: "document-action",
    status: "catalog",
    executableCapabilities: [],
    blockedBy: ["planned vertical", "current repo is primarily UI/workflow catalog", "shared intelligence and fulfillment runtime not connected"],
    evidence: ["README explicitly marks vertical as planned"],
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
