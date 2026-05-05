# Feature Specification: Page AI Guidance

**Feature Branch**: `071-page-ai-guidance`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "عايز اعمل حاجه ف كل صفحه تشرح للمحامي كل حاجه و عايز يبان انو يستخدم ai امتي و ازاي فاهمني زي المواقع عايزها لكل حاجه"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand Each Page Immediately (Priority: P1)

As a lawyer opening any main page in the dashboard, I want a concise Arabic popup explaining what this page is for, the steps I should follow, and what the next recommended action is, so I can work without guessing.

**Why this priority**: The lawyer needs immediate orientation before any AI guidance can be useful. If the page purpose is unclear, users may skip important actions or use AI at the wrong time.

**Independent Test**: Can be fully tested by opening each main dashboard page and confirming that a guidance popup explains the page purpose, ordered steps, and next step in Arabic without requiring support documentation.

**Acceptance Scenarios**:

1. **Given** a lawyer opens a main dashboard page, **When** the page finishes loading, **Then** the lawyer sees a clear Arabic guidance popup describing the page purpose and primary work steps.
2. **Given** a lawyer is on a page with multiple possible actions, **When** they read the popup steps, **Then** they can identify the recommended next action without opening a separate help document.
3. **Given** a page has no records or a loading/error state, **When** the page renders that state, **Then** the popup still explains what the page is for and what the lawyer should do next.

---

### User Story 2 - Know When And How To Use AI (Priority: P2)

As a lawyer, I want each relevant page to explain when AI is useful, what information AI needs, and what output I should review, so I can use AI confidently while preserving professional judgment.

**Why this priority**: The product value depends on lawyers knowing when AI helps and where human review remains mandatory.

**Independent Test**: Can be tested by opening every AI-capable area and confirming it contains a plain Arabic explanation of the AI trigger, prerequisites, expected result, and review responsibility.

**Acceptance Scenarios**:

1. **Given** a page includes an AI action, **When** the lawyer views the page guidance, **Then** it states when to use AI and what input should be ready first.
2. **Given** AI output may affect legal work, **When** the lawyer reads the guidance, **Then** it clearly states that AI output is a drafting or analysis aid and requires lawyer review.
3. **Given** a page has no AI action, **When** the lawyer views the guidance, **Then** it does not imply AI is available and instead explains the page's manual workflow.

---

### User Story 3 - Keep Guidance Useful Without Blocking Work (Priority: P3)

As an experienced lawyer, I want guidance to be easy to scan, close, or permanently hide per page, so it helps first-time use without slowing repeated daily work.

**Why this priority**: Helpful guidance becomes noise if it occupies too much space or interrupts experienced users.

**Independent Test**: Can be tested by interacting with guidance on multiple pages and confirming it is readable, compact, and does not block core actions on desktop or mobile widths.

**Acceptance Scenarios**:

1. **Given** a lawyer has already understood a page, **When** they click "عدم الإظهار مرة أخرى", **Then** the same page popup no longer appears on later visits from the same browser.
2. **Given** a page is viewed on a narrow screen, **When** guidance is displayed, **Then** the popup remains readable and does not overlap buttons, forms, or page navigation incoherently.
3. **Given** the lawyer navigates between pages, **When** each page loads, **Then** popup text matches the current page and does not show generic unrelated instructions.

### Edge Cases

- Pages that already have empty states must avoid duplicate explanations that repeat the same sentence in two places.
- Pages with sensitive legal content must avoid suggesting that AI replaces legal review or court-ready responsibility.
- Pages without AI actions must not display AI usage instructions that would mislead users.
- Long Arabic page names or guidance text must wrap cleanly without pushing core actions off-screen.
- Guidance must remain useful when a page is loading, empty, or showing an error.
- Permanent hide must be page-specific, not a global opt-out for all guidance popups.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every main lawyer dashboard page MUST show an Arabic guidance popup that explains the page purpose, ordered work steps, and the recommended next action.
- **FR-002**: Every page with an AI action MUST explain when the lawyer should use AI, what prerequisites should be prepared first, what output to expect, and what the lawyer must review afterwards.
- **FR-003**: Pages without an AI action MUST state the manual workflow and MUST NOT imply that AI is available on that page.
- **FR-004**: Guidance MUST be concise enough to scan quickly, with ordered steps visible in the popup and more detailed AI or practical notes shown inside the same popup when relevant.
- **FR-005**: Guidance MUST be written in professional Arabic suitable for lawyers and MUST avoid marketing claims, exaggerated promises, or wording that weakens the lawyer's responsibility.
- **FR-006**: Guidance MUST support repeated use by allowing lawyers to close the popup for the current visit or choose "عدم الإظهار مرة أخرى" so that page popup does not appear again in the same browser.
- **FR-007**: Guidance MUST cover loading, empty, and error states where those states are part of the page experience.
- **FR-008**: Guidance MUST remain visually consistent across pages while allowing page-specific content and AI-specific warnings.
- **FR-009**: Guidance MUST be responsive and accessible, including readable text, clear interactive labels, and no overlap with primary actions.
- **FR-010**: Guidance MUST include a consistent AI responsibility notice wherever AI output can influence legal analysis, drafting, or case decisions.

### Key Entities

- **Page Guidance**: The explanatory popup content for a dashboard page. Key attributes include page identity, page purpose, ordered steps, next recommended action, and optional notes.
- **AI Usage Guidance**: Page-specific instructions for AI-capable flows. Key attributes include when to use AI, required inputs, expected outputs, review responsibility, and warnings.
- **Guidance Preference**: A user's lightweight page-specific choice to permanently hide a guidance popup in the current browser.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A lawyer can identify the purpose and recommended next action on each main page within 10 seconds of opening it.
- **SC-002**: 100% of AI-capable pages explain when to use AI and include a lawyer review responsibility notice.
- **SC-003**: 100% of non-AI pages avoid presenting AI usage instructions as if AI were available there.
- **SC-004**: Guidance remains readable and non-overlapping on desktop and mobile-width layouts during manual review.
- **SC-005**: At least 90% of reviewed guidance text is page-specific, not generic copy reused without relevance.
- **SC-006**: New users can complete the primary page task after reading guidance without needing external help in at least 8 out of 10 reviewed pages.

## Assumptions

- The first release targets the lawyer dashboard's main pages and high-value workflows rather than admin-only or marketing pages.
- Guidance is static editorial content maintained with the application, not generated dynamically by AI.
- The platform already has authenticated lawyer pages, Arabic RTL layout, and existing AI actions that can be referenced by guidance.
- The guidance should be helpful but restrained: it should support work, not behave like a blocking onboarding tour.
- Collapsed or reduced guidance preference can be lightweight and local to the user's browser unless a future requirement asks for cross-device persistence.
