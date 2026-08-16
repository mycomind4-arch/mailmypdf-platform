# Ecosystem Harvest — Finishing Audit

## Promoted capability families

- provenance / source-backed facts
- case / correspondence primitives
- AI provider adapter
- document security boundary
- consequential-action approval
- search orchestration / agents
- PII detection / redaction geometry
- evidence completeness
- accessibility audit
- governed agent runtime
- vertical factory planning

## Deliberately canonical

MailMyPDF remains the owner of identity, billing, mailing, tracking, proof-of-service and customer account lifecycle.

## Deliberately not imported

Provider-specific application code, vertical policy rules, UI implementations, credentials, autonomous authority, and duplicated implementations where the Platform already has a stronger generalized capability.

## Factory rule

A vertical is generated from a manifest and selected Platform capabilities. The factory must report missing capabilities and conflicts before implementation. It must not silently fork a Platform capability.

## Verification state

The repository now has a reproducible CI workflow for frozen-lockfile installation, typecheck, build and tests. The branch also includes a sample Code Enforcement Records Request manifest and runnable Node test configurations for the newly added search and vertical-factory packages.

The GitHub connector cannot execute the CI runner locally, so merge readiness is determined by the repository's actual GitHub Actions result rather than an invented local test result.

## Completion gate

1. CI must pass typecheck, build and test.
2. Changed-file review must show no accidental duplication.
3. Capability registry entries must match promoted packages.
4. No secrets or provider credentials may be imported.
5. MailMyPDF canonical ownership boundaries must remain intact.
6. Sample vertical manifest must produce a valid build plan.
7. Only after these gates pass should the harvest PR be merged.
