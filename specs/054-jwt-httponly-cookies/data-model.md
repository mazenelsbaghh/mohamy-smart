# Phase 1 — Data Model

No database schema changes.

## Server-side entities (existing, unchanged)

### ApplicationUser (existing)

Relevant fields only:

| Field | Type | Notes |
|-------|------|-------|
| `RefreshToken` | `string?` | SHA-256 hash of the currently active refresh token. Set on login, rotated on refresh, cleared on logout. Same behavior as today. |
| `RefreshTokenExpiresAt` | `DateTime?` | UTC expiry of the currently active refresh token. |

No migration required.

## Client-side state

### Browser cookies (issued by backend)

| Cookie | Content | HttpOnly | Secure | SameSite | Lifetime | Scope |
|--------|---------|----------|--------|----------|----------|-------|
| `__Host-session` (prod) / `session` (dev) | JWT access token | **yes** | yes (prod) / no (dev) | Lax | 15 minutes | Path=/ |
| `__Host-refresh` (prod) / `refresh` (dev) | Opaque refresh token | **yes** | yes (prod) / no (dev) | Lax | 7 days | Path=/api/auth/refresh |
| `XSRF-TOKEN` | Random antiforgery token | no | yes (prod) / no (dev) | Lax | Session (rotates per login) | Path=/ |

Production uses the `__Host-` prefix (browser-enforced: host-only + Secure + Path=/) for the session and refresh cookies to harden against sibling-subdomain attacks.

### Redux (frontend)

After the migration, `authSlice` holds only:
- `user`: profile (id, fullName, roles) — fetched from `GET /api/auth/me` on app boot.
- `status`: `'unknown' | 'authenticated' | 'unauthenticated'`.

No `accessToken`, no `refreshToken`, no localStorage interaction.

## State transitions

```
[unknown] --(/auth/me 200)--> [authenticated]
[unknown] --(/auth/me 401)--> [unauthenticated]
[unauthenticated] --(login OK)--> [authenticated]   (server sets 3 cookies)
[authenticated] --(401 then refresh OK)--> [authenticated]   (server rotates 2 cookies)
[authenticated] --(401 then refresh 401)--> [unauthenticated]   (all cookies expired)
[authenticated] --(logout)--> [unauthenticated]   (cookies expired, server revokes)
```

## Invariants

- At all times, if the frontend is `authenticated`, the browser holds both session and refresh cookies (or one has just expired and refresh is in flight).
- The server-side `ApplicationUser.RefreshToken` hash corresponds to exactly one currently-valid refresh cookie value — reuse of an old value fails comparison.
- The `XSRF-TOKEN` cookie value matches what the server expects for every state-changing request from this session.
