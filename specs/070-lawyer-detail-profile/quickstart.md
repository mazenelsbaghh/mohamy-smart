# Quickstart: Lawyer Detail Profile

## Prerequisites

- Backend solution can build and run from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend`.
- Admin dashboard dependencies are installed in the workspace.
- Admin account exists with access to `/lawyers/:id`.

## Backend Validation

1. Run:

   ```bash
   dotnet test /Users/mazenelsbagh/mazen\ mac/apps/mohamy\ smart/mohamy-smart-backend/Lawyer.Tests/Lawyer.Tests.csproj
   ```

2. Verify `GET /api/v1/lawyers/{userId}` returns the expanded detail contract for an admin request.
3. Verify invalid IDs and non-lawyer users return a clear error response.

## Frontend Validation

1. Run:

   ```bash
   npm run type-check -w @mohamy/admin-dashboard
   npm run lint -w @mohamy/admin-dashboard
   ```

2. Start the admin dashboard:

   ```bash
   npm run dev -w @mohamy/admin-dashboard -- --host 0.0.0.0 --port 5079
   ```

3. Open `http://localhost:5079/lawyers/{id}` with an admin session.
4. Confirm the page shows:
   - Profile header with account and subscription status.
   - Personal, contact, and professional sections.
   - Metrics for cases, clients, powers of attorney, reviews, and AI usage.
   - Recent cases, subscription history, reviews, and AI usage sections when data exists.
   - Arabic empty states when optional values are missing.
   - Back-to-list and related AI usage action when available.

## Visual Checks

- At `1280px` desktop width, no horizontal scrolling or overlapping text.
- Long names, email addresses, law firm names, and specialization values wrap inside their containers.
- Loading, error, and empty states use the same warm neutral surfaces and amber accent as the admin dashboard.
