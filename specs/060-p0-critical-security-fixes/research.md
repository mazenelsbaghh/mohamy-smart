# Research: P0 — Emergency Critical Security Fixes

**Date**: 2026-04-23
**Feature**: `060-p0-critical-security-fixes`

---

## R1: OTP Logging — Remove vs Conditional Guard

**Decision**: Remove OTP code from log statements entirely. Replace with masked output.

**Rationale**:
- The current code logs OTP codes at `Warning` level (`_logger.LogWarning`), which persists in production log files.
- Conditional guards (e.g., `#if DEBUG`) risk being left enabled in production builds or forgotten during release.
- The safest approach is to never log the code value — only log the masked phone number and success/failure result.

**Files affected**:
- `AuthService.cs:276` — `_logger.LogWarning("🚨 DEV OTP CODE FOR {Phone}: {Code} 🚨", user.PhoneNumber, otpCode);`
  - Replace with: `_logger.LogInformation("OTP generated for {Phone}", MaskPhone(user.PhoneNumber ?? string.Empty));`
- `AuthService.cs:674` — `_logger.LogWarning("Verifying OTP for {Phone}, Provided: '{ProvidedCode}', Valid: {IsValid}", phone, trimmedCode, isValid);`
  - Replace with: `_logger.LogInformation("OTP verification attempted for {Phone}, IsValid: {IsValid}", MaskPhone(phone), isValid);`

**Alternatives considered**:
- `#if DEBUG` conditional compilation — rejected: easy to miss in release, creates false sense of security
- Custom log level filtering — rejected: relies on configuration being correct, doesn't remove the risk

---

## R2: Leaked Google Vision API Key

**Decision**: Replace with placeholder in `appsettings.example.json`. Key must be revoked in Google Cloud Console.

**Rationale**:
- The file `appsettings.example.json` is explicitly NOT gitignored (`.gitignore` line 74: `!**/appsettings.example.json`), meaning it is committed to the repository.
- Line 9 contains a real-looking key: `<REDACTED_OLD_GOOGLE_VISION_KEY>`
- This must be replaced with `"YOUR_GOOGLE_VISION_API_KEY"` to match the pattern of other placeholders in the file (lines 13-14 for Gemini, lines 16-21 for Paymob).

**Files affected**:
- `Lawyer/appsettings.example.json:9` — Replace `"ApiKey": "<REDACTED_OLD_GOOGLE_VISION_KEY>"` with `"ApiKey": "YOUR_GOOGLE_VISION_API_KEY"`

**Important**: This key must be revoked in Google Cloud Console independently of code changes.

---

## R3: Database Credentials in appsettings.Development.json

**Decision**: No code change needed — file is already gitignored and contains placeholder values.

**Rationale**:
- `.gitignore` line 71: `**/appsettings.Development.json` — the file IS gitignored.
- `.gitignore` line 72: `**/appsettings.*.json` — double coverage.
- Current content already uses placeholder values: `YOUR_OPENAI_API_KEY`, `YOUR_GEMINI_API_KEY`, etc.
- The connection string `Server=localhost,1433;Database=Lawyer;User Id=sa;Password=YourStrong!Passw0rd;...` uses local Docker SQL Server default credentials — this is standard for local development and the file is not committed.

**Action**: Verify file is gitignored (confirmed) — no code change required. Original audit concern was based on the assumption it was tracked; it is not.

---

## R4: Database Schema Exposure in API Error Responses

**Decision**: Return generic error message for `DbUpdateException`. Fix status code mismatch (currently sends HTTP 500 with internal result code 400).

**Rationale**:
- `ExceptionMiddleware.cs:52-57` handles `DbUpdateException`:
  - Sets HTTP status to `BadRequest` (400) — should be `InternalServerError` (500) for database errors
  - Logs full exception with inner message — good for server-side
  - Returns `dbUpdateEx.InnerException?.Message ?? dbUpdateEx.Message` to client — exposes SQL constraint/table/column names
- Fix: Change HTTP status to 500, return generic message, keep detailed server-side logging

**Current code** (`ExceptionMiddleware.cs:52-57`):
```csharp
case DbUpdateException dbUpdateEx:
    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
    _logger.LogError(dbUpdateEx, "Database update error. Inner: {Inner}", dbUpdateEx.InnerException?.Message);
    var dbMessage = dbUpdateEx.InnerException?.Message ?? dbUpdateEx.Message;
    response = _responseHandler.BadRequest<string>(dbMessage);
    break;
```

**Replacement**:
```csharp
case DbUpdateException dbUpdateEx:
    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
    _logger.LogError(dbUpdateEx, "Database update error.");
    response = _responseHandler.InternalServerError<string>("A database error occurred. Please try again.");
    break;
```

**Note**: Requires checking if `ApiExceptionResponse` has an `InternalServerError` method. If not, use a generic approach that sets both HTTP status and result body to 500.

**Alternatives considered**:
- Keep 400 status but hide message — rejected: DB errors are server errors, not client errors
- Custom exception type for DB errors — rejected: overkill for this P0 fix

---

## R5: File Upload Security

**Decision**: Add filename sanitization + file extension whitelist validation to `FileUploadService`.

**Rationale**:
- `FileUploadService.cs:36` — `$"{Guid.NewGuid()}_{file.FileName}"` uses raw `file.FileName` which can contain path traversal sequences (`../`, `..\\`).
- No extension validation exists anywhere in the service.
- Both `UploadClientFileAsync` and `UploadGeneralFileAsync` have identical vulnerability patterns.

**Changes**:

1. **Filename sanitization**: Use `Path.GetFileName(file.FileName)` to strip any path components.
2. **Extension whitelist**: Validate against a configurable list (default: `.pdf, .doc, .docx, .jpg, .jpeg, .png`).
3. **Case-insensitive matching**: Extensions should be compared case-insensitively (`.PDF` = `.pdf`).
4. **Missing config default**: If whitelist config is not set, default to deny-all (empty list) — fail-safe.

**Implementation pattern**:
```csharp
private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
{
    ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"
};

private static string SanitizeFileName(string rawFileName)
{
    var safeName = Path.GetFileName(rawFileName) ?? "unknown";
    return safeName;
}

private static void ValidateFileExtension(string fileName)
{
    var ext = Path.GetExtension(fileName);
    if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
        throw new ArgumentException($"File type '{ext}' is not allowed. Allowed types: {string.Join(", ", AllowedExtensions)}");
}
```

**Files affected**:
- `Lawyer.Infrastracture/Services/FileUploadService.cs` — Add validation to both upload methods

**Alternatives considered**:
- MIME type validation — rejected for P0: browser MIME types are unreliable; extension-only is sufficient for emergency fix. Can be added in Phase 1.
- Content-type magic bytes check — rejected: overkill for P0, add in Phase 6.

---

## R6: localStorage JSON.parse Crash

**Decision**: Wrap `JSON.parse` in try-catch in both `authSlice.ts` files. On failure, remove the corrupted entry and default to `null`.

**Rationale**:
- Admin `authSlice.ts:29` — `user: savedUser ? JSON.parse(savedUser) : null` — no try-catch
- Lawyer `authSlice.ts:38` — `user: savedUser ? JSON.parse(savedUser) : null` — no try-catch
- Corrupted localStorage causes unrecoverable crash on app boot
- The localStorage key is `"admin_user"` for admin, `"user"` for lawyer

**Implementation pattern** (both files):
```typescript
const getSavedUser = (key: string): TAdminUser | null => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
    } catch {
        localStorage.removeItem(key);
        return null;
    }
};
```

**Files affected**:
- `apps/admin-dashboard/src/redux/auth/authSlice.ts` — Lines 26-29
- `apps/lawyer-dashboard/src/redux/auth/authSlice.ts` — Lines 35-38

**Alternatives considered**:
- Zod validation of stored data — rejected for P0: overkill; simple try-catch is sufficient
- Migration logic for old schema — rejected: not needed; the auth me thunk re-fetches on boot

---

## R7: Landing Site Register Page Deletion

**Decision**: Delete the entire `register/` directory and the unused `RegisterForm.tsx` component.

**Rationale**:
- `apps/landing/src/app/register/page.tsx` renders an empty form wrapper (line 20-21: `<div className="auth-form-wrapper"></div>`)
- `RegisterForm.tsx` exists at `apps/landing/src/components/auth/RegisterForm.tsx` but is never imported anywhere
- Registration is handled by the lawyer dashboard (`/auth/verify-phone` flow)
- The register page has no internal links pointing to it from other landing pages (verified: Header and Footer don't link to `/register`)

**Files to delete**:
- `apps/landing/src/app/register/page.tsx`
- `apps/landing/src/app/register/auth.css`
- `apps/landing/src/components/auth/RegisterForm.tsx`
- `apps/landing/src/lib/validations/registerSchema.ts` (only used by RegisterForm — verify no other imports)

**Alternatives considered**:
- Redirect to lawyer dashboard signup — rejected: adds complexity, and the register route has no inbound links
- Keep RegisterForm for future use — rejected: dead code is a maintenance burden; it can be recreated from git history if needed

---

## R8: ApiExceptionResponse — InternalServerError Method Check

**Decision**: Check if `ApiExceptionResponse` class has an `InternalServerError<T>` method. If not, create one or use the existing `Result<T>` pattern.

**Rationale**:
- The ExceptionMiddleware fix (R4) needs to return a 500 Internal Server Error response.
- Current middleware uses `_responseHandler.BadRequest<string>()` for the DB error case.
- Need to verify what methods are available on `ApiExceptionResponse` and `Result<T>`.

**Action**: This is resolved during implementation by reading the `ApiExceptionResponse` and `Result<T>` source files. The fallback is to create a `Result<T>` with `StatusCode = 500` manually.

---

## Summary of Decisions

| # | Decision | Risk Level | Effort |
|---|----------|-----------|--------|
| R1 | Remove OTP from logs entirely | Low | Low (2 line changes) |
| R2 | Replace API key with placeholder | Low | Low (1 line change + manual revoke) |
| R3 | No change needed (already gitignored) | None | None |
| R4 | Generic DB error + fix status code | Low | Low (5 line changes) |
| R5 | Filename sanitization + extension whitelist | Low | Medium (new validation logic) |
| R6 | try-catch around JSON.parse | Low | Low (4 line changes per file) |
| R7 | Delete register page + dead RegisterForm | Low | Low (file deletions) |
| R8 | Check ApiExceptionResponse methods | None | None (implementation-time check) |
