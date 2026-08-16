# Technology Integration Gates

No external repository becomes a production dependency merely because it is highly starred or technically impressive.

## Gate A — architecture
- Maps to an existing Platform capability interface.
- Does not duplicate an existing domain model.
- Runtime boundary is explicit.
- Cloudflare compatibility is documented.

## Gate B — security
- Secrets remain server-side.
- Tenant isolation is preserved.
- External execution is sandboxed.
- Browser navigation, downloads, CPU, memory and network use are bounded.
- Human approval exists for irreversible or consequential actions.

## Gate C — provenance
- Agent outputs can reference source documents/actions.
- External browser actions can produce evidence metadata.
- AI traces do not leak sensitive case data.

## Gate D — reliability
- Retry behavior is deterministic/idempotent.
- Long-running work can resume safely.
- Provider failure does not corrupt case state.
- Cancellation is supported.

## Gate E — dependency and license
- Repository license reviewed.
- Transitive licenses reviewed where required.
- Model/data licenses reviewed separately.
- Maintenance/activity assessed.
- Upgrade and rollback strategy documented.

## Gate F — benchmark
Each candidate must be benchmarked against the Platform-native implementation for correctness, latency, resource usage, failure recovery, security, and developer ergonomics.

Only candidates passing all applicable gates may be promoted from experimental to production.
