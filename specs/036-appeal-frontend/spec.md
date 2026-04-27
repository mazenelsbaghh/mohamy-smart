# Feature Specification: Phase 6 Appeal Brief Frontend Implementation

**Feature Branch**: `036-appeal-frontend`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "phase-6-appeal-brief-frontend-implementation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - End-to-End Appeal Brief Generation (Priority: P1)

Users need to be able to navigate through a unified, 6-step wizard that guides them through generating a complete Appeal Brief for a case, using streamlined and consistent frontend components.

**Why this priority**: Generating an Appeal Brief is a core legal workflow, and doing it efficiently and accurately without frontend bugs or inconsistencies is critical for providing value to lawyers.

**Independent Test**: Can be fully tested by launching the Appeal Brief workflow for a mock case, stepping through all 6 stages, verifying AI outputs load correctly via the shared hook, and confirming the final assembly renders successfully.

**Acceptance Scenarios**:

1. **Given** a lawyer is on the Appeal Brief workflow page for a case, **When** they load the first step, **Then** the page should seamlessly utilize standard loading skeletons and retrieve the judgment data automatically.
2. **Given** the lawyer finishes reviewing any intermediate step (e.g., Step 3: Appeal Grounds), **When** they click to proceed, **Then** the system navigates them safely to the next step, preserving the state of previous steps in the Redux store.
3. **Given** the lawyer reaches Step 6, **When** the page renders, **Then** all previously collected information should be assembled and presented as the final legal document.

---

### Edge Cases

- What happens when a network error occurs during a specific step's AI processing? (System should gracefully show a unified error state via `useAnalysisStep` with a "Retry" button).
- How does the system handle direct URL navigation to Step 4 if Step 1-3 have not been hydrated yet? (System should redirect back or trigger auto-submission correctly depending on the workflow logic).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a unified orchestration component `AppealBriefPage.tsx` utilizing `AnalysisWorkflowShell` to manage routing between the 6 steps.
- **FR-002**: System MUST render Step 1 (`AppealStep1JudgmentData.tsx`) to extract and display the original judgment data.
- **FR-003**: System MUST render Step 2 (`AppealStep2Analysis.tsx`) to process and display the reasoning analysis.
- **FR-004**: System MUST render Step 3 (`AppealStep3Grounds.tsx`) to manage the appeal grounds.
- **FR-005**: System MUST render Step 4 (`AppealStep4Requests.tsx`) to manage the user's specific appeal requests.
- **FR-006**: System MUST render Step 5 (`AppealStep5LegalBasis.tsx`) to retrieve and display the legal basis for the appeal.
- **FR-007**: System MUST render Step 6 (`AppealStep6Assembly.tsx`) to review the final assembled appeal brief.
- **FR-008**: System MUST utilize the shared `useAnalysisStep` hook inside every step component to handle API requests, SignalR monitoring, response parsing, and state hydration, maintaining consistent UI states across all steps.
- **FR-009**: System MUST utilize `AnalysisStageLayout` or an equivalent shared layout shell inside each step for consistent Sidebar, Header, and Content visual structures.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully step through all 6 stages of the new Appeal Brief frontend without encountering unhandled state exceptions.
- **SC-002**: The boilerplate code for each of the 6 new step components is significantly reduced (e.g., averaging 40-70 lines of code) compared to legacy step implementations.
- **SC-003**: All steps exhibit identical, unified loading skeletons and error alert banners when subjected to network delays or failures.

## Assumptions

- The backend APIs and Redux slices (from Phase 5 unification) required to drive these 6 steps already exist or will behave consistently with the newly unified infrastructure.
- The `useAnalysisStep` and `AnalysisStageLayout` components built in Phase 4 are fully functional and available for consumption.
- The workflow follows a linear progression layout standard to existing project analysis pipelines.
