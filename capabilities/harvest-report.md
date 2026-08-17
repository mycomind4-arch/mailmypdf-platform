# Capability Harvest Report — 2026-08-16

## Repositories reviewed

The authenticated account exposes 30+ repositories. The highest-relevance sources reviewed in this pass were MailMyPDF, MailMyPDF Platform, FairProcess, Ruth Solv Flow, Immigration-Mail, Appeal-Mail, Notice-Respond, Dispute-Mail, TrustTrace, ParcelProof, Civic Ledger, Redact Desk, AccessForge, Advanced Search, and Ruthless Investigator.

## Promoted now

1. **SourceReference + VerifiedFact** — from FairProcess. Generic provenance is directly reusable across every correspondence vertical.
2. **Case/Correspondence records** — from FairProcess. The generic lifecycle is useful for requests, notices, appeals, disputes, and immigration correspondence.
3. **Cloudflare Workers AI adapter** — from Ruth Solv Flow. Provider adapter is reusable; domain prompts stay in verticals.
4. **Untrusted-document AI boundary** — promoted from Immigration-Mail's security work into the shared platform.
5. **Consequential-action approval boundary** — promoted from the Immigration-Mail voice safety model.

## Kept canonical rather than copied

Mailing fulfillment, tracking, proof, payments, and ecosystem identity remain owned by MailMyPDF. The Platform should consume stable contracts rather than fork those implementations.

## Not promoted yet

- Domain policy engines from FairProcess.
- Immigration-specific classifiers/workflows.
- Investigation-specific search logic.
- Redaction UI.
- Civic/parcel domain models.
- Vertical-specific templates.

These may become reusable later, but copying them now would violate the platform/vertical boundary.

## Next harvest targets

- FairProcess deterministic policy/evaluator primitives behind a generic policy interface.
- TrustTrace/ParcelProof integrity primitives if their source implementations provide a distinct capability beyond the existing proof model.
- Advanced Search/Ruthless Investigator source orchestration behind a provider-neutral research interface.
- Redact Desk redaction engine if it is generic and testable.
- Image Upscale preprocessing behind a document-image adapter if benchmarks justify it.
