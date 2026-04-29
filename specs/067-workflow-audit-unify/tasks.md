# Tasks: Workflow Architecture Audit & Unification

**Input**: Design documents from `/specs/067-workflow-audit-unify/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

---

## Phase 1: Setup

**Purpose**: No new dependencies or scaffolding needed — this is a frontend refactoring feature.

- [x] T001 Verify dev environment runs on canonical ports: backend 8976, lawyer-dashboard 5078, and confirm test/lint commands work (`npm test && npm run lint` in `apps/lawyer-dashboard/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared infrastructure that ALL user stories depend on. No user story work can begin until this phase is complete.

- [x] T002 [P] Expand step definitions with icons for all 7 workflows in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/analysisWorkflow/workflowConstants.ts` — add `StepMeta` type (`{ id: string; label: string; icon: React.ComponentType }`) and 7 new exported constants (`DEFENSE_MEMO_STEP_DEFS`, `STATEMENT_OF_CLAIMS_STEP_DEFS`, `APPEAL_BRIEF_STEP_DEFS`, `ADMIN_COMPLAINT_STEP_DEFS`, `RULING_ANALYSIS_STEP_DEFS`, `LEGAL_WARNING_STEP_DEFS`, `EXEC_REQUEST_STEP_DEFS`). Copy icon imports from each page file's inline step arrays. Each array length MUST match `WORKFLOW_CATALOG[id].totalSteps`. Keep existing `ADMIN_COMPLAINT_STEPS`, `LEGAL_WARNING_STEPS`, `DEFENSE_MEMO_STEPS` for backward compat but mark as deprecated.

- [x] T003 [P] Add `DraftWorkflowState` interface to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/shared/workflowTypes.ts` — extract the fields from the local type in `CaseAnalysis.tsx` lines 23-30 (`workflowId`, `caseId`, `outputs`, `loadingState`, `errorState`, `lastSavedAt`, `createdAt`, `isReadOnly`, `snapshotLabel`). Place alongside existing `BaseWorkflowState`.

- [x] T004 [P] Create shared workflow utilities module at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/shared/workflowUtils.ts` — implement 4 functions: (1) `isWorkflowCompleted(outputs, workflowKey)` — checks `outputs[WORKFLOW_CATALOG[workflowKey].totalSteps]` is truthy; (2) `getDraftWorkflows(statesMap)` — returns `{key, state, isSaved}[]` filtering saved drafts; (3) `getWorkflowThunks()` — returns canonical `Record<string, IWorkflowThunks>` mapping all 7 routes to their thunks (import from all slice files); (4) `buildWorkflowHref(route, workflowId)` — returns URL with `?workflowId=X` for versioned workflows or `?fresh=1` for non-versioned (`defense-memo`, `preparing-statement-of-claims`). Import `WORKFLOW_CATALOG` from `workflowCatalog.ts`.

- [x] T005 [P] Add 4 optional extensibility callbacks to `UseWorkflowOrchestratorConfig` interface in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/hooks/useWorkflowOrchestrator.ts`: `onJobCompleted?: (jobKey: string, job: AiJob, outputs: Record<number, unknown>, dispatch: Dispatch) => void`, `onStepSave?: (stepNumber: number, payload: unknown, dispatch: Dispatch) => Promise<void>`, `onError?: (error: unknown, context: string) => void`, `computeAutoResumeTarget?: (outputs: Record<number, unknown>, jobs: Record<string, AiJob>) => number`. Destructure them from config. Wire `onJobCompleted` into the AI job completion effect (after existing auto-hydration). Wire `onError` into all `.catch()` blocks replacing `catch(() => {})` with `catch((e) => { onError?.(e, context) })`. Wire `computeAutoResumeTarget` as fallback in the auto-jump effect (if provided, use its return value; otherwise use existing `maxStepAllowed` logic). Return `onStepSave` from the hook for pages to pass to children.

- [x] T006 [P] Create `UnifiedStepShell` component at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/analysisWorkflow/UnifiedStepShell.tsx` — composed wrapper that renders `<AnalysisStepShell>` as outer gate (loading/error/content triage) wrapping `<AnalysisStageLayout>` as inner layout (2/3 + 1/3 grid with sidebar). Props: all AnalysisStepShell props (`isLoading`, `hasFailed`, `errorMessage`, `onRetry`, `loadingTitle`, `loadingSubtitle`, `steps`, `currentStepIndex`) plus all AnalysisStageLayout props (`title`, `actions`, `sidebar`, `children`). Re-export all 7 sub-components from AnalysisStageLayout (`AnalysisStageSectionCard`, `AnalysisStageSidebarCard`, `AnalysisStageActionButton`, `AnalysisStageDocumentCard`, `AnalysisStageBanner`, `AnalysisStageListItem`, `AnalysisStageNumberedList`). When `isLoading` or `hasFailed`, skip rendering AnalysisStageLayout (only render the state from AnalysisStepShell).

- [x] T007 Fix `isReadOnly` not resetting on new workflow start in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/shared/createWorkflowSlice.ts` — add `state.isReadOnly = false;` to the `startWorkflow.fulfilled` handler (around line 166-175) and to the `applyWorkflowPayload` helper function (around line 126-159). This ensures starting a new version always results in editable mode (BUG-002).

**Checkpoint**: Foundation ready — shared types, constants, utils, orchestrator extensions, unified shell, and isReadOnly fix all in place. User story implementation can now begin in parallel.

---

## Phase 3: User Story 2 - Correct Version/Start/Continue Navigation (Priority: P1) 🎯 MVP

**Goal**: Fix P0 bugs that block users from navigating between tabs and starting new workflow versions.

**Independent Test**: From CaseAnalysis, click "نسخة سابقة" → history tab activates. Open a snapshot → click "بدء واحدة جديدة" → new workflow is editable.

### Implementation for User Story 2

- [x] T008 [US2] Fix tab navigation from location.state in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/CaseDetails.tsx` — add a new `useEffect` that watches `location.state` for `activeTab` changes and calls `setActiveTab`. Remove the `navigationProcessedRef` guard that blocks re-reading `location.state.activeTab` (around lines 44-60). The fix must handle: (1) initial mount reads `activeTab` from state, (2) subsequent navigations to same route with different `activeTab` in state also trigger tab switch, (3) `history.replaceState` is called to clear the state after reading to prevent stale re-triggers on browser back (BUG-001).

- [x] T009 [US2] Fix snapshot count badge refresh in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/CaseDetails.tsx` — change the snapshot count fetch from a mount-only `useEffect([id])` to a refetchable pattern. Expose a `refreshSnapshotCount` callback. Call it when `location.pathname` changes back to `/cases/:id` (detecting return from workflow pages). The badge on the analysis and history tab headers must update within 2 seconds (BUG-010).

**Checkpoint**: Tab navigation works. isReadOnly resets on new version. Snapshot badge refreshes. All 7 workflows can be started, continued, and restarted without issues.

---

## Phase 4: User Story 1 - Unified Tab Navigation / DefenseMemoPage Migration (Priority: P1)

**Goal**: Migrate DefenseMemoPage from manual implementation to `useWorkflowOrchestrator`, reducing ~300 lines of duplicated logic. All 7 workflow pages now use the same orchestration hook.

**Independent Test**: Open defense-memo workflow → step through all 5 steps → verify tab click-guarding, auto-save, AI auto-advance, and per-defense analysis cache all work identically to other 6 workflows.

### Implementation for User Story 1

- [x] T010 [US1] Rewrite DefenseMemoPage to use useWorkflowOrchestrator in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx` — replace all manual state (`useState` for active, maxStepAllowed, autoResumeTarget), manual effects (fresh/snapshot/workflowId handling, auto-save setup, SignalR, facts), and manual job hydration with the orchestrator hook. Pass config: `sliceSelector=(s)=>s.smartAnalysis`, `thunks=smartAnalysisThunks`, `restoreSnapshot`, `resetWorkflow`, `workflowPrefix='defense'`, `maxSteps=5`, `steps=DEFENSE_MEMO_STEP_DEFS` (from T002), `isCaseIdBased=true`, `abandonThunk=abandonSmartAnalysisWorkflow`, `stepNumberMapFn` mapping [0→null, 1→1, 2→2, 3→4, 4→5]. Pass `onJobCompleted` callback that handles the per-defense analysis cache (step 3 defenseExplanationCache + hydratedKey dedup logic from original lines 300-322). Pass `onStepSave` callback for `saveDefensesStep` (original lines 149-160). Pass `onError` callback that calls `toast.error()` from react-hot-toast. Pass `computeAutoResumeTarget` for the auto-resume logic (original lines 100-115). Import step definitions from `workflowConstants.ts`. Remove all inline step arrays. The component should shrink from ~447 lines to ~150 lines (depends on T002, T005, T007).

- [x] T011 [US1] Remove legacy CSS class and CSS import from DefenseMemoPage — remove the `"defense-memo"` class from the section element and remove the CSS file import at line 2 in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx`. Verify that the `"py-8 min-h-screen"` classes match the other 6 workflow pages (BUG-015).

- [x] T012 [US1] Add snapshot history button pattern to useWorkflowOrchestrator return or keep it in DefenseMemoPage as a local feature — in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx`, keep the snapshotCount fetch + history button as local logic since only DefenseMemoPage uses this pattern. The button navigates to `/cases/${caseId}` with `{ state: { activeTab: 'history' } }` which now works correctly thanks to T008.

**Checkpoint**: DefenseMemoPage uses the same orchestrator as the other 6 workflows. All tab navigation, auto-save, and AI job handling is unified. Per-defense cache logic works through callbacks.

---

## Phase 5: User Story 3 - Centralized Step Definitions and Constants (Priority: P2)

**Goal**: All consumers derive step definitions, completion checks, and thunk mappings from shared modules. Adding a new workflow requires changes to exactly 2 files.

**Independent Test**: Change a step label in `workflowConstants.ts` → verify it appears in all 7 workflow pages, CaseAnalysis, CaseSummary, DocumentSelection, and SnapshotsHistory without any other file edits.

### Implementation for User Story 3

- [x] T013 [P] [US3] Update all 7 workflow page files to import step definitions from workflowConstants — remove inline `DEFENSE_STEPS`, `STATEMENT_STEPS`, `APPEAL_STEPS`, `COMPLAINT_STEPS`, `RULING_STEPS`, `WARNING_STEPS`, `EXEC_STEPS` arrays from: `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx` (already done in T010), `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/AdminComplaintPage.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/LegalWarningPage.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/ExecRequestPage.tsx`. Each page should import from `workflowConstants.ts` and pass to both `useWorkflowOrchestrator({ steps: ... })` and `<WorkflowStepBar steps={...}>` (depends on T002).

- [x] T014 [US3] Refactor DocumentSelection to derive from WORKFLOW_CATALOG in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/DocumentSelection.tsx` — remove the hardcoded `legalAnalysisOptions` array (lines 79-129) and replace with a `WORKFLOW_CATALOG.map()` iteration. Each catalog item provides `title` (from `label`), `text` (from `description`), `stepCount` (from `totalSteps`), `link` (from `route`), and `icon` (from catalog's `icon` field — use catalog icons as canonical source, fixing BUG-017 exec-request icon mismatch). Remove the duplicate `workflowThunks` mapping (lines 46-53) and import from `workflowUtils.ts` instead. Keep the existing grid layout and card styling unchanged (depends on T004).

- [x] T015 [US3] Refactor CaseAnalysis to use shared utilities in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/CaseAnalysis.tsx` — remove local `DraftWorkflowState` type (import from `workflowTypes.ts`), remove local `FINAL_STEPS` map (use `isWorkflowCompleted` from `workflowUtils.ts`), remove local `workflowThunks` mapping (import from `workflowUtils.ts`), remove local `isWorkflowCompleted` function, remove local `drafts` array construction (use `getDraftWorkflows` from `workflowUtils.ts`), remove hardcoded `controllerMap` (lines 207-213 — derive controller name from thunks). Update `buildWorkflowHref` calls to use shared version from `workflowUtils.ts` (depends on T003, T004).

- [x] T016 [US3] Refactor CaseSummary to use shared utilities in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/CaseSummary.tsx` — remove local `DraftWorkflowState` type (import from `workflowTypes.ts`), remove local `isWorkflowCompleted` function (import from `workflowUtils.ts`), remove local `FINAL_STEPS` map. Replace with imports from shared modules (depends on T003, T004).

- [x] T017 [US3] Normalize StatementOfClaims orchestrator config in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims.tsx` — replace the custom `computeMaxStepAllowed` function (lines 47-66, `STATEMENT_COMPUTE_MAX_STEP`) with a `STATEMENT_JOB_STEP_MAP` constant mapping job keys to step indices: `StatementCaseType→1, StatementParties→2, StatementSubjects→3, StatementFacts→4, StatementLegalBasis→5, StatementRequests→6, StatementFinal→7`. Pass `jobStepMap=STATEMENT_JOB_STEP_MAP` to orchestrator instead of `computeMaxStepAllowed`. Remove the old function (BUG-013, BUG-014).

**Checkpoint**: All step definitions centralized. Adding a new workflow requires only `workflowConstants.ts` + new slice. All shared logic in one place.

---

## Phase 6: User Story 4 - Consistent Step Shell Components (Priority: P2)

**Goal**: All step components across all 7 workflows use `UnifiedStepShell` for consistent loading/error/content states.

**Independent Test**: Trigger loading state in any workflow step → same spinner. Trigger error → same error card. View completed step → consistent layout with sidebar support.

### Implementation for User Story 4

- [x] T018 [P] [US4] Migrate AdminComplaint step components from AnalysisStageLayout to UnifiedStepShell — update all 5 step files in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/` (`ComplaintStep1Classification.tsx`, `ComplaintStep2FactsDraft.tsx`, `ComplaintStep3ViolationAnalysis.tsx`, `ComplaintStep4RequestsDraft.tsx`, `ComplaintStep5FinalAssembly.tsx`). Replace `AnalysisStageLayout` import with `UnifiedStepShell` import. Wrap content in `<UnifiedStepShell isLoading={...} hasFailed={...} onRetry={...} title={...} sidebar={...}>`. Keep using `AnalysisStageSectionCard`, `AnalysisStageSidebarCard`, etc. (re-exported from UnifiedStepShell). Add loading/error props from step's AI job state (depends on T006).

- [x] T019 [P] [US4] Migrate LegalWarning step components from AnalysisStageLayout to UnifiedStepShell — update all 3 step files in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/` (`WarningStep1Classification.tsx`, `WarningStep2WarningDraft.tsx`, `WarningStep3FinalAssembly.tsx`). Same pattern as T018: replace import, wrap in UnifiedStepShell, keep sub-components (depends on T006).

- [x] T020 [P] [US4] Migrate DefenseMemo step components to UnifiedStepShell — update step files in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/` (`LegalAnalysis.tsx`, `DefensesList.tsx`, `FinalRequirements.tsx`, `FinalNote.tsx`). Replace `AnalysisStepShell` import with `UnifiedStepShell` import. Existing `AnalysisStepShell` usage becomes `UnifiedStepShell` with same loading/error props. If step content would benefit from sidebar layout, add optional `title` and `sidebar` props (depends on T006).

- [x] T021 [P] [US4] Migrate remaining 4 workflow step components to UnifiedStepShell — update step files in: `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/` (7 files), `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/` (6 files), `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/` (4 files), `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/steps/` (3 files). Replace `AnalysisStepShell` with `UnifiedStepShell` in all files. Same loading/error prop pattern (depends on T006).

**Checkpoint**: All step components across all 7 workflows use UnifiedStepShell. Loading, error, and content states are visually consistent.

---

## Phase 7: User Story 5 - Working Snapshot/Version History (Priority: P2)

**Goal**: Snapshot count badges are always current. "استكمال" button navigates to the correct workflow instance.

**Independent Test**: Create new workflow version → return to CaseDetails → badge count updated. Click "استكمال" in history → correct workflow instance loads.

### Implementation for User Story 5

- [x] T022 [US5] Wire snapshot count refresh into CaseDetails navigation listener in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/CaseDetails.tsx` — the `refreshSnapshotCount` function from T009 must be called when the user returns from a workflow page. Use a `useEffect` watching `location.key` or `navigationType` to detect returns. Also refresh when a workflow version operation is detected via Redux state change (watch for changes in any workflow slice's `status` field) (depends on T009) (BUG-010).

- [x] T023 [US5] Fix SnapshotsHistory "استكمال" button to pass workflowId for versioned workflows in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy-dashboard/src/pages/cases/subPagesCases/SnapshotsHistory.tsx` — for the 5 versioned workflows (appeal-brief, admin-complaint, ruling-analysis, legal-warning, exec-request), append `?workflowId=${currentVersion.workflowId}` to the navigation URL. For the 2 non-versioned workflows (defense-memo, preparing-statement-of-claims), keep the current URL without query param. Use `buildWorkflowHref` from `workflowUtils.ts` (depends on T004) (BUG-011).

**Checkpoint**: Snapshot badges always current. Navigation from history loads correct instance.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, error handling standardization, and verification.

- [x] T024 [P] Standardize error toast for abandon failures in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/hooks/useWorkflowOrchestrator.ts` — verify all `.catch()` blocks now call `onError?.(error, 'abandon')` or `onError?.(error, 'fetch')` instead of silently swallowing errors. Ensure DefenseMemoPage passes `onError` that calls `toast.error()`. Verify other 6 pages also show error toasts (they should via the orchestrator's onError callback) (BUG-016).

- [x] T025 [P] Canonicalize exec-request icon in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/workflowCatalog.ts` — ensure the `icon` field for exec-request matches what DocumentSelection now renders (after T014, DocumentSelection reads from catalog). Pick one canonical icon and remove the mismatch (BUG-017).

- [x] T026 Run lint and typecheck on all changed files — execute `cd apps/lawyer-dashboard && npm run lint && npx tsc --noEmit`. Fix any type errors introduced by the refactoring (new imports, changed interfaces, removed code). Ensure no regressions.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: No dependencies on Phase 1 — can start immediately
- **US2 Navigation (Phase 3)**: Depends on T007 (isReadOnly fix) from Phase 2
- **US1 DefenseMemoPage (Phase 4)**: Depends on T002 (step defs), T005 (orchestrator callbacks), T007 (isReadOnly fix) from Phase 2. Depends on T008 (tab fix) from Phase 3 for history button
- **US3 Centralized Constants (Phase 5)**: Depends on T002, T003, T004 from Phase 2
- **US4 Shell Unification (Phase 6)**: Depends on T006 (UnifiedStepShell) from Phase 2
- **US5 Snapshot History (Phase 7)**: Depends on T004 (workflowUtils), T009 (badge refresh) from Phase 2/3
- **Polish (Phase 8)**: Depends on all previous phases

### User Story Dependencies

```
Phase 2 (Foundational)
  ├── Phase 3 (US2) → Phase 4 (US1)
  ├── Phase 5 (US3) [parallel with US1, US4, US5]
  ├── Phase 6 (US4) [parallel with US1, US3, US5]
  └── Phase 7 (US5) [parallel with US1, US3, US4]
Phase 8 (Polish) [after all]
```

### Within Each User Story

- Foundational types/utils before consumer refactoring
- Shared module creation before consumer migration
- Page-level refactoring before step-level migration

### Parallel Opportunities

- **Phase 2**: T002, T003, T004, T005, T006 can all run in parallel (different files)
- **Phase 5**: T013 tasks (7 pages) can run in parallel (different files each)
- **Phase 6**: T018, T019, T020, T021 can all run in parallel (different workflow directories)
- **Phase 8**: T024, T025, T026 can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all foundational tasks together:
Task T002: "Expand step definitions in workflowConstants.ts"
Task T003: "Add DraftWorkflowState to workflowTypes.ts"
Task T004: "Create workflowUtils.ts"
Task T005: "Add callbacks to useWorkflowOrchestrator"
Task T006: "Create UnifiedStepShell.tsx"
```

## Parallel Example: Phase 6 (Shell Unification)

```bash
# Launch all shell migrations together:
Task T018: "Migrate AdminComplaint steps"
Task T019: "Migrate LegalWarning steps"
Task T020: "Migrate DefenseMemo steps"
Task T021: "Migrate remaining 4 workflow steps"
```

---

## Implementation Strategy

### MVP First (Phases 1-3)

1. Complete Phase 2: Foundational
2. Complete Phase 3: US2 (P0 bug fixes)
3. **STOP and VALIDATE**: Verify tab navigation and isReadOnly fix work
4. Deploy if needed — P0 bugs are fixed

### Incremental Delivery

1. Phase 2+3 → P0 bugs fixed (MVP!)
2. + Phase 4 → DefenseMemoPage unified (biggest code reduction)
3. + Phase 5 → All constants centralized (maintenance win)
4. + Phase 6 → All shells unified (visual consistency)
5. + Phase 7 → Snapshot history working (data integrity)
6. + Phase 8 → Polish and verification

---

## Notes

- Tasks T002-T006 in Phase 2 are all parallel-safe (different files, no cross-dependencies)
- DefenseMemoPage rewrite (T010) is the largest single task — allow extra time
- When migrating step components to UnifiedStepShell, preserve all existing sub-component usage (SectionCard, SidebarCard, etc.)
- All `workflowConstants.ts` existing exports must remain for backward compat during migration
- No backend changes in any task — frontend-only refactoring
- BUG-017 (icon mismatch) is implicitly fixed by T014 + T025
