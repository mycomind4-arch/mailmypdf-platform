import test from "node:test";
import assert from "node:assert/strict";
import { runAdversarialReview } from "../src/index.js";

test("adversarial review identifies an unsupported claim as the weakest link", () => {
  const result = runAdversarialReview(
    [
      { id: "supported", text: "The filing was received on March 1, 2026.", evidenceIds: ["receipt", "portal"], confidence: 0.95 },
      { id: "weak", text: "The agency acted unfairly.", evidenceIds: [], confidence: 0.3 },
    ],
    [
      { id: "receipt", description: "dated receipt", confidence: 0.95, verified: true },
      { id: "portal", description: "portal record", confidence: 0.9, verified: true },
    ],
  );

  assert.equal(result.summary.totalClaims, 2);
  assert.equal(result.weakestLink?.claimId, "weak");
  assert.ok((result.weakestLink?.severity === "critical" || result.weakestLink?.severity === "serious"));
});

test("verified evidence materially improves a claim profile", () => {
  const result = runAdversarialReview(
    [{ id: "c1", text: "A specific documented event occurred before the deadline.", evidenceIds: ["e1"], confidence: 0.9 }],
    [{ id: "e1", description: "official record", confidence: 0.95, verified: true }],
  );
  assert.equal(result.profiles[0]?.support, "strong");
  assert.ok((result.profiles[0]?.score ?? 0) >= 80);
  assert.equal(result.challenges[0]?.status, "mitigated");
});

test("resource limits fail closed", () => {
  const claims = Array.from({ length: 1001 }, (_, index) => ({
    id: String(index), text: "claim", evidenceIds: [], confidence: 0.1,
  }));
  assert.throws(() => runAdversarialReview(claims, []), RangeError);
});
