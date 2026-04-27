# Feature Specification: Phase 1 — Backend Critical Fixes (P1)

**Feature Branch**: `061-p1-backend-fixes`  
**Created**: 2026-04-23  
**Status**: Draft  
**Input**: User description: "Phase 1: Backend Critical Fixes — Transactions & Data Integrity, Input Validation, Performance Quick Wins, Code Quality per PROJECT_REMEDIATION_PLAN.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Data Integrity for Case Creation & Password Reset (Priority: P1)

When a lawyer creates a new case, the system performs multiple database save operations (case record, client link, case assignment, audit fields). If any step fails midway, the current system leaves partial data in the database, creating orphaned or inconsistent records. Similarly, when a user resets their password, the old refresh tokens should be invalidated but currently remain active, allowing potential unauthorized access.

**Why this priority**: Partial data corruption and stale tokens are the highest-risk issues — they directly affect data correctness and security. Without transactions, failed operations silently corrupt data.

**Independent Test**: Can be fully tested by creating a case and forcing a failure on the last save step — the entire operation should roll back with no partial records left. Password reset can be tested by resetting a password, then attempting to use the old refresh token.

**Acceptance Scenarios**:

1. **Given** a lawyer is creating a new case with valid data, **When** the third database save operation fails, **Then** the system rolls back all previous saves and returns a clear error — no partial case record exists in the database.
2. **Given** a lawyer is creating a new case with valid data, **When** all save operations succeed, **Then** the case, client link, and audit fields are all persisted atomically.
3. **Given** a user changes their password, **When** the password update succeeds, **Then** all previously issued refresh tokens are invalidated and any subsequent API call with the old token is rejected.
4. **Given** an entity is created or updated, **When** the system persists it, **Then** the `CreatedBy` and `UpdatedBy` audit fields are automatically populated with the authenticated user's identity.

---

### User Story 2 — Input Validation on All DTOs (Priority: P2)

Lawyers and clients submit data through various forms (case creation, client details, password changes, contact requests). The backend currently lacks proper validation rules, allowing invalid, malformed, or excessively long data into the system. This causes downstream errors, database issues, and poor user experience.

**Why this priority**: Without validation, garbage data enters the system, causing bugs that are hard to trace. This is critical for data quality but slightly lower priority than atomic transactions.

**Independent Test**: Can be tested by sending API requests with invalid data (empty required fields, overly long strings, malformed phone numbers, invalid email formats) and verifying the system rejects them with clear error messages.

**Acceptance Scenarios**:

1. **Given** a lawyer submits a new case, **When** the title is missing, exceeds 200 characters, or the case number/court/client name is blank, **Then** the system rejects the request with specific field-level error messages.
2. **Given** a lawyer updates an existing case, **When** any required field is invalid, **Then** the system rejects the update with the same validation rules as creation.
3. **Given** a lawyer creates or updates a client record, **When** the phone number format is invalid, the email is malformed, or the national ID format is wrong, **Then** the system rejects with clear validation error messages.
4. **Given** a user changes their password, **When** the new password does not meet complexity requirements, **Then** the system rejects the change with specific requirements listed.
5. **Given** a visitor submits a contact request, **When** the name is blank, the phone format is invalid, or the message exceeds the maximum length, **Then** the system rejects with validation errors.
6. **Given** a user logs in, **When** the system validates credentials, **Then** only email/phone and password presence are checked — no password complexity rules are applied during login.
7. **Given** a payment is initiated, **When** the payment method is not one of the allowed values, **Then** the system rejects the request.

---

### User Story 3 — Performance Quick Wins (Priority: P3)

The system has several performance bottlenecks: a correlated subquery in account listing causes slow page loads, unbounded page sizes allow clients to request thousands of records at once, and prompt template files are read from disk on every AI request instead of being cached.

**Why this priority**: These affect system responsiveness but don't cause data loss or corruption. They are quick fixes with significant user-perceived improvement.

**Independent Test**: Can be tested by measuring response times before and after fixes, requesting large page sizes, and verifying prompt templates are served from cache.

**Acceptance Scenarios**:

1. **Given** an admin views the account listing page, **When** the data loads, **Then** the response time is significantly faster due to the elimination of the correlated subquery (replaced with an efficient grouped query).
2. **Given** any API consumer requests a paginated list, **When** the page size exceeds 100, **Then** the system caps it at 100 and returns results with a warning.
3. **Given** the AI contract generation feature is used, **When** multiple requests arrive in rapid succession, **Then** prompt templates are served from an in-memory cache rather than being read from disk each time.

---

### User Story 4 — Code Quality & Maintainability (Priority: P4)

Several namespace typos, duplicated utility functions (OTP generation, email templates, lawyer ID resolution), and inconsistent naming exist across the backend codebase. This makes the code harder to maintain, increases bug risk, and confuses new developers.

**Why this priority**: Important for long-term maintainability but does not directly affect users or data integrity. Can be done after the critical fixes.

**Independent Test**: Can be verified by confirming correct namespaces compile, duplicated code is consolidated into shared utilities, and all call sites use the shared implementations.

**Acceptance Scenarios**:

1. **Given** the backend codebase, **When** all files are compiled, **Then** namespace references are correct and consistent across all service files.
2. **Given** multiple services that generate OTPs, **When** the code is refactored, **Then** a single shared `OtpHelper` utility is used by all callers.
3. **Given** multiple services that build email content, **When** the code is refactored, **Then** a single shared `EmailTemplateBuilder` utility is used by all callers.
4. **Given** multiple controllers that resolve the current lawyer's ID, **When** the code is refactored, **Then** a single shared helper method is used instead of duplicated logic.

---

### Edge Cases

- What happens when a transaction times out during case creation? The system should roll back and return a timeout error.
- What happens when validation rules conflict between create and update DTOs? Both should apply the same base rules, with update allowing partial fields.
- What happens when the page size parameter is zero or negative? The system should use a default page size.
- What happens when the prompt cache is accessed concurrently? The cache must be thread-safe.
- What happens when a user changes their password while simultaneously making an API call with an old refresh token? The token should be invalidated even if the race condition occurs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST wrap multi-step case creation in a database transaction that rolls back all changes if any step fails.
- **FR-002**: The system MUST automatically populate `CreatedBy` and `UpdatedBy` audit fields on all entities when changes are persisted.
- **FR-003**: The system MUST invalidate all refresh tokens for a user when their password is changed.
- **FR-004**: The system MUST validate that case title is required and does not exceed 200 characters, case number is required, court is required, and client name is required on both create and update.
- **FR-005**: The system MUST validate client phone number format, email format, and national ID format on both create and update.
- **FR-006**: The system MUST enforce password complexity rules (minimum length, character diversity) when changing passwords.
- **FR-007**: The system MUST validate contact request fields: name is required, phone format is valid, and message does not exceed a maximum length.
- **FR-008**: The system MUST NOT apply password complexity validation during login — only credential presence checks.
- **FR-009**: The system MUST restrict payment methods to an explicit whitelist of allowed values.
- **FR-010**: The system MUST cap all paginated API responses to a maximum of 100 items per page.
- **FR-011**: The system MUST replace the correlated subquery in account listing with an efficient grouped query.
- **FR-012**: The system MUST cache prompt template files in memory to avoid repeated disk reads on every AI request.
- **FR-013**: The system MUST use correct and consistent namespaces across all backend service files.
- **FR-014**: The system MUST consolidate duplicated OTP generation logic into a single shared utility.
- **FR-015**: The system MUST consolidate duplicated email template building logic into a single shared utility.
- **FR-016**: The system MUST consolidate duplicated lawyer ID resolution logic into a single shared helper.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All multi-step database operations complete atomically — no partial records exist after any failure scenario.
- **SC-002**: 100% of user-submitted data passes validation before being persisted — no invalid data enters the system.
- **SC-003**: Account listing page loads at least 50% faster after query optimization.
- **SC-004**: Prompt template serving adds zero disk I/O overhead after the first load, verified by cache hit metrics.
- **SC-005**: Zero duplicated utility code remains — all OTP, email template, and lawyer ID resolution logic exists in exactly one place.
- **SC-006**: Password reset completely invalidates prior sessions — users must re-authenticate after changing their password.

## Assumptions

- The existing Unit of Work pattern (`IUnitOfWork`) supports `BeginTransactionAsync` with commit/rollback semantics.
- `FluentValidation` library is already available in the project (referenced in prior features like 049-secure-otp-recovery).
- Prompt template files are static and do not change at runtime — a ConcurrentDictionary cache with lazy loading is sufficient.
- The default page size is 10 and maximum is 100, consistent with common API conventions.
- Refresh token invalidation on password change applies to all active sessions for that user.
- Password complexity rules follow the existing regex pattern already defined in the codebase.
- Phone validation accepts both local (Egyptian) and international formats.
- Contact request message maximum length is 1000 characters (standard for contact forms).
