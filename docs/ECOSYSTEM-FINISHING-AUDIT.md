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

## Completion gate

Before merging the harvest branch:

1. run repository tests
2. run production build
3. inspect changed-file list for accidental duplication
4. verify capability registry entries
5. verify no secrets or provider credentials were imported
6. verify canonical MailMyPDF boundaries remain intact
7. create at least one sample vertical build plan
8. only then merge
