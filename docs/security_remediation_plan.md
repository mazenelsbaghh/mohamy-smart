# Security Remediation Plan — Mohamy Smart
**Date:** 2026-04-20  
**Source:** SECURITY_ISSUES.md  
**Overall Risk:** LOW — No critical/high vulnerabilities. All issues are medium/hardening.

---

## Status Overview

| Phase | Issues | Effort | Status |
|-------|--------|--------|--------|
| Phase 1 — Quick Wins | Issue 1, Issue 3 | ~35 min | ⬜ Not Started |
| Phase 2 — Frontend Hardening | Issue 5, Issue 2 | ~1.5 hr | ⬜ Not Started |
| Phase 3 — Backend Coordination | Issue 4 | ~1 sprint | ⬜ Blocked (needs backend) |
| Phase 4 — Ongoing | — | Continuous | ⬜ Not Started |

---

## Phase 1 — Quick Wins ⚡ (~35 min)

> No dependencies. Do this first. Zero risk of breaking anything.

### Task 1.1 — HTTPS Enforcement Check (Medium Severity)

**Files:**
- `mohamy-smart-admin-dashboard/src/APIs/api.ts`
- `mohamy-smart-lawyer-dashboard/src/APIs/api.ts` (if exists)

Add a runtime guard at the top of the Axios instance creation:

```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

if (import.meta.env.PROD && apiBaseUrl && !apiBaseUrl.startsWith("https://")) {
  throw new Error(
    `[Security] VITE_API_BASE_URL must use HTTPS in production. Got: ${apiBaseUrl}`
  );
}
```

Also update `.env.example` in both dashboards:

```env
# Development only — must be HTTPS in production
VITE_API_BASE_URL=http://localhost:8976/api
# VITE_API_BASE_URL=https://your-production-domain.com/api
```

**Definition of Done:**
- [ ] Guard added to admin dashboard `api.ts`
- [ ] Guard added to lawyer dashboard `api.ts` (if applicable)
- [ ] `.env.example` updated in both dashboards

---

### Task 1.2 — Delete Unused `SafeHtmlRenderer` (Hardening)

**Action:** Delete `SafeHtmlRenderer.tsx` from whichever dashboard contains it.

Verify it's unused first:
```bash
grep -r "SafeHtmlRenderer" src/
```
If no results → delete the file.

**Definition of Done:**
- [ ] Searched and confirmed no usages
- [ ] File deleted (or warning comment added if intentional)

---

## Phase 2 — Frontend Hardening 🛡️ (~1.5 hrs)

> Pure frontend changes. No backend coordination needed.

### Task 2.1 — Token Expiry Validation on Page Load (Hardening)

**Files:**
- `mohamy-smart-admin-dashboard/src/redux/auth/authSlice.ts`
- `mohamy-smart-lawyer-dashboard/src/redux/auth/authSlice.ts` (if applicable)

Add a JWT expiry check on store hydration:

```typescript
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // treat malformed token as expired
  }
}

const storedToken = localStorage.getItem("token");
const initialToken = isTokenExpired(storedToken) ? null : storedToken;

// Use initialToken in initialState instead of storedToken
```

**Definition of Done:**
- [ ] `isTokenExpired` function added
- [ ] `initialState` uses validated token
- [ ] `isAuthenticated: false` when token is expired → redirects to login
- [ ] Tested: expired token clears session on page load

---

### Task 2.2 — HTTP Security Headers via Nginx (Hardening)

**File:** `nginx.conf` (or `docker/nginx.conf`)

Add inside the `server` or `location /` block:

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;" always;
```

> ⚠️ Start with `Content-Security-Policy-Report-Only` first. Monitor for violations in the browser console. Switch to enforcing `Content-Security-Policy` after confirming no breakage.

**Definition of Done:**
- [ ] Headers added to nginx config
- [ ] Deployed and verified via browser DevTools → Network → Response Headers
- [ ] No console CSP violations after testing all app flows
- [ ] Switched from `Report-Only` to enforcing `Content-Security-Policy`

---

## Phase 3 — Backend Coordination 🔗 (Next Sprint)

> Requires backend team. Do NOT implement frontend-only.

### Task 3.1 — Migrate Tokens to HttpOnly Cookies (Hardening)

**Requires:** Backend sets tokens as `httpOnly; Secure; SameSite=Strict` cookies first.

**Frontend steps (after backend is ready):**
1. Remove `localStorage.setItem/getItem/removeItem('token')` from `authSlice.ts`
2. Remove manual `Authorization: Bearer` header injection from Axios interceptors
3. Add `withCredentials: true` to the Axios instance:
   ```typescript
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL,
     withCredentials: true,
   });
   ```

**Backend checklist:**
- [ ] Backend sets `Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict`
- [ ] CORS configured to allow credentials from frontend origins
- [ ] Logout endpoint clears the cookie server-side

**Frontend checklist:**
- [ ] `localStorage` token references removed
- [ ] `withCredentials: true` added
- [ ] Manual `Authorization` header injection removed
- [ ] Login/logout flow tested end-to-end

---

## Phase 4 — Ongoing Practices 📋

> No code changes. Process improvements.

- [ ] Add the HTTPS check to the CI/CD pipeline
- [ ] Run `npm audit` monthly on all dashboard packages
- [ ] Review CSP headers after adding any new third-party scripts/fonts
- [ ] Re-audit when major dependencies are upgraded

---

## Reference: What's Already Secure ✅

| Area | Status |
|------|--------|
| XSS (dangerouslySetInnerHTML) | ✅ DOMPurify protected |
| Hardcoded secrets/API keys | ✅ None found |
| SQL/NoSQL injection | ✅ N/A (frontend) |
| Open redirects | ✅ Hardcoded paths only |
| CSRF | ✅ Bearer token (not cookie-based) |
| eval() / Function() injection | ✅ Not used |
| Sensitive PII in console.log | ✅ None found |
| Token refresh race condition | ✅ Queue pattern in place |
| Authentication bypass | ✅ AdminRoute checks role + auth |
