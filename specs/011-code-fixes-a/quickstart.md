# Quickstart: Section A Code Fixes

## Prerequisites

1. Confirm the canonical local ports are available:
   - Backend API: `http://localhost:8976`
   - Lawyer Dashboard: `http://localhost:5078`
   - Admin Dashboard: `http://localhost:5079`
   - Landing Page: `http://localhost:3000`
2. Ensure dashboard API base URLs remain environment-driven and point to `http://localhost:8976/api` for local development.
3. Ensure local backend configuration is ready for:
   - email delivery credentials in a non-committed local settings source
   - monitoring DSN values in environment-backed configuration
   - schema updates affecting plans, contact triage, or email failure recording
4. Prepare:
   - one admin-capable test account
   - one authenticated non-admin account for admin-route denial checks
   - at least one existing subscription plan
   - at least one contact request record, or ability to create one from the public contact form

## Local Run Flow

### Backend

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer"
dotnet restore
dotnet run
```

### Admin Dashboard

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard"
npm install
npm run dev
```

### Lawyer Dashboard

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard"
npm install
npm run dev
```

## Verification Flow

1. Verify admin-route behavior:
   - signed-out access to an admin route redirects immediately to login
   - authenticated non-admin access redirects immediately and shows Arabic denial feedback
   - authenticated admin access renders the page without a blank intermediate frame
2. Verify subscription plan workflows from the Admin Dashboard:
   - create a valid new plan through the admin UI
   - confirm the new plan appears in the plan list
   - archive an eligible plan and confirm it is removed from active sale but still treated as historical data
   - attempt to archive a blocked plan and confirm the reason is shown clearly
3. Verify contact-request triage:
   - submit a public contact request through `POST /api/contact/submit`
   - open the admin contact-request page and confirm the new item appears
   - filter by `New`, `Read`, and `Replied`
   - update one request status and confirm the filtered views refresh correctly
4. Verify email continuity behavior:
   - trigger a password-recovery case that uses the secondary email path
   - trigger one subscription action that should send a confirmation
   - if delivery is intentionally failed in QA, confirm a reviewable failure record exists
5. Verify observability and documentation:
   - confirm the backend API reference shows summaries for core auth, contact, subscription, and admin controllers in scope
   - confirm dashboard and backend monitoring bootstrap without hardcoded secrets and can capture a forced sample error in a non-production-safe test environment
6. Verify regression coverage:
   - backend service tests cover contact handling, auth-related behavior, and plan archival rules
   - admin dashboard tests cover admin-route behavior, plan state updates, and shared API behavior where applicable
   - lawyer dashboard tests cover protected-route and shared auth/API behavior

## Validation Commands

### Backend Tests and Build

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend"
dotnet test
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer"
dotnet build
```

### Admin Dashboard

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard"
npm run test -- --run
npm run lint
```

### Lawyer Dashboard

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard"
npm run test -- --run
npm run lint
```

## Implementation Notes

### What this plan is expected to add

- A render-safe `AdminRoute` flow that prevents blank-screen authorization states.
- Backend test project scaffolding plus targeted service-level and controller-adjacent regression coverage.
- Frontend test scaffolding in both dashboards with focused route and shared API tests.
- Body-based subscription-plan creation and archive semantics for admin plan removal.
- Admin contact-request listing and status-update flows with fixed statuses.
- Email sending support for fallback and confirmation scenarios, plus operational recording of failed attempts only.
- Environment-driven production error monitoring in backend and dashboards.
- XML-comment-driven enrichment of the existing API reference surface.

### Delivery emphasis

- Preserve current runtime architecture and avoid unnecessary refactors.
- Prefer additions that improve release confidence on the highest-risk flows first.
- Keep public-facing copy and admin workflow feedback Arabic-first.
