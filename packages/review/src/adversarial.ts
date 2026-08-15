/**
 * Framework-agnostic adversarial review primitives promoted from Appeal Mail's
 * Stress Test. This package deliberately avoids appeal-specific ground types.
 * Verticals supply their own claims, evidence and context.
 */

export type ReviewSeverity = "critical" | "serious" | "moderate";
export type SupportStatus = "strong" | "moderate" | "needs_verification" | "gap";
export type ReviewStatus = "open" | "mitigated" | "dismissed";

export interface ReviewClaim {
  readonly id: string;
  readonly text: string;
  readonly evidenceIds: readonly string[];
  readonly confidence: number;
}

export interface ReviewEvidence {
  readonly id: string;
  readonly description: string;
  readonly confidence: number;
  readonly verified: boolean;
}

export interface ReviewChallenge {
  readonly id: string;
  readonly claimId: string;
  readonly challenge: string;
  readonly whatWouldDefeat: string;
  readonly evidenceNeeded: readonly string[];
  readonly severity: ReviewSeverity;
  readonly status: ReviewStatus;
}

export interface ReviewProfile {
  readonly claimId: string;
  readonly score: number;
  readonly support: SupportStatus;
  readonly components: readonly {
    readonly label: string;
    readonly status: SupportStatus;
    readonly detail: string;
  }[];
  readonly whatCouldChangeIt: string;
}

export interface ReviewWeakestLink {
  readonly claimId?: string;
  readonly title: string;
  readonly description: string;
  readonly severity: ReviewSeverity;
  readonly fixAction: string;
}

export interface ReviewResult {
  readonly challenges: readonly ReviewChallenge[];
  readonly profiles: readonly ReviewProfile[];
  readonly weakestLink: ReviewWeakestLink | null;
  readonly summary: {
    readonly totalClaims: number;
    readonly wellSupported: number;
    readonly needsVerification: number;
    readonly vulnerable: number;
    readonly overallScore: number;
  };
  readonly reviewedAt: string;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const normalizeConfidence = (value: number): number => clamp(Number.isFinite(value) ? value : 0, 0, 1);

function profileClaim(claim: ReviewClaim, evidence: readonly ReviewEvidence[]): ReviewProfile {
  const linked = evidence.filter((item) => claim.evidenceIds.includes(item.id));
  const verified = linked.filter((item) => item.verified);
  const averageEvidence = linked.length === 0
    ? 0
    : linked.reduce((sum, item) => sum + normalizeConfidence(item.confidence), 0) / linked.length;
  const claimConfidence = normalizeConfidence(claim.confidence);

  const factual: SupportStatus = claim.text.trim().length >= 20 ? "strong" : "needs_verification";
  const documentary: SupportStatus = verified.length >= 2 ? "strong" : verified.length === 1 ? "moderate" : linked.length ? "needs_verification" : "gap";
  const confidence: SupportStatus = claimConfidence >= 0.8 && averageEvidence >= 0.7
    ? "strong"
    : claimConfidence >= 0.5 && averageEvidence >= 0.4
      ? "moderate"
      : "needs_verification";

  const points = [factual, documentary, confidence].map((status) =>
    status === "strong" ? 100 : status === "moderate" ? 70 : status === "needs_verification" ? 40 : 0,
  );
  const score = Math.round(points.reduce((a, b) => a + b, 0) / points.length);
  const support: SupportStatus = score >= 80 ? "strong" : score >= 60 ? "moderate" : score >= 30 ? "needs_verification" : "gap";

  return {
    claimId: claim.id,
    score,
    support,
    components: [
      { label: "Claim specificity", status: factual, detail: claim.text.trim().length >= 20 ? "Claim is specific enough to review." : "Claim is too short or vague to verify reliably." },
      { label: "Documentary support", status: documentary, detail: linked.length ? `${linked.length} linked evidence item(s), ${verified.length} verified.` : "No linked evidence." },
      { label: "Confidence", status: confidence, detail: `Claim confidence ${Math.round(claimConfidence * 100)}%; evidence average ${Math.round(averageEvidence * 100)}%.` },
    ],
    whatCouldChangeIt: linked.length === 0
      ? "Add source-linked evidence that directly supports the claim."
      : "Add stronger, independently verified evidence or resolve uncertainty.",
  };
}

function challengeClaim(claim: ReviewClaim, profile: ReviewProfile): ReviewChallenge {
  const missing = profile.support === "gap" || profile.support === "needs_verification";
  return {
    id: `${claim.id}:challenge`,
    claimId: claim.id,
    challenge: missing
      ? "An opposing reviewer could challenge this claim because its support is incomplete, weak, or insufficiently verified."
      : "An opposing reviewer could challenge the interpretation, relevance, or completeness of the evidence supporting this claim.",
    whatWouldDefeat: profile.whatCouldChangeIt,
    evidenceNeeded: missing
      ? ["Primary source document", "Independent corroboration", "Timestamped or otherwise verifiable record"]
      : ["Direct source citation", "Contrary-source check", "Evidence showing the claim remains valid under the strongest alternative interpretation"],
    severity: profile.score < 40 ? "critical" : profile.score < 70 ? "serious" : "moderate",
    status: profile.score >= 80 ? "mitigated" : "open",
  };
}

export function runAdversarialReview(
  claims: readonly ReviewClaim[],
  evidence: readonly ReviewEvidence[],
): ReviewResult {
  if (claims.length > 1000 || evidence.length > 5000) {
    throw new RangeError("Review input exceeds the platform resource limit");
  }

  const profiles = claims.map((claim) => profileClaim(claim, evidence));
  const challenges = claims.map((claim, index) => challengeClaim(claim, profiles[index]!));
  const weakest = profiles.reduce<ReviewProfile | null>((current, profile) =>
    current === null || profile.score < current.score ? profile : current, null);

  const weakestLink: ReviewWeakestLink | null = weakest
    ? {
        claimId: weakest.claimId,
        title: "Weakest supported claim",
        description: `Claim ${weakest.claimId} has the lowest support score (${weakest.score}/100).`,
        severity: weakest.score < 40 ? "critical" : weakest.score < 70 ? "serious" : "moderate",
        fixAction: weakest.whatCouldChangeIt,
      }
    : null;

  const total = profiles.length;
  const wellSupported = profiles.filter((p) => p.support === "strong").length;
  const needsVerification = profiles.filter((p) => p.support === "needs_verification").length;
  const vulnerable = profiles.filter((p) => p.support === "gap").length;
  const overallScore = total ? Math.round(profiles.reduce((sum, p) => sum + p.score, 0) / total) : 0;

  return {
    challenges,
    profiles,
    weakestLink,
    summary: { totalClaims: total, wellSupported, needsVerification, vulnerable, overallScore },
    reviewedAt: new Date().toISOString(),
  };
}
