# Quickstart Guide: Admin Dashboard Auth & Guards

## 1. Setup

Launch the fully unified application infrastructure components constructed over Phase 1, Phase 2, and Phase 3:
```bash
# Start backend on 8976
cd mohamy-smart-backend/Lawyer
dotnet run

# Start Admin Dashboard
cd mohamy-smart-admin-dashboard
npm run dev
```

## 2. Guard Penetration Testing Methodology

### Unauthorized Access
1. Open Incognito Tab or clear local storage.
2. Direct browser link to `http://localhost:5079/lawyers`.
3. Validation: App must silently intercept constraints and rewrite URI back to `/auth/login`.

### Public Re-Entry Bypass
1. Ensure you securely logged in via `/auth/login` natively caching `admin_accessToken` and verifying the session Redux.
2. Direct the browser's address bar actively to `http://localhost:5079/auth/login`.
3. Validation: The view refuses rendering the credentials page and returns users to `http://localhost:5079/`.

### Sub-Role Segregation (JWT Claim Manipulation)
1. Trigger successful auth with a lawyer user instead of an admin if reachable. (Or manually patch state via devtools assigning `["Lawyer"]`).
2. Refresh browser rendering `<AdminRoute />`.
3. Validation: The application detects invalid token role claims and purges data pushing unauthenticated states.
