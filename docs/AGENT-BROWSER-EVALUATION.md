# agent-browser evaluation

Repository: https://github.com/vercel-labs/agent-browser

Observed GitHub metadata on 2026-08-15: public, active, Apache-2.0 licensed, Rust implementation, positioned as a browser automation CLI for AI agents. It is a strong candidate for the first concrete adapter, but it must remain outside the Platform core and Cloudflare Worker runtime.

## Integration decision

**Status: EXPERIMENTAL CANDIDATE — NOT PRODUCTION ENABLED**

Reason: repository quality and activity justify a POC, but production suitability requires a controlled adapter benchmark and security review of the actual execution environment.

## Required adapter behavior

- Accept only Platform BrowserPolicy-approved navigation.
- Never receive raw Platform secrets by default.
- Block private-network destinations independently of caller policy.
- Bound actions, runtime, downloads and browser session lifetime.
- Require Platform approval before consequential operations.
- Emit provenance for every observation/evidence artifact.
- Destroy browser context on timeout, cancellation or failure.

## Benchmark cases

Use public, deterministic pages only:

1. Read page title and text.
2. Navigate to an allowlisted subdomain.
3. Find and click a deterministic link.
4. Fill a harmless public form without submitting it.
5. Capture evidence and provenance.
6. Attempt a blocked domain.
7. Attempt a blocked private/local destination.
8. Exceed the action budget.
9. Cancel a long-running task.
10. Verify consequential action requires approval.

## Promotion criteria

Do not promote the adapter until it passes security tests, produces complete provenance, cleans up reliably, and demonstrates acceptable success rate/latency/resource usage against the benchmark baseline.
