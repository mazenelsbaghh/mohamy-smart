# Feature Specification: P0 — Emergency Critical Security Fixes

**Feature Branch**: `060-p0-critical-security-fixes`  
**Created**: 2026-04-23  
**Status**: Draft  
**Input**: User description: "Phase 0: Emergency security fixes — OTP logging, leaked credentials, DB error exposure, file upload security, localStorage crash prevention, delete empty register page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — OTP Codes No Longer Exposed in Logs (Priority: P1)

As a system operator, OTP verification codes must never appear in log files at any log level, so that anyone with access to logs cannot bypass phone verification or impersonate users.

**Why this priority**: OTP exposure in logs is a direct authentication bypass vector. Every minute the codes remain logged is a window for account takeover.

**Independent Test**: Can be tested by triggering OTP send/verify flows and confirming that no log entry contains the actual code — only masked identifiers like phone number.

**Acceptance Scenarios**:

1. **Given** a user requests an OTP for phone `+2010XXXXXXX`, **When** the OTP is generated and logged, **Then** the log entry contains the masked phone number but NOT the OTP code value
2. **Given** a user submits an OTP for verification, **When** the verification is processed and logged, **Then** the log entry does NOT contain the submitted code value
3. **Given** a developer searches all log output at any level (Debug, Info, Warning, Error), **When** OTP-related flows are triggered, **Then** zero instances of raw OTP codes appear

---

### User Story 2 — No Secrets or Credentials in Source Code (Priority: P1)

As a developer or security auditor, the source code repository must not contain any real API keys, database credentials, or other secrets — only placeholders that are safe to commit.

**Why this priority**: Leaked credentials in version control can be exploited by anyone with repository access (public or private). This is the highest-impact, lowest-effort fix.

**Independent Test**: Can be tested by searching the entire repository for patterns matching real API keys and database connection strings.

**Acceptance Scenarios**:

1. **Given** the file `appsettings.example.json`, **When** a developer opens it, **Then** the API key field contains a placeholder like `"YOUR_API_KEY_HERE"` instead of a real key
2. **Given** the file `appsettings.Development.json`, **When** a developer opens it, **Then** the connection string does NOT contain hardcoded SA credentials; it references user secrets or environment variables instead
3. **Given** the entire repository, **When** a credential scan is performed, **Then** no real API keys or database passwords are found

---

### User Story 3 — Database Schema Not Leaked in API Error Responses (Priority: P1)

As an end user or attacker, when a database error occurs during an API request, the response must NOT contain SQL constraint names, column names, table names, or any internal database schema details.

**Why this priority**: Schema exposure helps attackers craft targeted SQL injection attacks and reveals system internals.

**Independent Test**: Can be tested by triggering a database constraint violation (e.g., duplicate unique key) and verifying the API response contains only a generic error message.

**Acceptance Scenarios**:

1. **Given** a database unique constraint violation occurs, **When** the exception middleware handles the error, **Then** the API response contains a generic message like "A database error occurred. Please try again."
2. **Given** the API response for a database error, **When** inspected, **Then** it does NOT contain any SQL table names, column names, or constraint names
3. **Given** the HTTP status code is 500 for a database error, **When** the response body is checked, **Then** the internal result status code also reflects a server error (not a mismatched 400)

---

### User Story 4 — File Uploads Reject Dangerous Files (Priority: P1)

As a malicious user attempting to upload harmful files, the system must reject files with dangerous extensions and sanitize filenames to prevent path traversal attacks.

**Why this priority**: Without file type filtering, attackers can upload executable files, HTML for stored XSS, or use path traversal to overwrite system files.

**Independent Test**: Can be tested by attempting to upload `.exe`, `.html`, `.js` files and filenames containing `../` — all must be rejected.

**Acceptance Scenarios**:

1. **Given** a user uploads a file with extension `.exe`, **When** the upload is processed, **Then** the system rejects the file with a clear error message
2. **Given** a user uploads a file with extension `.pdf`, `.doc`, `.docx`, `.jpg`, `.jpeg`, or `.png`, **When** the upload is processed, **Then** the file is accepted
3. **Given** a user uploads a file with filename `../../../etc/passwd.pdf`, **When** the upload is processed, **Then** the stored filename is sanitized to contain only the base name (no path traversal characters)
4. **Given** a user uploads a file with a valid extension but mismatched content type, **When** the upload is processed, **Then** the file extension is validated against the whitelist regardless of content type

---

### User Story 5 — Application Does Not Crash from Corrupt localStorage (Priority: P2)

As a user of the admin or lawyer dashboard, if the browser's localStorage contains corrupted JSON data for the user session, the application must gracefully recover instead of crashing to a blank screen.

**Why this priority**: A corrupted localStorage makes the app completely unusable with no recovery path for non-technical users. It requires manual browser console intervention to fix.

**Independent Test**: Can be tested by manually setting `localStorage.setItem("user", "{invalid json")` and refreshing the page — the app should load normally with a logged-out state.

**Acceptance Scenarios**:

1. **Given** the admin dashboard's localStorage contains invalid JSON in the "user" key, **When** the app initializes, **Then** the app loads normally and shows the login page (not a crash)
2. **Given** the lawyer dashboard's localStorage contains invalid JSON in the "user" key, **When** the app initializes, **Then** the app loads normally and shows the login page (not a crash)
3. **Given** corrupted localStorage data is detected during initialization, **When** the recovery logic runs, **Then** the invalid entry is automatically removed from localStorage

---

### User Story 6 — Empty Register Page Removed from Landing Site (Priority: P2)

As a visitor to the landing site, navigating to the register page should not show a blank page. The empty register route should be removed to avoid confusing users.

**Why this priority**: A blank page is a broken user experience. Since registration is handled through the lawyer dashboard, the landing page register route is redundant and confusing.

**Independent Test**: Can be tested by navigating to `/register` on the landing site and confirming either a redirect or a 404 — never a blank page.

**Acceptance Scenarios**:

1. **Given** a visitor navigates to `/register` on the landing site, **When** the page loads, **Then** the visitor is redirected to the lawyer dashboard signup page or sees a proper 404
2. **Given** the register page directory is removed, **When** the landing site is built, **Then** no broken internal links reference `/register`

---

### Edge Cases

- What happens if the file upload whitelist configuration is missing — does the system default to a safe "deny all" or an unsafe "allow all"?
- What happens if the environment variable for the database connection is not set — does the app fail to start with a clear error or crash silently?
- What happens when a user has localStorage data from a previous app version with a different schema — is the migration handled gracefully?
- What happens if the `appsettings.example.json` API key placeholder is accidentally deployed — does the feature fail gracefully?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST NOT log OTP verification codes at any log level (Debug, Information, Warning, Error, Critical) — only masked phone number identifiers are permitted
- **FR-002**: System MUST NOT log submitted OTP codes during verification — only the success/failure result may be logged
- **FR-003**: Source code MUST NOT contain real API keys; example configuration files MUST use placeholder values like `"YOUR_API_KEY_HERE"`
- **FR-004**: Source code MUST NOT contain hardcoded database credentials in tracked files; connection strings MUST reference environment variables or user secrets
- **FR-005**: API responses MUST NOT expose database schema details (table names, column names, constraint names) when database errors occur
- **FR-006**: API responses for database errors MUST return a generic user-friendly message
- **FR-007**: The HTTP status code and the internal result status code in database error responses MUST be consistent (both 500)
- **FR-008**: File upload service MUST sanitize uploaded filenames to prevent path traversal attacks
- **FR-009**: File upload service MUST validate file extensions against a configurable whitelist (default: `.pdf,.doc,.docx,.jpg,.jpeg,.png`)
- **FR-010**: File upload service MUST reject files with extensions not in the whitelist with a clear error message
- **FR-011**: Admin dashboard MUST gracefully handle corrupted localStorage data without crashing — invalid entries MUST be automatically removed
- **FR-012**: Lawyer dashboard MUST gracefully handle corrupted localStorage data without crashing — invalid entries MUST be automatically removed
- **FR-013**: The empty register page on the landing site MUST be removed and replaced with a redirect or proper 404

### Key Entities

- **Allowed File Extensions**: A configurable list of file extensions permitted for upload (default: `.pdf,.doc,.docx,.jpg,.jpeg,.png`)
- **Sanitized Filename**: An uploaded file's name after removing any path components, keeping only the base filename with a unique prefix

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero OTP codes appear in any log output across all application flows involving phone verification
- **SC-002**: A full repository search (including git history from this point forward) returns no real API keys or database passwords in tracked files
- **SC-003**: 100% of database error API responses contain only generic error messages with no schema details
- **SC-004**: 100% of file uploads with dangerous extensions (`.exe`, `.html`, `.js`, `.svg`, etc.) are rejected before storage
- **SC-005**: 100% of file uploads with path traversal patterns in filenames are sanitized before storage
- **SC-006**: Both dashboards (admin and lawyer) recover gracefully from corrupted localStorage without user intervention
- **SC-007**: The landing site's `/register` route no longer displays a blank page

## Assumptions

- The existing Google API key in `appsettings.example.json` must be revoked in the Google Cloud Console before or immediately after merging this fix
- Database connection string management will use environment variables in production and user secrets in development
- The file upload whitelist is intentionally conservative (documents and images only) and can be expanded later based on business needs
- The landing site's registration functionality is handled entirely by the lawyer dashboard's signup flow — no local registration form is needed on the landing site
- The `RegisterForm.tsx` component in the landing site can be deleted along with the register page since it is not imported or used anywhere
- The OTP logging fix targets the warning-level logs in `AuthService.cs` — lower-level debug logging that may exist is also in scope
- Admin and lawyer dashboards both use the same localStorage key pattern (`"user"`) for session data
