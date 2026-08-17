# GitHub Technology Acquisition Matrix

Date: 2026-08-15

This document records reusable open-source technologies evaluated for MailMyPDF Platform. The goal is capability acquisition without coupling the Platform to a single external framework.

## Current Platform baseline

The repository is a pnpm 10 monorepo on Node >=20 with recursive build/test/typecheck/lint scripts. Existing packages already include AI and document/voice-oriented capabilities, so new technology must enter through adapters and explicit runtime boundaries rather than duplicated business logic.

## Tier 1 — highest-value candidates

### Browser intelligence

**browser-use/browser-use** — https://github.com/browser-use/browser-use

Use for autonomous browser research and interaction. Strong candidate for a dedicated browser-worker adapter. Keep it outside the Cloudflare Worker runtime; expose narrowly scoped browser tools to Platform agents. Security requirements: domain allowlists, navigation limits, credential isolation, download limits, action budgets, screenshots/evidence provenance, and human approval for consequential actions.

**Vercel agent-browser** — https://github.com/vercel-labs/agent-browser

Evaluate as the TypeScript/browser-control counterpart. Prefer it where the Platform needs a Node-native browser tool; do not duplicate browser implementations in the core package.

### Agent orchestration

**langchain-ai/langgraph** — https://github.com/langchain-ai/langgraph

Strong candidate for durable/stateful agent graphs. Prefer an adapter around Platform's agent contracts rather than making LangGraph the domain model. JavaScript/TypeScript support makes it a particularly useful candidate for Platform integration.

**openai/openai-agents-python** — https://github.com/openai/openai-agents-python

Strong candidate for a Python agent runtime adapter when its tools, handoffs, guardrails, sessions, tracing, or sandbox capabilities are useful. Keep it behind the existing Platform agent/tool contracts.

### Memory / knowledge

**topoteretes/cognee** — https://github.com/topoteretes/cognee

Evaluate for graph-oriented long-term agent memory. Do not import wholesale. First define a Platform memory interface covering entities, relationships, provenance, retention, tenant isolation, deletion, and retrieval.

### Durable execution

**temporalio/temporal** — https://github.com/temporalio/temporal

High-value infrastructure candidate for long-running workflows, retries, timers, and crash recovery. Evaluate operational complexity against Vercel Workflow before adopting. This should remain infrastructure behind Platform workflow contracts.

**vercel/workflow** — https://github.com/vercel/workflow

Evaluate as the lighter TypeScript-oriented durable-workflow option. Prefer if Platform requirements can be satisfied without introducing a separate Temporal service.

### AI observability/evaluation

**langfuse/langfuse** — https://github.com/langfuse/langfuse

Strong candidate for AI tracing, evaluation, prompt/version tracking, cost visibility, and agent run inspection. Prefer the JS SDK/service boundary for the TypeScript Platform and keep sensitive case data out of telemetry by default.

## Tier 2 — evaluate after Tier 1

- Phoenix / Arize: agent/LLM tracing and evaluation.
- OpenLIT: OpenTelemetry-oriented AI observability.
- Qdrant: retrieval/vector infrastructure adapter if current retrieval requirements outgrow existing storage.
- Additional document extraction systems should be benchmarked against the existing Docling boundary rather than added as parallel default pipelines.

## Explicit non-goals

Do not copy complete external applications into Platform. Do not add a second database, vector store, agent framework, voice framework, OCR stack, or browser framework merely because it is popular. Do not force Python/Rust workloads into Cloudflare Workers.

## Proposed adapter architecture

```text
Platform capability interfaces
        |
        +-- BrowserAdapter ---- browser-use / agent-browser
        +-- AgentRuntimeAdapter -- LangGraph / OpenAI Agents
        +-- MemoryAdapter ------- Cognee / future graph store
        +-- WorkflowAdapter ----- Temporal / Vercel Workflow
        +-- ObservabilityAdapter - Langfuse / Phoenix
        +-- DocumentAdapter ------ existing Docling boundary
        +-- VoiceAdapter --------- existing LiveKit/Pipecat boundary
```

## Security and licensing gate

Before any runtime dependency is promoted to a production default, record its license, transitive dependency risk, maintenance/activity, runtime requirements, data-handling model, isolation strategy, and upgrade policy. Model licenses and external data licenses must be reviewed separately from repository licenses.

## Recommended order

1. Browser adapter proof of concept.
2. Agent runtime adapter benchmark: existing Platform runtime vs LangGraph vs OpenAI Agents.
3. Memory interface and Cognee evaluation on representative case data.
4. Durable workflow decision: Vercel Workflow vs Temporal.
5. Langfuse/OpenTelemetry observability integration.
6. Only then promote selected implementations into production defaults.
