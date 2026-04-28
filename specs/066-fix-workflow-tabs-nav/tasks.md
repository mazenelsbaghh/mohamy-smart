# Tasks: مراجعة وإصلاح مسارات العمل (Workflow Tabs & Step Navigation)

**Branch**: `066-fix-workflow-tabs-nav` | **Date**: 2026-04-28
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

## Implementation Strategy

**MVP**: Phase 1 (bug fixes) delivers immediate user-facing value — fixes a crash, a typo, and a re-render flash. Phases 2-4 refactor incrementally, one workflow page at a time, so each can be tested independently before proceeding.

## Dependencies

```text
Phase 1 (Bug Fixes) ──→ independent, ship immediately
    │
Phase 2 (Foundations) ──→ depends on nothing
    │
Phase 3 (US1) ──→ depends on Phase 2 (useWorkflowOrchestrator)
    │
Phase 4 (US2+US3) ──→ depends on Phase 2, can run in parallel with Phase 3
    │
Phase 5 (US4+US5) ──→ depends on Phase 2, can run in parallel with Phase 3+4
    │
Phase 6 (Polish) ──→ depends on all prior phases
```

## Parallel Execution Opportunities

- Phase 1: All 4 bug-fix tasks are parallelizable (different files)
- Phase 3-5: Workflow page refactors within each phase are parallelizable after the first page in each group is validated
- T012-T018 (7 page refactors) can run in parallel after T008 is verified on ExecRequestPage

---

## Phase 1: Bug Fixes (Immediate — no dependencies)

> **Goal**: Fix 4 blocking bugs that cause crashes, typos, and UI glitches.
> **Independent Test**: Open each affected page, verify no console errors, correct Arabic text, no loading flash.

- [x] T001 [P] Add missing SmartAnalysisLoader import in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx`. Add `import SmartAnalysisLoader from '../../../../../components/skeleton/SmartAnalysisLoader';` at the top with other imports. This fixes a runtime crash when the appeal brief workflow loads.
- [x] T002 [P] Fix Arabic hamza typo in `apps/lawyer-dashboard/src/components/header/CaseHeaderBanner.tsx`. Change `ابدء التحليل الذكي` to `ابدأ التحليل الذكي` on line 45 (hamza on top of alif, not on the letter).
- [x] T003 [P] Fix location.state re-render flash in `apps/lawyer-dashboard/src/pages/cases/CaseDetails.tsx`. Remove `location.state` from the useEffect dependency array on line 64. Add a `useRef<boolean>` to track if navigation state has been processed — only read `location.state` once on mount, then ignore subsequent state changes. Keep `id` and `dispatch` in the dependency array.
- [x] T004 [P] Set `hideDocsButton={true}` on all 7 workflow pages' `<CaseHeaderBanner>` components. Currently `false` in: `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx`, `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/AdminComplaintPage.tsx`, `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage.tsx`. The other 4 pages already use `true`. Verify all 7 use `hideDocsButton={true}` after change.

---

## Phase 2: Foundational (Shared Hook + Constants)

> **Goal**: Create the `useWorkflowOrchestrator` hook and shared tab classNames constant that all 7 workflow pages will consume.
> **Independent Test**: Hook compiles without TypeScript errors. Import and call from a single workflow page to verify return shape matches `UseWorkflowOrchestratorReturn`.

- [x] T005 Add `WORKFLOW_TAB_CLASSNAMES` constant and `WORKFLOW_TAB_PROPS` shared config in `apps/lawyer-dashboard/src/components/analysisWorkflow/workflowConstants.ts`. Extract the identical HeroUI `<Tabs>` classNames object that is copy-pasted across all 7 workflow pages. Use standardized dark mode value `dark:app-text-subtle` for unselected tabContent. Also export a `WORKFLOW_TAB_PROPS` object with `disableAnimation: true, variant: 'light', color: 'primary'` to eliminate repeated props.

- [x] T006 Define TypeScript interfaces `UseWorkflowOrchestratorConfig<TOutputs>` and `UseWorkflowOrchestratorReturn<TOutputs>` in `apps/lawyer-dashboard/src/hooks/useWorkflowOrchestrator.ts`. Follow the data-model.md spec exactly. Config includes: `sliceSelector`, `thunks`, `restoreSnapshot`, `resetWorkflow`, `workflowPrefix`, `maxSteps`, `steps`, optional `isCaseIdBased`, `abandonThunk`, `stepNumberMapFn`, `computeMaxStepAllowed`. Return includes: `active`, `setActive`, `nextStep`, `prevStep`, `maxStepAllowed`, `caseId`, `workflowId`, `isFreshRun`, `isReadOnly`, `snapshotModeRef`, `workflowState`, `singleCase`, `caseFacts`, `setCaseFacts`, `selectedFacts`, `setSelectedFacts`, `handleManualSave`, `isLoading`, `tabsClassNames`, `isSavingStep`.

- [x] T007 Implement the `useWorkflowOrchestrator` hook body in `apps/lawyer-dashboard/src/hooks/useWorkflowOrchestrator.ts`. Encapsulate these 13 patterns that are currently duplicated across all 7 pages:
  1. URL param extraction: `caseId` from `useParams` or pathname split, `workflowId` from searchParams, `snapshotId`, `isFreshRun`
  2. Redux state selection via `sliceSelector`
  3. `useWorkflowSnapshotLoader` call with `restoreSnapshot`, `resetWorkflow`, `fallbackStep`
  4. `useAiJobSignalR(caseId, isFreshRun, workflowState.createdAt)`
  5. `useWorkflowFacts({ workflowPrefix, caseId })`
  6. `useWorkflowAutoSave({ mode: 'immediate', onSave })` where `onSave` uses `thunks.saveDraftStep` with `routeId = isCaseIdBased ? (workflowState.caseId ?? caseId) : workflowId`, and `stepNumber = stepNumberMapFn ? stepNumberMapFn(active) : active`
  7. Auto-save triggering `useEffect` on `currentStepOutput` changes (guard: `active > 0 && routeId && !isReadOnly`)
  8. `handleManualSave` callback that flushes auto-save
  9. Case fetch `useEffect`: `dispatch(thunkGetSingleCase({ id: caseId }))` when caseId changes
  10. Workflow lifecycle `useEffect`: reset slice, then handle fresh-run (startWorkflow + redirect, or abandonThunk + navigate), then selectedWorkflowId lookup, then get-or-create pattern. Guard with `snapshotModeRef.current`
  11. Reset on unmount `useEffect`: `dispatch(resetWorkflow())`
  12. Active step management: `useState(0)`, `nextStep()`, `prevStep()`, auto-jump `useEffect` that sets `active` to `maxStepAllowed` on first load (skip if `isFreshRun`)
  13. `maxStepAllowed` computation: cascading if/else checking outputs then AI job statuses. Use `computeMaxStepAllowed` override if provided, otherwise derive from `outputs` keys and `aiJobs.jobs`
  14. `isLoading = workflowState.loadingState.isFetchingWorkflow || (!workflowState.workflowId && !isCaseIdBased)`
  Return `tabsClassNames` from the constant created in T005. Ensure all `useEffect` dependencies are correct and exhaustive.

---

## Phase 3: User Story 1 — بدء مسار عمل جديد من الصفر (P1)

> **Goal**: Every workflow page shows SmartAnalysisLoader while loading, starts from step 0 on fresh runs, and all 7 pages use the shared hook.
> **Independent Test**: Navigate to any case → click "ابدأ التحليل الذكي" → select any workflow → verify loader appears then step 0 renders. Test all 7 workflows.

- [x] T008 [US1] Refactor `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/ExecRequestPage.tsx` to use `useWorkflowOrchestrator`. This is the simplest page (4 steps, workflowId-based). Replace all duplicated logic with the hook call. Keep only: step array definition, renderedStep JSX array, and the return JSX with `<Tabs>` using `tabsClassNames` from the hook. Verify `isLoading` gates the SmartAnalysisLoader rendering. After refactoring, test: fresh run, resume, tab navigation, auto-save.

- [x] T009 [US1] Refactor `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/LegalWarningPage.tsx` to use `useWorkflowOrchestrator`. Same pattern as T008. Config: `maxSteps: 3`, `workflowPrefix: 'warning'`. (depends on T007, T008 for validated pattern)

- [x] T010 [US1] Refactor `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage.tsx` to use `useWorkflowOrchestrator`. Config: `maxSteps: 4`, `workflowPrefix: 'ruling'`. (depends on T007)

- [x] T011 [US1] Refactor `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/AdminComplaintPage.tsx` to use `useWorkflowOrchestrator`. Config: `maxSteps: 5`, `workflowPrefix: 'admin-complaint'`. (depends on T007)

- [x] T012 [US1] Refactor `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx` to use `useWorkflowOrchestrator`. Config: `maxSteps: 6`, `workflowPrefix: 'appeal'`. This page had the missing SmartAnalysisLoader import (fixed in T001) — verify the loader renders correctly after refactoring. (depends on T001, T007)

- [x] T013 [US1] Refactor `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims.tsx` to use `useWorkflowOrchestrator`. Config: `maxSteps: 7`, `workflowPrefix: 'statement'`, `isCaseIdBased: true`, `abandonThunk: abandonStatementOfClaimsWorkflow`. This page currently has no loading state — the refactored version MUST show SmartAnalysisLoader when `isLoading` is true. Uses `hasInitializedActive` ref pattern — replace with the hook's built-in auto-jump. (depends on T007)

- [x] T014 [US1] Refactor `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx` to use `useWorkflowOrchestrator`. Config: `maxSteps: 4`, `workflowPrefix: 'defense-memo'`, `isCaseIdBased: true`, `abandonThunk: abandonSmartAnalysisWorkflow`, `stepNumberMapFn: (active) => active === 1 ? 1 : active === 2 ? 2 : active === 3 ? 4 : active === 4 ? 5 : null`. This is the most complex page — keep the DefenseMemo-specific AI job hydration logic (`parseWorkflowJobResult`, `hydrateStep` calls, `freshRunRef`, `defenseExplanationCache`) OUTSIDE the hook in the page component. The page currently has no loading state — the refactored version MUST show SmartAnalysisLoader when `isLoading` is true. (depends on T007)

---

## Phase 4: User Stories 2+3 — استكمال + التنقل بين التابات (P1)

> **Goal**: Auto-resume lands on correct step, tab navigation guards work consistently, auto-save preserves data on tab switches.
> **Independent Test**: Start a workflow, complete 2 steps, leave, return via "استكمال" → verify lands on correct step. Click backward tabs → verify navigation works. Click forward disabled tab → verify blocked.

- [x] T015 [US2] Verify auto-resume behavior is consistent across all 7 workflow pages after refactoring. For each page: start a workflow, complete steps 0-1, leave, return — confirm the page auto-jumps to `maxStepAllowed` (the furthest step with data). Test with active AI jobs to verify auto-resume targets the step with the running job. Test after page refresh. No code changes expected — this is a manual verification pass using the hook's built-in auto-jump logic from T007.

- [x] T016 [US3] Verify tab navigation guards work correctly across all 7 workflow pages after refactoring. For each page: navigate to a middle step, verify backward tabs are clickable and navigate correctly, verify forward tabs beyond `maxStepAllowed` are disabled. Verify auto-save fires on tab switch (check network tab for PATCH requests). No code changes expected — the navigation guard logic `step <= Math.max(active, maxStepAllowed)` is built into the hook's `setActive` wrapper.

---

## Phase 5: User Stories 4+5 — بدء نسخة جديدة + مراجعة نسخة سابقة (P2+P3)

> **Goal**: Fresh-run clears old data and starts from step 0. Snapshot viewing opens all tabs in read-only mode.
> **Independent Test**: Complete a workflow → click "بدء واحدة جديدة" → verify fresh workflow from step 0. Open a snapshot → verify all tabs navigable and read-only.

- [x] T017 [US4] Verify fresh-run flow works across all 7 workflow pages after refactoring. For each page: start a workflow, complete some steps, go back to case analysis, click "بدء واحدة جديدة" → confirm Redux state is reset, old data cleared from UI, and page starts from step 0. For workflowId-based pages: verify redirect to `?workflowId=X`. For caseId-based pages (DefenseMemo, StatementOfClaims): verify abandon+redirect. No code changes expected — fresh-run logic is in the hook.

- [x] T018 [US5] Verify snapshot viewing works across all 7 workflow pages after refactoring. Navigate to SnapshotsHistory, click a snapshot → verify all tabs are navigable, content renders correctly, and editing is blocked (read-only mode). Verify `isLoading` is false when viewing snapshots (snapshot data loads via `useWorkflowSnapshotLoader`, not the standard hydration path). No code changes expected — snapshot logic is in the hook.

---

## Phase 6: Polish & Cross-Cutting

> **Goal**: Final cleanup — consistent dark mode, remove unused code, lint/typecheck pass.

- [x] T019 Remove unused `AnalysisWorkflowShell.tsx` component at `apps/lawyer-dashboard/src/components/analysisWorkflow/AnalysisWorkflowShell.tsx`. Verify no imports reference this file before deleting.

- [x] T020 Run `npm run lint` and `npm test` from repo root to verify no TypeScript errors, no lint warnings, and no test failures after all refactoring. Fix any issues found.
