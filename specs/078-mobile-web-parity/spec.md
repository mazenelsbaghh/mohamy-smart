# Feature Specification: Mobile Web Parity

**Feature Branch**: `078-mobile-web-parity`  
**Created**: 2026-05-22  
**Status**: Draft  
**Input**: User description: "Update the Mohamy Smart mobile app so it matches the lawyer web dashboard flow across screens and core journeys, with a modern Arabic mobile experience covering authentication, cases, clients, agenda, documents and OCR, AI workflows, legal contracts, process server papers, subscription and AI points, notifications, settings, and loading/error states."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Mobile Practice Workspace (Priority: P1)

As a lawyer, I want to sign in and manage my daily legal work from the mobile app with the same core flow I use on the web dashboard, so I can handle urgent work without returning to desktop.

**Why this priority**: This is the minimum useful mobile product. Without reliable authentication, case, client, agenda, and document flows, the app cannot replace the web dashboard for daily practice.

**Independent Test**: A lawyer can open the app, authenticate, review the home dashboard, create or open a case, add or inspect a client, view agenda items, and reach related documents without needing desktop.

**Acceptance Scenarios**:

1. **Given** a returning lawyer with valid credentials, **When** they open the app and sign in, **Then** they reach a mobile home dashboard with current cases, sessions, AI points, and recent activity.
2. **Given** a lawyer is reviewing cases, **When** they create a new case or open an existing case, **Then** they can see and manage the case's key details, client, facts, documents, sessions, and available actions.
3. **Given** a lawyer is reviewing a client, **When** they open the client profile, **Then** they can see contact details, related cases, related documents, and quick actions.
4. **Given** the lawyer has no data in a section, **When** they open that section, **Then** the app shows a useful empty state with a clear next action instead of a blank screen.

---

### User Story 2 - Document Capture and OCR to Case (Priority: P1)

As a lawyer, I want to upload or scan legal documents from my phone, review extracted information, and attach them to a case or create a case from them, so mobile document intake is as useful as the web flow.

**Why this priority**: Documents and OCR feed case creation and AI workflows. Without this, the mobile app cannot support core legal drafting from the field.

**Independent Test**: A lawyer can add a document, see processing status, review extracted case data, correct it, and attach it to an existing or new case.

**Acceptance Scenarios**:

1. **Given** a lawyer has a legal file on the phone, **When** they upload it, **Then** the app shows upload progress, processing status, and a final ready or failed state.
2. **Given** OCR has extracted case information, **When** the lawyer reviews the extraction, **Then** they can correct fields before creating or updating a case.
3. **Given** a document is tied to a case, **When** the lawyer opens the case details, **Then** the document is visible and available for AI readiness.

---

### User Story 3 - Mobile AI Workflow Parity (Priority: P1)

As a lawyer, I want to run, pause, resume, review, and export legal AI workflows from mobile with clear step-by-step guidance, so I can produce the same legal outputs I produce on the web dashboard.

**Why this priority**: AI drafting is a major product value. The mobile app must not only list workflows; it must support the web flow's readiness checks, point usage clarity, step progress, and output review.

**Independent Test**: A lawyer can choose a case, select documents and facts, start a defense memo or statement of claims workflow, confirm point usage, complete all required steps, save progress, resume later, and export or share the final output.

**Acceptance Scenarios**:

1. **Given** a case has enough facts, documents, and AI points, **When** the lawyer starts a workflow, **Then** the app shows readiness, point cost, selected facts/documents, and one clear primary action per step.
2. **Given** an AI step is running, **When** status changes, **Then** the app updates progress and preserves output without requiring a refresh.
3. **Given** the lawyer leaves a workflow mid-run, **When** they return later, **Then** they can resume the same workflow or restore a saved version.
4. **Given** a workflow is complete, **When** the lawyer opens the final result, **Then** they can review, copy, share, or export the output.

---

### User Story 4 - Legal Tools and Operational Pages (Priority: P2)

As a lawyer, I want mobile access to legal contracts, process server papers, legal library tools, subscriptions, AI points, settings, and notifications, so the app covers the same operational surface as the web dashboard.

**Why this priority**: These sections complete parity, but they can follow the primary daily workspace and AI flows.

**Independent Test**: A lawyer can navigate from the mobile shell to each secondary section, perform the primary action for that section, and return to the relevant case or home context.

**Acceptance Scenarios**:

1. **Given** a lawyer opens legal contracts, **When** they create or open a contract, **Then** they can review details, update required information, and access the generated result.
2. **Given** a lawyer opens process server papers, **When** they create or review a paper, **Then** the status and next action are clear.
3. **Given** a lawyer opens subscription and points, **When** they inspect usage, **Then** they can understand current balance, deductions, and required top-up actions.
4. **Given** the app has new activity, **When** the lawyer opens notifications, **Then** they can distinguish unread from read items and navigate to the relevant destination.

---

### User Story 5 - Modern Arabic Mobile Experience (Priority: P2)

As a lawyer, I want the app to feel modern, premium, fast, and native to Arabic mobile use, so complex legal work feels controlled rather than cramped.

**Why this priority**: Visual and interaction quality determines whether a mobile parity effort feels trustworthy. The app must be more than a compressed copy of the web dashboard.

**Independent Test**: Across key screens, a reviewer can verify RTL layout, light and dark parity, consistent typography, clear hierarchy, touch-friendly controls, loading states, error states, and no overlapping content.

**Acceptance Scenarios**:

1. **Given** the lawyer uses a small phone, **When** they navigate core screens, **Then** text, buttons, cards, and bottom actions remain readable and reachable.
2. **Given** the lawyer switches theme, **When** they revisit key flows, **Then** light and dark modes preserve contrast, hierarchy, and brand quality.
3. **Given** data is loading or partially unavailable, **When** a screen opens, **Then** the app shows polished skeleton, retry, offline, or partial-data states.

### Edge Cases

- Network is unavailable during sign-in, upload, AI job execution, or agenda refresh.
- A session expires while the lawyer is editing a case, OCR review, or workflow output.
- A case has no facts, no documents, no client, or insufficient AI points.
- An uploaded document fails OCR, is unsupported, too large, or loses connectivity mid-upload.
- A workflow job finishes while the app is backgrounded.
- A saved workflow version is renamed, deleted, or restored after newer work exists.
- Arabic text is unusually long, contains numbers, or mixes Arabic and English legal references.
- The lawyer has a very large number of cases, clients, documents, notifications, or point history entries.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST provide complete account entry flows for sign in, sign up, phone verification, password recovery, session restoration, and sign out.
- **FR-002**: The app MUST show a home dashboard that summarizes urgent legal work, today's agenda, active cases, recent documents, running AI work, and AI point balance.
- **FR-003**: Users MUST be able to browse, search, filter, create, open, and update cases using the same essential business fields available in the lawyer web workflow.
- **FR-004**: Users MUST be able to manage case details including client, facts, documents, agenda items, workflow outputs, and next actions from one mobile workspace.
- **FR-005**: Users MUST be able to browse, search, create, open, and update client profiles with related cases, contact details, documents, and legal relationships.
- **FR-006**: Users MUST be able to browse agenda items, inspect details, create or update sessions/tasks, and navigate from agenda items to related cases.
- **FR-007**: Users MUST be able to upload or scan documents, view processing state, retry failed actions, review OCR output, and attach documents to cases.
- **FR-008**: Users MUST be able to create a case from reviewed OCR output without losing the original document relationship.
- **FR-009**: The app MUST provide a case-level AI workflow hub showing available workflows, readiness, current progress, prior versions, and point cost.
- **FR-010**: The app MUST support mobile execution for defense memo, statement of claims, appeal brief, administrative complaint, ruling analysis, legal warning, and execution request workflows.
- **FR-011**: The app MUST let users select and review facts and documents before starting an AI workflow.
- **FR-012**: The app MUST clearly confirm AI point cost before a chargeable workflow step starts and block or redirect users when points are insufficient.
- **FR-013**: The app MUST preserve workflow progress and support pause, resume, rename, restore, and delete saved workflow versions.
- **FR-014**: Users MUST be able to review, copy, share, and export completed AI outputs.
- **FR-015**: Users MUST be able to access legal library tools including inheritance, court fees, official powers of attorney, and internal regulations.
- **FR-016**: Users MUST be able to browse, create, open, update, and export legal contracts where the web dashboard supports those actions.
- **FR-017**: Users MUST be able to browse, create, open, update, and export process server papers where the web dashboard supports those actions.
- **FR-018**: Users MUST be able to inspect subscription status, AI point balance, point history, deductions, and top-up or renewal guidance.
- **FR-019**: The app MUST provide notifications for AI job changes, agenda reminders, document processing changes, and subscription or point issues.
- **FR-020**: The app MUST provide settings for profile, password/security actions, appearance preferences, and account exit.
- **FR-021**: Every primary section MUST include loading, empty, error, retry, partial-data, and offline states that explain what happened and what action is available.
- **FR-022**: The mobile navigation MUST expose the same major user destinations as the web dashboard while prioritizing the highest-frequency mobile actions.
- **FR-023**: The app MUST be Arabic RTL first, with readable mixed Arabic/English content and no incoherent text or control overlap on common phone sizes.
- **FR-024**: The app MUST provide light and dark mode parity across all new and updated screens.
- **FR-025**: The app MUST protect unsaved user input during navigation interruptions, session expiry, backgrounding, and recoverable network failures.

### Key Entities *(include if feature involves data)*

- **Lawyer Account**: The authenticated lawyer using the app; includes identity, profile, contact, security, preferences, and subscription visibility.
- **Mobile Session**: The active authenticated app state; includes verification, restoration, expiry, and sign-out behavior.
- **Case**: A legal matter with number, title, type, court, parties, client, facts, documents, agenda, and AI workflow context.
- **Client**: A person or organization represented by the lawyer; linked to cases, contact details, documents, and official powers.
- **Agenda Item**: A session, task, reminder, or legal date linked to a lawyer and optionally to a case.
- **Document**: A legal file uploaded, scanned, processed, attached to a case, and optionally used for OCR or AI workflows.
- **OCR Review**: A user-confirmed extraction of legal document data before it creates or updates case information.
- **AI Workflow**: A case-bound legal drafting or analysis journey with readiness, steps, costs, jobs, progress, versions, and final output.
- **Workflow Version**: A saved or restored state of a workflow for review, continuation, or comparison.
- **AI Point Ledger Entry**: A visible record of point balance changes, deductions, top-ups, and workflow charges.
- **Legal Contract**: A legal document workflow with details, generated output, and export/share actions.
- **Process Server Paper**: A procedural paper with status, data fields, generated output, and export/share actions.
- **Notification**: A time-sensitive item with read state, category, message, and destination.
- **User Preference**: Appearance, language/display behavior, and local dismissal preferences.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A returning lawyer can sign in and reach the home dashboard in under 30 seconds on a typical mobile connection.
- **SC-002**: A lawyer can create a minimum viable case with client, court, type, and facts in under 3 minutes.
- **SC-003**: A lawyer can upload or scan a document, review extracted case fields, and attach or create a case with no repeated data entry for already extracted fields.
- **SC-004**: A lawyer can start and complete the primary defense memo mobile workflow from an eligible case without using the web dashboard.
- **SC-005**: At least 90% of primary mobile screens expose a clear loading, empty, error, and retry path during manual QA.
- **SC-006**: A lawyer can resume an interrupted AI workflow from the same case and continue from the latest saved step.
- **SC-007**: All primary screens remain readable and usable on 390px-wide and 430px-wide phone layouts without text overlap.
- **SC-008**: Light and dark modes pass visual QA for navigation, forms, cards, generated outputs, and error states.
- **SC-009**: Users can identify the AI point cost and current balance before every chargeable AI action.
- **SC-010**: The mobile app covers all major lawyer web destinations as either a primary tab, secondary route, or contextual action.

## Assumptions

- The target user is the practicing lawyer, not the admin operator.
- The mobile product should be a mobile-first daily workspace, not a pixel-for-pixel copy of desktop web tables.
- The existing web dashboard remains the source of truth for scope parity and business behavior.
- Existing backend capabilities should be reused where possible; missing backend capability should be documented as a dependency rather than simulated silently.
- The first complete implementation should prioritize authentication, cases, documents/OCR, defense memo, statement of claims, agenda, AI points, and production-grade states.
- Legal contracts, process server papers, remaining AI workflows, notifications, and deeper settings may be implemented after the P1 slice but must be planned now.
- Arabic RTL, Tajawal typography, warm neutral surfaces, restrained amber accent use, and light/dark parity are required quality bars.
