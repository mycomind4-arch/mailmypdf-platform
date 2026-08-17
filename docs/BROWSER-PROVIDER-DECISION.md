# Browser provider decision gate

The Platform will not select a browser runtime based on popularity alone.

## Candidates

- Vercel agent-browser — TypeScript/Node-facing CLI, Apache-2.0.
- browser-use — autonomous browser agent/runtime candidate.

## Required evidence

A provider must demonstrate:

- policy enforcement that cannot be bypassed by agent prompts;
- reliable cleanup;
- bounded resource usage;
- deterministic cancellation;
- evidence/provenance support;
- tenant credential isolation;
- acceptable latency and task success;
- acceptable maintenance and dependency risk;
- licensing compatibility.

## Decision rule

The first provider to pass the complete Platform benchmark is an **experimental adapter**, not automatically a production dependency. Production promotion requires a second review covering threat modeling, deployment isolation, observability and rollback.
