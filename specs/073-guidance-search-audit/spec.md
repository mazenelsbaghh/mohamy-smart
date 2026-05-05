# Feature Specification: Guidance Coverage Audit And Case Search Expansion

**Feature Branch**: `073-guidance-search-audit`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "Ensure every guided help item is complete, scrolls to and focuses the correct thing, and expand case search so searching by case number or court also finds cases by client name and related visible case data."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Guided Help Focus For Every Page (Priority: P1)

As a lawyer using the dashboard, I want each guidance step to move me to the exact button, card, form, or section being explained, so I can understand the page without guessing what the text refers to.

**Why this priority**: The guidance exists to teach lawyers how to use the product. If the highlighted target is wrong, hidden, or covered by the popup, the guidance fails its purpose and creates confusion.

**Independent Test**: Open every dashboard route with guidance enabled, move through every guidance step, and verify that each step scrolls to the relevant visible target, applies a visible focus state, and displays a specific explanation for that target.

**Acceptance Scenarios**:

1. **Given** a page has an off-screen guided target, **When** the lawyer reaches that guidance step, **Then** the page scrolls to bring the target into a clear visible area before showing the focus state.
2. **Given** a page has multiple guided targets, **When** the lawyer presses next or previous, **Then** the focus state moves to the correct new target and is removed from the previous target.
3. **Given** a guided target cannot be found in the current page state, **When** the step is displayed, **Then** the guidance still explains the step clearly and tells the lawyer that the target may not be available now.
4. **Given** the lawyer has reduced motion enabled, **When** the guidance changes steps, **Then** the guidance remains usable without distracting motion.

---

### User Story 2 - Page-Specific Explanations Are Complete (Priority: P1)

As a lawyer, I want the guidance text to explain what each highlighted item is for and when to use it, so I can confidently use the page and know when artificial intelligence should help me.

**Why this priority**: Highlighting alone is not enough. The lawyer needs clear, page-specific wording that explains the workflow, the target, and the professional review needed before relying on AI output.

**Independent Test**: Review all configured guidance pages and confirm that each page has a title, summary, actionable steps, AI usage guidance where applicable, review warnings, and a permanent dismissal option scoped to that page.

**Acceptance Scenarios**:

1. **Given** a page has an AI workflow, **When** the AI guidance step appears, **Then** it explains when to use AI, what inputs must be ready, what output to expect, and that the lawyer must review the result.
2. **Given** a page has a manual workflow, **When** guidance steps appear, **Then** each step names the relevant target and explains the practical action expected from the lawyer.
3. **Given** the lawyer chooses not to show guidance again, **When** the lawyer returns to the same page, **Then** the guidance does not reappear for that page while other pages keep their own dismissal state.

---

### User Story 3 - Search Cases By Client And Related Case Data (Priority: P2)

As a lawyer managing cases, I want the cases search field to find cases by client name, opponent name, case number, court, title, and visible case details, so I can open the correct file quickly even when I remember only a person name.

**Why this priority**: Lawyers often remember the client or opponent before remembering the case number. Search that only covers case number or court slows down daily work.

**Independent Test**: In the cases list, enter a client name, opponent name, case number, court name, and case title separately, and verify the matching case appears for each query without requiring a full exact phrase.

**Acceptance Scenarios**:

1. **Given** a case belongs to a client named "عاطف", **When** the lawyer searches for "عاطف", **Then** the case appears in the result list.
2. **Given** a case has an opponent named "محمد", **When** the lawyer searches for "محمد", **Then** the case appears in the result list.
3. **Given** a case has a court or case number containing the query, **When** the lawyer searches using any part of that court or number, **Then** the case appears in the result list.
4. **Given** the lawyer types Arabic or English text with extra spaces or different letter forms, **When** search runs, **Then** matching should still work for normalized visible text where possible.

### Edge Cases

- A guidance target is below the popup or partially visible: the page must scroll until the target is comfortably visible and not covered by the popup.
- A guidance target appears inside an inner scrollable panel: that panel must scroll when possible instead of only scrolling the whole page.
- A target is disabled, hidden, or not rendered because the page has no data: the step must remain understandable and avoid focusing a nonexistent element.
- The lawyer moves backward through guidance steps: the old focus state must not remain stuck on previous elements.
- The search query is empty: the full case list should return to its normal unfiltered state.
- The search query matches multiple fields: all matching cases should remain visible.
- A case is missing client or opponent data: search should skip missing fields without errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide guided help steps for all pages currently registered for page guidance.
- **FR-002**: Each guided help step MUST have clear text naming or describing the target being explained.
- **FR-003**: Each guided help step MUST attempt to locate its target by a stable selector, label, accessible name, placeholder, title, or visible text.
- **FR-004**: When a target is found, the system MUST scroll the relevant page area so the target is clearly visible before applying focus.
- **FR-005**: When a target is found, the system MUST apply a visible focus/highlight state to that target and remove the state when the step changes or closes.
- **FR-006**: The guidance popup MUST avoid covering the highlighted target whenever there is enough viewport space.
- **FR-007**: If a target cannot be found, the system MUST show a clear fallback message instead of failing silently.
- **FR-008**: Guidance dismissal MUST remain scoped per page so hiding guidance on one page does not hide it everywhere.
- **FR-009**: AI guidance pages MUST explain when to use AI, required inputs, expected output, and mandatory lawyer review.
- **FR-010**: The cases search MUST match case number, court name, case title, client name, opponent name, case type, and visible status fields available in the case list data.
- **FR-011**: The cases search MUST support partial matching and ignore repeated whitespace.
- **FR-012**: The cases search MUST handle missing optional fields without errors.
- **FR-013**: The cases search placeholder MUST communicate that client and opponent names are searchable.
- **FR-014**: The feature MUST preserve the existing visual language and avoid adding heavy instructional text inside normal pages outside the guidance popup.

### Key Entities *(include if feature involves data)*

- **Guidance Page**: A page that has contextual guidance, identified by route and guidance key.
- **Guidance Step**: A single explanation in a page tour, with text, optional AI role, and a target reference.
- **Guidance Target**: A button, link, form control, card, heading, or section that a guidance step explains.
- **Case Search Record**: A case row or card with searchable fields including case number, title, court, client, opponent, type, and status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of registered guidance pages have at least one actionable guidance step and no placeholder wording.
- **SC-002**: 100% of guided steps either focus a visible target or show a clear fallback message explaining why the target may not be available.
- **SC-003**: In a manual verification pass, every target that exists on the page is brought into a clear visible area before focus is applied.
- **SC-004**: Lawyers can search the cases list by client name, opponent name, case number, court name, or case title and find the expected case within one query.
- **SC-005**: Empty and no-result searches remain understandable and do not break normal list behavior.
- **SC-006**: Existing guidance dismissal behavior remains page-specific after the changes.

## Assumptions

- Existing registered guidance pages remain the scope for this feature.
- Case search can use fields already available in the list data; adding new backend fields is only needed if the frontend does not receive client or opponent names.
- The feature should improve the current popup tour rather than replacing it with a separate onboarding system.
- The lawyer dashboard remains right-to-left Arabic-first, with professional legal wording.
