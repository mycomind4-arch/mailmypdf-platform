# MailMyPDF Platform

Reusable technology and infrastructure for the MailMyPDF product family.

## Mission

MailMyPDF Platform is the shared technical layer beneath MailMyPDF and its specialized verticals. It provides reusable primitives for document intelligence, evidence, timelines, AI orchestration, workflows, proof, fulfillment integration, UI, voice, security, and ecosystem commerce contracts.

The platform is **not** a vertical application and is not a dumping ground for domain-specific logic.

## Ecosystem account model

**MailMyPDF is the canonical account and identity layer for the entire ecosystem.** A user creates one MailMyPDF account and can access every enabled vertical with that identity.

The platform defines the provider-neutral contracts in `@mailmypdf/ecosystem`; MailMyPDF owns the authentication, billing, and fulfillment implementations.

- Basic **Mail a PDF without a printer** may remain anonymous.
- Rich AI, voice, research, document-intelligence, evidence, and specialized workflows require a MailMyPDF account.
- Free accounts receive limited workflow usage.
- Paid platform plans increase platform usage.
- Physical mailing is always a separate transactional charge.
- Verticals never create competing ecosystem accounts or billing tiers.

See `docs/ECOSYSTEM_ACCOUNT_AND_MONETIZATION.md` for the canonical policy.

## Architectural boundaries

- **MailMyPDF:** canonical identity, accounts/organizations, billing, fulfillment, payments, mailing, tracking, and proof infrastructure.
- **MailMyPDF Platform:** reusable technology and stable ecosystem contracts.
- **Verticals:** specialized domain intelligence, workflows, persistence, and user experiences that consume the shared ecosystem model.
- **Small Business:** business-oriented automation and CRM/workflow capabilities built on the platform where appropriate.

## Initial v0.1 scope

1. Core types and errors
2. Document abstraction
3. Provenance model
4. Fact model
5. Evidence model
6. Timeline primitives
7. Deadline primitives
8. Structured AI interface
9. AI evaluation harness
10. MailMyPDF fulfillment interface
11. Proof and audit-event model
12. Design tokens and reusable UI foundations
13. Ecosystem identity/entitlement/usage contracts
14. Documentation and example adapters

## Advanced capability layer

The platform now defines provider-neutral boundaries for advanced external runtimes:

- **Document intelligence:** Docling-compatible layout/OCR/table extraction through `@mailmypdf/document-intelligence`.
- **Realtime voice:** LiveKit-compatible server sessions and tool execution through `@mailmypdf/voice`.
- **Voice client:** Pipecat-compatible browser integration boundary through `@mailmypdf/voice-client`.
- **AI tools:** provider runtimes operate through platform-scoped tools rather than direct database access.
- **Approval boundary:** consequential voice/AI actions require explicit user approval.

See `docs/ADVANCED_AI_STACK.md` for deployment topology, licensing, and provider-boundary details.

## Vertical factory principle

A generated vertical should inherit the shared ecosystem account, entitlement, usage, AI, document, evidence, voice, proof, and mailing contracts automatically. The vertical generator should compose domain specialization on top of these capabilities instead of rebuilding them.

For example, `Build Code Enforcement Correspondence` should produce a specialized domain application that already knows how to authenticate through MailMyPDF, meter workflow usage, access shared AI/voice/document technology, and route physical mail through the canonical MailMyPDF fulfillment boundary.

## Future layers

- Workflow engine
- Capability registry
- Agent runtime
- Policy/approval engine
- Connector framework
- Expanded evaluation and regression infrastructure
- Production-hosted Docling worker
- Production-hosted LiveKit/Pipecat agent workers
- Automated vertical compiler/generator

## Core principle

> Understand → Structure → Investigate → Recommend → Build → Review → Send → Track → Prove → Follow Up

The platform should make that lifecycle reusable while allowing every vertical to implement its own domain-specific intelligence.

## Development rules

- Prefer reusable primitives over duplicated implementations.
- Keep domain-specific rules in verticals unless they are demonstrably reusable.
- AI outputs must be structured, validated, provenance-aware, and reviewable.
- Uploaded documents are untrusted input.
- Consequential side effects require explicit application policy and authorization.
- Provider runtimes must not receive direct persistence/database access.
- Keep Python/ML/realtime runtimes behind explicit service boundaries rather than forcing them into Cloudflare Workers.
- Every shared capability should have tests and fixtures before being consumed broadly.
- Do not create vertical-specific identity or billing systems when the capability belongs to the MailMyPDF ecosystem.
