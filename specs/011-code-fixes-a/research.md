# Phase 0: Outline & Research

## Decision 1: AdminRoute must redirect during render and keep side effects secondary

- **Decision**: Resolve admin authorization directly in the route render path, while keeping logout and Arabic toast feedback as follow-up side effects.
- **Rationale**: The primary defect is the white-screen frame caused by deferring navigation to an effect. Render-time gating removes the broken intermediate state and aligns with the constitution’s boundary-enforcement rule.
- **Alternatives considered**: Keeping redirect logic inside an effect (preserves the blank-screen bug), moving authorization deeper into page components (violates the route-boundary rule and duplicates logic).

## Decision 2: Plan removal must archive rather than hard-delete

- **Decision**: Treat admin plan removal as an archive action that blocks new purchases while preserving historical records and references.
- **Rationale**: The clarification phase established archive semantics, and subscription products benefit from retaining reporting continuity, auditability, and referential integrity for historical subscriptions.
- **Alternatives considered**: Hard delete when no active subscriptions exist (higher reporting and historical-risk cost), making admins choose archive vs delete per action (adds UX and service complexity not required by scope).

## Decision 3: Contact triage should use a fixed three-state workflow

- **Decision**: Support exactly three contact-request states in this feature: `New`, `Read`, and `Replied`.
- **Rationale**: A fixed workflow keeps filtering, validation, admin actions, and tests straightforward while still covering the business need to review and follow up on requests.
- **Alternatives considered**: Adding a fourth `Closed` state (not required by the spec and adds another transition path), allowing custom statuses (too flexible for a code-fixes slice and harder to validate).

## Decision 4: Email support remains secondary and records only failures operationally

- **Decision**: Add email sending for password-recovery fallback and subscription confirmations, and create operational records only when delivery fails.
- **Rationale**: The constitution and clarified spec preserve phone-based verification as primary. Failure-only operational records give support visibility without flooding storage and dashboards with routine success noise.
- **Alternatives considered**: Logging every success and failure (higher noise and retention cost), using email as a primary verification path (contradicts the clarified scope), shipping confirmation UX without support-visible failure handling (poor operational readiness).

## Decision 5: Production observability should extend the existing logging pipeline with environment-driven monitoring

- **Decision**: Layer Sentry-backed incident capture on top of the existing logging setup and keep all DSN/configuration values environment-driven.
- **Rationale**: The backend already uses Serilog and the dashboards already centralize bootstrapping in `main.tsx`, so adding monitoring at those boundaries provides broad coverage with low structural disruption.
- **Alternatives considered**: Relying on local logs only (insufficient for production triage), building a custom incident table/UI for this feature (too broad and slower to deliver), hardcoding DSNs in source (constitution violation).

## Decision 6: API documentation should build on the existing Swagger/Scalar surface

- **Decision**: Enable XML comments and controller summaries on the current API documentation stack rather than introducing a new documentation mechanism.
- **Rationale**: The source analysis already confirmed Swagger services exist. Extending the existing surface is the smallest change that satisfies the spec’s discoverability goal.
- **Alternatives considered**: Writing standalone docs separate from the live API reference (can drift from behavior), deferring documentation entirely (leaves the readiness gap unresolved).

## Decision 7: Regression coverage must prioritize route auth, shared API behavior, and plan workflows

- **Decision**: Establish backend and frontend test scaffolding, then prioritize coverage for admin route gating, protected-route behavior, auth-related thunks, shared API refresh logic, contact service behavior, and subscription plan create/archive rules.
- **Rationale**: These flows have the highest regression cost because they sit on access boundaries, critical admin operations, and shared request infrastructure.
- **Alternatives considered**: Broad but shallow snapshot-style coverage (lower confidence on behavioral regressions), testing only backend services or only frontend screens (leaves cross-surface gaps in the corrected flows).
