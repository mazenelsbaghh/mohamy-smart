# Quickstart: Admin Search Filters

1. Start backend and admin dashboard using the normal local workflow.
2. Open admin dashboard on `http://localhost:5079`.
3. Go to "إدارة المحامين".
4. Search by lawyer name, office, specialization, email, phone, or bar number.
5. Apply active/inactive and subscription filters; verify pagination resets to page 1.
6. Open contacts, reviews, subscriptions, notifications, AI usage, and account messaging reports.
7. Verify each page has consistent RTL search/filter controls, clear behavior, and no overlap on narrow widths.

## Verification Commands

```bash
cd apps/admin-dashboard
npm run lint
npm test -- --run
cd ../../mohamy-smart-backend
dotnet test
```
