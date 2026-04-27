# Critical Issues Remediation Phases

Generated: 2026-04-25

Scope: only dangerous issues found during a targeted code scan. This excludes normal lint, UI polish, minor warnings, and non-blocking refactors.

## Phase 0 - P0: Remove Exposed Historical Secrets

**Risk:** Real or real-looking credentials are still present in committed documentation/spec files. Even if some were already rotated, keeping them in the workspace increases accidental re-leak risk and makes future secret scanning noisy.

**Evidence:**
- `specs/001-phase0-prerequisites-decisions/tasks.md:212-224` contains historical DB, OpenAI, Gemini, and Paymob credential values.
- `specs/060-p0-critical-security-fixes/research.md:35-41` records a real-looking Google API key and explicitly says it must be revoked.
- `docs/setup-guide.md:139` and some spec files still use secret fragments in grep examples.

**Fix tasks:**
1. ✅ Replace every real key/value in specs/docs with redacted labels such as `<REDACTED_OLD_OPENAI_KEY>`.
2. ✅ Do not preserve full old keys for "verification"; keep only provider name, date, and rotation status.
3. ✅ Rotate/revoke any key that appears in these files if not already revoked.
4. ✅ Add a local/CI secret scan that fails on provider key prefixes, Paymob tokens, DB passwords, SMTP passwords, and JWT secrets.
5. ✅ If this content ever existed in a real git repository, purge history with `git filter-repo` after backing up.

**Done when:**
- ✅ A secret scanner returns no real credentials outside allowed redacted documentation.

## Phase 1 - P0: Fix Paymob Callback URLs

**Risk:** Payment redirect and server callback URLs are generated without the API version prefix, while the controller route is `api/v1/payment`. In production this can break payment confirmation or make subscription activation depend on the browser redirect instead of the authoritative server callback.

**Evidence:**
- `mohamy-smart-backend/Lawyer/Controllers/PaymentController.cs:9` uses `[Route("api/v1/[controller]")]`.
- `mohamy-smart-backend/Lawyer.Application/Services/PaymobService.cs:132-133` generates `/api/payment/callback` and `/api/payment/server-callback`.
- `mohamy-smart-backend/PAYMOB_INTEGRATION_PLAN.md` also documents the old non-versioned paths.

**Fix tasks:**
1. ✅ Change generated Paymob URLs to `/api/v1/payment/callback` and `/api/v1/payment/server-callback`.
2. ✅ Update Paymob integration docs and environment guide to match.
3. ✅ Add tests asserting generated callback URLs include `/api/v1/payment`.
4. ✅ Test both flows: browser redirect and Paymob server-to-server webhook.

**Done when:**
- ✅ A payment can be completed even if the user closes the browser after paying, because the server callback alone activates the subscription.

## ✅ Phase 2 - P0/P1: Sanitize Rich HTML Before Rendering or Saving

**Risk:** Legal document editors assign and save raw `innerHTML`. These values can originate from drafts, AI output, or user-editable content. If malicious HTML is stored, it can execute when the document is reopened.

**Evidence:**
- `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/FinalStatementOfClaims.tsx:185` assigns saved draft HTML directly.
- `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/FinalStatementOfClaims.tsx:188` assigns generated HTML directly.
- `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/FinalStatementOfClaims.tsx:290` saves raw `innerHTML`.
- `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx:715` assigns memo HTML directly.
- `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx:727` saves raw `innerHTML`.
- `apps/lawyer-dashboard/src/utils/sanitizeHtml.ts` already exists and is used by other final assembly screens.

**Fix tasks:**
1. ✅ Sanitize before every `editorRef.current.innerHTML = ...`.
2. ✅ Sanitize before every auto-save/manual save of rich HTML.
3. ✅ When building HTML from structured data, escape text values before string interpolation or render through React instead of manual template strings.
4. ✅ Add tests with payloads like image/script event handlers and `javascript:` URLs (via standard React testing/DOMPurify validation).
5. ✅ Keep the allowed tag/attribute list intentionally small for legal document formatting.

**Done when:**
- Reopening a saved draft containing malicious HTML displays harmless text/formatting only, with no executable attributes or scripts.

## ✅ Phase 3 - P1: Stop Leaking Internal AI/Provider Errors to Users

**Risk:** Background AI job failures store raw exception messages and the frontend displays them. Provider responses, model names, prompt/schema failures, or infrastructure details can leak to users.

**Evidence:**
- `mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs:130` stores `ex.Message` in `job.ErrorMessage`.
- `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx:720-721` displays `aiJob.errorMessage`.

**Fix tasks:**
1. ✅ Store a generic user-facing message in `job.ErrorMessage`.
2. ✅ Log the full exception server-side with correlation/job ID.
3. ✅ Add a separate internal diagnostics field only if it is never returned to normal users (handled via server logs).
4. ✅ Update frontend copy to show a generic failure and a retry action.

**Done when:**
- A failed AI provider call does not expose raw exception text in API responses or SignalR payloads.

## ✅ Phase 4 - P1: Reduce SMS Credential Exposure

**Risk:** OTP SMS provider credentials are sent in a GET query string. Query strings often end up in proxies, load balancer logs, browser/network tools, and vendor logs.

**Evidence:**
- `mohamy-smart-backend/Lawyer.Infrastructure/Services/PlusSmsSender.cs:39-47` builds a URL query containing `username` and `password`.
- `mohamy-smart-backend/Lawyer.Infrastructure/Services/PlusSmsSender.cs:52` sends the request with `GetAsync`.

**Fix tasks:**
1. ✅ Check the `PlusSms` API documentation to see if it supports POST with a JSON or form-data body instead of GET.
2. ✅ If it supports POST, migrate the request.
3. ✅ If it strictly requires GET, wrap the configuration retrieval in a method that ensures it doesn't log the URI by mistake, and suppress any logging of this specific outgoing URL in `IHttpClientFactory`.
4. ✅ Add a test or guard that no logger records a full SMS request URI.

**Done when:**
- SMS credentials cannot appear in application logs, reverse proxy logs, or error traces.

## Phase 5 - P1: Prevent Local/Docker Backend Port Confusion

**Risk:** A local `dotnet` backend can bind `127.0.0.1:8976` while Docker binds `*:8976`. Browser requests to `localhost` may hit the local backend instead of the Docker backend, causing the app to use `appsettings.Development.json` instead of `.env.docker`. This directly caused the Gemini configuration confusion.

**Evidence:**
- Observed locally: a `Lawyer/bin/Debug/net9.0/Lawyer` process was listening on `127.0.0.1:8976` while Docker backend also exposed `8976`.
- Browser `localhost:5078` API calls were therefore able to hit the wrong backend runtime.

**Fix tasks:**
1. ✅ Give local `dotnet run` and Docker different backend ports (8977 for local, 8976 for Docker).
2. ✅ Add a preflight script (`Makefile`) that fails if more than one process listens on the backend API port.
3. ✅ Document one supported local mode at a time: Docker stack or local backend, not both on the same port.
4. ✅ Make the frontend API base URL explicit per mode in `.env.example` files.

**Done when:**
- Starting Docker cannot silently leave the frontend talking to a stale local backend.

## Not Classified As Dangerous In This Pass

- The case-details navigation "refresh" issue was a UX/runtime loading problem, not a security/data-loss issue. It was addressed separately by avoiding the lazy full-page fallback for `CaseDetails` and passing list data through navigation state.
- Existing CORS, JWT cookie, CSRF, HSTS, rate limiting, and global exception middleware looked directionally sound in the files reviewed.
