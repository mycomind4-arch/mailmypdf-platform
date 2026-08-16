# Browser Intelligence Proof of Concept

## Objective

Introduce browser control as a Platform capability without coupling the core application to a particular browser framework.

## Proposed interface

```ts
export interface BrowserIntelligence {
  session(input: BrowserSessionInput): Promise<BrowserSession>
}

export interface BrowserSession {
  navigate(url: string): Promise<BrowserObservation>
  inspect(): Promise<BrowserObservation>
  click(target: string): Promise<BrowserObservation>
  type(target: string, value: string): Promise<BrowserObservation>
  screenshot(): Promise<BrowserEvidence>
  close(): Promise<void>
}
```

The real implementation should add stricter types, capability declarations, cancellation, timeouts and policy enforcement before production use.

## First adapter candidates

1. `vercel-labs/agent-browser` for Node/TypeScript-native browser control.
2. `browser-use/browser-use` for richer autonomous browser behavior in an isolated worker.

Neither should be imported into the Cloudflare Worker/core domain package.

## Security boundary

Every session must have:

- explicit allowed domains;
- navigation/action/time budgets;
- download and upload limits;
- isolated credentials/session storage;
- no access to Platform secrets by default;
- SSRF protection and private-network blocking;
- explicit approval for login, payment, submission, deletion or other consequential actions;
- screenshot/action provenance attached to evidence;
- cancellation and cleanup on timeout.

## Evidence model

A browser observation should be capable of producing a provenance record containing:

- URL;
- timestamp;
- action performed;
- relevant page title/text hash;
- screenshot reference where appropriate;
- adapter/runtime version;
- session identifier;
- tenant/case scope;
- redaction status.

## Benchmark

Use a fixed set of non-sensitive public websites and deterministic tasks. Compare adapters on:

- successful task completion;
- selector robustness;
- navigation latency;
- memory/CPU;
- recovery from transient failures;
- evidence quality;
- cancellation correctness;
- security-policy enforcement.

Do not benchmark against real customer accounts or production government portals.

## Exit criteria

The POC is successful when a Platform agent can request a bounded browser task through the interface, receive structured observations and provenance, and recover safely from timeout/failure without the browser runtime becoming part of the core domain model.
