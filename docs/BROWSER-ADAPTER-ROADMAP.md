# Browser adapter roadmap

## Step 1 — capability boundary
Complete. Platform contracts live in `@mailmypdf/browser-intelligence` with no runtime dependency.

## Step 2 — package integration
Complete. Package participates in the pnpm `packages/*` workspace and has build/typecheck/test/lint scripts.

## Step 3 — policy enforcement
Complete. HTTPS, allowlisting, local/private host blocking, action budgets, time/download limits, and approval semantics are represented.

## Step 4 — security tests
Complete. Policy and validation tests cover allowlisting, unsafe protocols, local hosts, budgets, invalid policies, and consequential approval.

## Step 5 — adapter contract
Complete. Providers must validate policy, enforce it per navigation/action, isolate credentials, emit provenance, and clean up on failure.

## Step 6 — TypeScript adapter benchmark
Next. Evaluate `vercel-labs/agent-browser` behind the contract using only public, non-sensitive deterministic tasks.

## Step 7 — autonomous worker benchmark
Then evaluate `browser-use` in an isolated Node/Python worker. Keep it outside the Cloudflare runtime.

## Step 8 — evidence integration
Connect browser observations/screenshots to the Platform evidence model with tenant/case scope and content hashes.

## Step 9 — production decision
Choose an adapter only after benchmark results, security review, licensing review, resource profiling, and failure-recovery tests. If neither passes, retain the interface without a production adapter.
