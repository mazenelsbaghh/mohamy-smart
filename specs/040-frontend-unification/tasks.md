# Tasks: Frontend Unification

**Input**: Design documents from `/specs/040-frontend-unification/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Path Conventions

All paths are relative to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new project setup is needed. The shared infrastructure (`createWorkflowSlice`, `createWorkflowThunks`, `useAnalysisStep`, `AnalysisStepShell`, `SmartAnalysisLoader`) already exists. This phase contains zero tasks.

**Checkpoint**: Foundation already ready — user story implementation can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: There are no blocking cross-story prerequisites. The `smartAnalysisSlice.ts` already uses `createWorkflowSlice`. All shared utilities are in place. The three user stories are independent.

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 3 - Dead Code Removal (Priority: P2) 🎯 Do First

**Goal**: Delete the legacy `rulingAnalysis` slice (122 lines), its 4 unused thunks, and remove all references from the store. The `rulingAnalysisAiSlice.ts` is the MODERN slice used by the `RulingAnalysisPage` — it MUST NOT be deleted.

> **IMPORTANT**: US3 is executed first (before US1/US2) because removing the dead legacy `rulingAnalysis` reducer from the store changes the `RootState` type, which could cause merge conflicts if done later. Do this cleanup first so the store is clean for all subsequent work.

**Independent Test**: Run `npx tsc --noEmit` from the dashboard root. Zero errors. Run `npm run build` — no bundle includes `RulingAnalysis.ts` or any of the 4 deleted thunks.

### Implementation for User Story 3

- [x] T001 [US3] Delete the legacy Ruling Analysis slice file at `src/redux/rulingAnalysis/RulingAnalysis.ts`. This is the old manually-written slice (122 lines, using `thunkStartRulingWorkflow`, `thunkGetRulingWorkflow`, etc.). Do NOT delete `rulingAnalysisAiSlice.ts` — that file is the modern hydration slice actively used by `RulingAnalysisPage.tsx`.

- [x] T002 [P] [US3] Delete the 4 legacy thunk files inside `src/redux/rulingAnalysis/thunk/`. Delete ALL of these files:
  - `src/redux/rulingAnalysis/thunk/thunkGetRulingWorkflow.ts`
  - `src/redux/rulingAnalysis/thunk/thunkRunRulingStep.ts`
  - `src/redux/rulingAnalysis/thunk/thunkSaveEditedRulingStep.ts`
  - `src/redux/rulingAnalysis/thunk/thunkStartRulingWorkflow.ts`
  After deletion, remove the now-empty `src/redux/rulingAnalysis/thunk/` directory.

- [x] T003 [US3] Remove the legacy `rulingAnalysis` reducer from the Redux store in `src/redux/store.ts`. Specifically:
  1. Delete the import on line 19: `import rulingAnalysisReducer from './rulingAnalysis/RulingAnalysis';`
  2. Delete the reducer entry on line 43: `rulingAnalysis: rulingAnalysisReducer,`
  Keep the `rulingAnalysisAi: rulingAnalysisAiReducer` import (line 20) and reducer entry (line 46) — those are the MODERN slice still actively used. (depends on T001, T002)

- [x] T004 [US3] Verify TypeScript compilation succeeds after dead code removal. Run `npx tsc --noEmit` from `mohamy-smart-lawyer-dashboard/` root. Fix any import errors that appear (there should be none since `RulingAnalysis.ts` was not imported anywhere except `store.ts`). (depends on T003)

**Checkpoint**: Dead code removed. Store is clean. `RulingAnalysisPage` still works via the modern `rulingAnalysisAi` slice.

---

## Phase 4: User Story 1 - Defense Memo (SmartAnalysis Phase 1) Unification (Priority: P1) 🎯 MVP

**Goal**: The `smartAnalysisSlice.ts` already uses `createWorkflowSlice` — no slice rewrite is needed. This story focuses on: (a) replacing the Mantine `<Loader>` import in `DefenseMemoPage.tsx` with `SmartAnalysisLoader`, and (b) verifying the step components already integrate correctly with the AI Jobs + SignalR pattern.

**Independent Test**: Navigate to the Defense Memo page in the dashboard, start a workflow, and verify all 5 steps render correctly with the standard `SmartAnalysisLoader` instead of the old Mantine orange loader.

### Implementation for User Story 1

- [x] T005 [US1] Replace the Mantine `<Loader>` with `<SmartAnalysisLoader>` in `src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx`. Specifically:
  1. Remove the import on line 4: `import { Loader } from '@mantine/core';`
  2. Add an import: `import SmartAnalysisLoader from '../../../../../components/skeleton/SmartAnalysisLoader';`
  3. Replace the JSX block on lines 109-112 that renders `<Loader size="xl" color="orange" />` with `<SmartAnalysisLoader title="جاري تحميل بيانات التحليل..." subtitle="يتم استرجاع حالة مذكرة الدفاع للقضية الحالية." />`.
  The outer wrapping `<section>` and conditional `{isFetchingSummary && (...)}` stay as-is — only the inner content changes.

- [x] T006 [US1] Verify that all 5 Defense Memo step components already use the correct `SmartAnalysisLoader` and AI Jobs pattern. Open each of the following files and confirm they do NOT import any legacy thunks (they should import from `smartAnalysisSlice` or `aiJobs` only):
  - `src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FactsReview.tsx` — already uses `thunkSubmitAiJob` and `SmartAnalysisLoader` ✓
  - `src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/LegalAnalysis.tsx`
  - `src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/DefensesList.tsx`
  - `src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalRequirements​.tsx`
  - `src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx`
  If any of these import from legacy thunks or use non-standard loaders, refactor them to use `thunkSubmitAiJob` + `SmartAnalysisLoader`. Document findings as inline code comments.

- [x] T007 [US1] Verify TypeScript compilation succeeds after Defense Memo changes. Run `npx tsc --noEmit`. Fix any type or import errors. (depends on T005, T006)

**Checkpoint**: Defense Memo (Phase 1) fully uses the unified pattern. Mantine Loader is removed from this page.

---

## Phase 5: User Story 2 - Statement of Claims (Phase 2) Redux Migration (Priority: P1)

**Goal**: Replace the legacy `preparingStatementOfClaimsSlice.ts` (371 lines, manual `extraReducers` for 12 thunks) with a new slice built using `createWorkflowSlice`. Delete all 12 legacy thunk files. Update all 7 step components (6 AI steps + 1 final assembly) plus the orchestrator page to use the new slice's state shape. The new slice must use `camelCase` property keys matching the backend `System.Text.Json` output.

**Independent Test**: Navigate to the Statement of Claims page, start a workflow for a case, and verify all 7 steps render correctly. Each step should show `SmartAnalysisLoader` while processing and display `camelCase` data correctly when complete.

### Implementation for User Story 2

#### Step A: Create the new unified slice

- [x] T008 [US2] Create a new unified slice file at `src/redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice.ts`. This file must:
  1. Import `createWorkflowSlice` from `../../shared/createWorkflowSlice`.
  2. Import `createWorkflowThunks` from `../../shared/createWorkflowThunks`.
  3. Define typed `TStepOutputs` interface with 6 step output types (all using `camelCase` keys):
     - Step 1: `TCaseDetails` (keys: `caseId`, `caseMainType`, `caseSubType`, `courtType`, `proceduralNature`, `isUrgentOrSummary`, `justificationSummary`)
     - Step 2: `TLawsuitParties` (keys: `caseId`, `parties` array with `id`, `name`, `role`, `type`, `legalCapacity`, `address`, `nationalId`)
     - Step 3: `TLawsuitSubjects` (keys: `caseId`, `subjectTitle`, `subjectFullText`)
     - Step 4: `TLawsuitFact` (key: `factsNarrative`)
     - Step 5: `TLawsuitLegalBasis` (keys: `caseId`, `legalTexts` array, `cassationRulings` array — use `camelCase` sub-keys)
     - Step 6: `TLawsuitRequests` (keys: `caseId`, `principalRequests`, `subsidiaryRequests`, `proceduralRequests` — use `camelCase` sub-keys)
  4. Create thunks: `export const statementOfClaimsThunks = createWorkflowThunks('PreparingStatementOfClaims');`
  5. Create slice: `export const statementOfClaimsSlice = createWorkflowSlice<TStepOutputs>({ name: 'preparingStatementOfClaims', initialOutputs: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null }, thunks: statementOfClaimsThunks, maxSteps: 6 });`
  6. Export actions: `export const { hydrateStep: hydrateStatementStep, resetWorkflow: resetStatementOfClaims } = statementOfClaimsSlice.actions;`
  7. Export default: `export default statementOfClaimsSlice.reducer;`
  
  **CRITICAL**: Keep the existing types (`TCaseDetails`, `TLawsuitParty`, `TLawsuitParties`, `TLawsuitSubjects`, `TLawsuitLegalBasis`, `TLawsuitRequests`) from the old slice but ensure all property keys are `camelCase` (they already are in the old file). Copy the type definitions from the old `preparingStatementOfClaimsSlice.ts` lines 17-87.

- [x] T009 [US2] Update `src/redux/store.ts` to use the new unified slice. Specifically:
  1. Change the import on line 7 from `import preparingStatementOfClaimsSlice from './analysis/preparingStatementOfClaims/preparingStatementOfClaimsSlice';` to `import preparingStatementOfClaimsSlice from './analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';`
  2. Keep the reducer key as `preparingStatementOfClaimsSlice: preparingStatementOfClaimsSlice` (same key name to minimize downstream breakage).
  (depends on T008)

#### Step B: Update step components to use new state shape

The new slice stores step outputs as `outputs[1]`, `outputs[2]`, etc. (from `TypedWorkflowState`), instead of named fields like `lawsuitCaseType`, `lawsuitParties`, etc. Each step component must be updated to read from `outputs[N]` and use `useAnalysisStep` + `AnalysisStepShell` for loading/error states. Each step also uses `thunkSubmitAiJob` so only the **state reading** pattern changes.

- [x] T010 [US2] Update `src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/LawsuitCaseType.tsx` to use the new unified slice state. Changes:
  1. Replace import of `hydrateLawsuitCaseType, clearLawsuitCaseType` from the old slice with `hydrateStatementStep` from `../../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice`.
  2. Also import the `TCaseDetails` type from the new slice.
  3. Change state selector from `useAppSelector((state) => state.preparingStatementOfClaimsSlice)` to read `useAppSelector((state) => state.preparingStatementOfClaimsSlice.outputs[1])` as `TCaseDetails | null`. The `loading` state changes to `useAppSelector((state) => state.preparingStatementOfClaimsSlice.loadingState)`.
  4. Update the hydration `dispatch(hydrateLawsuitCaseType({...}))` call to `dispatch(hydrateStatementStep({ stepNumber: 1, result: {...} }))`.
  5. Update the "clear" call `dispatch(clearLawsuitCaseType())` to dispatch the `resetWorkflow` action (or set step 1 to null via `hydrateStatementStep`).
  6. Replace loading checks from `loading === 'pending'` to `loadingState.isRunningStep` or equivalent.
  7. Replace `loading === 'succeeded'` with a check like `lawsuitCaseType !== null`.
  (depends on T008, T009)

- [x] T011 [US2] Update `src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/LawsuitParties.tsx` to use the new unified slice state. Changes:
  1. Replace import of `hydrateLawsuitParties` with `hydrateStatementStep` from the new unified slice.
  2. Import `TLawsuitParties` type from the new unified slice.
  3. Change state selector to read from `state.preparingStatementOfClaimsSlice.outputs[2]` as `TLawsuitParties | null`.
  4. Update hydration dispatch from `dispatch(hydrateLawsuitParties({...}))` to `dispatch(hydrateStatementStep({ stepNumber: 2, result: {...} }))`.
  5. Replace `loading` checks with `loadingState` equivalents.
  (depends on T008, T009)

- [x] T012 [US2] Update `src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/LawsuitSubjects.tsx` to use the new unified slice state. Changes:
  1. Replace import of `hydrateLawsuitSubjects` with `hydrateStatementStep` from the new unified slice.
  2. Import `TLawsuitSubjects` type from the new unified slice.
  3. Change state selector to read from `state.preparingStatementOfClaimsSlice.outputs[3]` as `TLawsuitSubjects | null`.
  4. Update hydration dispatch to `dispatch(hydrateStatementStep({ stepNumber: 3, result: {...} }))`.
  5. Replace `loading` checks with `loadingState` equivalents.
  (depends on T008, T009)

- [x] T013 [US2] Update `src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/LawsuitFacts.tsx` to use the new unified slice state. Changes:
  1. Replace import of `hydrateLawsuitFacts` with `hydrateStatementStep` from the new unified slice.
  2. Change state selector to read from `state.preparingStatementOfClaimsSlice.outputs[4]` as `{ factsNarrative: string } | null`.
  3. Update hydration dispatch to `dispatch(hydrateStatementStep({ stepNumber: 4, result: {...} }))`.
  4. Replace `loading` checks with `loadingState` equivalents.
  (depends on T008, T009)

- [x] T014 [US2] Update `src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/LawsuitLegalBasis.tsx` to use the new unified slice state. Changes:
  1. Replace import of `hydrateLawsuitLegalBasis` with `hydrateStatementStep` from the new unified slice.
  2. Import `TLawsuitLegalBasis` type from the new unified slice.
  3. Change state selector to read from `state.preparingStatementOfClaimsSlice.outputs[5]` as `TLawsuitLegalBasis | null`.
  4. Update hydration dispatch to `dispatch(hydrateStatementStep({ stepNumber: 5, result: {...} }))`.
  5. Replace `loading` checks with `loadingState` equivalents.
  (depends on T008, T009)

- [x] T015 [US2] Update `src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/LawsuitRequests.tsx` to use the new unified slice state. Changes:
  1. Replace import of `hydrateLawsuitRequests` with `hydrateStatementStep` from the new unified slice.
  2. Import `TLawsuitRequests` type from the new unified slice.
  3. Change state selector to read from `state.preparingStatementOfClaimsSlice.outputs[6]` as `TLawsuitRequests | null`.
  4. Update hydration dispatch to `dispatch(hydrateStatementStep({ stepNumber: 6, result: {...} }))`.
  5. Replace `loading` checks with `loadingState` equivalents.
  (depends on T008, T009)

- [x] T016 [US2] Update `src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/FinalStatementOfClaims.tsx` to use the new unified slice state. This component reads ALL step outputs to assemble the final document. Changes:
  1. Update the destructured state from `useAppSelector((state) => state.preparingStatementOfClaimsSlice)` to read individual outputs:
     - `const outputs = useAppSelector((state) => state.preparingStatementOfClaimsSlice.outputs);`
     - Then access `outputs[1]` as `TCaseDetails`, `outputs[2]` as `TLawsuitParties`, `outputs[3]` as `TLawsuitSubjects`, `outputs[4]` as facts, `outputs[5]` as `TLawsuitLegalBasis`, `outputs[6]` as `TLawsuitRequests`.
  2. Update all JSX references from `lawsuitCaseType.caseMainType` to `outputs[1]?.caseMainType`, etc.
  (depends on T008, T009)

#### Step C: Update the orchestrator page

- [x] T017 [US2] Update `src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims.tsx` to use the new unified slice state. Changes:
  1. The state selector on line 38 changes from `rootState.preparingStatementOfClaimsSlice` (which had named fields like `lawsuitCaseType`, `lawsuitParties`) to reading from the unified state shape with `outputs[N]`:
     - Replace `preparingStatementOfClaimsState.lawsuitCaseType` with `preparingStatementOfClaimsState.outputs?.[1]`
     - Replace `preparingStatementOfClaimsState.lawsuitParties` with `preparingStatementOfClaimsState.outputs?.[2]`
     - Replace `preparingStatementOfClaimsState.lawsuitSubjects` with `preparingStatementOfClaimsState.outputs?.[3]`
     - Replace `preparingStatementOfClaimsState.lawsuitFact` with `preparingStatementOfClaimsState.outputs?.[4]`
     - Replace `preparingStatementOfClaimsState.lawsuitLegalBasis` with `preparingStatementOfClaimsState.outputs?.[5]`
     - Replace `preparingStatementOfClaimsState.lawsuitRequests` with `preparingStatementOfClaimsState.outputs?.[6]`
  2. Update the `caseType` prop variable on line 140 from `preparingStatementOfClaimsState.lawsuitCaseType` to `preparingStatementOfClaimsState.outputs?.[1]`.
  3. The `handleStartCaseType` function checks `preparingStatementOfClaimsState.lawsuitCaseType` — update to `preparingStatementOfClaimsState.outputs?.[1]`.
  (depends on T008, T009)

- [x] T018 [US2] Update `src/pages/cases/CaseDetails.tsx` to import `resetStatementOfClaims` from the new unified slice instead of the old one. Change the import on line 16 from `import { resetPreparingStatementOfClaims } from "../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsSlice";` to `import { resetStatementOfClaims as resetPreparingStatementOfClaims } from "../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice";`. This aliased import ensures zero changes needed in the rest of the file. (depends on T008)

#### Step D: Delete legacy files

- [x] T019 [US2] Delete the old legacy slice file `src/redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsSlice.ts` (371 lines). This file is fully replaced by the new `preparingStatementOfClaimsUnifiedSlice.ts`. (depends on T010, T011, T012, T013, T014, T015, T016, T017, T018)

- [x] T020 [US2] Delete ALL 12 legacy thunk files from `src/redux/analysis/preparingStatementOfClaims/thunk/`. Delete each of the following files:
  - `thunkAddLawsuitCaseType.ts`
  - `thunkAddLawsuitFacts.ts`
  - `thunkAddLawsuitLegalBasis.ts`
  - `thunkAddLawsuitParties.ts`
  - `thunkAddLawsuitRequests.ts`
  - `thunkAddLawsuitSubjects.ts`
  - `thunkGetLawsuitCaseType.ts`
  - `thunkGetLawsuitFacts.ts`
  - `thunkGetLawsuitLegalBasis.ts`
  - `thunkGetLawsuitParties.ts`
  - `thunkGetLawsuitRequests.ts`
  - `thunkGetLawsuitSubjects.ts`
  After deletion, remove the now-empty `src/redux/analysis/preparingStatementOfClaims/thunk/` directory.
  (depends on T019)

- [x] T021 [US2] Verify TypeScript compilation succeeds after Statement of Claims migration. Run `npx tsc --noEmit` from `mohamy-smart-lawyer-dashboard/` root. Fix any remaining type errors. (depends on T020)

**Checkpoint**: Statement of Claims (Phase 2) fully uses `createWorkflowSlice`, 12 legacy thunks deleted, 371-line old slice deleted.

---

## Phase 6: User Story 2 Continued - Appeal Brief Slice Relocation (Priority: P1)

**Goal**: Move `appealBriefSlice.ts` from the non-standard `src/redux/slices/workflow/` path to `src/redux/appealBrief/appealBriefSlice.ts` to align with the consistent module convention used by all other slices (each slice has its own top-level folder under `src/redux/`).

**Independent Test**: Run `npx tsc --noEmit`. All imports resolve correctly. The Appeal Brief workflow page functions identically.

### Implementation for Appeal Brief Relocation

- [x] T022 [P] [US2] Create directory `src/redux/appealBrief/` and move the file `src/redux/slices/workflow/appealBriefSlice.ts` to `src/redux/appealBrief/appealBriefSlice.ts`. The file contents remain unchanged.

- [x] T023 [US2] Update the import path in `src/redux/store.ts` from `import appealBriefReducer from './slices/workflow/appealBriefSlice';` (line 17) to `import appealBriefReducer from './appealBrief/appealBriefSlice';`. (depends on T022)

- [x] T024 [US2] Update import paths in all 7 Appeal Brief page/step files that reference the old path `../../../../../redux/slices/workflow/appealBriefSlice`. Change them all to `../../../../../redux/appealBrief/appealBriefSlice`. Files to update:
  - `src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx` (line 10)
  - `src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep1JudgmentData.tsx` (line 4)
  - `src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep2Analysis.tsx` (line 4)
  - `src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep3Grounds.tsx` (line 4)
  - `src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep4Requests.tsx` (line 4)
  - `src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep5LegalBasis.tsx` (line 4)
  - `src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep6Assembly.tsx` (line 5)
  (depends on T022)

- [x] T025 [US2] Delete the now-empty directory `src/redux/slices/workflow/` and its parent `src/redux/slices/` (which has no other contents). (depends on T023, T024)

- [x] T026 [US2] Verify TypeScript compilation succeeds after the relocation. Run `npx tsc --noEmit`. (depends on T025)

**Checkpoint**: Appeal Brief slice is now at the standard location. All import paths are updated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all changed files.

- [x] T027 Run a full `npm run build` from `mohamy-smart-lawyer-dashboard/` root to verify zero warnings and zero errors after all changes. (depends on T004, T007, T021, T026)

- [x] T028 Verify that the `mohamy-smart-lawyer-dashboard/src/redux/` directory structure now follows the consistent pattern where each workflow type has its own top-level folder. Confirm the following structure:
  ```
  src/redux/
  ├── adminComplaint/
  ├── aiJobs/
  ├── analysis/
  │   ├── preparingStatementOfClaims/
  │   │   └── preparingStatementOfClaimsUnifiedSlice.ts  (NEW — no thunk/ subfolder)
  │   └── smartAnalysisSlice.ts
  ├── appealBrief/              (MOVED from slices/workflow/)
  │   └── appealBriefSlice.ts
  ├── auth/
  ├── cases/
  ├── execRequest/
  ├── legalWarning/
  ├── rulingAnalysis/
  │   └── rulingAnalysisAiSlice.ts  (KEPT — modern slice)
  │   (NO RulingAnalysis.ts, NO thunk/ subfolder)
  ├── shared/
  │   ├── createWorkflowSlice.ts
  │   ├── createWorkflowThunks.ts
  │   └── workflowTypes.ts
  ├── store.ts
  └── ...
  ```
  (depends on T027)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Nothing to do — already complete.
- **Phase 2 (Foundational)**: Nothing to do — already complete.
- **Phase 3 (US3 — Dead Code)**: No dependencies — start immediately. T001-T004.
- **Phase 4 (US1 — Defense Memo)**: Can run in parallel with Phase 3. T005-T007.
- **Phase 5 (US2 — Statement of Claims)**: Can start after Phase 2. T008-T021.
- **Phase 6 (US2 continued — Appeal Brief move)**: Can run in parallel with Phase 5. T022-T026.
- **Phase 7 (Polish)**: Depends on all story phases being complete. T027-T028.

### User Story Dependencies

- **User Story 3 (P2)**: No dependencies on other stories. Execute first to clean the store.
- **User Story 1 (P1)**: No dependencies on other stories. Can run in parallel with US3.
- **User Story 2 (P1)**: No dependencies on other stories. Can run in parallel with US1 and US3.

### Parallel Opportunities

```text
# These can run in parallel (different files, no conflicts):
Wave 1: T001 + T002 (delete legacy ruling files)
Wave 2: T003 (update store after deletes) + T005 (Defense Memo Mantine fix)
Wave 3: T006 (verify Defense Memo steps) + T008 (create new unified slice)
Wave 4: T009 (update store for new slice) + T022 (move appealBrief)
Wave 5: T010-T016 (all 7 step component updates can run in parallel)
Wave 6: T017 + T018 (orchestrator + CaseDetails updates)
Wave 7: T019-T020 (delete old files)
Wave 8: T023 + T024 (update appeal brief imports)
```

---

## Implementation Strategy

### MVP First (User Story 3 + User Story 1)

1. Complete Phase 3: Dead Code Removal (T001-T004) — ~15 minutes
2. Complete Phase 4: Defense Memo fix (T005-T007) — ~10 minutes
3. **STOP and VALIDATE**: Run `npm run build`. Zero errors.
4. Commit: `refactor: remove legacy rulingAnalysis slice, replace Mantine Loader in DefenseMemoPage`

### Full Delivery (Add User Story 2)

5. Complete Phase 5: Statement of Claims migration (T008-T021) — ~2 hours
6. Complete Phase 6: Appeal Brief relocation (T022-T026) — ~15 minutes
7. Complete Phase 7: Final build validation (T027-T028) — ~5 minutes
8. Commit: `refactor: migrate preparingStatementOfClaims to createWorkflowSlice, relocate appealBrief`

---

## Notes

- **DO NOT delete `rulingAnalysisAiSlice.ts`** — it is the modern hydration slice used by `RulingAnalysisPage`.
- **DO NOT delete `smartAnalysisSlice.ts`** — it already uses `createWorkflowSlice` and is the production slice.
- The Defense Memo step components (`FactsReview`, `LegalAnalysis`, `DefensesList`, `FinalRequirements`, `FinalNote`) already use `thunkSubmitAiJob` and `SmartAnalysisLoader` — they do NOT need a full rewrite, only verification.
- The Statement of Claims step components need a real rewrite since the state shape changes from named fields to `outputs[N]`.
- All property keys in the new unified slice use `camelCase` — this matches the backend `System.Text.Json` output after Phase 1 backend unification.
- The `LawsuitCaseType.tsx` component currently handles both `PascalCase` and `camelCase` keys (lines 43-67). After this migration, only `camelCase` keys need to be handled.
