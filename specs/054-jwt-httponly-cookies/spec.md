# Feature Specification: Migrate JWT Auth to httpOnly Cookies

**Feature Branch**: `054-jwt-httponly-cookies`
**Created**: 2026-04-20
**Status**: Draft
**Input**: User description: "اعملها" — migrate JWT storage from browser localStorage to httpOnly cookies with CSRF protection across all dashboards (lawyer, admin, landing) and the backend API.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Session tokens are not accessible to scripts (Priority: P1)

As a platform operator, I want authentication credentials to be unreachable by JavaScript running in the browser, so that a single XSS flaw anywhere in any dashboard cannot leak a user's session and impersonate them (including lawyers with active paid subscriptions and admins with privileged access).

**Why this priority**: This is the sole driver of the migration. Today, a stolen `accessToken` from `localStorage` gives an attacker full account takeover, including payment and client-data access. Every other story in this spec is an enabler for this one.

**Independent Test**: Log in as any user, open DevTools, confirm that `localStorage`, `sessionStorage`, and `document.cookie` all return no usable access or refresh token. Authenticated API calls still succeed because the browser automatically sends the httpOnly cookie.

**Acceptance Scenarios**:

1. **Given** a user logs in successfully, **When** the login response returns, **Then** no access token or refresh token value appears anywhere readable by client JavaScript.
2. **Given** an authenticated user, **When** they call any protected endpoint, **Then** the request authenticates successfully without the frontend attaching an `Authorization` header.
3. **Given** an attacker executes arbitrary script in the authenticated user's page, **When** they attempt to read the session cookie, **Then** it is not exposed (httpOnly flag blocks access).

---

### User Story 2 - Silent session refresh continues to work (Priority: P1)

As a logged-in user, I want my session to renew automatically as it approaches expiry so that I am not forced to re-enter credentials during normal work (drafting a defense memo, uploading evidence, editing a client record).

**Why this priority**: The current refresh flow is critical to UX because access tokens are short-lived. If refresh breaks during the cookie migration, every user is effectively logged out mid-session.

**Independent Test**: Let the access token expire while a user is working in any dashboard. The next API call triggers a silent refresh; the user never sees a 401 or login screen, and new cookies are issued.

**Acceptance Scenarios**:

1. **Given** an expired access token but a valid refresh token, **When** the frontend makes any API call, **Then** the system transparently issues new tokens (via cookies) and retries the original request without user interaction.
2. **Given** a revoked or reused refresh token, **When** the refresh endpoint is called with it, **Then** the session is terminated and the user is redirected to login.
3. **Given** an active SignalR/WebSocket connection when tokens rotate, **When** a reconnection occurs, **Then** the new cookies authenticate the socket without requiring the frontend to read or pass tokens.

---

### User Story 3 - State-changing requests are protected from cross-site forgery (Priority: P1)

As a user whose browser automatically attaches the session cookie to every request to our domain, I want unsafe actions (create, update, delete, pay, revoke) to be rejected unless they carry a proof that the request originated from our own frontend, so that a malicious external site cannot trick my browser into transferring money or deleting records.

**Why this priority**: Moving the token to a cookie moves the XSS risk down but introduces CSRF risk. Without CSRF protection, the fix is a net-neutral or net-worse change. P1 because this must ship with the cookie migration, not after.

**Independent Test**: From an attacker-controlled origin, attempt a cross-site POST/PUT/DELETE to any state-changing endpoint while the user is logged in. Verify the request is rejected with a clear authorization failure and no state change occurs.

**Acceptance Scenarios**:

1. **Given** a logged-in user visits a malicious third-party site, **When** that site attempts a cross-origin state-changing request, **Then** the server rejects it without performing any change.
2. **Given** the legitimate frontend makes a state-changing request, **When** the server processes it, **Then** the request succeeds because it carries the expected anti-forgery proof.
3. **Given** a safe idempotent read (GET), **When** it is made from any origin, **Then** the cookie-only authentication is sufficient (no anti-forgery proof required) and the request succeeds only if the user is authenticated.

---

### User Story 4 - Clean logout invalidates the session everywhere (Priority: P2)

As a user who logs out (or whose admin revokes their session), I want every trace of the session removed from my browser and the server so that stepping away from a shared device or revoking a compromised account is effective.

**Why this priority**: Logout hygiene is important but less catastrophic than XSS protection or refresh flow. Ships with the migration but tested separately.

**Independent Test**: Click logout, then try to access a protected page by typing its URL directly. The server returns unauthorized, and no cookies or cached auth state remain in the browser.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they click logout, **Then** all session cookies are cleared from the browser and the server-side refresh token is invalidated.
2. **Given** a user's refresh token was revoked server-side (by an admin or security action), **When** the user's next request requires refresh, **Then** the refresh is denied and the session terminates.

---

### User Story 5 - Production deployment does not disrupt live users (Priority: P2)

As a platform operator, I want the cutover from localStorage-based auth to cookie-based auth to avoid forcing every active user through an unexplained logout at deploy time, so that lawyers in the middle of case work and clients mid-onboarding do not lose their draft state.

**Why this priority**: Required for safe launch, but strictly a rollout concern — does not affect the end-state security model.

**Independent Test**: During deploy, currently-logged-in users either (a) continue working until their next natural session boundary, or (b) see a single guided re-login prompt with no data loss.

**Acceptance Scenarios**:

1. **Given** a user is logged in with a legacy localStorage token at the moment of deploy, **When** they make their next request, **Then** the system handles the transition gracefully — either by accepting the legacy token once and issuing new cookies, or by returning a clean "please log in again" response that their frontend handles without showing an error screen.
2. **Given** the deploy has completed and all frontends are on the new build, **When** any user authenticates, **Then** they receive cookie-based auth only.

---

### Edge Cases

- Multiple browser tabs for the same user making concurrent refresh attempts when the token is expiring — only one refresh should succeed and both tabs must continue working.
- User is logged in on the lawyer dashboard and the admin dashboard simultaneously under different subdomains/hosts — sessions remain independent and logging out of one must not log them out of the other.
- Mobile Safari and in-app browsers (e.g., WhatsApp link preview) that apply stricter third-party cookie rules — login must still succeed when the user is on our own first-party domain.
- Requests coming from the SignalR hub where the cookie cannot always be forwarded on the WebSocket handshake — authentication must still work without resorting to passing tokens in the URL.
- A user whose device clock is skewed by several minutes — refresh and expiry calculations must tolerate reasonable clock drift, consistent with today's behavior.
- The legal landing pages (marketing site) that today do not authenticate — they must not be inadvertently blocked or forced into authentication by the new cookie/CSRF rules.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST stop returning access and refresh tokens in any response body that is readable by the browser; tokens MUST only travel via HTTP cookies marked httpOnly, Secure (in production), and with a SameSite policy appropriate for same-site first-party navigation.
- **FR-002**: The system MUST authenticate protected API requests using the session cookie when no `Authorization` header is present, and MUST continue to accept the `Authorization: Bearer` header for backward-compatible server-to-server and test contexts only where the frontend does not participate.
- **FR-003**: The frontend (lawyer dashboard, admin dashboard, and any other authenticated surface) MUST NOT read, write, or store access tokens or refresh tokens in `localStorage`, `sessionStorage`, IndexedDB, or any script-accessible storage.
- **FR-004**: The system MUST reject cross-site state-changing requests (create, update, delete, payment, revoke) unless the request carries a valid anti-forgery proof issued for the current session.
- **FR-005**: The system MUST provide a way for the frontend to obtain the anti-forgery proof for the current session (e.g., a dedicated endpoint or a non-sensitive cookie the frontend can read and echo back in a header).
- **FR-006**: Silent token refresh MUST continue to work without the frontend ever holding the refresh token value — the refresh endpoint MUST accept the refresh cookie, rotate it, and set the new cookies in the response.
- **FR-007**: The system MUST invalidate the server-side refresh token record and clear session cookies on logout so that the same refresh token cannot be replayed.
- **FR-008**: The system MUST preserve concurrent refresh-safe behavior: when multiple tabs or requests attempt refresh simultaneously, the outcome MUST leave every tab with a valid working session and MUST NOT strand any tab with a revoked token.
- **FR-009**: Real-time connections (SignalR hubs used for AI job notifications) MUST authenticate using the session cookie on the initial handshake without requiring tokens to be passed in query strings.
- **FR-010**: The CORS policy MUST restrict allowed origins to the known first-party frontends and MUST permit credentials, and cookies MUST be scoped so they are only sent to the expected API host(s).
- **FR-011**: The existing login, registration, OTP verification, password reset, and refresh flows MUST continue to work end-to-end for all existing user types (lawyers, admins, clients) with no change to the credentials they enter.
- **FR-012**: In non-production environments where TLS is not available, cookies MAY be issued without the Secure flag; in production, cookies MUST be issued with the Secure flag.
- **FR-013**: Server logs MUST NOT log token values at any severity level; correlation IDs remain the only identifier carried in logs for a session.
- **FR-014**: A user who was logged in before the cutover MUST be transitioned either silently (one-time upgrade) or with at most one re-login, and MUST NOT see broken UI or data loss.
- **FR-015**: The system MUST document which endpoints require the anti-forgery proof and which do not, and the rule MUST be applied consistently (idempotent reads exempt; all state-changing requests required).

### Key Entities *(include if feature involves data)*

- **Session Cookie**: A short-lived cookie representing the current access grant. Not readable by scripts. Replaces the `accessToken` previously held in localStorage.
- **Refresh Cookie**: A longer-lived cookie representing the ability to mint a new session. Not readable by scripts. Rotates on every use. Replaces the `refreshToken` previously held in localStorage.
- **Anti-Forgery Proof**: A per-session value that the legitimate frontend can obtain and echo back on state-changing requests, proving the request originated from our own application rather than a cross-site context. Has no value to an attacker without an already-authenticated session.
- **User Session Record (server-side)**: The existing refresh-token record on the user account, now driven by the Refresh Cookie instead of a client-sent value. Continues to support revoke, rotate, and expire semantics.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After deploy, zero authenticated users have an access or refresh token value reachable via `localStorage.getItem`, `sessionStorage.getItem`, or `document.cookie` in any of the three dashboards.
- **SC-002**: A simulated XSS payload injected into a live authenticated page cannot exfiltrate a working session — verified by red-team dry run before go-live.
- **SC-003**: A simulated cross-site state-changing request from an external origin is rejected 100% of the time on all state-changing endpoints (create/update/delete/pay/revoke).
- **SC-004**: End-to-end login → work → silent refresh → logout flows succeed on lawyer dashboard, admin dashboard, and the landing-to-dashboard transition with no manual re-login during a 60-minute active session.
- **SC-005**: Login success rate and time-to-dashboard-load do not regress by more than 5% against the pre-migration baseline in the week after deploy.
- **SC-006**: Zero incidents in the first 72 hours post-deploy involving users reporting "logged out unexpectedly" that trace back to the cookie migration (tracked via support tickets and Sentry session-terminated events).
- **SC-007**: Payment flow (Paymob initiation + webhook return + subscription activation) completes end-to-end on the new auth model with no change to observed success rate.
- **SC-008**: Existing automated tests for auth, payment, and workflow services continue to pass; new tests specifically covering cookie issuance, rotation, logout cleanup, and anti-forgery rejection are added and pass.

## Assumptions

- The production frontends and the API are served from the same registrable domain (or subdomains of it), allowing first-party cookie semantics without cross-site cookie constraints. If they are ever split onto unrelated domains, a follow-up is required.
- HTTPS is terminated before the API in production; the Secure cookie flag is meaningful in that environment. (This matches the HTTPS/HSTS work already landed in Phase 1.)
- The existing refresh-token rotation logic (rotate on use, server-side invalidation on logout) is the intended model and is preserved — only the transport changes.
- Server-to-server integrations (e.g., Paymob webhook, Hangfire internal jobs) do not rely on the browser cookie flow and are unaffected.
- Mobile native clients, if they appear later, are out of scope for this migration and will use a separate token-based contract.
- The existing Sentry error monitoring continues to capture failures of the new auth flow, so regressions surface quickly post-deploy.
- CORS origins and CSP headers landed earlier in Phase 1 remain in force and are tightened further only if required by the cookie model.
