# Ecosystem Capability Harvest Matrix

## Promotion rule

Only promote technology that is generic, tested, provider-isolated, and useful to at least two verticals. Domain-specific policy stays in its source vertical.

## 22 milestones

1. Inventory sibling repositories.
2. Classify capabilities as canonical, promoted, candidate, experimental, or vertical-only.
3. Establish provenance as a shared primitive.
4. Establish verified facts with source references.
5. Establish correspondence records.
6. Promote Cloudflare Workers AI as a provider adapter.
7. Standardize untrusted document input handling.
8. Standardize consequential-action approval boundaries.
9. Add document SHA-256 identity candidate.
10. Add redaction capability candidate.
11. Add rate-limit capability candidate.
12. Add evidence-report capability candidate.
13. Add search/evidence-collection capability candidate.
14. Add investigation-orchestration capability candidate.
15. Add image preprocessing capability candidate.
16. Add redaction-workflow capability candidate.
17. Add access/policy enforcement capability candidate.
18. Add verifiable-record capability candidate.
19. Add parcel/proof evidence capability candidate.
20. Add policy-engine capability candidate.
21. Add timeline/deadline/contradiction/quality/explainability candidates.
22. Keep MailMyPDF fulfillment, identity, billing, mailing, tracking and proof canonical rather than forking them.

## Source-specific findings

### TrustTrace
Useful reusable patterns include hashing, redaction, rate limiting, evidence/report records, and signed/shareable report concepts. The Platform should extract the generic algorithms/contracts, not the TrustTrace product UI.

### FairProcess
Source references, verified facts, case/correspondence state, and policy-engine boundaries are strong reusable foundations. The code-enforcement jurisdiction logic remains vertical-specific.

### Ruth Solv Flow
The Cloudflare Workers AI adapter is reusable infrastructure. Its domain prompts and UI are not.

### Notice Respond
Timeline, deadline, contradiction, quality, explainability, security and response-versioning patterns are strong candidates for promotion after interface normalization.

### MailMyPDF
Fulfillment, identity, billing, mailing, tracking and proof remain canonical. They should be consumed through ecosystem contracts rather than copied into Platform.

## Next extraction order

1. TrustTrace integrity/redaction/rate-limit primitives.
2. Notice Respond intelligence engines.
3. FairProcess policy/timeline primitives.
4. Advanced Search evidence collection.
5. Redact Desk document privacy workflow.
6. Image Upscale document-photo preprocessing.
7. AccessForge policy enforcement.
8. Ruthless Investigator orchestration, after security review.
9. Civic Ledger / ParcelProof integrity concepts, after license and overlap review.
