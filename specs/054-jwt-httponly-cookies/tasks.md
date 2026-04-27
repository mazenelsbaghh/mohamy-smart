# Tasks: Migrate JWT Auth to httpOnly Cookies

**Branch**: `054-jwt-httponly-cookies`
**Input**: Design documents from `/specs/054-jwt-httponly-cookies/`
**Spec**: spec.md · **Plan**: plan.md · **Research**: research.md (R1–R10) · **Data Model**: data-model.md

**Organization**: Backend first (Phase 2), then each user story in priority order (P1 → P2).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Wire antiforgery service, update CORS policy, configure cookie auth options — all in Program.cs before any controller work.

- [ ] T001 Add `builder.Services.AddAntiforgery(opts => { opts.HeaderName = "X-XSRF-TOKEN"; opts.Cookie.Name = "XSRF-TOKEN"; opts.Cookie.HttpOnly = false; opts.Cookie.SameSite = SameSiteMode.Lax; })` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`
- [ ] T002 Update the existing CORS named policy to add `.AllowCredentials()` (keep the existing `WithOrigins(corsOrigins)` whitelist) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`
- [ ] T003 Add `app.UseAntiforgery()` middleware call in the correct pipeline position (after `UseAuthentication`, before `MapControllers`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`
- [ ] T004 Add a cookie-auth helper method `SetAuthCookies(HttpResponse, string accessToken, string refreshToken, bool isProduction)` that writes `__Host-session` / `session` and `__Host-refresh` / `refresh` httpOnly cookies with correct `Secure`, `SameSite=Lax`, `Path`, and `MaxAge` values in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/Base/AppControllerBase.cs`
- [ ] T005 Add a `ClearAuthCookies(HttpResponse)` helper that expires the three cookies (`session`, `refresh`, `XSRF-TOKEN`) with `Max-Age=0` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/Base/AppControllerBase.cs` (depends on T004)
- [ ] T006 Override `JwtBearerEvents.OnMessageReceived` in the JWT bearer configuration to read the token from `context.Request.Cookies["__Host-session"] ?? context.Request.Cookies["session"]` when no `Authorization` header is present in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`

**Checkpoint**: Backend can now issue and read httpOnly cookies and validate antiforgery header. No controller changes yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: New endpoints that every story depends on (`/auth/me`, `/auth/csrf-token`, `/auth/logout`) and the backward-compat transition flag.

- [ ] T007 Add `GET /api/auth/me` action in `AuthController` that returns `{ userId, fullName, roles, phone, profileId }` from the authenticated JWT claims (no DB call needed) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AuthController.cs`
- [ ] T008 Add `GET /api/auth/csrf-token` action in `AuthController` that calls `IAntiforgery.GetAndStoreTokens(HttpContext)`, sets/refreshes the `XSRF-TOKEN` cookie, and returns `{ token: string }` — inject `IAntiforgery` into controller constructor in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AuthController.cs` (depends on T001)
- [ ] T009 Add `POST /api/auth/logout` action in `AuthController` that reads the refresh cookie, calls `_service.RevokeRefreshTokenAsync(...)`, then calls `ClearAuthCookies(Response)` — decorate with `[ValidateAntiForgeryToken]` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AuthController.cs` (depends on T005)
- [ ] T010 Add `[IgnoreAntiforgeryToken]` attribute to the Paymob server-to-server webhook action (`POST /api/payment/server-callback`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/PaymentController.cs`
- [ ] T011 Add `Auth:ReturnTokensInBody` config key (default `true`) to `appsettings.json` — read it in `AuthController` to conditionally include `AccessToken`/`RefreshToken` in the login response body during the transition period in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/appsettings.json`

**Checkpoint**: Foundation ready. Three new endpoints exist. Controllers can now be updated story by story.

---

## Phase 3: US1 — Session tokens not accessible to scripts (Priority: P1) 🎯 MVP

**Goal**: Login/AdminLogin set httpOnly cookies. Authenticated API calls succeed via cookie. No token readable from JS.

**Independent Test**: Log in → open DevTools Console → run `localStorage.getItem('accessToken')` → must return `null`. Run `document.cookie` → must NOT contain `session` or `refresh` value. An API call to `/api/auth/me` must still return 200.

### Implementation for US1

- [ ] T012 [US1] Update `Login` action in `AuthController` to call `SetAuthCookies(Response, result.Data.AccessToken, result.Data.RefreshToken, env.IsProduction())` after a successful login, and conditionally strip `AccessToken`/`RefreshToken` from the returned DTO body based on the `Auth:ReturnTokensInBody` flag in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AuthController.cs` (depends on T004, T011)
- [ ] T013 [US1] Apply the same cookie-setting change to the `AdminLogin` action in `AuthController` (same pattern as T012) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AuthController.cs` (depends on T004, T011)
- [ ] T014 [US1] Update `thunkAuthLogin.ts` in the Lawyer dashboard to stop writing `accessToken` / `refreshToken` to `localStorage` — keep writing the safe user profile object (`userId`, `fullName`, `roles`, `phone`, `profileId`) to `localStorage` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/thunk/thunkAuthLogin.ts`
- [ ] T015 [US1] Update `thunkAuthLogin.ts` in the Admin dashboard the same way — strip localStorage token writes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/auth/thunk/thunkAuthLogin.ts`
- [ ] T016 [US1] Update `authSlice.ts` in the Lawyer dashboard: remove `token` from `TInitialState`, remove `accessToken` and `refreshToken` from the user profile shape, remove `localStorage.getItem('accessToken')` init read, remove `localStorage.setItem/removeItem` token writes in the `logOut` reducer in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/authSlice.ts`
- [ ] T017 [US1] Apply the same `authSlice.ts` cleanup to the Admin dashboard in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/auth/authSlice.ts`
- [ ] T018 [US1] Update `api.ts` in the Lawyer dashboard: remove `getAccessToken()` / `getRefreshToken()` / `removeTokens()` helpers, remove `Authorization: Bearer` request interceptor, add `withCredentials: true` to the `axios.create({})` call, add `xsrfCookieName: 'XSRF-TOKEN'` and `xsrfHeaderName: 'X-XSRF-TOKEN'` options in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/APIs/api.ts`
- [ ] T019 [US1] Apply the same `api.ts` changes to the Admin dashboard in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/apis/api.ts` (or wherever the Axios instance lives)
- [ ] T020 [US1] Create `thunkAuthMe.ts` in the Lawyer dashboard that calls `GET /api/auth/me` and dispatches the user profile into Redux state — used on app boot by `ProtectedRoute` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/thunk/thunkAuthMe.ts`
- [ ] T021 [US1] Create `thunkAuthMe.ts` in the Admin dashboard (same pattern) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/auth/thunk/thunkAuthMe.ts`
- [ ] T022 [US1] Add `status: 'unknown' | 'authenticated' | 'unauthenticated'` field to `authSlice` in the Lawyer dashboard, dispatched by `thunkAuthMe` results — `ProtectedRoute` waits for `status !== 'unknown'` before rendering or redirecting in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/authSlice.ts` (depends on T016, T020)
- [ ] T023 [US1] Add same `status` field to Admin dashboard `authSlice` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/auth/authSlice.ts` (depends on T017, T021)
- [ ] T024 [US1] Update `ProtectedRoute.tsx` in the Lawyer dashboard to dispatch `thunkAuthMe` on mount and render a loading state while `status === 'unknown'`, redirect to `/auth/login` when `status === 'unauthenticated'` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/routing/ProtectedRoute.tsx` (depends on T022)
- [ ] T025 [US1] Update `AdminRoute.tsx` in the Admin dashboard the same way — also verify `roles.includes('Admin')` from the `/auth/me` payload in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/components/AdminRoute.tsx` (depends on T023)

**Checkpoint**: US1 fully functional — no tokens in localStorage/sessionStorage/document.cookie. Authenticated API calls work via cookie.

---

## Phase 4: US2 — Silent session refresh continues to work (Priority: P1)

**Goal**: 401 from any protected endpoint triggers a cookie-based silent refresh. User never sees a login screen during normal work.

**Independent Test**: Let the access token expire (wait 15 min or set a 30-second expiry in dev config). Make any API call — it should succeed transparently. Check Network tab: a `POST /api/auth/refresh-token` call appears in between, and the original request is retried.

### Implementation for US2

- [ ] T026 [US2] Update `RefreshToken` action in `AuthController` to read refresh token from `Request.Cookies["__Host-refresh"] ?? Request.Cookies["refresh"]` (falling back to `model.RefreshToken` from body for backward compat), then call `SetAuthCookies(Response, ...)` on success in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AuthController.cs` (depends on T004)
- [ ] T027 [US2] Update the 401 response interceptor in `api.ts` for the Lawyer dashboard: remove `getRefreshToken()` body send, change the refresh `axios.post` to send no body (cookies are sent automatically via `withCredentials`), remove `localStorage.setItem('accessToken'/'refreshToken')` writes from the success handler, simplify the retry to just `return api(originalRequest)` without patching the Authorization header in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/APIs/api.ts` (depends on T018)
- [ ] T028 [US2] Apply the same 401 interceptor update to the Admin dashboard `api.ts` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/apis/api.ts` (depends on T019)
- [ ] T029 [US2] Update the SignalR `HubConnectionBuilder` call in the `useAiJobSignalR` hook to add `withCredentials: true` to the connection options, and remove any `accessTokenFactory` or `?access_token=` query-string token passing in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/hooks/useAiJobSignalR.ts`
- [ ] T030 [US2] Remove the `JwtBearerEvents.OnMessageReceived` query-string fallback (`context.Token = context.Request.Query["access_token"]`) from the JWT Bearer configuration in `Program.cs` — the cookie hook added in T006 replaces it in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs` (depends on T006)

**Checkpoint**: US2 functional — silent refresh works via cookie, SignalR authenticates without query-string token.

---

## Phase 5: US3 — State-changing requests protected from CSRF (Priority: P1)

**Goal**: Every POST/PUT/PATCH/DELETE on an authenticated endpoint is rejected without a valid `X-XSRF-TOKEN` header. Cross-origin requests are blocked.

**Independent Test**: From browser DevTools console, run `fetch('/api/cases', { method: 'POST', credentials: 'include', body: '{}', headers: { 'Content-Type': 'application/json' }})` — must return 400 (antiforgery validation failure). The same request from the real frontend (which includes the XSRF header) must succeed.

### Implementation for US3

- [ ] T031 [US3] Add `[ValidateAntiForgeryToken]` attribute to all state-changing actions in `AuthController` (logout — already done in T009), `CasesController`, `WorkflowController`, `SubscriptionController`, and any other controller with POST/PUT/PATCH/DELETE actions — audit all controller files and apply the attribute in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/`
- [ ] T032 [US3] Add `[IgnoreAntiforgeryToken]` explicitly to all currently-exempt unauthenticated POST endpoints: `login`, `admin/login`, `register`, `refresh-token`, `request-phone-verification`, `verify-phone-number`, `verify-otp`, `forget-password`, `reset-password` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AuthController.cs` (depends on T003)
- [ ] T033 [US3] After the Lawyer dashboard login (`thunkAuthLogin` success), dispatch a call to `GET /api/auth/csrf-token` to seed the `XSRF-TOKEN` cookie before the first state-changing request — add this as a sequential call in the fulfilled handler in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/thunk/thunkAuthLogin.ts` (depends on T014)
- [ ] T034 [US3] Same CSRF seeding call after Admin dashboard login in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/auth/thunk/thunkAuthLogin.ts` (depends on T015)
- [ ] T035 [US3] Verify that the Axios `xsrfCookieName: 'XSRF-TOKEN'` and `xsrfHeaderName: 'X-XSRF-TOKEN'` options set in T018/T019 are sending the header correctly — add a one-line integration smoke test by checking the Network tab on a POST request in both dashboards. Document confirmation in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/security_remediation_plan.md`

**Checkpoint**: US3 functional — CSRF protection active on all state-changing endpoints, Axios handles header injection automatically.

---

## Phase 6: US4 — Clean logout invalidates the session (Priority: P2)

**Goal**: Clicking logout clears all cookies client-side AND revokes the refresh token server-side. Typing a protected URL after logout returns 401.

**Independent Test**: Log in → click logout → manually type `/dashboard` in the URL → should redirect to `/auth/login`. Check Application → Cookies in DevTools — all three cookies must be gone.

### Implementation for US4

- [ ] T036 [US4] Update the `logOut` reducer in the Lawyer dashboard `authSlice.ts` to call `POST /api/auth/logout` (the endpoint from T009) via a new `thunkLogout` thunk — on success, clear Redux state and redirect to `/auth/login` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/thunk/thunkLogout.ts`
- [ ] T037 [US4] Create the same `thunkLogout.ts` for the Admin dashboard in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/auth/thunk/thunkLogout.ts`
- [ ] T038 [US4] Update all logout button `onClick` handlers in both dashboards to dispatch `thunkLogout` instead of the synchronous `logOut` action — find all usages with `dispatch(logOut())` and update them in both dashboard `src/` trees
- [ ] T039 [US4] Update the 401 interceptor in both `api.ts` files: when the refresh call itself returns 401, call `thunkLogout` (or `handleLogout`) which hits `POST /api/auth/logout` to expire cookies server-side before redirecting in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/APIs/api.ts` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/apis/api.ts` (depends on T027, T028)

**Checkpoint**: US4 functional — logout is clean on both client and server.

---

## Phase 7: US5 — Production deploy does not disrupt live users (Priority: P2)

**Goal**: Users logged in with the old localStorage-based build are transitioned silently to cookies or receive a single guided re-login prompt with no data loss.

**Independent Test**: Simulate a legacy session: set `localStorage.setItem('accessToken', '<valid-jwt>')` in DevTools, reload the page, make an API call — user should continue working (cookie upgrade) OR see a clear "session upgraded, please continue" banner (not an error screen).

### Implementation for US5

- [ ] T040 [US5] In `CookieAuthFallbackMiddleware.cs`, read the `Authorization: Bearer <token>` header when no session cookie is present, validate the token via `ITokenService.GetPrincipalFromExpiredToken` (or standard JWT validation), and if valid, call `SetAuthCookies(Response, token, refreshToken="", ...)` to issue a session cookie — the user continues without re-login in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Middleware/CookieAuthFallbackMiddleware.cs`
- [ ] T041 [US5] Register `CookieAuthFallbackMiddleware` in `Program.cs` between `UseAuthentication` and `UseAuthorization` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`
- [ ] T042 [US5] Add a `COOKIE_SECURE` environment variable read in `Program.cs` (fallback: `env.IsProduction()`) and use it in `SetAuthCookies` helper so Docker dev can explicitly set it `false` — update `.env.docker.example` with `COOKIE_SECURE=false` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.env.docker.example`

**Checkpoint**: US5 functional — rolling deploy is safe. Live users are not force-logged-out.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T043 [P] Remove `Auth:ReturnTokensInBody` config flag and strip `AccessToken`/`RefreshToken` fields from `AuthResponseDto` — this is the cleanup deploy step (run ≥48h after US1 is live and all clients are on the new build) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Auth/AuthResponseDto.cs` and `AuthController.cs`
- [ ] T044 [P] Add `COOKIE_SECURE` and `CorsOrigins` validation in the startup `CheckUrl` section of `Program.cs` so the backend throws a clear error if `CORS AllowCredentials` is configured without explicit origins in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`
- [ ] T045 Write backend integration tests using `WebApplicationFactory<Program>` covering: (a) login sets 3 cookies with correct flags; (b) refresh rotates cookies; (c) logout expires cookies + revokes server token; (d) CSRF rejection on POST without header in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Auth/CookieAuthIntegrationTests.cs`
- [ ] T046 [P] Update `docs/security_remediation_plan.md` to mark the `054-jwt-httponly-cookies` migration complete, list the SC-001–SC-008 verification status, and document the cleanup deploy schedule in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/security_remediation_plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 — MVP, deliver first
- **Phase 4 (US2)**: Depends on Phase 3 (shares `api.ts` changes)
- **Phase 5 (US3)**: Depends on Phase 2, can parallel with Phase 4
- **Phase 6 (US4)**: Depends on Phase 4 (needs logout endpoint from T009)
- **Phase 7 (US5)**: Depends on Phase 1 only (middleware can be built in parallel with Phase 3+)
- **Phase 8 (Polish)**: Depends on all stories complete

### Parallel Opportunities

```bash
# Once Phase 2 is done, these can run in parallel:
Developer A: Phase 3 (US1) + Phase 4 (US2)   # backend auth + frontend api.ts
Developer B: Phase 5 (US3)                    # antiforgery attribute sweep
Developer C: Phase 7 (US5)                    # migration middleware
```

---

## Implementation Strategy

### MVP (US1 + US2 — P1 stories only)

1. Complete Phase 1 (Setup) — ~1h
2. Complete Phase 2 (Foundational) — ~1h
3. Complete Phase 3 (US1) — ~2h
4. **STOP & VALIDATE**: DevTools test, no tokens in localStorage
5. Complete Phase 4 (US2) — ~1h
6. **STOP & VALIDATE**: Silent refresh works, SignalR connects
7. Deploy MVP — XSS token-theft risk eliminated

### Full Delivery

8. Complete Phase 5 (US3) — CSRF protection
9. Complete Phase 6 (US4) — Clean logout
10. Complete Phase 7 (US5) — Rollout safety
11. Complete Phase 8 (Polish + cleanup deploy)

---

## Notes

- `[P]` = no dependency on incomplete sibling tasks — safe to run in parallel
- `[US#]` = maps to user story in spec.md for traceability
- T043 (body token removal) is a **separate deploy** — do NOT ship it with the initial migration
- The `__Host-` prefix on production cookies is enforced by the browser: requires `Secure=true`, `Path=/`, no `Domain` — verify this in staging before prod deploy
- All CSRF-exempt endpoints MUST carry `[IgnoreAntiforgeryToken]` explicitly — do not rely on the global filter skipping unauthenticated routes
