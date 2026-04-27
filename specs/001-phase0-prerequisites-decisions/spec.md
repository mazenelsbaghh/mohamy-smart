# Feature Specification: Phase 0 — Prerequisites & Decisions

**Feature Branch**: `001-phase0-prerequisites-decisions`
**Created**: 2026-04-04
**Status**: Draft
**Input**: User description: "Phase 0 — Prerequisites & Decisions: حسم جميع القرارات التصميمية قبل البدء في أي كود"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Port Assignments Locked (Priority: P1)

The development team needs all four components running on their designated ports without
conflicts, so that local development mirrors the production topology from day one.

The port decisions are already made (Backend: 8976, Lawyer Dashboard: 5078,
Admin Dashboard: 5079, Landing Page: 3000) and need to be formally recorded as the
canonical reference — no component may start on a different port during development.

**Why this priority**: Every other phase depends on this. Mismatched ports cause silent
API failures and CORS errors. This must be resolved before a single line of integration
code is written.

**Independent Test**: Start all four components locally and confirm each responds on its
designated port, and the Lawyer Dashboard can reach the Backend without CORS errors.

**Acceptance Scenarios**:

1. **Given** the repo is freshly cloned, **When** a developer follows the setup guide,
   **Then** each component starts on its designated port without manual overrides.
2. **Given** all four components are running, **When** the Lawyer Dashboard makes an API
   request, **Then** the request reaches the Backend on port 8976 with no CORS error.
3. **Given** both dashboards are running simultaneously, **When** each is opened in a
   browser, **Then** Lawyer Dashboard responds on 5078 and Admin Dashboard on 5079
   with no port collision.

---

### User Story 2 - Email Service Chosen & Integrated (Priority: P2)

The platform owner selects an email service provider so that OTP codes, password-reset
links, and registration confirmations can be delivered to lawyers reliably.

Without a real email service, user registration is incomplete and account recovery is
impossible — two flows that block real-world usage.

**Why this priority**: OTP and password reset are part of the Auth flow that the Lawyer
Dashboard already partially implements. Choosing the provider unlocks the completion of
these flows.

**Independent Test**: Trigger a "Forgot Password" flow from the Lawyer Dashboard login
page and confirm an email arrives in the test inbox within 60 seconds.

**Acceptance Scenarios**:

1. **Given** a lawyer requests a password reset, **When** they submit their email,
   **Then** a reset email arrives in their inbox within 60 seconds.
2. **Given** a new lawyer registers, **When** registration completes, **Then** a
   confirmation email is delivered to the provided address.
3. **Given** a lawyer requests OTP verification, **When** the OTP is triggered,
   **Then** the code arrives via email before the OTP expires.
4. **Given** the email service is down, **When** an email is triggered,
   **Then** the user sees a clear error message and the system logs the failure.

[NEEDS CLARIFICATION: Which email service provider should be used? Options: (A) Brevo/Sendinblue — free tier, good for early-stage SaaS; (B) SendGrid — industry standard for SaaS; (C) Amazon SES — cheapest at scale but requires AWS setup; (D) Gmail SMTP — simplest for solo developers but rate-limited]

---

### User Story 3 - Contact Form Behavior Defined (Priority: P3)

A visitor on the Landing Page fills in the Contact Us form and submits it. The platform
owner needs to decide where that submission goes so that the Landing Page can be
considered complete.

**Why this priority**: The Landing Page is 90% complete. The contact form is the only
non-functional interactive element blocking a "done" status. The behavior choice affects
both the Landing Page scope and possibly the Admin Dashboard scope.

**Independent Test**: Fill in the contact form on the Landing Page, submit it, and confirm
the submission reaches the chosen destination (inbox / DB / external channel) within the
expected time.

**Acceptance Scenarios**:

1. **Given** a visitor fills in the contact form with valid data, **When** they click
   Submit, **Then** the submission reaches the chosen destination within 2 minutes.
2. **Given** a visitor submits the form with an invalid email, **When** they click Submit,
   **Then** an inline validation error appears before the request is sent.
3. **Given** the form is submitted successfully, **When** the page updates,
   **Then** the visitor sees a confirmation message ("Your message has been received").
4. **Given** the delivery service is unavailable, **When** a form is submitted,
   **Then** the user sees an error message and the submission does not silently disappear.

[NEEDS CLARIFICATION: Where should contact form submissions go? Options: (A) Email to the platform owner — simplest, no DB changes needed; (B) Stored in DB and visible in Admin Dashboard — requires new API endpoint and Admin Dashboard page; (C) UI-only with no actual delivery — fastest to implement, lowest value; (D) WhatsApp API — high engagement but requires WhatsApp Business API setup]

---

### User Story 4 - Notification Delivery Mechanism Defined (Priority: P4)

A lawyer receives a notification (e.g., case update, task reminder). The platform owner
needs to decide how notifications are delivered so that the backend notification system
can be completed.

**Why this priority**: The notification model exists in the DB already. Choosing the
delivery mechanism determines how much backend and infrastructure work is needed to
complete the feature.

**Independent Test**: Trigger an in-app notification event and confirm the notification
appears in the lawyer's notification panel within the expected time for the chosen
delivery method.

**Acceptance Scenarios**:

1. **Given** a notification is generated for a lawyer, **When** the lawyer opens the app,
   **Then** the notification appears in their notification list within the session.
2. **Given** the chosen delivery method includes email, **When** a notification is
   generated, **Then** an email is also sent to the lawyer's registered address.
3. **Given** the lawyer has unread notifications, **When** they view the notification panel,
   **Then** unread items are visually distinguished from read items.

[NEEDS CLARIFICATION: How should notifications be delivered? Options: (A) In-app only — notification model already in DB, minimal new work; (B) In-app + Email — requires email service (linked to Story 2) and email templates; (C) In-app + Push Notifications — requires Firebase setup, most effort but best engagement for a mobile-first audience]

---

### User Story 5 - Secrets Management Formalized (Priority: P5)

The development team moves all hardcoded credentials out of source code into a documented,
reproducible secrets management approach — so that the codebase is safe to share and the
deployment process is clear.

**Why this priority**: Hardcoded production DB password, JWT secret, and API keys are in
committed source files right now. This is a security risk that must be resolved before any
further development touches those files.

**Independent Test**: Remove all secret values from committed config files, clone the repo
fresh, follow the setup guide, and confirm the application starts correctly using only
the documented secret injection method.

**Acceptance Scenarios**:

1. **Given** the repo is cloned fresh, **When** a developer follows the secrets setup
   guide, **Then** all services start with no hardcoded values in any committed file.
2. **Given** a developer inspects committed files and git history, **When** they search
   for credentials, **Then** no passwords, API keys, or JWT secrets appear in any commit.
3. **Given** the application is deployed to production, **When** secrets are injected via
   the production mechanism, **Then** the application starts and authenticates correctly.

---

### User Story 6 - Testimonials Management Approach Decided (Priority: P6)

The platform owner decides whether testimonials on the Landing Page are managed statically
in code or dynamically via the Admin Dashboard — so that the scope of both can be finalized.

**Why this priority**: Lower priority because the static default works fine for launch.
This only becomes urgent if the Admin Dashboard scope needs to be expanded.

**Independent Test**: Update a testimonial via the chosen method and confirm the change
is reflected on the Landing Page within the expected time.

**Acceptance Scenarios**:

1. **Given** the static approach is chosen, **When** a developer updates the testimonial
   content, **Then** the Landing Page reflects the change after a redeployment.
2. **Given** the dynamic approach is chosen, **When** an admin edits a testimonial in
   the Admin Dashboard, **Then** the Landing Page reflects the change without redeployment.

---

### User Story 7 - Admin/Lawyer API Separation Strategy Confirmed (Priority: P7)

The backend team confirms whether Admin and Lawyer users share API endpoints (differentiated
by role) or use entirely separate endpoint sets — so that backend development in Phase 3–6
follows a consistent pattern.

**Why this priority**: The recommended approach (shared endpoints with role-based auth) is
clear and low-risk. This story is P7 because the decision is effectively already made; it
just needs to be formally confirmed and documented.

**Independent Test**: An Admin user calls a Lawyer-only endpoint and receives 403 Forbidden.
A Lawyer user calls an Admin-only endpoint and receives 403 Forbidden.

**Acceptance Scenarios**:

1. **Given** an Admin-only endpoint exists, **When** a Lawyer JWT is used to call it,
   **Then** the response is 403 Forbidden with a clear error message.
2. **Given** a shared endpoint with role-based data filtering exists, **When** an Admin
   calls it, **Then** they see aggregated platform data. When a Lawyer calls it, they see
   only their own data.
3. **Given** an unauthenticated request hits any protected endpoint, **When** it arrives,
   **Then** the response is 401 Unauthorized.

---

### Edge Cases

- What happens if a developer starts the backend on a different port than 8976 (e.g.,
  VS Code default 5000)? The setup guide must actively prevent this, not just document it.
- What if the chosen email provider is unavailable during an OTP request?
  The user must receive a meaningful error, not an infinite spinner.
- What if a contact form submission fails to reach the destination?
  Should it be retried, queued, or permanently lost?
- What if both an Admin and a Lawyer have valid tokens — on a shared endpoint,
  what data does each see, and are there data-leakage risks between roles?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The team MUST have a single authoritative document listing all canonical
  port assignments for all four components.
- **FR-002**: All four components MUST be configurable to start on their designated ports
  via environment configuration — not hardcoded values.
- **FR-003**: An email service provider MUST be selected and its configuration documented
  in a way that allows switching providers without code changes.
- **FR-004**: The contact form destination MUST be decided and its behavior fully specified
  before Landing Page work resumes.
- **FR-005**: The notification delivery mechanism MUST be decided and documented before
  the notification backend feature is implemented.
- **FR-006**: All credentials (DB password, JWT secret, OpenAI / Gemini / Paymob keys)
  MUST be removed from committed files and placed in git-ignored configuration.
- **FR-007**: A developer onboarding guide MUST document how to obtain and inject all
  required secrets locally and in production.
- **FR-008**: The testimonials management approach (static vs. Admin-managed) MUST be
  documented as a formal decision before Admin Dashboard scope is finalized.
- **FR-009**: The Admin vs. Lawyer API separation strategy MUST be documented as the
  canonical pattern for all backend work in Phase 3–6.
- **FR-010**: Each decision in Phase 0 MUST be recorded in a decisions log
  (`docs/decisions.md`) with: chosen option, rejected alternatives, and rationale.

### Key Entities

- **Decision Record**: A formal choice made in Phase 0. Attributes: decision ID, topic,
  options considered, chosen option, rationale, affected phases, decision date.
- **Secret / Credential**: A sensitive value (password, API key, connection string, JWT
  secret) that MUST never appear in committed source code.
- **Environment Configuration**: A git-ignored file or deployment mechanism that holds
  secret values and environment-specific settings per component.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 7 Phase 0 decisions are recorded with a chosen option and rationale
  in `docs/decisions.md` before any Phase 1–11 implementation begins.
- **SC-002**: A fresh clone of the repo produces zero hardcoded credentials in any
  committed file (verifiable by a `git grep` for known credential patterns).
- **SC-003**: A developer with no prior knowledge can set up their local environment and
  have all four components running on the correct ports within 30 minutes, following
  only the onboarding guide — no Slack messages or additional help needed.
- **SC-004**: All four components start on their designated ports simultaneously with no
  port conflicts, in under 60 seconds from the first command.
- **SC-005**: A triggered email (OTP or password reset) is delivered to the test inbox
  within 60 seconds of the event, with a 95% delivery success rate in normal conditions.
- **SC-006**: A contact form submission reaches the chosen destination within 2 minutes,
  with no silent failures — either success confirmation or a visible error is shown.

## Assumptions

- Port assignments (Backend: 8976, Lawyer Dashboard: 5078, Admin Dashboard: 5079,
  Landing Page: 3000) are finalized and non-negotiable — specified by the platform owner.
- The secrets strategy (`appsettings.Development.json` locally + production secrets manager)
  will be adopted unless the platform owner explicitly decides otherwise.
- The recommended Admin/Lawyer API pattern (shared endpoints + role-based authorization)
  will be adopted — this avoids duplicating 14 existing controllers.
- Testimonials default to static management unless the platform owner requests dynamic
  Admin Dashboard management.
- "Done" for Phase 0 means all decisions are documented and secrets are removed from
  committed files — no changes to the four components' runtime code are in scope for this
  phase (those belong to Phase 1 onward).
- This phase is executed by a single developer; team workflow decisions (PR review process,
  branching strategy beyond Specify) are out of scope.
