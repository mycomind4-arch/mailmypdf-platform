# Vertical Technology Consolidation

**Date:** 2026-08-15

This document records the reusable technology promoted into the platform from the recent Notice Respond and Appeal Mail upgrades.

## Promoted from Notice Respond

### Persistence safety contracts
- `@mailmypdf/persistence` defines owner-scoped repository access.
- Missing owner identity fails closed with `VALIDATION_ERROR`.
- Cross-owner access fails with `UNAUTHORIZED`.
- `RepositoryError` gives applications a stable error taxonomy without coupling the platform to Supabase or another provider.
- `mergeAppendOnlyVersions()` protects version history from stale-writer overwrite.
- `executeSave()` turns persistence failures into explicit state that applications can surface and retry instead of silently swallowing errors.
- `AppendOnlyAuditStore` defines immutable audit persistence semantics; the database implementation remains application-owned.

## Promoted from Appeal Mail

### Adversarial review
- `@mailmypdf/review` generalizes the useful part of Appeal Mail's Stress Test.
- Claims and evidence are scored independently of any appeal-specific ground type.
- The engine produces challenges, evidence requirements, support profiles, and a weakest-link assessment.
- Resource limits prevent unbounded review input.
- The package is deterministic and framework-agnostic; LLM prompting remains a vertical concern.

## Already present in Platform

The platform already contains the generic equivalents of several major Appeal/Notice capabilities:

- provenance
- evidence graph
- contradiction detection
- timeline with precision/integrity
- deadline rules and calculation
- findings
- risk assessment
- case assessment/readiness
- production document security foundation

These were not duplicated.

## Intentionally excluded

The platform does not absorb:

- Supabase/Auth implementations
- Stripe/Lob/Resend integrations
- React/TanStack components
- Appeal-specific X-Ray extraction heuristics
- appeal grounds and workflow definitions
- Notice Respond's notice-specific extraction/domain logic
- vertical-specific prompts

The rule is: **promote reusable machinery, not vertical product behavior.**
