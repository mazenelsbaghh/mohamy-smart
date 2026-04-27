# MOHAMY SMART — Decision Log

All architectural decisions for the MOHAMY SMART platform. This file is the single
source of truth. Every decision must be recorded here before the dependent phase begins.

---

## DEC-001 — Port Assignments

**Date**: 2026-04-04
**Status**: Confirmed
**Affects phases**: Phase 1

| Component        | Port |
|------------------|------|
| Backend (.NET)   | 8976 |
| Lawyer Dashboard | 5078 |
| Admin Dashboard  | 5079 |
| Landing Page     | 3000 |

**Decision**: Ports specified by platform owner. Non-negotiable.

---

## DEC-002 — Secrets Management

**Date**: 2026-04-04
**Status**: Confirmed
**Affects phases**: Phase 2, all subsequent phases

**Decision**: `appsettings.Development.json` (git-ignored) for local development.
Production: environment variables injected by hosting platform.

**Rules**:
- `appsettings.json` contains only TODO placeholders — no real values.
- `appsettings.Development.json` is git-ignored and holds all real secrets locally.
- React frontend secrets live in `.env` (git-ignored). `.env.example` is committed.

---

## DEC-003 — Admin vs. Lawyer API Separation

**Date**: 2026-04-04
**Status**: Confirmed
**Affects phases**: Phase 3, 4

**Decision**: Shared endpoints with role-based authorization attributes.
- Admin-only endpoints: `[Authorize(Roles = "Admin")]`
- Lawyer-only endpoints: `[Authorize(Roles = "Lawyer")]`
- No duplicate controllers for Admin.

---

## DEC-004 — Email Provider

**Date**: 2026-04-04
**Status**: Confirmed — deferred
**Affects phases**: Post-launch

**Decision**: No email provider integrated in current phase.
- OTP and account verification: Phone OTP only.
- `IEmailService` interface exists as a placeholder — not activated, not implemented.
- No email NuGet packages added.
- Revisit before launch: Brevo (recommended) / SendGrid / Amazon SES.

---

## DEC-005 — Contact Form Destination

**Date**: 2026-04-04
**Status**: Confirmed — deferred to backlog
**Affects phases**: Post-launch

**Decision**: Contact form deferred. The form UI remains visible but submission is
disabled — button replaced with static message "سيتم التواصل معك قريباً".
No `POST /api/contact` endpoint created.

**Future options**: Email to owner / DB + Admin Dashboard / WhatsApp API.

---

## DEC-006 — Notification Delivery

**Date**: 2026-04-04
**Status**: Confirmed
**Affects phases**: Notification backend phase

**Decision**: In-app notifications only.
- Notification entity already in DB.
- `InAppNotificationService` saves to DB.
- No email notifications. No Firebase/push notifications.
- Future upgrade: add `EmailNotificationService` after email provider is chosen.

---

## DEC-007 — Testimonials Management

**Date**: 2026-04-04
**Status**: Confirmed
**Affects phases**: Landing Page phase

**Decision**: Static in Landing Page code. No Admin Dashboard management for v1.
- To update: edit the constants file in Landing Page source → redeploy.
- Dynamic management deferred to post-launch.
