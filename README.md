# MailMyPDF Platform

Reusable technology and infrastructure for the MailMyPDF product family.

## Mission

MailMyPDF Platform is the shared technical layer beneath MailMyPDF and its specialized verticals. It provides reusable primitives for document intelligence, evidence, timelines, AI orchestration, workflows, proof, fulfillment integration, UI, and security.

The platform is **not** a vertical application and is not a dumping ground for domain-specific logic.

## Architectural boundaries

- **MailMyPDF:** canonical fulfillment, payments, mailing, tracking, and proof infrastructure.
- **MailMyPDF Platform:** reusable technology and primitives.
- **Verticals:** specialized domain intelligence and user experiences.
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
13. Documentation and example adapters

## Future layers

- Workflow engine
- Capability registry
- Agent runtime
- Policy/approval engine
- Connector framework
- Expanded evaluation and regression infrastructure

## Core principle

> Understand → Structure → Investigate → Recommend → Build → Review → Send → Track → Prove → Follow Up

The platform should make that lifecycle reusable while allowing every vertical to implement its own domain-specific intelligence.

## Development rules

- Prefer reusable primitives over duplicated implementations.
- Keep domain-specific rules in verticals unless they are demonstrably reusable.
- AI outputs must be structured, validated, provenance-aware, and reviewable.
- Uploaded documents are untrusted input.
- Consequential side effects require explicit application policy and authorization.
- Do not add an agent framework before the underlying deterministic services and AI skills are mature enough to justify it.
- Every shared capability should have tests and fixtures before being consumed broadly.
