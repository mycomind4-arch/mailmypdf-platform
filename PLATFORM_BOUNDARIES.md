# Platform Boundaries

**Date:** 2026-08-14

Explicit definition of what belongs where in the MailMyPDF ecosystem.

---

## The Four Layers

### 1. MailMyPDF Application (mailmypdf repo)

**Owns:** Canonical fulfillment, payment, mailing, tracking, and proof-of-service infrastructure.

**What belongs here:**
- Physical mail provider integration (Lob adapter)
- Payment processing (Stripe checkout, refunds, subscriptions, webhooks)
- Email notifications (Resend)
- PDF generation (pdf-lib)
- File storage (Supabase Storage adapter)
- Document upload API (`/v1/documents`)
- Communications API (`/v1/communications`)
- Tracking webhook handling (Lob webhooks)
- Proof-of-service custody chain and bundle generation
- Mail job state machine
- Address verification
- Rate limiting at the API gateway level
- User authentication and organization management
- Admin dashboard and analytics
- SEO landing pages and marketing site
- Vertical product modules (appeal-reply, benefits-appeal, etc.) — these are MailMyPDF's own product implementations, NOT the same as standalone vertical apps

**What does NOT belong here:**
- Reusable domain primitives (facts, evidence, timeline, deadlines) — that's the platform
- AI calling contracts — that's the platform
- Design tokens — that's the platform

### 2. MailMyPDF Platform (mailmypdf-platform repo)

**Owns:** Reusable technology primitives that multiple verticals consume.

**What belongs here:**

**Core primitives:**
- Branded types (PlatformId, Confidence)
- Result type (ok/err)
- Typed errors
- Validation utilities
- Date/time utilities
- Configuration interfaces
- Logging interfaces
- Environment handling
- Common domain type building blocks

**Document model:**
- Document lifecycle (UPLOADED → VALIDATING → PROCESSING → EXTRACTED → ANALYZED → READY → FAILED)
- Document metadata (filename, MIME type, size, hash, pages)
- Document provenance
- Document classification contract
- Security validation contract (max size, MIME types, forbidden content)
- Extraction interface (verticals implement the actual extraction)

**Intelligence primitives:**
- SourceRef model (document → page → locator)
- Provenance classification (USER_PROVIDED, EXTRACTED, INFERRED, VERIFIED, AI_SUGGESTED, EXTERNAL_SOURCE)
- Fact model (subject, predicate, value, source, confidence, provenance, status, timestamps, conflicting values)
- Evidence model (claim, supporting, contradicting, missing, source, relevance, confidence, provenance)
- Contradiction model (statement A vs statement B, sources, confidence, comparison method, severity, review status)
- Timeline model (event, date/time, type, description, source, provenance, confidence, status, date precision)
- Deadline primitives (event + rule = deadline, separated: date extraction / rule evaluation / calculation)
- Finding model (type, severity, confidence, title, explanation, source, evidence, recommended action)

**AI platform:**
- AI task contract (task ID, input schema, model, structured output, validation, retries, fallback)
- AI result contract (output, confidence, model, sources, warnings, token/cost metadata, provenance)
- Model routing interface (task → model selection based on accuracy/latency/cost/context)
- Evaluation framework (input → task → expected → actual → comparison → score → regression detection)

**Proof and audit:**
- Audit event model (timestamped, attributable, structured, queryable, immutable)
- Proof artifact model (artifact, hash, version, kind)
- Proof packet model (artifacts + events + subject + timestamp)

**Fulfillment boundary:**
- Fulfillment adapter interface (createMailing, getMailing, cancelMailing, getTracking, getProof)
- Status normalization utility (mapStatus)
- Idempotency contract
- Provider error types

**Design:**
- Design tokens (color, typography, spacing, radius, shadows, borders, status, z-index, breakpoints)
- Reusable UI component contracts (not implementations — verticals own their React components)

**What does NOT belong here:**
- Lob, Stripe, Resend, or Supabase SDK integrations
- Authentication implementation
- Payment processing
- PDF generation
- Vertical-specific domain logic (appeal grounds, immigration document types, notice workflows)
- Agent runtime (premature)
- External schedulers (Temporal, Trigger.dev, n8n)
- CRM integrations
- Database schema or migrations
- API routes or server functions

### 3. Vertical Applications (appeal-mail, immigration-mail, notice-respond, dispute-mail)

**Own:** Domain-specific intelligence, user experiences, and workflow definitions.

**What belongs here:**
- Domain schemas (appeal grounds, immigration document types, dispute categories, notice types)
- Domain-specific document types and classifications
- Domain-specific finding types
- Domain-specific workflow definitions
- Domain-specific AI prompts and skills
- Domain-specific extraction logic (pattern matching, AI prompts)
- Domain-specific deadline rules (e.g., "appeal must be filed within 30 days of decision")
- Domain-specific UI components and pages
- Domain-specific API routes
- Supabase integration (auth, storage, database)
- Stripe checkout integration (via MailMyPDF)
- MailMyPDF fulfillment integration (via platform adapter)
- User authentication and session management
- Application-level rate limiting and security

**What does NOT belong here:**
- Generic document model (use platform)
- Generic fact/evidence/timeline/finding models (use platform)
- AI calling infrastructure (use platform)
- MailMyPDF API client implementation (use platform adapter)
- Status mapping logic (use platform utility)
- Design tokens (use platform)

### 4. MailMyPDF Small Business (mailmypdf-smallbusiness)

**Owns:** Business-specific automation, CRM integration, and workflow execution.

**What belongs here:**
- Business correspondence workspace
- CRM integrations (EspoCRM, Twenty)
- Business workflow engine (Trigger.dev, scheduling)
- Business-specific agent skills (draftCorrespondence, analyzeCorrespondence, recommendMailClass)
- Business-specific intent planning
- Business-specific schedule coordination
- Business CRM data store
- Command Center UI

**What should eventually consume from platform:**
- Document model
- Fact/evidence/timeline/finding models
- AI contract
- Fulfillment adapter
- Proof/audit event model
- Approval model
- Design tokens

**What does NOT belong in platform (stays here):**
- CRM integrations
- Trigger.dev/Temporal/n8n adapters
- Business-specific agent runtime
- Business-specific workflow engine implementation

---

## Boundary Rules

1. **The platform never imports from a vertical.** Dependencies flow downward: Platform ← Vertical ← MailMyPDF.

2. **The platform never imports from MailMyPDF.** The fulfillment adapter interface lives in the platform; MailMyPDF implements it. The platform defines the contract; MailMyPDF owns the implementation.

3. **Verticals import from the platform, not from each other.** If Appeal Mail and Immigration Mail need the same thing, it goes in the platform.

4. **Domain-specific logic never goes in the platform.** Appeal grounds, immigration document types, dispute categories, notice workflows — all stay in their verticals.

5. **AI prompts are vertical-specific.** The platform provides the AI calling contract; verticals provide the prompts.

6. **The platform is framework-agnostic.** No React, no TanStack, no Vite. Pure TypeScript packages.

7. **MailMyPDF is the only place that touches Lob, Stripe, or Resend directly.** Verticals go through the platform adapter, which calls MailMyPDF's API.

8. **The platform does not own a database.** It defines models; verticals and MailMyPDF own their own persistence.

9. **A capability must be useful to at least 2 verticals or be foundational infrastructure to justify platform inclusion.**

10. **The platform prioritizes stability over features.** Once a package is consumed by a production vertical, breaking changes require migration notes and regression coverage.

---

## Dependency Flow

```
                    ┌─────────────┐
                    │  Platform   │
                    │ (primitives)│
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌──────────┐    ┌──────────┐    ┌──────────────┐
   │ Verticals│    │ Verticals│    │  Small Biz   │
   │(Appeal,  │    │(Notice,  │    │              │
   │ Immig)   │    │ Dispute) │    │              │
   └────┬─────┘    └────┬─────┘    └──────┬───────┘
        │               │                 │
        └───────────────┼─────────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │  MailMyPDF  │
                 │(fulfillment)│
                 └─────────────┘
```

Verticals depend on Platform (for primitives) and MailMyPDF (for fulfillment, via the Platform adapter interface). They never depend on each other. The Platform never depends on any of them.
