# Feature Specification: Phase A Remaining Code Fixes

**Feature Branch**: `010-remaining-code-fixes`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "phase-a--remaining-code-fixes from /Users/mazenelsbagh/mazen mac/apps/mohamy smart/plan v2.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Safe Local Workspace Setup (Priority: P1)

As a product team member running the system locally, I need every dashboard and service to default to local development targets so I can test changes without unintentionally using production data or unreachable services.

**Why this priority**: Safe local execution is a prerequisite for every other fix in this phase and directly reduces the risk of accidental production use during development and QA.

**Independent Test**: Can be fully tested by starting each dashboard and backend in a local environment and confirming they connect to local service endpoints and remain reachable from the intended local runtime environment.

**Acceptance Scenarios**:

1. **Given** a team member starts the lawyer dashboard locally, **When** the dashboard initializes its API connection, **Then** it uses the local backend target instead of a production target.
2. **Given** a team member starts the admin dashboard locally, **When** the dashboard initializes its API connection, **Then** it uses the local backend target instead of a production target.
3. **Given** a team member runs the dashboards inside the planned local runtime environment, **When** the runtime attempts to reach the dashboard dev servers, **Then** the dashboards are reachable without additional manual configuration.

---

### User Story 2 - Admin Account Settings Management (Priority: P1)

As an authenticated administrator, I need the settings page to show my real account information and let me update my profile and password so I can maintain correct account data without relying on placeholder values.

**Why this priority**: The current settings experience is functionally incomplete and undermines trust because it shows hardcoded information instead of real account data.

**Independent Test**: Can be fully tested by signing in as an administrator, opening settings, verifying the displayed profile data, updating editable profile fields, and changing the password successfully.

**Acceptance Scenarios**:

1. **Given** an authenticated administrator opens the settings page, **When** the page loads, **Then** the administrator sees their current saved profile information rather than placeholder data.
2. **Given** an authenticated administrator edits supported profile fields, **When** they save the form, **Then** the updated information is persisted and shown on the next page load.
3. **Given** an authenticated administrator enters a valid current password and a valid replacement password, **When** they submit the change password form, **Then** the password is updated and the administrator receives a clear success confirmation.
4. **Given** an authenticated administrator submits invalid or incomplete profile or password data, **When** the request is rejected, **Then** the page shows an actionable error state without losing the entered form context unnecessarily.

---

### User Story 3 - Operational Inbox for Users (Priority: P2)

As an authenticated user, I need to view, manage, and clear my notifications so I can keep track of relevant activity and reduce clutter once I have acted on it.

**Why this priority**: Notifications are a core part of day-to-day product awareness, but they only provide value if users can retrieve and manage them reliably.

**Independent Test**: Can be fully tested by signing in as a user with existing notifications, reviewing the list, marking individual items as read, marking all items as read, and deleting a notification.

**Acceptance Scenarios**:

1. **Given** an authenticated user has notifications, **When** they request their notification list, **Then** they receive only notifications relevant to their own account.
2. **Given** an authenticated user views an unread notification, **When** they mark it as read, **Then** the notification state changes to read and remains read on refresh.
3. **Given** an authenticated user has multiple unread notifications, **When** they mark all as read, **Then** every notification in their list is updated accordingly.
4. **Given** an authenticated user deletes a notification, **When** the deletion completes, **Then** that notification no longer appears in their list.

---

### User Story 4 - Contact Requests Reach the Business (Priority: P2)

As a prospective customer using the landing page, I need the contact form to accept and submit my details so the business can receive and review my inquiry instead of leaving the form inactive.

**Why this priority**: An inactive contact form blocks lead capture and prevents the business from turning visitor interest into follow-up conversations.

**Independent Test**: Can be fully tested by submitting a valid contact request from the landing page and verifying that the request is stored for later review by the business team.

**Acceptance Scenarios**:

1. **Given** a visitor enters a valid name, phone number, and message, **When** they submit the contact form, **Then** the request is accepted and a clear submission confirmation is shown.
2. **Given** a visitor omits required information or provides invalid input, **When** they attempt to submit the form, **Then** the form explains what must be corrected before submission can proceed.
3. **Given** a contact request is submitted successfully, **When** business staff review incoming contact requests, **Then** the new request is available for follow-up.

---

### User Story 5 - Resilient Dashboard Navigation (Priority: P3)

As a dashboard user, I need unexpected failures and invalid routes to resolve into clear recovery screens so I am not left with a blank page or a broken session.

**Why this priority**: This work improves reliability and recovery, but it is less business-critical than enabling correct data flows and contact capture.

**Independent Test**: Can be fully tested by forcing a render failure inside a dashboard route and by navigating to a missing admin route, then verifying the user sees clear recovery options.

**Acceptance Scenarios**:

1. **Given** an unexpected rendering failure occurs inside a dashboard screen, **When** the failure is encountered, **Then** the user sees a fallback error view with a clear recovery action.
2. **Given** an admin user navigates to an unknown route, **When** the route is resolved, **Then** the user sees a 404 page with a path back to the main experience.
3. **Given** unused sample endpoints are still present in the backend, **When** the phase is completed, **Then** those sample artifacts no longer appear in the delivered application surface.

### Edge Cases

- What happens when a locally started dashboard is missing its local environment configuration? The system should fail in an obvious, recoverable way and must not silently fall back to production-facing behavior.
- How does the system handle an administrator opening settings when profile data cannot be retrieved? The user should see a clear loading failure state and retain the ability to retry.
- What happens when a user tries to modify a notification that no longer exists? The system should return a not-found outcome and keep the rest of the notification list usable.
- How does the system handle duplicate or repeated contact form submissions from the same visitor? Each submission should receive a clear result and the user should not be left uncertain whether the request was accepted.
- What happens when an unexpected dashboard error occurs repeatedly after reload? The fallback view should remain accessible so the user is not trapped in a broken blank state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST ensure locally run dashboard environments default to non-production service targets for routine development and testing use.
- **FR-002**: The system MUST allow locally run dashboards to be reached from the approved local runtime environment without requiring ad hoc host reconfiguration.
- **FR-003**: The system MUST remove backend sample artifacts that are not part of the product’s supported feature set.
- **FR-004**: The system MUST display the authenticated administrator’s current account profile data on the settings page.
- **FR-005**: The system MUST allow an authenticated administrator to update supported profile details from the settings page.
- **FR-006**: The system MUST allow an authenticated administrator to change their password from the settings page.
- **FR-007**: The system MUST provide clear validation and error feedback when administrator profile or password updates cannot be completed.
- **FR-008**: The system MUST allow an authenticated user to retrieve their own notifications.
- **FR-009**: The system MUST allow an authenticated user to mark a single notification as read.
- **FR-010**: The system MUST allow an authenticated user to mark all of their notifications as read in one action.
- **FR-011**: The system MUST allow an authenticated user to delete an individual notification.
- **FR-012**: The system MUST prevent a user from reading or modifying notifications that do not belong to their account.
- **FR-013**: The system MUST allow landing-page visitors to submit a contact request containing their name, phone number, and message.
- **FR-014**: The system MUST validate required contact request fields before accepting a submission.
- **FR-015**: The system MUST persist accepted contact requests so business staff can review them later.
- **FR-016**: The system MUST provide a visible submission result to visitors after a contact request is sent or rejected.
- **FR-017**: The system MUST show a fallback recovery screen when an unexpected dashboard rendering failure occurs.
- **FR-018**: The admin dashboard MUST show a not-found page when a user navigates to an unsupported route.

### Key Entities *(include if feature involves data)*

- **Admin Profile**: The authenticated administrator’s account record as exposed in settings, including display identity and editable profile details.
- **Password Change Request**: A secure request made by an authenticated administrator to replace the current account password.
- **Notification Item**: A user-specific alert containing a read state and enough contextual information for the user to understand and manage it.
- **Contact Request**: A visitor-submitted inquiry containing the sender’s name, phone number, message, submission status, and review availability for business staff.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In local QA runs, 100% of tested dashboard startups connect to approved local service targets instead of production-facing targets.
- **SC-002**: 95% of administrators in acceptance testing can view and update their profile information, including password changes, on the first attempt without developer assistance.
- **SC-003**: 95% of authenticated users in acceptance testing can complete notification retrieval, single-item read updates, mark-all-read, and delete actions without encountering ownership or state errors.
- **SC-004**: 95% of valid landing-page contact submissions are available for business review within 1 minute of user submission.
- **SC-005**: 100% of tested unexpected dashboard failures and invalid admin routes show a visible recovery or not-found screen instead of a blank or broken page.

## Assumptions

- Existing authentication and authorization rules remain the source of truth for determining the current administrator or end user.
- Contact requests are intended for internal business follow-up and do not require visitor self-service tracking in this phase.
- Notification content already exists or will be created by other workflows; this phase only enables retrieval and user management of notification records.
- The business accepts local-development safeguards and removal of backend sample artifacts as part of this feature’s scope because they directly support safe testing and delivery readiness.
