# Feature Specification: Phase 2 — Security & Secrets Hardening

**Feature Branch**: `003-security-secrets-hardening`
**Created**: 2026-04-04
**Status**: Draft
**Input**: User description: "Phase 2 — Security & Secrets Hardening: إزالة جميع الـ credentials الحساسة من الـ source code وحمايتها"

## Clarifications

### Session 2026-04-04

- Q: هل التحقق عند بداية التشغيل (startup validation) يشمل اتصال فعلي بقاعدة البيانات أو الـ services الخارجية؟ → A: لا — فحص القيم فقط (format check): التأكد من وجود القيم، عدم كونها placeholder، والتحقق من قواعد format أساسية (طول JWT ≥ 32، صيغة URLs صحيحة، أرقام/booleans قابلة للقراءة). لا DB ping ولا فحص اتصال فعلي بأي service. اختبار الاتصال يكون في health checks أو عند أول استخدام فعلي.
- Q: هل مطلوب تنظيف الـ git history لإزالة الـ secrets المتسربة؟ → A: لا — تدوير المفاتيح فقط بدون إعادة كتابة الـ history. لا force push ولا BFG ولا filter-branch. السبب: المخاطر التشغيلية (كسر clones/branches) أعلى من العائد. المفاتيح القديمة بعد rotation عديمة القيمة. اختيارياً: تفعيل secret scanning لمنع التسريب مستقبلاً.
- Q: هل الـ CORS policy لازم يدعم `AllowCredentials()`؟ → A: نعم — تفعيل `AllowCredentials()` مع origins محددة لدعم Authorization headers وcookies عبر cross-origin requests. مطلوب لأن الـ Lawyer Dashboard بيبعت JWT Bearer tokens في Authorization header.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - CORS Restricted to Known Origins (Priority: P1)

A developer starts the backend in Development mode and the CORS policy allows requests
only from the three known local origins (Lawyer Dashboard on 5078, Admin Dashboard on
5079, Landing Page on 3000). In Production mode, only the production domains are allowed.
Any request from an unknown origin is rejected with a CORS error.

**Why this priority**: CORS is the most impactful security surface — a permissive CORS
policy allows any website to make authenticated requests to the backend on behalf of a
logged-in user. This is the highest-risk item because it is exploitable remotely without
any access to the codebase.

**Independent Test**: Start the backend in Development mode. Use `curl` with an
`Origin: http://evil-site.com` header against any endpoint — the response must NOT include
`Access-Control-Allow-Origin`. Repeat with `Origin: http://localhost:5078` — the response
MUST include the correct allow header.

**Acceptance Scenarios**:

1. **Given** the backend is running in Development mode, **When** a request arrives from
   `http://localhost:5078` (Lawyer Dashboard), **Then** the response includes
   `Access-Control-Allow-Origin: http://localhost:5078`.
2. **Given** the backend is running in Development mode, **When** a request arrives from
   `http://localhost:5079` (Admin Dashboard), **Then** the response includes
   `Access-Control-Allow-Origin: http://localhost:5079`.
3. **Given** the backend is running in Development mode, **When** a request arrives from
   `http://localhost:3000` (Landing Page), **Then** the response includes
   `Access-Control-Allow-Origin: http://localhost:3000`.
4. **Given** the backend is running in Development mode, **When** a request arrives from
   `http://localhost:9999` (unknown origin), **Then** the response does NOT include any
   `Access-Control-Allow-Origin` header — the browser blocks the request.
5. **Given** the CORS allowed origins list needs to change, **When** a developer edits
   the configuration file, **Then** the origins update without changing any source code.
6. **Given** a dashboard sends an API request with an `Authorization: Bearer` header,
   **When** the CORS policy is evaluated, **Then** the response includes
   `Access-Control-Allow-Credentials: true` and the preflight response allows the
   `Authorization` header.

---

### User Story 2 - Backend Fails Fast on Missing Secrets (Priority: P2)

A developer clones the repository and runs `dotnet run` without creating an
`appsettings.Development.json` file. Instead of starting with broken or empty credentials
(leading to cryptic runtime errors later), the backend fails immediately at startup with
a clear, human-readable error message listing exactly which secrets are missing and how
to create the required configuration file.

**Why this priority**: This prevents the "it compiles but nothing works" scenario that
wastes developer time. Early validation catches misconfiguration before it causes confusing
downstream errors (e.g., "Failed to connect to database" or "JWT token invalid").

**Independent Test**: Rename or delete `appsettings.Development.json`, then run
`dotnet run`. The application must exit with a non-zero code and print a message that
includes the words "appsettings.Development.json" and lists at least one missing key name.

**Acceptance Scenarios**:

1. **Given** `appsettings.Development.json` does not exist, **When** a developer runs
   `dotnet run`, **Then** the application exits immediately with a clear error message
   naming the missing file.
2. **Given** `appsettings.Development.json` exists but the `ConnectionStrings:SqlServer`
   key contains a placeholder value (e.g., starts with "TODO"), **When** the backend starts,
   **Then** it fails with a specific error message about the missing database connection
   string.
3. **Given** `appsettings.Development.json` exists but the `JWT:Key` is shorter than 32
   characters, **When** the backend starts, **Then** it fails with a specific error
   indicating the JWT key must be at least 32 characters.
4. **Given** all required secrets are present, not placeholders, and pass format checks
   (JWT key ≥ 32 chars, URLs are valid format, numeric values parseable), **When** the
   backend starts, **Then** it starts normally without any validation warnings — regardless
   of whether external services (DB, OpenAI, Paymob) are reachable at that moment.

---

### User Story 3 - Onboarding Template for Backend Secrets (Priority: P3)

A new developer joining the project can find a committed example file that shows exactly
which secrets are needed, what format they should be in, and where to get them — without
exposing any real credentials. The developer copies this file, fills in real values, and
the backend starts successfully.

**Why this priority**: Without an onboarding template, new developers must reverse-engineer
the required configuration by reading source code or asking teammates. This story creates
a self-documenting entry point.

**Independent Test**: Delete `appsettings.Development.json`. Copy the example file and
rename it to `appsettings.Development.json`. Verify the file contains all required keys
with clearly labeled placeholder values.

**Acceptance Scenarios**:

1. **Given** a new developer clones the repository, **When** they look at the backend
   project directory, **Then** they find a committed example configuration file with
   placeholder values for every required secret.
2. **Given** the example file exists, **When** a developer copies it and replaces
   placeholders with real values, **Then** the backend starts successfully.
3. **Given** the example file is committed to version control, **When** any secret key
   is added to the backend configuration in a future phase, **Then** the example file must
   also be updated (documented as a maintenance rule).

---

### User Story 4 - Compromised Secrets Rotated (Priority: P4)

All credentials that were previously exposed in the git history are rotated (changed to
new values). This includes the database password, OpenAI API key, Gemini API key, all
Paymob keys, and the JWT signing key. After rotation, the old credentials no longer work.

The git history itself is NOT rewritten — no `git filter-branch`, no BFG Repo Cleaner,
no force push. Once the credentials are rotated, the old values in git history are
rendered useless. Future leaks are prevented via secret scanning (optional but recommended).

**Why this priority**: Even though the secrets have been replaced with `TODO:` placeholders
in the current commit, the real values remain accessible in git history. Until they are
rotated, anyone with repository access (even read-only) can extract production credentials.
This story addresses the residual risk.

**Independent Test**: Extract the old credentials from git history (initial commit). Try
to use them to connect to the database or call the OpenAI/Paymob APIs. The old credentials
must be rejected.

**Acceptance Scenarios**:

1. **Given** old database credentials are extracted from git history, **When** a connection
   attempt is made using those credentials, **Then** the connection is refused.
2. **Given** old API keys (OpenAI, Gemini) are extracted from git history, **When** an API
   call is made using those keys, **Then** the API returns an "invalid key" or
   "unauthorized" error.
3. **Given** old Paymob keys are extracted from git history, **When** a payment initiation
   is attempted, **Then** Paymob rejects the request.
4. **Given** old JWT signing key is extracted from git history, **When** a token is forged
   using that key, **Then** the backend rejects the token as invalid.
5. **Given** all credentials have been rotated, **When** the new values are placed in
   `appsettings.Development.json`, **Then** the backend starts and operates normally.

---

### User Story 5 - Production CORS Origins Documented (Priority: P5)

The backend configuration includes a clearly separated list of production-allowed origins
alongside the development origins. When the backend runs in a non-Development environment,
it restricts CORS to production domains only. This ensures that the local development
origins are never permitted in production.

**Why this priority**: This is the production counterpart to US1. While US1 secures
local development, this story ensures the production deployment is equally restrictive
and that the configuration pattern supports both environments cleanly.

**Independent Test**: Set `ASPNETCORE_ENVIRONMENT=Production` and start the backend.
Send a request with `Origin: http://localhost:5078` — it must be rejected. Send a
request with the production domain origin — it must be accepted.

**Acceptance Scenarios**:

1. **Given** the backend is running in Production mode, **When** a request arrives from
   a production domain (e.g., `https://app.mohamy-smart.com`), **Then** the CORS header
   allows it.
2. **Given** the backend is running in Production mode, **When** a request arrives from
   `http://localhost:5078`, **Then** the CORS header does NOT allow it.
3. **Given** the CORS origins are configurable, **When** the production domain changes,
   **Then** only the configuration file needs to be updated — no code changes required.

---

### Edge Cases

- What if a developer accidentally commits `appsettings.Development.json`? The `.gitignore`
  rules must catch this. The file must not appear in `git status` even after creation.
- What if a developer sets `ASPNETCORE_ENVIRONMENT` to an unrecognized value (e.g.,
  "Staging")? The CORS policy should default to the most restrictive set (production only).
- What if the CORS allowed origins list in configuration is empty or malformed? The backend
  should fail at startup with a clear error rather than falling back to "allow any".
- What if a frontend sends a preflight (OPTIONS) request? The CORS middleware must handle
  it correctly — returning the appropriate headers (including `Access-Control-Allow-Credentials`)
  without requiring authentication.
- `AllowCredentials()` is incompatible with `AllowAnyOrigin()` in ASP.NET Core. The code
  must never combine both — specific origins must always be listed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The CORS policy MUST read allowed origins from the configuration file, not
  from hardcoded values in source code. The policy MUST include `AllowCredentials()` to
  support `Authorization` headers and cookies in cross-origin requests.
- **FR-002**: In Development mode, the CORS policy MUST allow only
  `http://localhost:5078`, `http://localhost:5079`, and `http://localhost:3000`.
- **FR-003**: In Production mode, the CORS policy MUST allow only the documented
  production domains and MUST reject all localhost origins.
- **FR-004**: The backend MUST validate at startup that all required secrets are present,
  are not placeholder values (e.g., do not start with "TODO"), and meet minimum format
  requirements: JWT key length ≥ 32 characters, URLs are valid format, numeric/boolean
  values are parseable. This validation MUST NOT attempt any external connectivity
  (no DB ping, no API calls to OpenAI/Gemini/Paymob).
- **FR-005**: If any required secret is missing or invalid, the backend MUST exit with a
  non-zero code and a human-readable error message naming the specific missing/invalid key.
- **FR-006**: A committed example configuration file MUST exist in the backend project,
  containing placeholder values for every required secret, with inline comments explaining
  where to obtain real values.
- **FR-007**: The example configuration file MUST NOT contain any real credentials —
  all values MUST be clearly marked as placeholders (e.g., "YOUR_VALUE_HERE").
- **FR-008**: All previously exposed credentials (database password, AI API keys, payment
  keys, JWT signing key) MUST be rotated to new values.
- **FR-009**: After credential rotation, the old credentials MUST be verified as
  non-functional.
- **FR-010**: The `appsettings.Development.json` file MUST remain excluded from version
  control via `.gitignore`.
- **FR-011**: CORS preflight (OPTIONS) requests MUST be handled correctly without
  requiring authentication.
- **FR-012**: Startup validation MUST NOT include connectivity checks to any external
  service. External service reachability MUST be verified via health check endpoints or
  at first actual use — not during application boot.
- **FR-013**: Git history MUST NOT be rewritten to remove old secrets. Credential rotation
  is the sole mitigation. Optionally, secret scanning (e.g., GitHub secret scanning or
  pre-commit hooks) SHOULD be enabled to prevent future credential leaks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero requests from unknown origins are permitted by the backend CORS policy
  — verified by testing with at least 3 different unauthorized origins.
- **SC-002**: A new developer can set up the backend from scratch in under 10 minutes
  by following the example configuration file and the error messages from startup
  validation.
- **SC-003**: 100% of previously exposed credentials are rotated and verified as
  non-functional — measured by attempting to use each old credential.
- **SC-004**: The backend fails within 5 seconds of startup when required secrets are
  missing — not after minutes of partial operation.
- **SC-005**: Both Lawyer Dashboard and Admin Dashboard can still make API calls to the
  local backend after CORS is restricted — zero regression in existing functionality.

## Assumptions

- Phase 1 (Environment & Port Unification) is complete: all ports are locked and all
  components run on their canonical ports.
- The developer has access to rotate credentials on all third-party services (SQL Server
  admin panel, OpenAI dashboard, Google AI Studio, Paymob merchant portal).
- The repository is private, but the git history exposure is still treated as a security
  incident because credentials grant access to production infrastructure.
- Git history will NOT be rewritten (no force push, no BFG). Credential rotation renders
  the exposed values useless. The operational risk of history rewriting (breaking existing
  clones and branches) exceeds the security benefit.
- The production domains for CORS are: `https://mohamy-smart.com`,
  `https://app.mohamy-smart.com`, and `https://admin.mohamy-smart.com`.
- `AllowAnyOrigin()` in the current CORS policy will be replaced — not supplemented.
  The old policy name ("AllowAny") will be replaced with a descriptive name.
- The startup validation is for the Development environment only — production deployments
  may use different validation mechanisms (e.g., Azure Key Vault health checks).
