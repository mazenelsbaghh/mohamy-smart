# Feature Specification: Phase 6 — Backend: Missing Endpoints & Fixes

**Feature Branch**: `007-backend-endpoints-fixes`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Phase 6 — Backend: Missing Endpoints & Fixes"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lawyers & Subscriptions Analytical Reports (Priority: P1)

An administrator loads the Admin Dashboard home screen and checks the transaction ledger and lawyer aggregates. The backend API accurately returns the required metrics (e.g., lists of lawyers, total platform revenue, active subscriptions counts) without crashing or throwing internal 500 errors.

**Why this priority**: Without operational reports, the Home (`AnalyticsDashboard`/`Home`) and Reports (`SubscriptionReports`) pages built in Phase 5 cannot render data, rendering the dashboard essentially useless.

**Independent Test**: Perform a `GET /api/reports/lawyers` or equivalent using Postman. The JSON response must return well-formatted analytical data rather than a 404 or 500 error.

**Acceptance Scenarios**:

1. **Given** an authenticated admin token, **When** they request lawyer statistics via the backend API, **Then** the API returns a structured JSON payload detailing total and active lawyers.
2. **Given** an authenticated admin token, **When** they request subscription reports, **Then** the API returns paginated and accurately calculated ledger events.

---

### User Story 2 - Lawyer Active Status Management (Priority: P2)

An admin views the Lawyers directory and decides to suspend a misbehaving lawyer. When they click "Suspend", the API receives the toggle state (`isActive: false`), executes the database mutation correctly, and returns a 200 OK. Subsequent fetches reflect that the lawyer is no longer active.

**Why this priority**: Crucial for regulatory control on the platform. The Admin frontend was tied to dispatching `updateLawyerStatus` in Phase 5, but the backend handling must correctly interpret this request without blowing away other user fields.

**Independent Test**: Execute a `PUT /api/lawyers/{id}/status` with `{"isActive": false}`. A follow-up `GET` on that lawyer should show `isActive` as `false`.

**Acceptance Scenarios**:

1. **Given** a valid lawyer ID, **When** the admin submits a PUT request to change the status, **Then** the backend database securely updates the entity and prevents the target lawyer from accessing standard platform privileges.

---

### User Story 3 - Subscription Plans Mutable Endpoints (Priority: P3)

The administrator navigates to the Plans Manager UI to alter the monthly fee of the Premium tier. The backend correctly exposes a PUT endpoint that persists the altered configuration variables into the primary SQL storage without violating foreign keys of current subscribers.

**Why this priority**: Required to support Phase 5's dynamic Plan Editor.

**Independent Test**: Use Postman to `PUT /api/plans/{id}` with an altered price. Then, `GET /api/plans` to verify the modified price reflects globally.

**Acceptance Scenarios**:

1. **Given** a plan ID, **When** an authorized admin issues an update command with a new price, **Then** the system commits the change for *future* subscriptions while leaving existing active subscriptions untouched.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose an endpoint to retrieve paginated/aggregated lawyer statistical data (Lawyers Report).
- **FR-002**: The system MUST expose an endpoint to retrieve aggregated financial and active subscription data (Subscriptions Report).
- **FR-003**: The system MUST enforce strictly that `Admin` role JWT tokens are required to access any of the aforementioned read/write action endpoints.
- **FR-004**: The system MUST expose a targeted PATCH/PUT endpoint for updating specific fields on a Lawyer (namely, `isActive` Boolean flag) without requiring a full structural replacement of the entity.
- **FR-005**: The system MUST provide an endpoint to update existing Plan configurations (price, limits) while maintaining backwards compatibility for existing transactions mapping to the old configurations.

### Key Entities 

- **Lawyer Entity**: Extending to ensure the validation logic correctly respects `isActive` constraints.
- **Plan Entity**: Requires dynamic mutability via Admin inputs rather than relying on hardcoded static seeds in `.NET`.
- **Report DTOs**: Custom Data Transfer Objects designated for serving the analytic aggregates cleanly down to the Vite frontend.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: E2E (End-to-End) completion mapping: every frontend `createAsyncThunk` created in previous phases identically matches a valid URL on the `.NET` web server rendering 200 OK.
- **SC-002**: Missing endpoints respond in under 300ms latency, proving optimal querying patterns over the SQL database.
- **SC-003**: Unauthorized invocations (without Admin JWTs) to the new mutations explicitly receive 403 Forbidden.

## Assumptions

- The backend architecture utilizes ASP.NET Core (`dotnet`) with Entity Framework Core mapping to a SQL provider.
- Admin token middleware authorization (`[Authorize(Roles = "Admin")]`) is already established globally; it merely needs to be applied to the newly created REST controllers.
