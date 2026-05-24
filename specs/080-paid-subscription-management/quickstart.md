# Quickstart: Paid Subscription Management

## Preconditions

- Backend API is running with admin authentication available.
- Admin dashboard can authenticate as an admin.
- Database contains at least one active paid subscription and one active trial subscription.

## Scenario 1: Main Page Shows Paid Subscribers

1. Log in to the admin dashboard.
2. Open `/subscriptions`.
3. Verify dashboard metrics include paid subscriber values.
4. Verify the "آخر الاشتراكات المدفوعة" table contains no trial rows.
5. Verify any trial row, when shown elsewhere, has a visible "تجريبية" badge.

## Scenario 2: Detailed Report Filters

1. Open `/subscriptions/subscription-reports`.
2. Select subscription type "مدفوعة فقط".
3. Verify every visible row is paid.
4. Select subscription type "تجريبية فقط".
5. Verify every visible row is trial/free.
6. Apply a search or filter that matches no rows.
7. Verify the Arabic empty state appears.

## Verification Commands

```bash
dotnet build mohamy-smart-backend/Lawyer.sln
npm run lint --workspace=apps/admin-dashboard
npm test --workspace=apps/admin-dashboard -- --run
```

If workspace scripts are unavailable in the local package setup, run the equivalent admin dashboard `npm run lint` and `npm test` from `apps/admin-dashboard`.
