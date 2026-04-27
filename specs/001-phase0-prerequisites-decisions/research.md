# Research: Phase 0 — Prerequisites & Decisions

**Generated**: 2026-04-04
**Branch**: `001-phase0-prerequisites-decisions`
**Status**: All NEEDS CLARIFICATION resolved with recommendations. Platform owner confirmation
required for decisions marked ⚠ before dependent phases begin.

---

## Decision 1: Port Assignments

**Decision**: Locked (no clarification needed)

| Component        | Port |
|------------------|------|
| Backend (.NET)   | 8976 |
| Lawyer Dashboard | 5078 |
| Admin Dashboard  | 5079 |
| Landing Page     | 3000 |

**Rationale**: Specified by the platform owner. These are non-negotiable and already
recorded in the constitution (Principle V).

**Alternatives considered**: N/A — owner-specified.

**Affects**: Phase 1 (port unification config changes).

---

## Decision 2: Secrets Management Strategy

**Decision**: `appsettings.Development.json` (git-ignored) for local development.
Production: environment variables injected by the hosting platform (Azure App Service /
deployment pipeline). Azure Key Vault as a later upgrade path.

**Rationale**:
- The recommended approach from plan.md (Phase 0.6).
- `appsettings.Development.json` is the idiomatic .NET pattern — supported natively by
  `IConfiguration` without any extra NuGet packages.
- The `.Development.json` file is automatically loaded by ASP.NET Core when
  `ASPNETCORE_ENVIRONMENT=Development`, with no code changes to `Program.cs`.
- For React frontends, `.env` files (git-ignored) with `VITE_` prefix are the Vite standard.
- Both patterns are reversible — switching to Key Vault later requires only a DI registration
  change, not a rewrite.

**Alternatives considered**:
- Azure Key Vault now: Overkill for a solo developer at pre-launch stage. Adds dependency
  on Azure subscription and MSI/Service Principal setup. Deferred to production.
- `.env` with dotenv for .NET: Non-standard, requires extra package, breaks VS publish
  tooling. Rejected.
- User Secrets (`dotnet user-secrets`): Valid but less portable across machines and IDEs.
  Not chosen because `appsettings.Development.json` is more explicit and easier to document.

**Affects**: Phase 2 (secrets hardening). Unblocks all phases.

**Status**: ✅ Confirmed — no platform owner input needed (recommendation accepted per plan).

---

## Decision 3: Admin vs. Lawyer API Separation

**Decision**: Shared endpoints with `[Authorize(Roles = "Admin")]` / `[Authorize(Roles = "Lawyer")]`
decorators. No duplicate controllers.

**Rationale**:
- Recommended in plan.md (Phase 0.7).
- The backend already has 14 controllers. Creating parallel Admin controllers would double
  the surface area with no added security benefit — role checks happen at the same JWT
  validation layer either way.
- Admin-specific endpoints (reports, lawyer management) get their own controllers
  (`AdminReportController` already exists). Shared data endpoints (cases, clients) use
  the existing controllers with role-based filtering in the service layer.

**Alternatives considered**:
- Separate Admin endpoints for everything: More explicit but doubles maintenance burden.
  No security advantage over role attributes. Rejected.

**Affects**: Phase 3 (Admin Dashboard API layer). Phase 4 (Auth guards).

**Status**: ✅ Confirmed — no platform owner input needed.

---

## Decision 4: Email Service Provider ✅ CONFIRMED — No email, Phone OTP only

**Decision**: No email provider will be integrated in the current phase. OTP and account
verification are handled via **Phone OTP only**. Email integration is documented as a
placeholder in the codebase for future use but is NOT activated or implemented now.

**Rationale**:
- Platform owner confirmed: email-based flows (OTP, password reset) are out of scope for
  this phase.
- Phone OTP is the primary verification channel. This is more appropriate for the MENA
  legal market where phone numbers are the primary contact identifier.
- Keeping an `IEmailService` interface as a placeholder costs nothing and preserves the
  upgrade path — no code needs to be written or activated now.

**What exists in code (placeholder only)**:
```
IEmailService (Lawyer.Application) — interface only, no active implementation
```
No DI registration. No NuGet packages added. No config keys required.
The interface is a forward-declaration comment documenting the integration point.

**What is explicitly OUT of scope until a future phase**:
- Email OTP delivery
- Password reset via email link
- Registration confirmation emails
- Any `SmtpClient`, Brevo, or SendGrid NuGet package

**Future provider options** (decide when email is needed):
- Brevo: free 300/day, no credit card.
- SendGrid: 100/day free, better long-term reputation.
- Amazon SES: cheapest at scale, needs AWS setup.

**Config placeholder in `appsettings.json`** (committed, no secrets required now):
```json
"Email": {
  "Provider": "PLACEHOLDER: not configured — future integration point",
  "FromName": "محامي سمارت"
}
```

**Status**: ✅ Confirmed — Phone OTP only. Email placeholder documented, not implemented.

---

## Decision 5: Contact Form Destination ✅ CONFIRMED — Deferred to backlog

**Decision**: The Contact Form is deferred entirely. No backend logic, no API endpoint,
no delivery mechanism will be implemented in the current phase. The form UI may remain
visible in the Landing Page but MUST either be hidden, disabled, or display a
"Coming soon" message — it MUST NOT submit to any endpoint.

**Rationale**:
- Platform owner confirmed: Contact Form is not a priority for this phase.
- With email integration also deferred (Decision 4), implementing a contact form that
  actually delivers submissions is blocked anyway.
- The Landing Page at 90% is considered shippable without it.

**Backlog item** (for a future phase, after email or WhatsApp is decided):
- Feature: Contact form delivery
- Options to evaluate then: email to owner / DB + Admin Dashboard / WhatsApp API
- Precondition: Decision 4 (email provider) must be resolved first if email is chosen.

**Current Landing Page behavior**:
- Contact form UI: keep as-is visually.
- Form submission: disabled or shows a static "We'll be in touch soon" message.
- No `POST /api/contact` endpoint created.

**Status**: ✅ Confirmed — deferred. Backlog item documented above.

---

## Decision 6: Notification Delivery Mechanism ✅ CONFIRMED — In-app only

**Decision**: Notifications are **in-app only**. No email notifications. No push
notifications. The existing DB-backed notification model is sufficient.

**Rationale**:
- Platform owner confirmed: in-app only for the current phase.
- The notification entity already exists in `Lawyer.Core` — implementation cost is minimal.
- Email notifications are blocked by Decision 4 (no email provider).
- Push notifications require Firebase setup — out of scope for v1 web platform.
- In-app notifications are fully sufficient for a lawyer who uses the platform actively.

**Implementation pattern** (for notification backend phase):
```
INotificationService (Lawyer.Application)
  └── InAppNotificationService (saves to DB, reads via existing Notification entity)
```
No `EmailNotificationService`. No Firebase. No orchestrator needed.

**Future upgrade path** (post-launch, when email is ready):
- Add `EmailNotificationService : INotificationService`.
- Wire up via a `NotificationOrchestrator` that calls both.
- No changes to `InAppNotificationService` or the DB model required.

**Status**: ✅ Confirmed — in-app only. Email/push deferred to future phase.

---

## Decision 7: Testimonials Management

**Decision**: Static in Landing Page code for v1 launch.

**Rationale**:
- The Landing Page is essentially complete. Adding dynamic testimonials management
  requires a new DB table, a new Admin Dashboard page, and a new set of API endpoints —
  all for content that changes rarely (a few times per year at most).
- Static management (edit a `.ts` constants file + redeploy) is a 5-minute operation for
  a solo developer and has zero infrastructure cost.
- Dynamic management can be added post-launch as a quality-of-life improvement.

**Alternatives considered**:
- Admin Dashboard-managed: Better UX for non-technical owners but over-engineered for
  pre-launch. Deferred to post-launch feature roadmap.

**Affects**: Admin Dashboard scope (does NOT need a testimonials page for v1).

**Status**: ✅ Confirmed — default accepted per plan.

---

## Summary Table

| # | Decision | Status | Affects |
|---|----------|--------|---------|
| 1 | Port assignments | ✅ Locked | Phase 1 |
| 2 | Secrets management (appsettings.Development.json) | ✅ Confirmed | Phase 2 |
| 3 | Admin/Lawyer API separation (shared + roles) | ✅ Confirmed | Phase 3–4 |
| 4 | Email provider — Phone OTP only, email placeholder not activated | ✅ Confirmed | No email in current phases |
| 5 | Contact form — deferred to backlog, form UI disabled | ✅ Confirmed | Post-launch backlog |
| 6 | Notification delivery — in-app only | ✅ Confirmed | Notification phase |
| 7 | Testimonials (static) | ✅ Confirmed | Reduces Admin Dashboard scope |

**All 7 decisions are confirmed. Phase 0 is fully unblocked.**
