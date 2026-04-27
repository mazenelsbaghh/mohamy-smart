# Feature Specification: Phase 5 — Admin Dashboard: Full API Integration

**Feature Branch**: `006-admin-api-integration`  
**Created**: 2026-04-04
**Status**: Draft  
**Input**: User description: "Phase 5 — Admin Dashboard: Full API Integration"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-time Dashboard Analytics (Priority: P1)

An administrator logging into the platform lands on the Home Dashboard. Instead of placeholder static numbers, they see live, real-time metrics summarizing the platform's health—such as total active lawyers, current weekly revenue, and pending verification requests. If the network drops, they see an appropriate loading error or cached state.

**Why this priority**: The home dashboard is the visual starting point. Replacing the static metrics with actual system aggregates immediately validates that the API connection and token bindings established in Phase 3 work correctly.

**Independent Test**: Load the `/admin` root. The statistics widgets must reflect the exact count matches of a direct backend database query.

**Acceptance Scenarios**:

1. **Given** the backend has exactly 50 validated lawyers, **When** the admin loads the Home screen, **Then** the "Total Lawyers" widget correctly displays "50".
2. **Given** an invalid network state, **When** the admin loads the Home screen, **Then** the widgets show distinct error skeleton loaders and a toast notification warns about connectivity.

---

### User Story 2 - Lawyer Directory & Auditing (Priority: P2)

Administrators navigate to the "Lawyers" section. They interact with a paginated data table that lists every registered lawyer on the platform. They can drill down into a lawyer's details, review submitted verification documents, and either approve or suspend the lawyer's account.

**Why this priority**: Managing the supply node (Lawyers) is the core operational bottleneck for customer service administrators.

**Independent Test**: Suspend an active lawyer from the table. The row should dynamically reflect the suspended state, and the lawyer's active token on their dashboard should eventually fail.

**Acceptance Scenarios**:

1. **Given** the Lawyers directory view, **When** the administrator clicks "Search" for specific names, **Then** the UI refetches the API and renders only matching individuals.
2. **Given** an unverified lawyer, **When** the administrator clicks "Validate", **Then** the API registers the PUT request and the table row updates dynamically without a full page refresh.

---

### User Story 3 - Financial & Subscriptions Oversight (Priority: P3)

The administrator navigates to the "Subscriptions" or "Reports" tabs. They can view a chronological ledger of all processed transactions, filter by date ranges, and export the financial lists to a standard format (e.g., CSV) for accounting.

**Why this priority**: Financial tracking ensures accountability and correct revenue reporting for the platform.

**Independent Test**: Apply a date-range filter for the last 30 days. The rendered list must exactly match the transactions generated in the database for that period.

**Acceptance Scenarios**:

1. **Given** the Subscriptions ledger, **When** the administrator alters the date picker, **Then** the visual list repopulates instantly based on the chosen window.

---

### User Story 4 - System Plans Governance (Priority: P4)

The administrator enters the "Plans" configuration view. They can inspect the currently active subscription tiers offered to lawyers. They have the capability to adjust the pricing, alter the maximum quota limits per plan, and toggle whether a plan is currently "Active" for new purchases.

**Why this priority**: Offers the back-office flexibility to adjust business models and pricing without requiring a new frontend deployment.

**Independent Test**: Modify the price of a plan from $50 to $60. The change should persist into the database and reflect globally across the platform.

**Acceptance Scenarios**:

1. **Given** the Plans editor, **When** the administrator submits a form updating a plan's features, **Then** the API acknowledges the change and the global state slice refreshes the visual plans grid.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST dispatch data synchronization actions when navigating to route segment roots (e.g., `fetchLawyers()` on `/lawyers`).
- **FR-002**: The application MUST display localized (Arabic) loading indicators across all components while waiting for API resolution.
- **FR-003**: The application MUST gracefully catch any API error (HTTP 4xx or 5xx) and dispatch the error using the global Toast notification system.
- **FR-004**: Data tables MUST support cursor-based or offset-based pagination interacting seamlessly with backend endpoints natively, rather than downloading the entire database to memory.
- **FR-005**: All form modifications (approvals, suspensions, pricing updates) MUST implement optimistic UI updates or immediate data-refresh sequences post-mutation.

### Key Entities 

- **Lawyer Entity**: Contains status (Verified/Pending), balance, subscriptions history, and contact details.
- **Subscription Entity**: Holds payment reference, lawyer ID, expiry date, and plan type.
- **Plan Entity**: Holds tier details, pricing, max clients constraint, and active status boolean.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of hardcoded "mock" data is purged from the Admin Dashboard presentation layout files.
- **SC-002**: High-volume data pages (like the Lawyers index) load the initial dataset inside the UI in under 1 second (via pagination).
- **SC-003**: Administrators can successfully transition a Lawyer's status through the API natively without encountering desync.

## Assumptions

- The backend APIs conform to RESTful standards and already exist identically or closely to the mock configurations.
- The Redux global store slices configured in Phase 3 (`lawyersSlice`, `subscriptionsSlice` etc.) are appropriately configured with `createAsyncThunk` routines pointed at the centralized `api.ts` Axios instance.
- Pagination arguments standardly map to `page` and `limit` on the endpoints.
