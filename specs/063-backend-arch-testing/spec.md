# Feature Specification: Backend Architecture Improvements & Testing Polish

**Feature Branch**: `063-backend-arch-testing`
**Created**: 2026-04-23
**Status**: Draft
**Input**: User description: "Phase 6: Backend Architecture Improvements (P6) and Phase 7: Testing & Polish (P7) — from PROJECT_REMEDIATION_PLAN.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Service Layer Independence (Priority: P1)

As a system maintainer, I need the backend service layer to be independent of HTTP infrastructure so that services can be reused across different contexts (API controllers, background jobs, scheduled tasks) without coupling to web request details. Currently, services depend on HTTP context to resolve the current user, which prevents reuse outside of web requests and makes testing harder.

**Why this priority**: Architecture improvements have the widest impact — every downstream feature (testing, error handling, performance) depends on clean separation of concerns.

**Independent Test**: Can be verified by invoking any service method from a non-HTTP context (e.g., a background job) and confirming it works correctly without HTTP context.

**Acceptance Scenarios**:

1. **Given** a service method that currently reads the authenticated user from HTTP context, **When** the method is called from a background job or scheduled task, **Then** the method receives the user identifier as an explicit parameter and functions correctly
2. **Given** a repository operation that auto-saves changes, **When** multiple operations are performed in a business transaction, **Then** changes are only committed when the unit of work explicitly saves, ensuring atomicity
3. **Given** a controller action that needs the current user's ID, **When** the request is processed, **Then** the ID is resolved once at the controller level and passed to the service method

---

### User Story 2 - Resilient Error Handling (Priority: P2)

As a user of the application, I need to receive clear, appropriate error responses when something goes wrong, and I need the system to handle errors gracefully without exposing internal details. As an administrator, I need all errors to be properly logged and monitored so issues can be diagnosed and fixed quickly.

**Why this priority**: Error handling directly impacts user trust and system reliability — incorrect status codes or missing error handlers cause confusion for both users and monitoring tools.

**Independent Test**: Can be verified by triggering various error conditions (permission denied, validation failure, server error, rate limit exceeded) and confirming each returns the correct status code and message.

**Acceptance Scenarios**:

1. **Given** a user attempting an action they are not authorized for, **When** the server processes the request, **Then** the response returns a 403 Forbidden status with a user-friendly message
2. **Given** the contact form endpoint receiving too many requests, **When** the rate limit is exceeded, **Then** the request is rejected with an appropriate status and the user is informed to try again later
3. **Given** an asynchronous background task that encounters an error, **When** the error occurs, **Then** the error is logged with full context rather than silently swallowed
4. **Given** an unhandled error in the frontend, **When** the error boundary catches it, **Then** the error details are sent to the error monitoring service for investigation

---

### User Story 3 - Backend Performance Optimization (Priority: P3)

As a user interacting with the system, I need pages and operations to respond quickly without unnecessary delays caused by redundant database queries or missing pagination on large data sets.

**Why this priority**: Performance improvements enhance user experience but are less critical than architectural correctness and error resilience.

**Independent Test**: Can be verified by measuring response times for specific operations (payment history listing, client lookups, case creation) before and after the improvements.

**Acceptance Scenarios**:

1. **Given** a lawyer with hundreds of payment records, **When** they view payment history, **Then** results are paginated and only the requested page is loaded
2. **Given** a client lookup that currently triggers multiple separate queries, **When** the operation executes, **Then** data is retrieved in a single optimized query
3. **Given** a case creation operation involving multiple database writes, **When** the operation completes, **Then** all writes are committed in a single transaction with a single save operation
4. **Given** a long-running database operation, **When** the user cancels the request, **Then** the database operation is cancelled promptly via cancellation tokens

---

### User Story 4 - Comprehensive Test Coverage (Priority: P4)

As a developer, I need automated tests covering the critical backend and frontend flows so that changes can be made with confidence that existing functionality is not broken. This includes authentication flows, CRUD operations for core entities, payment processing, and key frontend interactions.

**Why this priority**: Testing is essential for long-term maintainability but comes after the architecture and error handling improvements that the tests need to validate.

**Independent Test**: Can be verified by running the test suite and confirming coverage thresholds are met for both backend (>50%) and frontend (>30% for critical paths).

**Acceptance Scenarios**:

1. **Given** the backend test suite, **When** tests are executed, **Then** authentication flows (login, register, OTP, password reset) are covered by passing tests
2. **Given** the backend test suite, **When** tests are executed, **Then** CRUD operations and validation for cases, clients, and payments are covered by passing tests
3. **Given** the backend test suite, **When** tests are executed, **Then** exception middleware scenarios (different error types, status codes) are covered by passing tests
4. **Given** the frontend test suite for admin, **When** tests are executed, **Then** auth flows and key data-fetching operations are covered by passing tests
5. **Given** the frontend test suite for lawyer, **When** tests are executed, **Then** auth flows and basic workflow operations are covered by passing tests
6. **Given** the shared packages, **When** tests are executed, **Then** validators, utilities, and type guards are covered by passing tests

---

### User Story 5 - Polish & Accessibility (Priority: P5)

As a user with accessibility needs, I need the application to support screen readers, keyboard navigation, and proper RTL layout so I can use the system effectively. As any user, I need the visual theme to be consistent across all pages.

**Why this priority**: Polish and accessibility are important for inclusivity and professionalism but are refinement layers built on top of the core improvements.

**Independent Test**: Can be verified by running accessibility audits and manually testing keyboard navigation, screen reader output, and theme consistency across pages.

**Acceptance Scenarios**:

1. **Given** a user navigating via keyboard only, **When** they tab through interactive elements, **Then** all controls are reachable and operable without a mouse
2. **Given** a screen reader user, **When** they interact with forms and navigation, **Then** all interactive elements have appropriate labels and roles
3. **Given** the application rendered in Arabic (RTL), **When** any page is displayed, **Then** layout, text alignment, and component direction are consistently right-to-left
4. **Given** the error monitoring integration, **When** a frontend error occurs, **Then** error details are captured and sent to the monitoring service

---

### Edge Cases

- What happens when a service method is called from a background job that has no HTTP context?
- How does the system handle concurrent requests to the contact form endpoint at the rate limit boundary?
- What happens when a cancellation token is triggered midway through a multi-step case creation?
- What happens when a payment history endpoint receives a page number beyond available data?
- How does the error boundary handle errors during error reporting itself?
- What happens when tests run against an empty database with no seeded data?
- How does the system handle a user switching between themes while a long-running operation is in progress?

## Requirements *(mandatory)*

### Functional Requirements

#### Architecture (Phase 6A)

- **FR-001**: Service layer methods MUST receive user identity as an explicit parameter rather than reading from HTTP context
- **FR-002**: The repository layer MUST NOT independently persist changes; only the unit of work MAY commit transactions
- **FR-003**: The generic repository MUST support entity identification by both integer and GUID key types
- **FR-004**: Controller actions MUST resolve the authenticated user's identity once per request and pass it to service methods
- **FR-005**: Error response generation MUST be a reusable utility, not requiring dependency injection per use

#### Performance (Phase 6B)

- **FR-006**: Payment history listing MUST support pagination so large result sets are returned in manageable pages
- **FR-007**: Client lookup operations MUST minimize database round-trips by consolidating related queries
- **FR-008**: Case creation MUST execute all database operations within a single transactional save
- **FR-009**: All database save operations MUST accept and propagate cancellation tokens

#### Error Handling (Phase 6C)

- **FR-010**: The system MUST return a 403 Forbidden response with a clear message when a user attempts an unauthorized action
- **FR-011**: HTTP response status codes MUST accurately reflect the nature of the error (validation, authorization, server error)
- **FR-012**: The contact form endpoint MUST enforce rate limiting to prevent abuse
- **FR-013**: Asynchronous background tasks MUST log errors with context rather than silently swallowing exceptions

#### Testing (Phase 7A, 7B)

- **FR-014**: Backend tests MUST cover authentication flows: login, registration, OTP verification, and password reset
- **FR-015**: Backend tests MUST cover full CRUD lifecycle and validation for cases, clients, and payments
- **FR-016**: Backend tests MUST cover exception middleware behavior across different error scenarios
- **FR-017**: Frontend admin tests MUST cover authentication flows and key data-fetching operations
- **FR-018**: Frontend lawyer tests MUST cover authentication flows and basic workflow operations
- **FR-019**: Shared packages MUST have unit tests covering validators, utility functions, and type guards

#### Polish (Phase 7C)

- **FR-020**: Frontend error boundaries MUST report errors to the centralized error monitoring service
- **FR-021**: The application theme MUST be applied consistently to the root document element
- **FR-022**: All interactive elements MUST have appropriate accessibility attributes (labels, roles, keyboard support)
- **FR-023**: All layouts MUST render consistently in right-to-left (RTL) direction for Arabic language support

### Key Entities

- **Service Method**: Represents a business operation that receives explicit parameters (including user identity) and returns results without depending on HTTP infrastructure
- **Repository**: Data access abstraction that supports querying by different key types but delegates persistence control to the unit of work
- **Unit of Work**: The sole authority for committing changes, ensuring transactional consistency across multiple repository operations
- **Test Suite**: Automated verification covering backend services, middleware, frontend flows, and shared package utilities

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All service layer methods can be invoked from non-HTTP contexts (background jobs, scheduled tasks) without errors
- **SC-002**: Users receive correct HTTP status codes for every error scenario (400, 403, 404, 429, 500)
- **SC-003**: Backend test coverage exceeds 50% for service and middleware code
- **SC-004**: Frontend test coverage exceeds 30% for critical user paths (authentication, data operations)
- **SC-005**: Case creation completes in a single database round-trip for the commit operation
- **SC-006**: Payment history loads only one page of results at a time, regardless of total record count
- **SC-007**: Frontend errors are captured by the error monitoring service within 5 seconds of occurrence
- **SC-008**: All pages pass basic accessibility checks (keyboard navigation, ARIA labels, proper heading hierarchy)
- **SC-009**: RTL layout renders correctly across 100% of application pages without visual misalignment

## Assumptions

- All previous phases (P0-P5) have been completed before this work begins, as the dependency graph requires it
- The existing unit of work pattern and repository interfaces can be extended without breaking changes
- Error monitoring service (e.g., Sentry) account and configuration are already provisioned
- Test infrastructure (test frameworks, mock libraries) is already available in the project from prior phases
- The contact form rate limiting strategy will use server-side enforcement; CAPTCHA integration is a future enhancement
- Shared packages (validators, utilities) are already structured to accept unit tests
- RTL support is primarily for Arabic; other RTL languages are not explicitly tested but should benefit
- Background job infrastructure (e.g., Hangfire) already exists and can invoke services outside HTTP context
