# Browser adapter contract

An adapter is an implementation detail. It must never weaken the policy supplied by the Platform.

## Required behavior

1. Validate policy before opening a browser.
2. Enforce the domain allowlist on every navigation, not only the first URL.
3. Enforce action and timeout budgets in the adapter.
4. Block local/private destinations even if the underlying browser library permits them.
5. Keep browser credentials/session storage isolated from Platform secrets.
6. Refuse consequential actions until the Platform approval mechanism authorizes them.
7. Close the browser and release resources on timeout, cancellation, or failure.
8. Emit provenance for observations and evidence.
9. Never expose raw cookies, authorization headers, or secrets through observations.
10. Make retries explicit and idempotent; never replay consequential actions automatically.

## Candidate adapters

- `agent-browser`: first Node/TypeScript benchmark candidate.
- `browser-use`: isolated-worker benchmark candidate for autonomous browser planning.

Neither candidate is a production dependency yet.
