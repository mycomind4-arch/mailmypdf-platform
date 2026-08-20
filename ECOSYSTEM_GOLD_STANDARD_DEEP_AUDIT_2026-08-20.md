# MailMyPDF Ecosystem — Gold Standard Deep Code Audit

Date: 2026-08-20

## Objective

Spend the day moving the MailMyPDF ecosystem from workflow metadata and isolated contracts toward genuinely executable Gold Standard workflows.

Gold means the workflow can prove, through code and tests, that it performs:

`ingest → classify → extract → provenance → deadlines → contradictions → findings → discrepancies → evidence → research → risk → strategy → draft → draft provenance → validation → blocking gate → human review → approval → mailing → tracking → proof/audit`

A workflow must not be called Gold because its UI, route, catalog entry, manifest, or lifecycle runner exists.

## Audit criteria

A workflow is evaluated against four distinct states:

- **catalog** — surfaced product/workflow intent, but no executable domain capability.
- **domain-ready** — domain contract and/or analysis exists, but runtime path is not complete.
- **executable** — domain/runtime lifecycle exists and blocks correctly; external production verification may still remain.
- **gold** — executable plus zero blockers, representative regression coverage, real fulfillment/tracking/proof integration, and deployed end-to-end verification.

## Cross-ecosystem findings

### P0 — state-machine bypass risk

Several mature verticals had transition functions that could return success without executing validation/evidence/approval gates. The most serious instance was Notice Respond, where forward `goToStep()` navigation could skip every consequential phase.

Status: **fixed in Notice Respond**.

### P0 — provenance-free Gold stages

GovReply, Code Enforcement, and Small Business Gold runners accepted bare boolean success values. A dependency could return `true` with no source, document, provider, actor, tracking, or proof evidence.

Status: **fixed in all three runners**. Regression tests now reject successful-looking stages without evidence IDs.

### P0 — non-idempotent physical-mail submission

Records Requests previously transitioned to `queued`, called fulfillment, then attempted additional state transitions. Provider success followed by a local transition error could permit a retry to submit duplicate physical mail.

Status: **hardened** with deterministic idempotency key derived from request ID + document hash and state reconciliation.

Remaining: the external MailMyPDF service must honor the idempotency key in deployed execution.

### P0 — caller-supplied approval actor

Records Requests approval accepts an `actor` string from the request body. That value is recorded as audit attribution but is not yet an authenticated identity/role proof.

Status: **open code-side blocker**.

Required: connect the approval endpoint to the real authenticated identity/authorization boundary and record the verified principal, not caller-supplied identity text.

### P1 — capability metadata versus implementation

Appeal Mail previously granted capabilities from workflow steps. That loophole has been removed. Capabilities now come from concrete packs, and specialized capabilities require explicit pack declaration.

Status: **fixed**.

### P1 — main product versus standalone vertical registry drift

The historical core MailMyPDF registry temporarily presented ten verticals as live product surfaces. The current architecture intentionally separates the three next-generation master verticals from legacy/standalone migration targets.

The correct model is now:

- MailMyPDF = shared platform/master vertical directory.
- Standalone repos = workflow homes for specialized verticals.
- Platform certification ledger = authoritative engineering readiness, not marketing status.

Status: **architecture clarified**.

## Repository audit matrix

| Repo | Strongest state | Key evidence | Main blockers |
|---|---|---|---|
| `mailmypdf-platform` | executable foundation | canonical pipeline, domain-pack contract, ecosystem certification ledger, CI | networked lockfile/build verification and sibling-runtime integration |
| `mailmypdf` | shared production platform | payment/fulfillment/security hardening, retention, rate limiting, private PDFs | operational secrets, cron, alerting, bot protection, E2E provider verification |
| `notice-respond` | executable | mature CP14/CP2000 stack, strict runtime gate, regression suite | deployed provider/path certification |
| `appeal-mail` | executable domain/runtime | pack-backed factory, quality gates, capability regressions | deployed submission/tracking/proof |
| `dispute-mail` credit-report | executable domain | deterministic analysis, evidence/finding gates, submission gate | runtime wiring, deployed fulfillment |
| `dispute-mail` other workflows | catalog | explicit partial state | domain packs/analysis |
| `immigration-mail` | executable domain/runtime | document understanding, preflight, validation/review/approval/mail/proof gates | deployed fulfillment/tracking/proof |
| `mailmypdf-smallbusiness` | executable workflow framework | Trigger.dev durable task, approval ordering, evidence-bearing Gold runner | persistence, authenticated scheduling, fulfillment, tracking, proof, team auth |
| `gov-reply` | domain-ready | source-grounded AI worker, evidence-bearing Gold runner | persistence, runtime execution, fulfillment, tracking/proof |
| `code-enforcement` | domain-ready | evidence-bearing lifecycle runner and tests | real runtime wiring, property/jurisdiction engines, fulfillment |
| `records-requests` | executable | D1 repo, DB constraints, server-side attested PDF, idempotent provider boundary, HMAC callback | D1 provisioning, authenticated approval, live provider, deployed E2E |
| `permit-response` | domain-ready | permit-specific contract and tests | Code Enforcement/shared runtime boundary |
| `benefits-appeal` | domain-ready | benefits-specific contract and tests | Appeal Mail/FairProcess runtime boundary |
| `debt-defense` | catalog | explicit execution decision | must validate reuse inside Dispute Mail |
| `tenant-reply` | catalog | explicit execution decision | shared runtime not connected |
| `insurance-claims` | catalog | planned UI/workflow directory | shared intelligence/runtime not connected |

## Gold Standard priority order for the day

### Wave 1 — close runtime bypasses

1. Notice Respond — verify all forward navigation and mailing entry points use the strict runtime.
2. Records Requests — authenticate approval; verify submit/retry/idempotency invariants.
3. Dispute Mail — wire `canApproveDispute` and `canSubmitDispute` into the real runtime.
4. Appeal Mail — wire factory capability state to actual workflow execution.

### Wave 2 — convert contract runners into real executable runtimes

5. Immigration Mail — wire certification to actual mailing entry points.
6. Small Business — connect Gold runner to real workflow executor and Trigger task; make persistence/approval/tracking durable.
7. GovReply — add persisted case lifecycle and real submission boundary.
8. Code Enforcement — connect jurisdiction/property/evidence engines to the Gold runner.

### Wave 3 — activate dependent verticals

9. Benefits Appeal — specialize the Appeal Mail engine.
10. Permit Response — specialize Code Enforcement/shared property infrastructure.
11. Debt Defense — implement inside Dispute Mail where reuse is proven.
12. Tenant Reply — build from shared document/timeline/evidence primitives.
13. Insurance Claims — build only after shared evidence/timeline primitives are proven reusable.

### Wave 4 — ecosystem certification

14. Run package-level and repo-level tests.
15. Run deployed smoke tests.
16. Verify real fulfillment/tracking/proof.
17. Promote workflows to Gold only when blocker count reaches zero.

## Required test invariants

Every Gold runner should have regression coverage proving:

1. a successful-looking stage with no provenance blocks;
2. missing evidence blocks consequential action;
3. failed validation blocks review/approval/mailing;
4. missing approval blocks mailing;
5. incomplete recipient blocks submission;
6. provider failure creates a deterministic recoverable state;
7. provider success cannot be duplicated by retry;
8. tracking must exist before completion;
9. proof must exist before Gold completion;
10. users cannot jump directly to consequential steps through alternate navigation paths.

## External-agent handoff

The following remain account/deployment operations rather than pure repository work:

- Cloudflare D1 provisioning and migrations.
- Live MailMyPDF fulfillment credentials.
- Provider webhook registration/secrets.
- Deployed runtime smoke tests.
- Stripe/Lob sandbox transactions.
- Cloudflare cron and alerting configuration.
- Production secret rotation/verification.

Those operations should be performed only after the repository-level gates are green.

## Rule for today

Do not add more catalog pages merely to make progress look larger.

Spend the day converting existing workflow definitions into **provable execution paths** and closing the gaps between:

`catalog → domain-ready → executable → Gold`.
