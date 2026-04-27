# Quickstart: P0 — Emergency Critical Security Fixes

**Feature**: `060-p0-critical-security-fixes`
**Date**: 2026-04-23

## Prerequisites

- Backend running on port 8976 (`make dev` or `dotnet run`)
- Admin dashboard running on port 5079
- Lawyer dashboard running on port 5078
- Landing page running on port 3000

## Verification Steps

### 1. OTP Logging (Backend)

```bash
# Start backend and trigger OTP send
# Then search logs for OTP code patterns
grep -r "DEV OTP CODE" mohamy-smart-backend/ --include="*.cs"
# Expected: 0 matches (line should be removed)

grep -r "Provided: '" mohamy-smart-backend/ --include="*.cs"
# Expected: 0 matches (submitted code should not be logged)
```

### 2. API Key Placeholder (Backend)

```bash
# Verify no real API keys in committed example config
grep -i "AIzaSy" mohamy-smart-backend/Lawyer/appsettings.example.json
# Expected: 0 matches
```

### 3. DB Error Response (Backend)

```bash
# Trigger a DB constraint violation via API and verify response:
# - HTTP status code: 500 (not 400)
# - Body: generic message, no SQL table/column/constraint names
# - Server logs still contain full exception details
```

### 4. File Upload Security (Backend)

```bash
# Test extension rejection (should fail):
curl -X POST -F "file=@test.exe" http://localhost:8976/api/documents/upload
# Expected: 400 with "File type '.exe' is not allowed"

# Test path traversal sanitization:
# Upload file with name "../../../etc/passwd.pdf"
# Verify stored filename contains no path separators

# Test allowed file (should succeed):
curl -X POST -F "file=@test.pdf" http://localhost:8976/api/documents/upload
# Expected: 200 with file path
```

### 5. localStorage Crash Prevention (Frontend)

```bash
# In browser console on Admin Dashboard (localhost:5079):
localStorage.setItem("admin_user", "{invalid json}")
# Refresh page → should show login page, not crash

# In browser console on Lawyer Dashboard (localhost:5078):
localStorage.setItem("user", "{invalid json}")
# Refresh page → should show login page, not crash
```

### 6. Register Page Deletion (Landing)

```bash
# Verify register directory is deleted
ls apps/landing/src/app/register/
# Expected: directory does not exist

# Verify RegisterForm is deleted
ls apps/landing/src/components/auth/RegisterForm.tsx
# Expected: file does not exist

# Build landing page and verify no broken references
cd apps/landing && npm run build
# Expected: successful build with no errors about missing register page
```

## Post-Merge Actions

1. **Revoke Google Vision API Key**: Go to Google Cloud Console → APIs & Services → Credentials → Delete key `AIzaSyCoLVAdtiPTi_ygh4QpPbwga1QWXbyjetw`
2. **Verify production logs**: Confirm OTP codes no longer appear in production log files
3. **Monitor error responses**: Verify DB errors return generic messages in production
