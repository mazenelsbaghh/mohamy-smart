# Feature Specification: Frontend Shared Components & Hooks

**Feature Branch**: `034-frontend-shared-hooks`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "Phase 4: Frontend Shared Components & Hooks"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Uses Unified Analysis Hook (Priority: P1)

As a frontend developer, I want to use a single unified hook (`useAnalysisStep`) for any AI analysis step, so that I don't have to rewrite API submission, SignalR status monitoring, error handling, and retry logic for each step.

**Why this priority**: Focuses on resolving duplication (DUP-08) across analysis step components, which is the primary objective of this phase.

**Independent Test**: Can be fully tested by implementing the new hook in one step, triggering an AI job, and verifying that statuses, auto-submission, parsing, and Redux hydration are seamlessly handled.

**Acceptance Scenarios**:

1. **Given** an initialized workflow step using the new hook, **When** the component mounts with auto-submit enabled, **Then** an AI job is dispatched automatically and SignalR connection listens for status updates.
2. **Given** a failed analysis step, **When** the developer invokes the `retry` function exposed by the hook, **Then** the previous failure state is cleared and the job is re-submitted.

---

### User Story 2 - Developer Uses Shell Component for Consistent UI (Priority: P2)

As a frontend developer, I want to wrap my analysis step UI inside an `AnalysisStepShell` component, so that loading spinners and error messages are displayed identically across all workflow steps without manual boilerplate.

**Why this priority**: Ensures consistent UX/UI (CONSIST-03) and removes boilerplate JSX currently spread across the application.

**Independent Test**: Can be tested by returning different mocked states (loading, error, success) from the hook and verifying the Shell component correctly renders placeholders vs content.

**Acceptance Scenarios**:

1. **Given** the hook indicates `isLoading: true`, **When** the shell renders, **Then** a unified loading skeleton or spinner is displayed centrally.
2. **Given** the hook indicates `hasFailed: true`, **When** the shell renders, **Then** the standard error block is displayed alongside a retry button.

### Edge Cases

- What happens if the AI job fails multiple times in a row? (The retry mechanism should handle continuous failures without crashing the application, displaying the error message each time).
- How does the system handle a timeout from the SignalR connection? (A timeout should trigger the `hasFailed` state and allow the user to manually retry).
- What if the Redux hydration fails or the resulting JSON is malformed? (The validation or parse step should catch the error and present an informative error boundary to the user).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a `useAnalysisStep` hook that tracks state variables `isLoading`, `isSubmitting`, `hasFailed`, `errorMessage`, and `result`.
- **FR-002**: System MUST provide automatic submission functionality when `autoSubmit` is true.
- **FR-003**: System MUST provide a `parseResult` callback capability to parse API JSON responses safely.
- **FR-004**: System MUST hydrate the parsed result automatically to the Redux store using the `onHydrate` callback context.
- **FR-005**: System MUST provide an `AnalysisStepShell` component that receives loading and error states to conditionally render loading skeletons, error screens with retry functionality, or child component trees.
- **FR-006**: Existing step components MUST be decoupled from direct AI job SignalR monitoring loops and adopt the new hook format.

### Key Entities

- **`useAnalysisStep` Options Object**: Represents the input configuration required (caseId, workflowId, stepNumber, stepType, autoSubmit, parseResult, onHydrate).
- **`useAnalysisStep` Return Object**: Represents the state and actions returned to the component (isLoading, isSubmitting, hasFailed, errorMessage, result, submit, retry).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Step component boilerplate lines of code are reduced by at least 50% (e.g. from ~130 lines to ~40-60 lines).
- **SC-002**: 100% of all duplicated loading states and error boundary states for steps are removed and replaced by `AnalysisStepShell`.
- **SC-003**: Addition of a brand new pipeline step requires setting up a step configuration and a UI visual component without needing new SignalR or API boilerplate logic.
- **SC-004**: Existing functionality (submission, loading display, error recovery) operates without any regressive behaviors compared to prior implementation.

## Assumptions

- No backend changes are required for this phase to work, as this solely addresses React rendering, boilerplate deduplication, and component encapsulation.
- Redux slices logic currently exists in some form and provides the store dispatch methods referenced by the hydration parameters.
