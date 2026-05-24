# Feature Specification: Paid Subscription Management

**Feature Branch**: `080-paid-subscription-management`  
**Created**: 2026-05-24  
**Status**: Draft  
**Input**: User description: "عايز ف ادراه الشتراكات تكون مظبوطه و تكون كل حاجه فيها صح و عايز يقولي مين مشترك الاشتراك اللي بفلو مش التجربيه"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See Paid Subscribers Clearly (Priority: P1)

As an admin, I want the subscription management page to show which lawyers are on paid subscriptions, not free trial subscriptions, so I can identify real paying customers without manual plan-name checks.

**Why this priority**: This is the core business need. Paid subscriber visibility affects revenue operations and support decisions.

**Independent Test**: Can be fully tested by opening the admin subscription management page with mixed paid and trial subscriptions and verifying the primary subscriber list and counts identify paid subscribers separately from trials.

**Acceptance Scenarios**:

1. **Given** the system has active paid subscriptions and active trial subscriptions, **When** the admin opens subscription management, **Then** the primary "latest subscriptions" view shows paid subscribers only by default.
2. **Given** a lawyer has a free trial subscription, **When** the admin reviews paid subscriber counts, **Then** that lawyer is not counted as a paid subscriber.
3. **Given** a paid subscription has expired or was deactivated, **When** the admin filters by active paid subscribers, **Then** that subscription is excluded from active paid subscriber counts.

---

### User Story 2 - Separate Paid, Trial, and Total Metrics (Priority: P2)

As an admin, I want subscription metrics to separate paid, trial, active, inactive, and revenue-relevant values so dashboard cards do not mix free trial records with paid business performance.

**Why this priority**: Accurate operational metrics prevent incorrect revenue interpretation and reduce support ambiguity.

**Independent Test**: Can be tested by comparing dashboard cards against known records containing paid, trial, active, and inactive subscriptions.

**Acceptance Scenarios**:

1. **Given** there are paid and trial subscriptions, **When** the admin views subscription cards, **Then** the UI presents paid subscribers, active paid subscribers, trial subscribers, and inactive subscriptions without conflating them.
2. **Given** a trial plan has a zero price, **When** revenue-related metrics are calculated, **Then** the trial contributes zero paid revenue and is visibly marked as trial only.

---

### User Story 3 - Filter Detailed Reports by Subscription Type (Priority: P3)

As an admin, I want detailed subscription reports to filter between paid, trial, and all subscriptions so I can audit either business customers or onboarding trial usage.

**Why this priority**: The detailed report is a secondary workflow after the main paid subscriber view is correct.

**Independent Test**: Can be tested by using the report filters and verifying the table updates to paid-only, trial-only, and all records with no stale rows.

**Acceptance Scenarios**:

1. **Given** the detailed report contains mixed subscription types, **When** the admin selects "مدفوعة فقط", **Then** only paid subscriptions remain in the table.
2. **Given** the admin selects "تجريبية فقط", **When** the report reloads or filters locally, **Then** only trial subscriptions remain and each row is labeled as trial.
3. **Given** no subscriptions match the current filters, **When** the table is rendered, **Then** the page shows a clear Arabic empty state instead of a blank table.

### Edge Cases

- Plans may be named differently in Arabic or English; paid/trial classification must not rely only on display name.
- Historical subscriptions can be inactive; "paid" and "active" must be independent concepts.
- Trial plans should be identified by zero price or legacy trial names when historical data lacks stronger flags.
- Admin APIs may return an empty list; the UI must render a stable empty state.
- Existing admin authorization must remain unchanged; only admins can access subscription reports.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST classify each lawyer subscription as paid or trial in the subscription response.
- **FR-002**: System MUST expose enough subscription data for the admin UI to distinguish paid subscriptions from free trial subscriptions without relying only on plan text.
- **FR-003**: System MUST allow the admin subscription list endpoint to filter by paid status while preserving the existing active-status filter.
- **FR-004**: System MUST show paid subscribers by default in the main admin subscription management list.
- **FR-005**: System MUST display trial subscriptions with a clear Arabic label when trials are included in a view.
- **FR-006**: System MUST provide separate counts for total subscriptions, paid subscriptions, active paid subscriptions, trial subscriptions, and inactive subscriptions in admin subscription reporting.
- **FR-007**: System MUST not count free trial subscriptions as paid subscribers or paid revenue contributors.
- **FR-008**: System MUST provide detailed report filters for active status and subscription type: all, paid only, trial only.
- **FR-009**: System MUST show a clear Arabic empty state when subscription filters return no rows.
- **FR-010**: System MUST preserve existing admin-only authorization for subscription management endpoints.

### Key Entities *(include if feature involves data)*

- **Lawyer Subscription**: A lawyer's subscription record, including lawyer, plan, start/end dates, active state, usage, and derived paid/trial classification.
- **Subscription Plan**: A plan definition with name, price, AI request limit, duration, and display flags. Price determines paid status, with legacy trial-name fallback.
- **Subscription Report**: Admin-facing aggregate metrics and optional ledger data used to summarize subscription health and revenue context.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can identify active paid subscribers from the main subscription page without reading or excluding trial plan names manually.
- **SC-002**: Mixed test data containing paid and trial records produces correct paid-only and trial-only report rows in one filter action.
- **SC-003**: Dashboard subscription counts match the known record set for total, paid, active paid, trial, and inactive categories.
- **SC-004**: Empty report states are visible and written in Arabic when filters match zero subscriptions.
- **SC-005**: Existing admin authorization and existing active/inactive filtering behavior continue to work.

## Assumptions

- A paid subscription is any subscription whose plan price is greater than zero.
- A trial subscription is any subscription whose plan price is zero, with `"الباقة التجريبية"` and `"Free Trial"` treated as legacy trial names.
- No database schema change is required because plan price already exists.
- The feature targets the admin dashboard only; lawyer dashboard subscription purchase flows are out of scope.
