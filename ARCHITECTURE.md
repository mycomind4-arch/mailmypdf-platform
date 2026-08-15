# MailMyPDF Platform Architecture

## 1. System model

```text
                         MAILMYPDF ECOSYSTEM

                              MailMyPDF
                     fulfillment + payment + proof
                                  |
                         MailMyPDF Platform
                                  |
       +--------------------------+--------------------------+
       |            |             |             |             |
   Documents   Intelligence     AI         Workflows       UI
       |            |             |             |             |
       +------------+-------------+-------------+-------------+
                                  |
                          Vertical Applications
                                  |
       +-------------+------------+-------------+-------------+
       |             |            |             |             |
     Appeal     Immigration   Notice       Dispute      Small Business
                               Respond
                                  |
                           Future Verticals
                                  |
                 Debt / Benefits / Tenant / Claims /
                       Records / Permit / etc.
```

## 2. Package boundaries

### core
Stable primitives: identifiers, validation, errors, results, dates, configuration, and shared types.

### documents
Document metadata, extraction contracts, classification contracts, provenance, hashes, and document lifecycle abstractions.

### intelligence
Reusable fact, evidence, contradiction, timeline, deadline, finding, confidence, and provenance primitives.

### ai
Model abstraction, structured output, schema validation, routing, retries, prompt registry, evaluation, safety, and tracing contracts.

### workflows
Future deterministic workflow runtime: triggers, conditions, actions, schedules, approvals, retries, and idempotency.

### proof
Artifact hashing, audit events, proof packet structures, verification, and lifecycle contracts.

### fulfillment
A stable adapter boundary to MailMyPDF fulfillment. The platform should not duplicate the fulfillment implementation.

### agents
Future capability registry, policy, approval, audit, and agent runtime. Do not activate this layer prematurely.

### ui / design-system
Reusable family UI primitives and design tokens. Vertical applications own domain-specific composition and copy.

### connectors
Reusable external-service adapters only when there is demonstrated reuse.

## 3. Reuse rule

A capability should be considered for extraction into the platform when it is useful to at least three verticals or is foundational infrastructure that must remain consistent across products.

Examples:

- Timeline engine: platform.
- Evidence model: platform.
- Appeal Stress Test: vertical.
- Immigration-specific requirement rules: vertical.
- Mailing API adapter: platform boundary, implementation owned by MailMyPDF.

## 4. AI architecture

```text
Input
  -> task contract
  -> model router
  -> structured output
  -> schema validation
  -> confidence/provenance
  -> deterministic policy
  -> human approval when required
  -> side effect
  -> audit event
```

AI must not bypass application authorization, policy, or audit controls.

## 5. Evidence architecture

```text
Claim
  +-- supporting evidence
  +-- contradicting evidence
  +-- missing evidence
  +-- source provenance
```

Facts must distinguish user-provided information, extracted information, inferred information, and AI suggestions.

## 6. Timeline architecture

Timeline events should preserve:

- event identity
- date/time where known
- event type
- description
- source document
- source location where available
- provenance
- confidence
- conflict state

The platform should support domain-specific rule packs without hard-coding a single domain's rules into the core engine.

## 7. Proof architecture

```text
Original document
      -> extracted facts
      -> user edits
      -> final correspondence
      -> attachments
      -> approval
      -> payment
      -> mailing
      -> tracking
      -> delivery
      -> proof packet
```

Critical artifacts may be hashed where appropriate. Proof must remain understandable to a normal user.

## 8. Dependency strategy

The initial platform should remain framework-light. Prefer TypeScript packages with explicit contracts and minimal runtime coupling. Do not create microservices or a monorepo of deployed applications merely for architectural appearance.

## 9. Versioning strategy

The platform will eventually expose versioned packages so verticals can upgrade intentionally. Breaking changes require migration notes and regression coverage.

## 10. Non-goals

- Rebuilding MailMyPDF fulfillment inside this repository.
- Storing every vertical's domain-specific rules here.
- Becoming a generic CRM.
- Becoming a generic agent framework.
- Adding integrations without demonstrated reuse.
