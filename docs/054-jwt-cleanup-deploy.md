# T043 — Cleanup Deploy Guide
**Feature**: `054-jwt-httponly-cookies`  
**When to run**: ≥48 hours after initial deploy, once all users confirmed on new cookie-based build.

---

## Prerequisites Checklist

Before executing the cleanup deploy, verify:

- [ ] All active users have logged in at least once with the new build (session cookie issued)
- [ ] Zero errors in Sentry/logs related to missing `accessToken` in localStorage
- [ ] `CookieAuthFallbackMiddleware` log messages show zero upgrades for ≥24h (meaning no old clients remain)
- [ ] Staging environment tested with `Auth:ReturnTokensInBody = false`

---

## Step 1 — Flip the transition flag

In `appsettings.Production.json` (or via environment variable):

```json
{
  "Auth": {
    "ReturnTokensInBody": false
  }
}
```

This strips `accessToken` / `refreshToken` from the login and refresh-token response bodies.  
The browser still receives them via `Set-Cookie` headers — nothing breaks.

---

## Step 2 — Remove the flag + DTO fields (after 1 week of stability)

**File**: `Lawyer/appsettings.json`
```diff
- "Auth": {
-   "ReturnTokensInBody": true
- },
```

**File**: `Lawyer.Application/Dtos/Auth/AuthResponseDto.cs`
```diff
  public class AuthResponseDto
  {
-     public string AccessToken { get; set; } = string.Empty;
-     public string RefreshToken { get; set; } = string.Empty;
      public string UserId { get; set; } = string.Empty;
      // ... rest of fields
  }
```

**File**: `Lawyer/Controllers/AuthController.cs`
```diff
- if (!(_config.GetValue<bool?>("Auth:ReturnTokensInBody") ?? true))
- {
-     result.Data.AccessToken  = string.Empty;
-     result.Data.RefreshToken = string.Empty;
- }
```

---

## Step 3 — Remove the migration shim middleware (≥2 weeks post-deploy)

**File**: `Lawyer/Program.cs`
```diff
- // T041: migration shim — upgrades legacy Authorization: Bearer sessions to httpOnly cookies.
- // REMOVE THIS after ≥2 weeks from the frontend deploy (all clients confirmed on new build).
- app.UseMiddleware<Lawyer.Middlewares.CookieAuthFallbackMiddleware>();
```

**File**: Delete `Lawyer/Middlewares/CookieAuthFallbackMiddleware.cs`

---

## Step 4 — Frontend cleanup (T038 already done)

Verify no remaining references to `localStorage.getItem('accessToken')` or `localStorage.getItem('refreshToken')` in either dashboard:

```bash
grep -rn "accessToken\|refreshToken" mohamy-smart-lawyer-dashboard/src --include="*.ts" --include="*.tsx"
grep -rn "accessToken\|refreshToken" mohamy-smart-admin-dashboard/src --include="*.ts" --include="*.tsx"
```

Expected output: **empty** (zero matches).

---

## Verification After Cleanup

```bash
# 1. Login and check response body — should have NO tokens
curl -X POST /api/auth/login -d '...' | jq '.data | keys'
# Expected: ["fullName", "phone", "profileId", "roles", "userId"] — no "accessToken"

# 2. Check cookies are set
curl -v -X POST /api/auth/login -d '...' 2>&1 | grep "Set-Cookie"
# Expected: __Host-session, __Host-refresh, XSRF-TOKEN cookies

# 3. Call a protected endpoint without Authorization header — should succeed via cookie
curl -v -b "session=<token>" /api/cases | jq '.succeeded'
# Expected: true
```
