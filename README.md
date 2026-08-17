# MailMyPDF Platform

Reusable technology platform for the MailMyPDF product family.

The Platform is the shared technology bank and vertical-factory foundation. It supplies reusable document, intelligence, evidence, search, agent, security, redaction, accessibility, voice and workflow capabilities. MailMyPDF remains the canonical ecosystem owner for identity, accounts, billing, mailing, fulfillment, tracking and proof-of-service.

## Build a vertical

Start with a `VerticalManifest`, run the Vertical Factory planner, resolve missing capabilities and conflicts, then implement the vertical against Platform contracts. Do not fork shared capabilities into a vertical.

Example manifest: `packages/vertical-factory/examples/code-enforcement-records-request.json`.

## Verification

CI runs frozen-lockfile installation, typecheck, build and tests on pushes to main/harvest and pull requests.
