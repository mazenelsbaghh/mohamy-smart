# Feature Specification: Lawyer Detail Profile

**Feature Branch**: `070-lawyer-detail-profile`  
**Created**: 2026-05-02  
**Status**: Draft  
**Input**: User description: "عايز دي تبنلي كل حاجه عن تفاصيل المحامي كلها و ظبط شكلها بنفس هويتنا"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View a Complete Lawyer Profile (Priority: P1)

As an admin, I want the lawyer detail page to show a complete, readable profile for the selected lawyer so I can understand the account, professional identity, subscription, and platform activity without leaving the page.

**Why this priority**: This is the core value of the page. The current screen shows sparse fields and does not give admins enough context to assess a lawyer account.

**Independent Test**: Open an existing lawyer from the admin lawyers list and verify that the detail page shows profile identity, contact information, professional details, account status, subscription summary, and activity counts in one coherent view.

**Acceptance Scenarios**:

1. **Given** an admin opens a lawyer detail page for an existing lawyer, **When** the data loads, **Then** the page displays a complete profile header plus sections for personal data, professional data, account status, subscription status, case/client activity, and usage indicators.
2. **Given** a lawyer has missing optional fields, **When** the profile is displayed, **Then** each missing value is shown as a clear empty state rather than an empty input or broken layout.
3. **Given** a lawyer has no current subscription or no activity, **When** the profile is displayed, **Then** the related card shows a neutral "not available" or "no records yet" state.

---

### User Story 2 - Inspect Operational Signals Quickly (Priority: P2)

As an admin, I want quick cards and compact summaries for the lawyer's operational signals so I can scan account health, workload, and paid status in seconds.

**Why this priority**: Admins need quick decision support before taking actions such as contacting, reviewing, or suspending a lawyer.

**Independent Test**: Open lawyers with different account states and verify that the page visually differentiates active, suspended, verified, unverified, subscribed, expired, and low-activity profiles without relying on dense text alone.

**Acceptance Scenarios**:

1. **Given** a lawyer is active and subscribed, **When** the admin views the page, **Then** the account and subscription cards use positive status labels and show key dates or limits when available.
2. **Given** a lawyer is suspended, unverified, expired, or missing important profile fields, **When** the admin views the page, **Then** the issue is visible in the summary area and does not require scanning the entire page.
3. **Given** the lawyer has related counts, **When** the page renders, **Then** counts for cases, clients, powers of attorney, reviews, and AI usage appear as compact metrics.

---

### User Story 3 - Navigate to Related Admin Workflows (Priority: P3)

As an admin, I want the lawyer detail page to provide obvious next steps and links to related workflows so I can continue investigation or management from the same context.

**Why this priority**: A complete profile is more useful when it helps admins continue to related lists and usage reports.

**Independent Test**: From a lawyer detail page, use available actions to return to the lawyer list, view AI usage details, and identify where subscription or activity information comes from.

**Acceptance Scenarios**:

1. **Given** an admin is viewing a lawyer profile, **When** they choose a related action, **Then** they can navigate back to the lawyer list or toward available related reports without losing the selected profile context.
2. **Given** a related workflow is unavailable for the lawyer, **When** the profile is displayed, **Then** the action is disabled or hidden with no misleading call to action.

### Edge Cases

- Lawyer account exists but has no linked professional profile.
- Lawyer has a professional profile but missing optional professional fields such as law firm, bar number, specialization, or birth date.
- Lawyer has no active subscription, an expired subscription, or multiple historical subscriptions.
- Lawyer has no cases, clients, reviews, powers of attorney, or AI usage records.
- Admin opens an invalid or deleted lawyer ID.
- Data loads slowly or partially fails while the page is visible.
- Long names, emails, firm names, or specialization labels must wrap without breaking the layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The lawyer detail page MUST present a complete profile header with the lawyer name, initials/avatar, account state, primary contact, and professional identity.
- **FR-002**: The page MUST show personal and contact data including full name, phone number, email, account active state, phone verification state when available, and account creation date when available.
- **FR-003**: The page MUST show professional data including law firm, bar number, specialization, experience number, birth date when available, and lawyer profile creation date.
- **FR-004**: The page MUST show subscription data including current plan name, active/expired status, start date, end date, billing cycle or duration when available, AI request limit, and used AI requests when available.
- **FR-005**: The page MUST show activity metrics for cases, clients, powers of attorney, reviews, and AI usage when those data points are available.
- **FR-006**: The page MUST show a short recent-activity area for relevant activity such as recent cases, recent subscriptions, recent reviews, or recent AI usage when available.
- **FR-007**: Missing optional data MUST render as explicit neutral placeholders and MUST NOT render blank input fields.
- **FR-008**: Loading, error, and not-found states MUST match the admin dashboard identity and provide a clear recovery path back to the lawyers list.
- **FR-009**: The page MUST preserve admin-only access expectations and MUST NOT expose lawyer detail data to non-admin users.
- **FR-010**: The visual design MUST use the existing Mohamy Smart admin identity: warm neutral surfaces, amber accent, RTL layout, Tajawal typography, clear cards, and restrained status colors.
- **FR-011**: The layout MUST be responsive across desktop and tablet-sized admin screens without overlapping text or controls.
- **FR-012**: The page MUST keep the current lawyer route behavior so links from the lawyer list continue to open the selected lawyer detail page.

### Key Entities *(include if feature involves data)*

- **Lawyer Profile**: The admin-facing representation of a lawyer, including identity, contact, professional fields, and account state.
- **Lawyer Subscription Summary**: The current and recent subscription information for the lawyer, including plan, status, dates, and usage-related limits.
- **Lawyer Activity Summary**: Aggregated counts and recent records related to the lawyer's cases, clients, powers of attorney, reviews, and AI usage.
- **Admin Detail View State**: The page states an admin can see: loading, loaded, empty optional data, not found, and failed load.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can identify a lawyer's account status, subscription status, and core professional identity within 10 seconds of the page loading.
- **SC-002**: At least 95% of available lawyer profile fields from the selected account are visible on the detail page without requiring navigation to another page.
- **SC-003**: The detail page remains readable without horizontal scrolling on common admin laptop widths of 1280px and above.
- **SC-004**: Missing optional data is clearly labeled in 100% of displayed fields so admins do not confuse missing data with loading or system failure.
- **SC-005**: Admins can return to the lawyers list or move to a related report action in no more than one click from the loaded detail page.

## Assumptions

- The feature targets admin users only.
- The existing admin authentication and authorization model remains in place.
- The page will use existing stored lawyer, subscription, usage, case, client, review, and power of attorney data where available.
- Editing lawyer data is outside the scope of this feature; this request is for a richer read-only detail view.
- The design should align with existing admin dashboard tokens and components rather than introducing a new brand system.
