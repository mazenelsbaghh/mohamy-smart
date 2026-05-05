# Feature Specification: Guided Popup Tour

**Feature Branch**: `072-guided-popup-tour`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "عايز يبقى فيها زرار، عايز كان فيه موشن رايح لكل زرار بيفهموا اي ده، اعمله بشكل كويس واظبطها بكل المعلومات اللي هو عايزها"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Follow Page Buttons Step By Step (Priority: P1)

As a lawyer opening a guided page, I want the popup to move through the important buttons and areas on the page with clear next and previous controls, so I understand what each action does before I use it.

**Why this priority**: The current popup explains the page but does not point to the exact controls. The lawyer needs contextual guidance that connects words to visible actions.

**Independent Test**: Open a guided page, use the popup's next and previous buttons, and confirm the highlighted target moves to the relevant button or area while the explanation updates.

**Acceptance Scenarios**:

1. **Given** a lawyer opens a page with available guided targets, **When** the popup appears, **Then** the first target is visually highlighted and the popup explains what that control does.
2. **Given** the lawyer clicks the next button, **When** another guided target exists, **Then** the highlight moves to the next target and the step text changes.
3. **Given** the lawyer clicks the previous button, **When** an earlier guided target exists, **Then** the highlight returns to the previous target.

---

### User Story 2 - Understand AI Readiness And Legal Responsibility (Priority: P2)

As a lawyer on an AI-capable page, I want the guided popup to explain what information must be ready before using AI and what I must review afterwards, so I do not treat AI output as final legal work.

**Why this priority**: Guided movement is only useful if it also teaches the correct professional use of AI actions and keeps lawyer review explicit.

**Independent Test**: Open an AI workflow page, navigate the popup steps, and confirm at least one AI step explains when to use AI, required inputs, expected output, and lawyer review responsibility.

**Acceptance Scenarios**:

1. **Given** a page includes AI actions, **When** the guided popup reaches the AI step, **Then** it states what facts, documents, or references should be prepared first.
2. **Given** the AI step is visible, **When** the lawyer reads it, **Then** it clearly states that AI output is a drafting or analysis aid requiring lawyer review.
3. **Given** a page has no AI action, **When** its guided popup appears, **Then** it does not imply that AI is available.

---

### User Story 3 - Control Repetition Without Losing Help Elsewhere (Priority: P3)

As an experienced lawyer, I want to close the popup now or choose not to show it again for the current page, so guidance does not interrupt repeated work while remaining available on other pages.

**Why this priority**: A guided popup is more prominent than inline help, so repetition controls must be clear and page-specific.

**Independent Test**: Dismiss the popup permanently on one page, refresh, and confirm it stays hidden only for that page while other pages can still show their own guided popups.

**Acceptance Scenarios**:

1. **Given** the popup is open, **When** the lawyer clicks "ابدأ العمل" or closes it, **Then** it disappears for the current visit without permanently hiding future visits.
2. **Given** the popup is open, **When** the lawyer clicks "عدم الإظهار مرة أخرى", **Then** the same page popup no longer appears in the same browser.
3. **Given** motion reduction is preferred by the user's device, **When** the tour moves between targets, **Then** the experience remains readable without unnecessary animation.

### Edge Cases

- If a target button is not present because data is loading, permissions differ, or the page state is empty, the popup must still show the step text without breaking.
- If a target is below the current viewport, the system should bring it into view before highlighting it when practical.
- If the highlighted target would be hidden behind the popup, the popup should remain readable and the highlight should still make sense.
- If the page changes route, the popup must reset to the new page's first available step unless that page was permanently dismissed.
- Permanent dismissal must be page-specific and must not disable guided help globally.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The guided popup MUST include visible next and previous controls for moving between page-specific guidance steps.
- **FR-002**: Each guided step MUST have a concise Arabic title and explanation describing what the highlighted button or page area does.
- **FR-003**: When a guided step has a matching visible target, the interface MUST show a visual spotlight or pointer around that target.
- **FR-004**: When no matching target exists, the popup MUST still show the step explanation and avoid errors.
- **FR-005**: AI-capable pages MUST include at least one step explaining when to use AI, required inputs, expected output, and lawyer review responsibility.
- **FR-006**: Pages without AI actions MUST NOT show AI usage guidance.
- **FR-007**: The popup MUST provide "ابدأ العمل" or close behavior that hides the popup for the current visit only.
- **FR-008**: The popup MUST provide "عدم الإظهار مرة أخرى" behavior that stores page-specific dismissal in the user's browser.
- **FR-009**: Motion MUST be purposeful and must respect reduced-motion preferences.
- **FR-010**: The popup and spotlight MUST remain readable and non-overlapping on desktop and mobile-width layouts.

### Key Entities

- **Guided Tour Step**: A page-specific instructional step. Key attributes include title, explanation, optional target text or selector, and optional AI flag.
- **Spotlight Target**: A visible page control or area associated with a step. Key attributes include target text, selector, position, and availability.
- **Guidance Preference**: A local browser preference storing whether a page's guided popup should stop appearing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A lawyer can identify the purpose of at least three main actions on a guided workflow page within 30 seconds.
- **SC-002**: 100% of guided AI workflow pages include an AI readiness and lawyer review step.
- **SC-003**: 100% of guided steps remain readable when their target button is missing or disabled.
- **SC-004**: A permanently dismissed page popup does not reappear after refresh in the same browser.
- **SC-005**: Other pages still show their own guided popup after one page is permanently dismissed.
- **SC-006**: Manual review at desktop and mobile widths finds no incoherent overlap between popup text, spotlight, and primary controls.

## Assumptions

- The first release enhances the existing page guidance popup rather than introducing a separate onboarding library.
- Guided targets can be matched from visible button/link text, aria labels, or optional selectors maintained in the local guidance catalog.
- The design should feel like a professional legal product: calm, precise, Arabic-first, and task-focused.
- The feature does not require backend persistence or cross-device preference syncing.
