# Implementation Tasks: Frontend Redux Unification

**Feature Name**: Frontend Redux Unification  
**Branch**: `035-frontend-redux-unification`

## Phase 1: Setup

*(No project-level setup required for this feature)*

## Phase 2: Foundational

**Goal**: Establish the generic Redux factories that all AI workflows will consume.  
**Independent Test**: The generic `createWorkflowSlice` and `createWorkflowThunks` can be imported and compile without TypeScript errors.

- [x] T001 Define `BaseWorkflowState` and workflow interfaces in `mohamy-smart-lawyer-dashboard/src/redux/shared/workflowTypes.ts`
- [x] T002 Implement generic `createWorkflowThunks` utility in `mohamy-smart-lawyer-dashboard/src/redux/shared/createWorkflowThunks.ts`
- [x] T003 Implement generic `createWorkflowSlice` utility in `mohamy-smart-lawyer-dashboard/src/redux/shared/createWorkflowSlice.ts` (depends on T001, T002)

## Phase 3: Standardized AI Workflow State Operations [US1]

**Goal**: Replace all bifurcated legacy/AI slices with the new unified generation mechanism for the core AI workflows, and hook them up to the Redux store.  
**Independent Test**: The Redux DevTools show unified state shapes under single keys for each workflow.

- [x] T004 [US1] Refactor Admin Complaint to use unified slice in `mohamy-smart-lawyer-dashboard/src/redux/adminComplaint/adminComplaintSlice.ts` and delete `AdminComplaint.ts` / `adminComplaintAiSlice.ts`
- [x] T005 [P] [US1] Refactor Smart Analysis (Defense Memo) to use unified slice in `mohamy-smart-lawyer-dashboard/src/redux/analysis/smartAnalysisSlice.ts` and delete legacy analysis slices
- [x] T006 [P] [US1] Refactor Legal Warning to use unified slice in `mohamy-smart-lawyer-dashboard/src/redux/legalWarning/legalWarningSlice.ts` and delete legacy slices
- [x] T007 [P] [US1] Refactor Executive Request to use unified slice in `mohamy-smart-lawyer-dashboard/src/redux/execRequest/execRequestSlice.ts` and delete legacy slices
- [x] T008 [US1] Register all the unified slices in the root store in `mohamy-smart-lawyer-dashboard/src/redux/store.ts` (depends on T004, T005, T006, T007)

## Phase 4: Consistent Workflow Network Monitoring [US2]

**Goal**: Refactor the frontend UI components to read from the unified Redux state structure and dispatch the unified thunks, ensuring standard loading and error indicators function properly.  
**Independent Test**: Users can load an Admin Complaint workflow and see proper loading skeletons and step outputs without UI breaking due to missing legacy state access.

- [x] T009 [P] [US2] Update Redux selectors and dispatches across Admin Complaint step components to map to the new unified slice shape
- [x] T010 [P] [US2] Update Redux selectors and dispatches across Smart Analysis step components to map to the new unified slice shape
- [x] T011 [P] [US2] Update Redux selectors and dispatches across Legal Warning step components to map to the new unified slice shape
- [x] T012 [P] [US2] Update Redux selectors and dispatches across Executive Request step components to map to the new unified slice shape

## Final Phase: Polish & Cross-Cutting Concerns

- [x] T013 Update `useAnalysisStep` hook in `mohamy-smart-lawyer-dashboard/src/hooks/useAnalysisStep.ts` (if needed) to flawlessly interact with the new unified thunk signatures and state schema
- [x] T014 Run formatting and TypeScript checks `npm install && npm test && tsc --noEmit` locally in `mohamy-smart-lawyer-dashboard` to verify there are no dangling typing errors from the unification.

## Dependencies

- **US1** depends on **Foundational** (generic slice/thunk makers).
- **US2** depends on **US1** (requires the actual reducers and store to exist).
- **Polish** depends on all previous phases.

## Execution Strategy

1. **Foundations First**: The generic `createWorkflowSlice` and `createWorkflowThunks` form the cornerstone. Focus heavily on getting the TypeScript generics perfect here.
2. **Incremental US1/US2**: You can actually tackle US1 and US2 for a *single* pipeline (e.g., Admin Complaint) and test it thoroughly end-to-end to ensure the `createWorkflowSlice` design works cleanly down to the UI. Once verified, blaze through the remaining workflows (`analysis`, `legalWarning`, `execRequest`) in parallel.
