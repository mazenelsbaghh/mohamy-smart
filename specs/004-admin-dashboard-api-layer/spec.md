# Feature Specification: Phase 3 — Admin Dashboard: API Layer

**Feature Branch**: `004-admin-dashboard-api-layer`
**Created**: 2026-04-04
**Status**: Draft
**Input**: User description: "Phase 3 — Admin Dashboard: API Layer — إنشاء طبقة الاتصال بالـ Backend للـ Admin Dashboard من الصفر"

## Clarifications

### Session 2026-04-04

- Q: هل نغيّر الـ Lawyer Dashboard token keys ولا نسيبها زي ما هي؟ → A: الـ Lawyer Dashboard يفضل كما هو (`accessToken` / `refreshToken`) بدون أي تغيير. الـ Admin Dashboard يستخدم `admin_accessToken` / `admin_refreshToken`. السبب: عدم كسر الـ Lawyer Dashboard الحالي، عدم عمل logout إجباري، منع scope creep. حل التعارض من جهة Admin فقط.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Axios Instance & HTTP Client (Priority: P1)

An admin dashboard developer imports a pre-configured HTTP client from the project's API
module and makes any API call. The HTTP client automatically reads the backend URL from
environment variables, attaches the admin's JWT token to every request in the Authorization
header, handles multipart form data uploads correctly, and retries once on 401 errors by
refreshing the access token before giving up. If the refresh also fails, the user is
redirected to the login page.

**Why this priority**: Every other API integration in the Admin Dashboard depends on this
HTTP client. Without it, no page can communicate with the backend. This is the single
dependency that unblocks all subsequent work.

**Independent Test**: Import the Axios instance in any component, make a GET request to
`/api/Auth/admin/login` (or any available endpoint), and verify:
1. The request goes to the correct backend URL (from `VITE_API_BASE_URL`).
2. If a token exists in localStorage, it is attached as a Bearer header.
3. If the request fails with 401, a refresh attempt occurs before redirecting to login.

**Acceptance Scenarios**:

1. **Given** `VITE_API_BASE_URL` is set in the `.env` file, **When** the Axios instance is
   created, **Then** its `baseURL` is set to the value of `VITE_API_BASE_URL`.
2. **Given** an admin access token is stored in localStorage, **When** the Axios instance
   makes any request, **Then** the `Authorization: Bearer <token>` header is automatically
   added.
3. **Given** a request returns HTTP 401, **When** a refresh token is available in
   localStorage, **Then** the instance calls the refresh endpoint, stores the new access
   token, and retries the original request exactly once.
4. **Given** a request returns HTTP 401 and the refresh token request also fails, **When**
   the user is logged in, **Then** all stored tokens are removed and the browser navigates
   to `/auth/login`.
5. **Given** a request body is a `FormData` object, **When** the request is sent, **Then**
   the `Content-Type` header is automatically set to `multipart/form-data`.
6. **Given** no access token is stored in localStorage, **When** a request is made,
   **Then** no `Authorization` header is added.

---

### User Story 2 - Redux Store & Provider Wiring (Priority: P2)

A developer opens the Admin Dashboard in the browser and the Redux DevTools extension
displays a store with organized slices. The store is wrapped around the entire application
via a Provider component in the entry point. Empty slices exist for all major feature
areas (auth, lawyers, subscriptions, plans, notifications, reports) ready to be populated
with real API integration in later phases.

**Why this priority**: Redux Toolkit is the state management layer that all pages will use
to dispatch async thunks for data fetching. Wiring it up with empty slices establishes the
architecture without coupling to specific API integrations (which belong in Phase 4+).

**Independent Test**: Start the Admin Dashboard, open Redux DevTools in the browser, and
confirm the store exists with visible slice names. Dispatch a test action from DevTools and
verify the state updates.

**Acceptance Scenarios**:

1. **Given** the Admin Dashboard is started in development mode, **When** a developer opens
   Redux DevTools, **Then** the store is visible with slices named `auth`, `lawyers`,
   `subscriptions`, `plans`, `notifications`, and `reports`.
2. **Given** the Redux store is configured, **When** the application renders, **Then** all
   child components can access the store via `useSelector` and `useDispatch`.
3. **Given** the entry point (`main.tsx`) is rendered, **When** the app loads, **Then** the
   Redux `<Provider>` wraps the entire component tree alongside the existing `HeroUIProvider`.
4. **Given** each slice has a default initial state, **When** no actions have been
   dispatched, **Then** each slice shows its initial state in Redux DevTools (e.g.,
   `auth: { token: null, isAuthenticated: false }`).

---

### User Story 3 - Auth Slice with Login/Logout Thunks (Priority: P3)

An admin user opens the Admin Dashboard login page, enters their email and password, and
submits. The login thunk dispatches an API call to the admin login endpoint. On success,
the JWT tokens are stored in localStorage with admin-specific keys (distinct from the
Lawyer Dashboard's keys), the auth state is updated, and the user is redirected. On
failure, a clear error message is shown. A logout action clears all tokens and redirects
to the login page.

**Why this priority**: Auth is the first slice that needs actual API interaction. It
establishes the pattern (thunk → API call → slice update → UI reaction) that all other
slices will follow. It also validates that the Axios instance from US1 works end-to-end.

**Independent Test**: Navigate to the login page, enter valid admin credentials, submit,
and verify: (1) the token appears in localStorage under the admin-specific key, (2) the
Redux auth state shows `isAuthenticated: true`, (3) the user is redirected to the
dashboard home.

**Acceptance Scenarios**:

1. **Given** the admin enters valid credentials, **When** they submit the login form,
   **Then** the auth thunk calls `POST /api/Auth/admin/login` and stores the returned
   tokens in localStorage with admin-specific keys (`admin_accessToken`,
   `admin_refreshToken`).
2. **Given** login succeeds, **When** the response is received, **Then** the auth slice
   state updates: `token` is set, `isAuthenticated` becomes `true`, and `error` is cleared.
3. **Given** login fails (wrong credentials), **When** the API returns an error, **Then**
   the auth slice sets `error` to a human-readable Arabic error message and
   `isAuthenticated` remains `false`.
4. **Given** the user is authenticated, **When** the logout action is dispatched, **Then**
   all admin tokens are removed from localStorage, auth state resets, and the browser
   navigates to `/auth/login`.
5. **Given** the Admin Dashboard is opened in the same browser as the Lawyer Dashboard,
   **When** both are logged in simultaneously, **Then** each dashboard uses its own
   token keys and they do not interfere with each other.

---

### User Story 4 - Toast Notification System (Priority: P4)

When any API call succeeds or fails, the user sees a toast notification with a clear
Arabic message. Success actions (e.g., login) show a green toast, errors show a red toast.
Toasts auto-dismiss after a short duration and can be manually closed.

**Why this priority**: Toast notifications provide immediate user feedback for all API
interactions. Installing the toast library and configuring it now means all future API
integrations (Phases 4-5) automatically have notification support.

**Independent Test**: Trigger a login with wrong credentials and verify a red toast appears
with an Arabic error message. Trigger a successful login and verify a green toast appears.

**Acceptance Scenarios**:

1. **Given** the user performs a successful action (e.g., login), **When** the API returns
   success, **Then** a green success toast appears with an Arabic message (e.g.,
   "تم تسجيل الدخول بنجاح").
2. **Given** the user performs a failed action, **When** the API returns an error, **Then**
   a red error toast appears with a descriptive Arabic message.
3. **Given** a toast is displayed, **When** the auto-dismiss timer expires (default 4
   seconds), **Then** the toast disappears without user action.
4. **Given** a toast is displayed, **When** the user clicks the close button, **Then** the
   toast disappears immediately.

---

### Edge Cases

- What if `VITE_API_BASE_URL` is not set in the `.env` file? The Axios instance must still
  initialize but API calls will fail immediately with a clear console error rather than
  silently sending requests to the wrong URL.
- What if localStorage is full or unavailable (e.g., private browsing)? Token storage
  operations should fail gracefully without crashing the application. The user should be
  redirected to login.
- What if two 401 responses arrive simultaneously (parallel API calls)? Only one refresh
  attempt should be made, and all queued requests should be retried with the new token.
- What if the admin tries to access the Admin Dashboard from a browser that also has a
  Lawyer Dashboard session? Each dashboard's tokens must be stored under different
  localStorage keys to prevent session conflicts.
- What if an API response is not in the expected format? The error handling should provide
  a generic Arabic fallback message (e.g., "حدث خطأ غير متوقع") rather than showing raw
  technical error data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Admin Dashboard MUST include a pre-configured Axios HTTP client that
  reads its base URL from the `VITE_API_BASE_URL` environment variable.
- **FR-002**: The Axios client MUST automatically attach the admin access token (from
  localStorage key `admin_accessToken`) to every outgoing request as a Bearer authorization
  header.
- **FR-003**: The Axios client MUST handle 401 responses by attempting a single token
  refresh using the refresh token endpoint. If the refresh succeeds, the original request
  MUST be retried. If the refresh fails, the user MUST be redirected to login.
- **FR-004**: To prevent infinite refresh loops, the Axios client MUST include a retry
  flag (`_retry`) that is checked before attempting a refresh. A request MUST NOT be
  retried more than once.
- **FR-005**: To prevent concurrent refresh storms from parallel 401 responses, the Axios
  client MUST implement a mechanism to queue incoming 401 requests and issue only one
  refresh call at a time.
- **FR-006**: The Admin Dashboard MUST include a Redux Toolkit store configured with
  slices for: `auth`, `lawyers`, `subscriptions`, `plans`, `notifications`, and `reports`.
- **FR-007**: The Redux store MUST be wired into the React component tree via a `<Provider>`
  component in the application entry point (`main.tsx`).
- **FR-008**: The auth slice MUST include a login thunk that calls the admin-specific login
  endpoint (`POST /api/Auth/admin/login`) and stores tokens in localStorage.
- **FR-009**: Admin Dashboard tokens MUST be stored under distinct localStorage keys
  (`admin_accessToken`, `admin_refreshToken`). The Lawyer Dashboard's existing keys
  (`accessToken`, `refreshToken`) MUST NOT be modified — token isolation is achieved
  entirely from the Admin side to avoid breaking existing Lawyer Dashboard sessions.
- **FR-010**: The auth slice MUST include a logout action that clears all admin tokens from
  localStorage, resets the auth state, and redirects to `/auth/login`.
- **FR-011**: The Admin Dashboard MUST include a toast notification system that displays
  success and error messages in Arabic.
- **FR-012**: Each Redux slice MUST have a well-defined initial state matching the pattern
  established in the Lawyer Dashboard (loading flags, error state, data arrays).

### Key Entities

- **Admin User**: The authenticated admin; identified by email, has JWT access token
  and refresh token. Distinguished from Lawyer users by the `Admin` role in JWT claims.
- **Auth State**: Tracks authentication status — token, refresh token, isAuthenticated,
  isLoading, error.
- **Slice Initial State Pattern**: Each feature slice (lawyers, subscriptions, plans,
  notifications, reports) starts with `{ data: [], isLoading: false, error: null }` to
  be populated in Phase 5.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can import the Axios instance in any Admin Dashboard component
  and make an authenticated API call in under 2 lines of code.
- **SC-002**: All 6 Redux slices are visible in Redux DevTools immediately after the
  dashboard loads — verified by opening DevTools.
- **SC-003**: An admin user can log in using the Admin Dashboard, and the stored token is
  valid for making subsequent authenticated API requests — verified by a successful login
  followed by any authenticated API call.
- **SC-004**: Admin Dashboard login does not interfere with a simultaneous Lawyer Dashboard
  session in the same browser — verified by logging into both dashboards and confirming
  each maintains its own session independently.
- **SC-005**: Toast notifications appear in Arabic for both success and error scenarios
  within 500ms of the triggering action.
- **SC-006**: Zero console errors or warnings related to missing Redux Provider, uncaught
  promise rejections, or CORS when the Admin Dashboard runs locally on port 5079.

## Assumptions

- Phase 1 (Environment & Port Unification) is complete — Admin Dashboard runs on port 5079.
- Phase 2 (Security & Secrets Hardening) is complete — CORS allows `http://localhost:5079`.
- The backend admin login endpoint (`POST /api/Auth/admin/login`) already exists and
  returns a response containing `accessToken` and `refreshToken` fields.
- The backend refresh token endpoint (`POST /api/Auth/refresh-token`) is the same endpoint
  used by the Lawyer Dashboard.
- The Admin Dashboard already has React 19, Vite, TypeScript, HeroUI, and Tailwind CSS 4
  installed. Only Axios, Redux Toolkit, react-redux, and react-hot-toast need to be added.
- The existing Admin Dashboard page components (Home, Lawyers, Subscriptions,
  PlansAndReview, Notifications, Settings) will NOT be modified in this phase — they will
  remain with static data until Phase 5.
- The Lawyer Dashboard's `api.ts` and Redux store serve as the reference implementation
  for patterns and conventions.
- The Lawyer Dashboard's localStorage token keys (`accessToken`, `refreshToken`) are NOT
  changed in this phase. Token isolation is one-directional: Admin uses prefixed keys.
