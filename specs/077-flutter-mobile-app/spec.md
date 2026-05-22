# Feature Specification: Mohamy Smart Mobile App

**Feature Branch**: `077-flutter-mobile-app`  
**Created**: 2026-05-22  
**Status**: Draft  
**Input**: User description: "Create a complete Arabic RTL Mohamy Smart mobile application under apps. The app must include a production-quality mobile design system, light and dark themes, authentication screens, app shell, home dashboard, cases, case details, clients, agenda, documents, AI workflow hub and runner, subscription and AI points, settings, reusable states, and automated tests. Use existing mobile page architecture as product input and keep implementation inside apps/."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open and Navigate the Mobile App (Priority: P1)

As an Arabic-speaking lawyer, I want to open the mobile app, understand the product, authenticate or continue as an existing user, and navigate between the main mobile sections from a polished RTL shell.

**Why this priority**: The app is unusable without a trusted entry flow, Arabic RTL layout, theme support, and stable navigation.

**Independent Test**: A tester can launch the app, move from splash/onboarding to login, enter demo credentials, reach the home screen, switch themes, and navigate through the bottom navigation without any other story being complete.

**Acceptance Scenarios**:

1. **Given** a first-time user opens the app, **When** onboarding appears, **Then** the user sees Arabic RTL onboarding content and can continue to login or sign-up.
2. **Given** a returning user signs in with accepted demo credentials, **When** authentication succeeds, **Then** the user reaches the home dashboard and sees bottom navigation in Arabic.
3. **Given** the user toggles dark mode from settings, **When** they return to any main section, **Then** the interface uses the dark visual treatment consistently.

---

### User Story 2 - Review Daily Legal Work (Priority: P1)

As a lawyer, I want a mobile home dashboard that summarizes urgent work, AI point balance, today sessions, active cases, and recent AI activity so I can decide what to do next quickly.

**Why this priority**: The home dashboard is the daily command center and the fastest way to prove the app value.

**Independent Test**: A tester can sign in, land on the home dashboard, see next action, sessions, active cases, AI points, and tap cards to open the relevant screens.

**Acceptance Scenarios**:

1. **Given** the lawyer has sessions and active cases, **When** the home screen loads, **Then** the user sees the next action, today sessions, active cases, and recent AI activity.
2. **Given** there are no sessions today, **When** the home screen loads, **Then** the sessions section shows a calm empty state and a useful next action.

---

### User Story 3 - Manage Cases and Case Details (Priority: P1)

As a lawyer, I want to browse, search, add, and inspect cases from my phone, including the case summary, facts, documents, sessions, and AI actions.

**Why this priority**: Cases are the core business object for the legal platform and must be available before supporting modules matter.

**Independent Test**: A tester can open cases, search by case/client, open details, switch detail tabs, and add a case draft with validation feedback.

**Acceptance Scenarios**:

1. **Given** existing case records, **When** the user searches by case number or client name, **Then** matching cases are shown and no-match states are clear.
2. **Given** a user opens a case, **When** the details screen appears, **Then** the user can see summary, facts, documents, sessions, and AI entry points.
3. **Given** a user adds a case with missing required fields, **When** they try to save, **Then** field-level Arabic validation appears and no invalid case is created.

---

### User Story 4 - Manage Clients, Agenda, and Documents (Priority: P2)

As a lawyer, I want to manage clients, upcoming sessions, and documents from mobile screens so that common office operations are available away from the desktop.

**Why this priority**: These modules complete the day-to-day practice loop around cases.

**Independent Test**: A tester can open clients, agenda, and documents from navigation, inspect records, trigger contact actions, view session details, and see upload/processing states.

**Acceptance Scenarios**:

1. **Given** client records exist, **When** the user opens the clients screen, **Then** each client shows contact information, linked case count, and contact actions.
2. **Given** the user opens the agenda, **When** a date is selected, **Then** sessions for that date are grouped and linked to cases.
3. **Given** the user opens documents, **When** document cards render, **Then** each document shows linked case/client, type, date, and readiness status.

---

### User Story 5 - Run AI Legal Workflows and Track Points (Priority: P2)

As a lawyer, I want to choose AI workflows for a case, review required inputs, confirm point usage, monitor progress, and see generated outputs so I can complete legal drafting from mobile.

**Why this priority**: AI workflows are a differentiating product capability and must clearly communicate readiness and point usage.

**Independent Test**: A tester can open AI workflows for a case, see readiness and point cost, run a demo workflow, observe progress/completed states, and open subscription/points when balance is low.

**Acceptance Scenarios**:

1. **Given** a case has enough data and points, **When** the lawyer starts a workflow, **Then** the app shows steps for documents, facts, running, and output.
2. **Given** AI points are insufficient, **When** the lawyer attempts an expensive workflow, **Then** the app prevents execution and offers a path to buy or upgrade.
3. **Given** a workflow completes, **When** the output screen appears, **Then** the lawyer can view the generated legal output and available export actions.

---

### User Story 6 - Configure Account and System States (Priority: P3)

As a lawyer, I want settings, profile, subscription, reusable loading/empty/error/offline states, and stable feedback so the mobile app feels reliable in real use.

**Why this priority**: Settings and system states are essential for polish, resilience, and production readiness after primary workflows are available.

**Independent Test**: A tester can open settings, update preferences, view subscription and usage history, trigger empty/error/offline demos, and confirm every state has a clear next action.

**Acceptance Scenarios**:

1. **Given** the user opens settings, **When** they toggle preferences, **Then** the change is reflected in the app without breaking navigation.
2. **Given** a screen has no data, **When** it renders, **Then** it shows a useful empty state with one clear action.
3. **Given** a recoverable error occurs, **When** the state appears, **Then** the user sees Arabic guidance and a retry or navigation action.

### Edge Cases

- First-time launch with no authenticated session should never show protected content.
- Long Arabic names, mixed Arabic/English case numbers, and Arabic-Indic digits must fit without overlap.
- Empty data sets must display purposeful empty states instead of blank screens.
- Low AI point balance must block point-consuming actions before execution.
- Dark mode must remain readable in every primary screen and system state.
- Offline or failed data loading must provide a recoverable path.
- Bottom navigation must not cover sticky actions or form submit buttons.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST provide Arabic RTL splash, onboarding, login, sign-up, forgot password, and verification screens.
- **FR-002**: Users MUST be able to authenticate with demo credentials and access protected mobile content.
- **FR-003**: The app MUST provide an RTL mobile shell with bottom navigation for home, cases, agenda, assistant, and more.
- **FR-004**: The app MUST provide light and dark visual modes with consistent readable colors across all primary screens.
- **FR-005**: The home dashboard MUST display AI point balance, next action, today sessions, active cases, and recent AI activity.
- **FR-006**: Users MUST be able to browse, search, and open cases.
- **FR-007**: Users MUST be able to add a case draft with required-field validation and Arabic error messages.
- **FR-008**: Case details MUST expose summary, facts, documents, sessions, and AI actions in a mobile-friendly layout.
- **FR-009**: Users MUST be able to browse clients, view client details, and access contact actions.
- **FR-010**: Users MUST be able to view agenda sessions by date and open linked cases.
- **FR-011**: Users MUST be able to browse documents and see upload, processing, ready, empty, and error states.
- **FR-012**: Users MUST be able to select AI workflows for a case and see readiness, point cost, running, failed, paused, and completed states.
- **FR-013**: The app MUST prevent point-consuming AI actions when the available balance is insufficient.
- **FR-014**: Users MUST be able to view subscription plan, AI point balance, and point usage history.
- **FR-015**: Users MUST be able to open settings, view profile data, change theme, and sign out.
- **FR-016**: All major screens MUST provide loading, empty, error, and recoverable interaction states.
- **FR-017**: The app MUST include automated checks that verify the main shell renders, navigation works, case search works, and required form validation appears.
- **FR-018**: The app MUST keep implementation contained under the repository apps area without modifying unrelated existing dashboard behavior.

### Key Entities *(include if feature involves data)*

- **Lawyer Profile**: Represents the signed-in lawyer, display name, license number, firm details, contact details, and preferences.
- **Case**: Represents a legal matter with case number, client, court, type, status, facts, documents, sessions, and AI workflow readiness.
- **Client**: Represents a client with identity, contact details, linked cases, documents, and notes.
- **Agenda Item**: Represents a session, hearing, reminder, or legal task linked to a case.
- **Document**: Represents a legal file with name, type, linked case/client, upload status, extraction status, and AI readiness.
- **AI Workflow**: Represents a legal AI task with name, required inputs, point cost, readiness, status, progress, and generated output.
- **Subscription**: Represents plan details, renewal date, AI point balance, packages, and usage entries.
- **System State**: Represents reusable loading, empty, error, offline, permission, and insufficient-balance states.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A lawyer can launch the app, authenticate, and reach the home dashboard in under 30 seconds during manual testing.
- **SC-002**: A tester can navigate to every MVP screen from the app shell or an obvious in-screen link without dead ends.
- **SC-003**: Case search returns visible matching results or a no-results message within 1 second for the bundled demo data.
- **SC-004**: 100% of required case form fields show Arabic validation feedback when submitted empty.
- **SC-005**: Light and dark modes are available and readable across all primary screens.
- **SC-006**: Automated tests cover app launch, navigation, case search, and case form validation.
- **SC-007**: No primary mobile screen has overlapping text or blocked primary actions at 390x844 screen size.

## Assumptions

- The first mobile implementation uses demo/local data to make all screens testable while leaving a clear boundary for real backend connection later.
- The mobile app targets practicing lawyers first; admin-only platform operations remain outside this mobile MVP.
- AI workflow execution in this implementation demonstrates states and flow using deterministic demo behavior rather than consuming real AI points.
- Payment and export actions may show realistic UI states without completing live payment or file export in the MVP.
- The existing page architecture in `docs/mobile-page-architecture/` is the source for screen scope and copy direction.
