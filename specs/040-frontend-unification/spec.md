# Feature Specification: Frontend Unification

**Feature Branch**: `040-frontend-unification`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "## المرحلة 2: Frontend Unification من @[/Users/mazenelsbagh/mazen mac/apps/mohamy smart/plan-analyzing-v2.md]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Conducting Defense Memo (Phase 1) with the New State Architecture (Priority: P1)

Legal analysts need to generate Defense Memos using the newly modernized unified AI jobs state management pattern so that they experience a consistent loading and rendering experience without old 'snake_case' mapping errors.

**Why this priority**: Defense Memo is a foundational feature. Refactoring must strictly maintain user parity while upgrading the underlying data flow.

**Independent Test**: Can be tested by starting a Defense Memo workflow in the dashboard, moving through all steps (Facts Review, Legal Analysis, Defenses List, Final Requirements, Final Note), and verifying loaders and API payload resolution function seamlessly.

**Acceptance Scenarios**:

1. **Given** a Legal Analyst is logged in and navigates to the Defense Memo page, **When** the workflow is initiated, **Then** all states are managed via unified generic reducers and `camelCase` payload mapping.
2. **Given** the Analyst initiates an AI step, **When** the step is fetching data, **Then** they see the `SmartAnalysisLoader` standard loader instead of legacy UI loaders.

---

### User Story 2 - Completing Preparing Statement of Claims (Phase 2) (Priority: P1)

Legal analysts need to generate a Statement of Claims utilizing the unified state management architecture so that their experience matches all subsequent workflow phases, guaranteeing stability.

**Why this priority**: Statement of Claims includes the most legacy thunks (12 old thunks). Upgrading it ensures the entire platform is unified.

**Independent Test**: Can be independently tested by starting the Statement of Claims workflow, submitting a step, and validating that the correct step components (wrapped via `AnalysisStepShell` with `useAnalysisStep`) reflect the live state without breaking. 

**Acceptance Scenarios**:

1. **Given** the user is viewing the Statement of Claims step components, **When** they request to generate content, **Then** the `useAnalysisStep` hook correctly drives the UI rendering.
2. **Given** the step response returns from the AI job, **When** it maps into the component, **Then** property keys are successfully read as `camelCase`.

---

### User Story 3 - Deprecating Dead Code and Enhancing Bundle Health (Priority: P2)

Developers need a clean codebase without obsolete legacy Ruling Analysis slices and unused Redux thunks so that future maintenance is faster and the application footprint is lighter.

**Why this priority**: Trimming technical debt makes the system healthier and reduces compilation time.

**Independent Test**: Can be completely verified by building the platform, validating no TS errors exist, and seeing a slight reduction in bundle sizes due to removed dead lines.

**Acceptance Scenarios**:

1. **Given** the repository state, **When** a new developer inspects the `/redux` folder, **Then** they do not find `rulingAnalysis` slices or legacy thunks for phase 1/2.
2. **Given** the Redux root store is configured, **When** it initializes, **Then** it does not evaluate any deleted legacy reducers.

### Edge Cases

- What happens when a user pauses an AI workflow job and resumes? The unified AI Jobs/SignalR module should handle the state hydrations appropriately via `createWorkflowSlice`.
- How does the system handle previous legacy data formats that might still hit the backend? (Ensured by Phase 1 JSON unification making everything `camelCase`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST process Smart Analysis (Phase 1) step updates utilizing the standard AI jobs pattern via `createWorkflowSlice` and `createWorkflowThunks` instead of legacy slice.
- **FR-002**: System MUST process Preparing Statement of Claims (Phase 2) step updates utilizing the standard AI jobs pattern, replacing the 12 old thunks.
- **FR-003**: System MUST NOT rely on 'snake_case' casing keys during the frontend binding in Phase 1 and Phase 2.
- **FR-004**: System MUST render all 12 step components across Phase 1 and Phase 2 inside the unified `AnalysisStepShell` component.
- **FR-005**: System MUST bind all 12 step components' logic using the single unified `useAnalysisStep` hook.
- **FR-006**: System MUST omit `rulingAnalysis` stores and its respective 4 thunks from the compile-time execution.
- **FR-007**: System MUST relocate the `appealBriefSlice.ts` up the file tree to align with regular module conventions.
- **FR-008**: System MUST execute the standard `SmartAnalysisLoader` uniformly in the `DefenseMemoPage.tsx` interface. 

### Key Entities *(include if feature involves data)*

- **Analysis Workflow State**: The universal state blueprint driving every workflow step, now handling Phase 1 & Phase 2 correctly via `createWorkflowSlice`.
- **Step Component Shell**: The standard React layout driving the error, loading, and display contexts for AI generated substeps.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User interactions across Phase 1 and 2 workflows have 0% failure rate attributed to legacy JSON deserialization boundaries.
- **SC-002**: Project's total Line of Code (LOC) is reduced by approximately 800 repeated legacy lines.
- **SC-003**: 100% of `src/pages/cases/subPagesCases/analysis` steps directly use the newly defined `useAnalysisStep` hook.
- **SC-004**: 12 exact legacy React thunks from Phase 2 are fully deleted and unavailable in the repository.

## Assumptions

- The backend (Phase 1 of Unification) successfully migrated its endpoints to `System.Text.Json` and produces compliant `camelCase` structure.
- Legacy workflow states currently active in user storage caches can be safely invalidated or ignored.
- The `createWorkflowSlice` factory component already comprehensively supports all data structures utilized across Defense Memo and Statement of Claims.
