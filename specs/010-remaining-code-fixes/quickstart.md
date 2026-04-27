# Quickstart: Phase A Remaining Code Fixes

## Prerequisites

1. Confirm the canonical local ports are available:
   - Backend API: `http://localhost:8976`
   - Lawyer Dashboard: `http://localhost:5078`
   - Admin Dashboard: `http://localhost:5079`
   - Landing Page: `http://localhost:3000`
2. Ensure both dashboards have `.env.local` files with `VITE_API_BASE_URL=http://localhost:8976/api`.
3. Ensure the landing page has `.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8976/api`.
4. Ensure both dashboard Vite dev servers bind to `0.0.0.0` (configured in `vite.config.ts`).
5. Ensure the backend database is available and can accept schema updates for notifications and contact requests.
6. Prepare:
   - one admin-capable test account
   - one authenticated user account with seeded notifications if notification UI/API verification is needed

## Local Run Flow

### Backend

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer"
dotnet run
```

### Admin Dashboard

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard"
npm install
npm run dev
```

Note: The Vite config now includes `host: '0.0.0.0'` so no additional flags are needed.

### Lawyer Dashboard

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard"
npm install
npm run dev
```

Note: The Vite config now includes `host: '0.0.0.0'` so no additional flags are needed.

### Landing Page

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing"
npm install
npm run dev
```

## Verification Flow

1. Open the Admin Dashboard and verify the settings page:
   - loads real profile data from `GET /api/account/profile`
   - saves profile updates through `PUT /api/account/profile`
   - changes passwords through `PUT /api/account/change-password`
   - shows actionable Arabic feedback on success and failure
2. Verify local environment safety:
   - both dashboards call the local backend origin via `.env.local` `VITE_API_BASE_URL`
   - no dashboard request points to a production API origin during local QA
3. Verify backend notification management with an authenticated account:
   - `GET /api/notification` returns only that account's notifications
   - `PUT /api/notification/{id}/read` marks one item as read
   - `PUT /api/notification/read-all` clears remaining unread items
   - `DELETE /api/notification/{id}` removes a notification
4. Verify landing-page contact intake:
   - valid form submissions succeed through `POST /api/contact/submit`
   - invalid submissions return clear field-level feedback
   - accepted submissions are stored for later business review
5. Verify dashboard resilience:
   - a forced rendering failure in each dashboard shows the shared fallback error UI
   - an unknown admin route shows the 404 page and a return path to the dashboard
6. Verify backend cleanup:
   - sample weather-forecast controller artifacts are no longer part of the delivered API surface

## Validation Commands

### Admin Dashboard

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard"
npm run lint
```

### Lawyer Dashboard

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard"
npm run lint
```

### Landing Page

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing"
npm run lint
```

### Backend

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer"
dotnet build
```

## Implementation Notes

### What was implemented

- **T001-T004**: Shared admin API route constants, types, Redux store registration, and typed Redux hooks (already existed).
- **T005-T009**: Admin settings Redux slice with `extraReducers` for `fetchAdminProfile`, `updateAdminProfile`, and `changeAdminPassword`. Thunks were fixed to use the shared `api` axios instance instead of raw `axios`. Validation schemas use Zod with Arabic messages.
- **T010-T011**: Shared `ErrorBoundary` components in both dashboards (already existed).
- **T012-T017**: `.env.local` files created for both dashboards and the landing page. Vite configs updated with `host: '0.0.0.0'`. Scaffolded `WeatherForecastController.cs` and `WeatherForecast.cs` removed.
- **T018-T022**: Settings page replaced with API-backed forms using `react-hook-form` + `zod` validation. Profile and password tabs with Arabic feedback via `react-hot-toast`.
- **T023-T032**: Full notification backend (DTOs, service interface, service implementation, controller, migration) and admin frontend (thunks, slice with `extraReducers`, notifications page with mark-read, mark-all-read, delete).
- **T033-T040**: Full contact request backend (model, DTOs, service interface, service implementation, controller, migration) and landing page contact form with validation and Arabic toast feedback.
- **T041-T044**: Both dashboards wrapped with `ErrorBoundary`. Admin dashboard has a proper 404 page (`NotFoundPage`) with Arabic text and return-to-dashboard navigation.
- **T045**: Backend DI updated to register `INotificationService` and `IContactService`.

### Key architectural decisions

- Admin dashboard thunks use the shared `api` axios instance (with interceptors for auth and token refresh) instead of raw `axios`.
- Notification `ReceiverId` changed from `int` to `Guid` to align with the `Lawyer` entity's `Guid`-based identity.
- Contact requests use a `Guid` primary key via `BaseEntity<Guid>`.
- Landing page uses native `fetch` for the contact form (no axios dependency).
- Landing page env variable uses `NEXT_PUBLIC_` prefix for client-side access in Next.js static export.
