# Phase 0 Research — JWT httpOnly Cookies Migration

## R1. Cookie content — store the JWT, or a server-side session ID?

**Decision**: Store the existing JWT access token inside the httpOnly cookie. Keep the refresh token (opaque base64 string) inside a separate httpOnly cookie. No server-side session store is introduced.

**Rationale**:
- The JWT signing/validation pipeline already exists and is exercised by every endpoint and by SignalR. Replacing it with server-side sessions would be a much larger refactor and defeats the "only transport changes" scope.
- The ASP.NET Core JWT Bearer handler can read the token from a cookie instead of the `Authorization` header via the `OnMessageReceived` event — a one-line change in the JWT bearer options.
- Refresh token is already hashed and stored on `ApplicationUser` — no change to storage.

**Alternatives considered**:
- Server-side session (`AddDistributedSession`) with session ID in the cookie: cleaner for invalidation semantics but requires a new session store, cache layer, or DB table, and breaks the SignalR/JWT contract. Rejected as out of scope.
- Split model (access in cookie, refresh in body): leaves the refresh token script-readable — defeats the purpose. Rejected.

## R2. Cookie attributes

**Decision**:
- `HttpOnly = true` (always).
- `Secure = true` in non-Development environments; `false` in Development.
- `SameSite = Lax` (default). State-changing requests use CSRF token; `Lax` is sufficient to stop cross-site POSTs from unrelated origins while allowing normal same-origin top-level navigation.
- `Domain` — not set (host-only cookie) in Development; set to the apex API host in Production via `Cookies:Domain` config when the dashboards and API share a parent domain.
- `Path = "/"`.
- Access cookie lifetime = access token lifetime (15 min, per constitution).
- Refresh cookie lifetime = 7 days (matches current `RefreshTokenExpiresAt`).

**Rationale**: Matches OWASP "Session Management" cheatsheet defaults. `SameSite=Strict` would break legitimate redirect flows (Paymob return URL coming back to the dashboard) and is not needed given explicit CSRF defense.

**Alternatives**: `SameSite=Strict` (rejected — breaks Paymob redirection back into dashboard). `SameSite=None; Secure` (rejected — only needed for third-party embedding, which we do not support).

## R3. CSRF defense — which model?

**Decision**: Use ASP.NET Core's built-in **Antiforgery** service with the **double-submit cookie pattern**:
- Server issues a non-httpOnly, Secure, SameSite=Lax `XSRF-TOKEN` cookie on first authenticated response.
- Frontend reads that cookie via JavaScript and echoes the value back in an `X-XSRF-TOKEN` request header on every unsafe (non-GET/HEAD/OPTIONS) request.
- A server filter validates the header matches the cookie on every state-changing endpoint.

**Rationale**:
- Standard, well-understood, works without server-side state.
- Axios supports it out of the box via `xsrfCookieName: 'XSRF-TOKEN'` + `xsrfHeaderName: 'X-XSRF-TOKEN'`.
- The XSRF cookie is safe to expose to scripts because its value alone is useless without the session cookie.

**Alternatives**:
- Synchronizer token (server-stored): requires server-side tracking. Rejected as over-engineered.
- `SameSite=Strict` only: rejected per R2 (breaks Paymob return). Also leaves subdomain-based CSRF possible if our own subdomain is ever compromised.

## R4. Which endpoints require antiforgery?

**Decision**: All `POST`, `PUT`, `PATCH`, `DELETE` endpoints require a valid `X-XSRF-TOKEN` header. Idempotent reads (`GET`, `HEAD`, `OPTIONS`) and the Paymob server-to-server webhook (`POST /api/payment/server-callback`) are exempt.

**Rationale**:
- Paymob webhook is an inbound server-to-server call, not browser-originated — it has its own HMAC signature defense (already implemented in [PaymobService.cs:220](../../mohamy-smart-backend/Lawyer.Application/Services/PaymobService.cs:220)) and no cookie is sent.
- A global filter with per-endpoint `[IgnoreAntiforgeryToken]` attributes on exempt endpoints is the cleanest expression.

**Alternatives**: Per-controller opt-in (rejected — too easy to forget on a new controller, violates Principle I's spirit).

## R5. SignalR hub authentication

**Decision**: Keep the existing `Lawyer/Hubs/AiJobHub.cs` endpoint at `/hubs/ai-jobs`. Remove the `?access_token=` query-string fallback from `JwtBearerEvents.OnMessageReceived`. Since hub is same-origin with the API, the session cookie is attached automatically on the WebSocket upgrade request and the JWT Bearer handler reads it from the cookie (R1).

**Rationale**: Same-origin WebSocket handshake carries cookies by default. The current query-string token pattern exists only because the previous Bearer header couldn't be set on `new WebSocket()` from the browser. Cookie-based auth eliminates that workaround.

**Alternatives**: Keep query-string fallback gated behind a feature flag (rejected — re-introduces a script-readable token; the query param gets logged in proxy access logs).

## R6. Axios client changes

**Decision**: Each dashboard's `APIs/api.ts` changes:
- Set `withCredentials: true` on the instance (the browser sends/receives cookies cross-origin — needed only in dev where frontend is `localhost:5078` and API is `localhost:8976`; in prod same origin).
- Set `xsrfCookieName: 'XSRF-TOKEN'` and `xsrfHeaderName: 'X-XSRF-TOKEN'`.
- Remove any code path that reads `localStorage.getItem('accessToken')` and sets `Authorization: Bearer …`.
- Keep the existing `isRefreshing` queue and 401-refresh retry (per constitution). The refresh call is now `POST /api/auth/refresh` with no body — the browser attaches the refresh cookie automatically. On success, the server sets new cookies in the response; the interceptor simply retries the original request.

**Rationale**: Minimal surface change. The refresh queue guarantees no concurrent refresh (spec US-2 edge case: multiple tabs).

**Alternatives**: Rewrite interceptor using AbortController + SWR-style dedup (rejected — out of scope).

## R7. Frontend route guards

**Decision**: `ProtectedRoute` / `PublicOnlyRoute` / `AdminRoute` stop checking `localStorage.getItem('accessToken')`. Instead:
- On mount, the app calls `GET /api/auth/me` once.
- If 200 → authenticated; cache user profile in Redux (not persisted).
- If 401 → unauthenticated; redirect to `/login` per existing logic.
- The Axios 401-refresh interceptor handles expiry transparently — the guard itself only needs to distinguish "known unauthenticated" from "checking".

**Rationale**: The frontend no longer has access to the token, so it cannot verify expiry locally — it must ask the server. One lightweight request on app boot is acceptable.

**Alternatives**: Non-httpOnly "is-logged-in" sidecar cookie (rejected — leaks session lifetime to scripts unnecessarily; adds complexity).

## R8. Backward compatibility / rollout

**Decision**: Two-phase rollout.
1. **Backend deploy** — starts issuing cookies AND still accepts `Authorization: Bearer` header from old frontends. Auth response body still returns access token temporarily (flagged by `Auth:ReturnTokensInBody` config, default `true` during transition).
2. **Frontend deploy** — new dashboards stop reading the body and rely on cookies. `make prod` deploys both together.
3. **Cleanup deploy** (≥48h later) — flip `Auth:ReturnTokensInBody` to `false` and remove body tokens from the response DTO.

**Rationale**: Allows per-dashboard rollback without backend rollback. Existing sessions held in old-build tabs continue to work until their refresh cycle, at which point they receive new cookies naturally.

**Alternatives**: Hard cutover (rejected — forces all users to re-login and violates SC-006).

## R9. Logout semantics

**Decision**: `POST /api/auth/logout` (new or existing) requires the session cookie, calls the existing `RevokeRefreshTokenAsync` path using the refresh cookie value, and then returns `Set-Cookie` headers that expire the session, refresh, and XSRF cookies (`Max-Age=0`). Frontend calls logout and then clears Redux auth state.

**Rationale**: One server round-trip achieves both server revocation and client cookie clearing. Safe against tab races because the frontend treats any subsequent 401 as "logged out" regardless.

## R10. Testing strategy

**Decision**:
- **Unit (backend)**: New tests in `Lawyer.Tests` covering (a) login sets three cookies with correct flags; (b) refresh rotates and re-sets cookies; (c) logout expires cookies and invalidates server-side token; (d) antiforgery rejection on unsafe methods without header.
- **Integration (backend)**: Use `WebApplicationFactory<Program>` with a test DB to run the login → authenticated call → refresh → logout flow end-to-end, asserting cookies and antiforgery behavior.
- **Manual e2e**: Run `make dev`, log in to each dashboard, verify DevTools → Application → Local Storage is empty, Cookies contain the httpOnly entries (not readable from console), and a cross-origin `fetch` from an arbitrary tab fails on state-changing endpoints.
- **Pen test drill** (satisfies SC-002): inject an XSS payload locally in a dev branch page and confirm `document.cookie` cannot read the session cookie.

**Rationale**: Mirrors existing test style in `Lawyer.Tests` and satisfies SC-008.

## Outputs

All NEEDS CLARIFICATION items resolved. Proceed to Phase 1.
