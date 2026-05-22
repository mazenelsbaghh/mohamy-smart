# Plan - Fix Admin 429 Too Many Requests Redirect Loop

Resolve the infinite client-side redirect loop in the Admin dashboard that occurs when a user is authenticated in the Lawyer dashboard (sharing the same `localhost` cookie context) but is not authorized as an Admin.

## Proposed Changes

### Component: Admin Dashboard Routing

#### [MODIFY] [PublicRoute.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/admin-dashboard/src/router/PublicRoute.tsx)
1. Check the user's role when `status === "authenticated"`.
2. Only redirect to `/` if the user is authenticated AND possesses the `"Admin"` role:
   - `if (status === "authenticated" && user?.roles?.includes("Admin")) { return <Navigate to="/" replace />; }`
3. If the user is authenticated but does NOT have the `"Admin"` role:
   - Allow them to stay on the public route `/auth/login` (render the `<Outlet />` instead of redirecting to `/`).
   - Trigger a cleanup logout in `useEffect` to clear the unauthorized Lawyer session cookies and state, resetting status to `unauthenticated`. Use a ref (`hasLoggedOut`) to ensure `thunkLogOut` is only dispatched once.

## Verification Plan

### Automated Tests
- Run `npm run type-check` and `npm run lint` inside the `admin-dashboard` directory.

### Manual Verification
- Log in to the Lawyer dashboard (saving a valid session on localhost).
- Visit the Admin dashboard `/auth/login` or `/` in a new tab.
- Confirm that the app does not enter an infinite loop of redirects and does not spam the backend, avoiding `429 Too Many Requests`.
- Verify that a toast message or logout occurs cleanly and the admin login screen displays.
