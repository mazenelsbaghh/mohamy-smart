# Feature Specification: Sessions and Actions Agenda

**Feature Branch**: `019-sessions-agenda`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "بدل المهام تبقي اجنده الجلسات و الاعمال وانتى بتسجل المهام عايز الجلسه يبقي بينات الجلسه كلها و الجلسه السابقه متاجله اي لو فيه معينه او تنفيذ بكتب التفاصيل و بكتب كل التفاصيل تبقي اختيارات"

## Clarifications

### Session 2026-04-08
- Q: عند اختيار "تأجيل الجلسة السابقة"، هل يتم ربط الجلسة الجديدة بسجل جلسة سابقة موجود بالفعل في النظام، أم يتم فقط اختيار "سبب التأجيل" من قائمة عامة دون ربط مباشر بسجل محدد؟ → A: يتم اختيار الجلسة السابقة من النظام لربطها واختيار سبب تأجيلها
- Q: ماذا يجب أن يحدث للمهام القديمة المسجلة حالياً في النظام؟ → A: لا يوجد مهام قديمة مسجلة مسبقاً للحاجة إلى ترتيب ترحيل بيانات.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registering a Court Session (Priority: P1)

Lawyers need to accurately record scheduled court sessions so they can track the history and upcoming agenda of a case. The entry must capture comprehensive session details and, crucially, the reason why the previous session was postponed, using predefined selections to maintain data consistency.

**Why this priority**: Court sessions are the most critical events in managing a case. Accurate and standardized recording of session details and postponement reasons is essential for legal tracking.

**Independent Test**: Can be independently tested by opening the agenda creation form, selecting "Session" as the type, and verifying that session details and previous postponement reasons are captured via predefined dropdowns/selections.

**Acceptance Scenarios**:

1. **Given** the lawyer is adding a new agenda item, **When** they select "Court Session" as the type, **Then** the form updates to display specific fields for session details.
2. **Given** the court session form is displayed, **When** the lawyer fills out the details, **Then** they must select the specifics (e.g., session type, court name) and the postponement reason of the previous session from predefined lists, without needing to type free text.
3. **Given** a completely filled session form, **When** the user saves, **Then** the session is successfully added to the agenda.

---

### User Story 2 - Registering an Action (Inspection or Execution) (Priority: P2)

Lawyers need to record specific legal actions related to a case, such as an official inspection (معاينة) or an execution of a judgment (تنفيذ), using standardized options so the system can organize these tasks properly within the agenda.

**Why this priority**: Actions like inspections and executions are significant events supporting a case. Standardizing their entry ensures reports and agendas are easily filtrable and readable.

**Independent Test**: Can be tested independently by creating a new agenda item, selecting "Action (Inspection/Execution)" as the type, and verifying the presence of specific choice-based fields for these actions.

**Acceptance Scenarios**:

1. **Given** the lawyer is adding a new agenda item, **When** they select an action like "Inspection" or "Execution", **Then** the form dynamically shows fields relevant to that specific action.
2. **Given** the inspection/execution form is displayed, **When** documenting the action details, **Then** the user can choose the required details from predefined selection lists.

---

### Edge Cases

- What happens when a user needs to enter a postponement reason that is not available in the predefined selection choices? (System should ideally have an "Other" option that allows brief text, or require admin to add it).
- What happens if the selected case doesn't have a "Previous Session" to postpone from? (The field should be hidden or allow a "First Session" choice).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST rename all user-facing references from "Tasks" (المهام) to "Sessions and Actions Agenda" (أجندة الجلسات والأعمال).
- **FR-002**: System MUST allow users to categorize an agenda item into distinct types, primarily "Session" (جلسة) or "Action" (أعمال - مثل معاينة أو تنفيذ).
- **FR-003**: When creating a "Session", the system MUST provide standardized, choice-based fields for capturing all session details.
- **FR-004**: When creating a "Session", the system MUST allow users to select an existing previous session record from the system and then specify its "Postponement Reason" (تأجيل الجلسة السابقة) using a predefined choice-based list.
- **FR-005**: When creating an "Action" (Inspection/Execution), the system MUST provide standardized, choice-based fields specific to the selected action type.
- **FR-006**: System MUST enforce predefined choices (e.g., dropdowns, radio buttons) for all detailed data entry in the agenda forms, minimizing free-text inputs.
- **FR-007**: System MUST allow users to save, view, and list these agenda items in an organized agenda view.

### Key Entities

- **AgendaItem**: Represents an entry in the "Sessions and Actions Agenda", categorized by its type (Session, Inspection, Execution, etc.).
- **SessionDetails**: Contains fields specific to court sessions, importantly including a direct relational link to the previous session record and the specific reason for its postponement.
- **ActionDetails**: Contains fields specific to actions like inspections or executions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of new session and action entries are recorded using predefined choice selections for their specific details (no free-text for primary structured data).
- **SC-002**: Users can complete the entry of a session or an action in under 60 seconds due to the choice-based form design.
- **SC-003**: All references to "Tasks" in the UI are successfully replaced with terms relating to "Sessions and Actions Agenda".

## Assumptions

- Predefined lists of options (e.g., court names, postponement reasons, execution types) will either be seeded in the system or managed by an administrator.
- The existing case management system can be linked to these new agenda items.
- "Tasks" are being entirely repurposed/replaced by this new Agenda feature for the target dashboard.
- No data migration script or process is required for existing old 'Tasks' data since there are no existing tasks in the database.
