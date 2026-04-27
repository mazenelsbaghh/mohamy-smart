# Tasks: Unify Workflow Architecture

**Input**: Design documents from `/specs/065-unify-workflow-arch/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file path(s) in descriptions
- Keep each task small enough for a low-cost LLM to execute without architectural guesswork
- Prefer one artifact per task; if needed, keep to at most 3 explicit file paths
- Use concrete verbs such as `Add`, `Implement`, `Wire`, `Update`, `Create`, `Validate`

## Path Conventions

All paths are relative to `apps/lawyer-dashboard/src/` within the monorepo root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend shared hooks and utilities needed by multiple user stories.

- [ ] T001 Add optional `stepMapFn` parameter to `useWorkflowSnapshotLoader` hook in `hooks/useWorkflowSnapshotLoader.ts` — accept `(step: number) => number`, default to identity function; apply `stepMapFn(rawStep)` when computing the tab index from snapshot data before calling `onLoaded`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: N/A — no blocking prerequisites beyond Phase 1. The `stepMapFn` addition in Phase 1 is the only shared infrastructure change needed.

**Checkpoint**: Phase 1 complete — user story implementation can begin

---

## Phase 3: User Story 1 - Unified Resume Experience (Priority: P1) 🎯 MVP

**Goal**: All 7 workflow pages resume at the correct step when clicking "استكمال النسخة الحالية".

**Independent Test**: Start any workflow, complete steps 1-3, navigate away, return via "استكمال", verify the active step matches the last completed step.

**Status**: ✅ Already implemented in prior quick-fix commits. DefenseMemoPage auto-resume now checks outputs first then AI jobs; CaseAnalysis passes `workflowId` in the resume link. No additional tasks required for this user story.

---

## Phase 4: User Story 2 - Consistent Snapshot Viewing (Priority: P2)

**Goal**: All 7 workflow pages use `useWorkflowSnapshotLoader` for loading snapshots, and defense-memo snapshots come from DB instead of localStorage.

**Independent Test**: Create a snapshot for any workflow, navigate to it via version history, verify the version label appears and data loads correctly.

### Implementation for User Story 2

- [ ] T002 [US2] Replace inline snapshot loading in `pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx` with `useWorkflowSnapshotLoader` hook call — import the hook, wire `snapshotId` from URL params, pass `restoreWorkflowSnapshot` action, `resetAnalysis` as `resetWorkflow`, `stepMapFn: (s) => s <= 2 ? s : Math.min(s - 1, 4)` (maps steps 1-5 to tabs 1-4 with step 3 → tab 2), remove the manual `useEffect` that fetches `/WorkflowSnapshots/{id}` and dispatches inline

- [ ] T003 [P] [US2] Replace inline snapshot loading in `pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims.tsx` with `useWorkflowSnapshotLoader` hook call — import the hook, wire `snapshotId` from URL params, pass `restoreStatementSnapshot` action, `resetStatementOfClaims` as `resetWorkflow`, remove the manual `useEffect` that fetches `/WorkflowSnapshots/{id}` and dispatches inline

- [ ] T004 [US2] Migrate defense-memo snapshot reading in `pages/cases/subPagesCases/CaseSummary.tsx` from localStorage to DB — replace `getDefenseMemoSnapshots(caseId)` (lines 47-59) with reading from `draft.state.workflowVersions` (the same Redux path used by all other workflows), remove the `getDefenseMemoSnapshots` helper function, remove the `localStorage` import/usage for defense-memo snapshots

**Checkpoint**: User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Clean State Between Workflows (Priority: P2)

**Goal**: Zero state leaks between workflow pages — navigating away from any workflow fully resets its state.

**Independent Test**: Open a defense-memo workflow with data, navigate to a different case's workflow, return to the first case, verify no stale data appears.

**Status**: ✅ Already implemented in prior quick-fix commits. DefenseMemoPage and PreparingStatementOfClaims both dispatch reset actions on unmount. `useWorkflowAutoSave` has `mountedRef` guard. No additional tasks required for this user story.

---

## Phase 6: User Story 4 - Unified Fact Selection (Priority: P3)

**Goal**: DefenseMemoPage uses `useWorkflowFacts` hook for fact selection and persistence across refreshes.

**Independent Test**: Select facts in defense-memo, refresh the page, verify selections are restored.

### Implementation for User Story 4

- [ ] T005 [US4] Migrate DefenseMemoPage from inline fact management to `useWorkflowFacts` hook in `pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx` — import `useWorkflowFacts`, replace the `caseFacts`/`selectedFacts`/`finalFacts` useState declarations with the hook's return values (`facts`, `selectedFacts`, `toggleFact`, `addFact`), wire `toggleFact` into the facts tab checkboxes, wire `addFact` into the add-fact form, remove inline `parseCaseFacts` usage; ensure the hook receives `caseId` and `workflowType: "defense-memo"` for localStorage scoping

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup after all user stories are complete.

- [ ] T006 [P] Run TypeScript type checking with `npx tsc -b` in `apps/lawyer-dashboard/` — fix any type errors introduced by the refactoring
- [ ] T007 [P] Run linting with `npm run lint` in `apps/lawyer-dashboard/` — fix any lint errors introduced by the refactoring
- [ ] T008 Validate all 7 workflow resume flows per quickstart.md in `specs/065-unify-workflow-arch/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **US1 (Phase 3)**: Already complete — no action needed
- **US2 (Phase 4)**: Depends on Phase 1 (T001: `stepMapFn` in `useWorkflowSnapshotLoader`)
- **US3 (Phase 5)**: Already complete — no action needed
- **US4 (Phase 6)**: No dependencies on other user stories — can run in parallel with US2
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: ✅ Complete
- **US2 (P2)**: Depends on T001 (stepMapFn)
- **US3 (P2)**: ✅ Complete
- **US4 (P3)**: No dependencies — independently implementable

### Within Each User Story

- T001 must complete before T002 (DefenseMemoPage needs `stepMapFn`)
- T002 and T003 can run in parallel (different files)
- T004 is independent of T002/T003 (CaseSummary is a different file)
- T005 is independent of T002-T004 (different concern)

### Parallel Opportunities

```
After T001 completes:
  T002 (DefenseMemoPage snapshot hook) ──┐
  T003 (PreparingStatementOfClaims snapshot hook) ──┤── All in parallel
  T004 (CaseSummary DB snapshots) ──┤
  T005 (DefenseMemoPage useWorkflowFacts) ──┘
```

---

## Parallel Example: User Story 2

```bash
# After T001 completes, launch all US2 tasks together:
Task: "T002 Replace inline snapshot loading in DefenseMemoPage.tsx with useWorkflowSnapshotLoader"
Task: "T003 Replace inline snapshot loading in PreparingStatementOfClaims.tsx with useWorkflowSnapshotLoader"
Task: "T004 Migrate CaseSummary.tsx defense-memo snapshots from localStorage to DB"

# T005 (US4) can also run in parallel since it touches different code:
Task: "T005 Migrate DefenseMemoPage from inline fact management to useWorkflowFacts hook"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ US1 already complete — resume correctness works for all 7 workflows

### Incremental Delivery

1. ~~Complete US1~~ ✅ Already done
2. Complete Phase 1 (T001) → Foundation for US2
3. Complete US2 (T002-T004) → Snapshot viewing unified
4. Complete US4 (T005) → Fact selection unified
5. Complete Phase 7 (T006-T008) → Validation and polish

### Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1: Setup | T001 | Pending |
| Phase 3: US1 (P1) | — | ✅ Complete |
| Phase 4: US2 (P2) | T002, T003, T004 | Pending |
| Phase 5: US3 (P2) | — | ✅ Complete |
| Phase 6: US4 (P3) | T005 | Pending |
| Phase 7: Polish | T006, T007, T008 | Pending |

**Total tasks**: 8 (1 setup + 3 US2 + 1 US4 + 3 polish)
**Parallel opportunities**: T002, T003, T004, T005 can all run in parallel after T001

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US3 are already complete from prior quick-fix commits
- The `stepMapFn` for defense-memo maps: step 1→1, 2→2, 3→2 (per-defense cache not a tab), 4→3, 5→4
- DefenseMemoPage keeps `stepNumber: active + 1` pattern (research Decision 5)
- No backend changes required — all changes are frontend-only
- Commit after each task or logical group
