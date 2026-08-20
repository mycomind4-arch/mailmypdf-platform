# Gold Standard Progress

Updated: 2026-08-20

The ecosystem target remains genuine executable Gold Standard for every workflow. `CATALOG` must never be presented as executable capability.

| Milestone | Status | Current evidence |
|---|---|---|
| 1. Contract + complete workflow inventory | ADVANCED | Canonical program and status model established; vertical inventory remains tracked across the MailMyPDF family. |
| 2. Notice Respond reference certification | ADVANCED | Notice Respond remains the reference implementation; its connected-stage depth is the parity target. |
| 3. Shared execution primitives | ADVANCED | Canonical pipeline runner enforces intelligence, validation, blocking, review, approval, mailing, tracking, and proof-audit stages and is represented as `@mailmypdf/workflows`. |
| 4. Domain-pack SDK and adapter contracts | ADVANCED | Executable capability diagnostics reject declared-but-missing runtime methods and separate catalog metadata from runtime capability. |
| 5. Appeal Mail | ADVANCED | Gold-standard gate, mailing readiness gate, and regression coverage are present; remaining work is full deployed-path certification. |
| 6. Dispute Mail | ADVANCED | Credit-dispute analysis contract, fixtures, and explicit lifecycle gate are present; remaining work is full deployed-path certification. |
| 7. Immigration Mail | ADVANCED | Document understanding now extracts action/deadline signals and missing facts/unverified deadlines block execution; remaining work is full deployed-path certification. |
| 8. Small Business + government/administrative | ADVANCED | Small Business has a strict executable lifecycle/capability layer; GovReply and Code Enforcement have lifecycle runners/tests; Records Requests now has stricter executable lifecycle semantics and regression coverage. Real persistence, fulfillment, tracking/proof, authorization, and deployed smoke certification remain explicit gaps. |
| 9. Claims, benefits, debt, tenant, permit, records | IN PROGRESS | Records Requests is the active executable build. Permit Response, Benefits Appeal, Debt Defense, Tenant Reply, and Insurance Claims now have explicit ownership/execution decisions and remain catalog-stage until their shared dependencies are proven reusable. |
| 10. Ecosystem certification + deployed smoke tests | NOT STARTED | — |

## Current hard gates

- Missing or unverified evidence stays explicit and blocks consequential execution.
- A workflow cannot claim capability merely because it appears in a catalog or manifest.
- Validation must pass before review, approval, mailing, tracking, and proof certification.
- Approval and mailing remain explicit runtime stages; they cannot be inferred from a draft or schedule.
- Tests must exercise representative fixtures and regression cases before a workflow can be certified.
- A workflow is not Gold merely because its lifecycle runner exists; the actual production integrations and deployed path must still be verified.
- CI/status checks for the newest platform commits are currently absent from the GitHub connector response, so no passing CI result is being claimed.
- The workspace lockfile predates the new `packages/workflows` workspace package and has not been regenerated in this pass; installation/build certification remains pending until the lockfile is updated by a normal pnpm install in a networked environment.

## Next execution order

1. Regenerate and validate the workspace lockfile, then run the full platform package test/build matrix.
2. Finish Records Requests regression certification and real integration gates.
3. Build the first of the dependent planned verticals only after its shared-owner boundary is proven.
4. Finish Small Business production persistence, authenticated scheduling, fulfillment authentication, carrier tracking, permanent proof, and team approval wiring.
5. Finish deployed-path certification for GovReply, Code Enforcement, Appeal, Dispute, and Immigration.
6. Run ecosystem-wide deployed smoke certification only after workflow-level gates are green.
