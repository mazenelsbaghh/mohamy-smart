# Tasks: Frontend Unification + Auto-save Complete

**Input**: Design documents from `/specs/046-frontend-unification-autosave/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file path(s) in descriptions

## Phase 1: Setup

**Purpose**: Consolidate type definitions and prepare the shared infrastructure for all user stories.

- [x] T001 Move `TFactAnalysis`, `TDefense`, `TDefenses`, `TFinalRequirements`, `TFinalRequirementsWrapper`, and `TAnalysisDefenses` type definitions from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/analysis/smartAnalysisSlice.ts` into `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/workflowTypes.ts` (export all; keep re-exports in original file to avoid breaking existing imports)
- [x] T002 Move `TCaseDetails`, `TLawsuitParty`, `TLawsuitParties`, `TLawsuitSubjects`, `TLawsuitLegalBasis`, `TLawsuitRequests`, and `TLawsuitFacts` type definitions from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice.ts` into `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/workflowTypes.ts` (export all; keep re-exports in original file)
- [x] T003 Add `TDefenseMemorandum` interface (with fields: introduction, factualBasis, legalTextsFull[], legalTextsUnavailableReason, linkingTextsToFacts, cassationPrecedentsFull[], cassationPrecedentsUnavailableReason, legalApplication, counterArgumentsAndResponse, legalEffectOfAcceptance, strengthsAndRisks) to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/workflowTypes.ts` — this type is currently inline in the step 3 hydrator of smartAnalysisSlice

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type-safety fixes in shared workflow factories that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Replace `any` in `IWorkflowThunks` interface — change all 5 thunk types from `any` to their proper `AsyncThunk` signatures using `IWorkflowDto` and specific return types in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/createWorkflowThunks.ts` (depends on T001, T002)
- [x] T005 Replace `any` in `stepHydrators` type signature — change `result: any` to `result: unknown` in the `WorkflowSliceConfig<TStepOutputs>.stepHydrators` definition in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/createWorkflowSlice.ts`
- [x] T006 Replace `action: any` with properly typed action payloads in all 5 `extraReducers` builder cases (startWorkflow, getWorkflow, runStep, saveEditedStep, saveDraftStep) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/createWorkflowSlice.ts` (depends on T004)
- [x] T007 Create reusable `AutoSaveButton` component in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/analysisWorkflow/AutoSaveButton.tsx` — accepts props `isAutoSaving: boolean`, `autoSaveError: string | null`, `lastSavedAt: string | null`, `onManualSave: () => void`, `isSavingStep: boolean`. Button text transitions: default "حفظ" → saving (spinner) → "تم الحفظ تلقائياً" (green, 2s revert) → or "فشل الحفظ" (red, 3s revert). Must support dark mode and RTL.

**Checkpoint**: Foundation ready — shared types centralized, factory types fixed, auto-save button component ready.

---

## Phase 3: User Story 1 — Defense Memo Auto-save (Priority: P1) 🎯 MVP

**Goal**: A lawyer editing any of the 5 Defense Memo steps gets automatic periodic saving with inline button indicator.

**Independent Test**: Open a defense memo workflow, edit text in any step, wait 1.5s, confirm save button shows "تم الحفظ تلقائياً" and data persists after page reload.

### Implementation for User Story 1

- [x] T008 [US1] Rewrite `FactsReview.tsx` to use `AnalysisStepShell` + `useAnalysisStep` hook — replace all ad-hoc loading/error states with shell props; use `AnalysisStageLayout`, `AnalysisStageSectionCard`, `AnalysisStageNumberedList` for output display; remove any inline CSS overrides in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FactsReview.tsx`
- [x] T009 [US1] Rewrite `DefensesList.tsx` to use `AnalysisStepShell` + `useAnalysisStep` hook — preserve defense card listing and individual defense analysis trigger functionality; adopt `AnalysisStageSectionCard` for defense groups (formal/substantive/evidentiary); remove ad-hoc loading states in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/DefensesList.tsx` (depends on T008)
- [x] T010 [US1] Rewrite `LegalAnalysis.tsx` to use `AnalysisStepShell` + `useAnalysisStep` hook — adopt `AnalysisStageDocumentCard` for memorandum display; remove ad-hoc loading/error handling in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/LegalAnalysis.tsx` (depends on T008)
- [x] T011 [P] [US1] Rewrite `FinalRequirements.tsx` to use `AnalysisStepShell` + `useAnalysisStep` hook — use `AnalysisStageSectionCard` for final prayers listing; remove all inline CSS in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalRequirements.tsx`
- [x] T012 [US1] Delete legacy CSS file `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalRequirements.css` and remove its import from FinalRequirements.tsx (depends on T011)
- [x] T013 [US1] Rewrite `FinalNote.tsx` to use `AnalysisStepShell` — this is the draft assembly step; adopt `AnalysisStageDocumentCard` for the memo preview; keep draft editing functionality; use `useWorkflowAutoSave` for this step's editor content in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx` (depends on T008)
- [x] T014 [US1] Delete legacy CSS file `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.css` and remove its import from FinalNote.tsx (depends on T013)
- [x] T015 [US1] Wire `useWorkflowAutoSave` into the Defense Memo page — import and configure with `delay: 1500`, connect `onSave` to `smartAnalysisThunks.saveDraftStep`, pass current step output as payload on change, integrate `AutoSaveButton` component replacing the existing manual save button in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx` (depends on T007, T008, T009, T010, T011, T013)
- [x] T016 [US1] Update `smartAnalysisSlice.ts` to import step output types from `workflowTypes.ts` instead of defining them locally — replace local type definitions with imports; update `stepHydrators` to cast `result: unknown` instead of `result: any` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/analysis/smartAnalysisSlice.ts` (depends on T001, T003, T005)

**Checkpoint**: Defense Memo workflow fully migrated — auto-save functional, unified UI, all 5 steps using AnalysisStepShell.

---

## Phase 4: User Story 2 — Statement of Claims Auto-save (Priority: P1)

**Goal**: A lawyer editing any of the 7 Preparing Statement of Claims steps gets automatic periodic saving with inline button indicator.

**Independent Test**: Open a statement of claims workflow, edit Lawsuit Subjects step, wait 1.5s, confirm save button shows "تم الحفظ تلقائياً" and data persists after page reload.

### Implementation for User Story 2

- [x] T017 [P] [US2] Rewrite `LawsuitCaseType.tsx` to use `AnalysisStepShell` + `useAnalysisStep` — adopt `AnalysisStageLayout` with sidebar cards for case classification results; remove ad-hoc states in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/LawsuitCaseType.tsx`
- [x] T018 [P] [US2] Rewrite `LawsuitParties.tsx` to use `AnalysisStepShell` + `useAnalysisStep` — use `AnalysisStageSectionCard` for party list display; remove ad-hoc loading/error handling in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/LawsuitParties.tsx`
- [x] T019 [P] [US2] Rewrite `LawsuitSubjects.tsx` to use `AnalysisStepShell` + `useAnalysisStep` — use `AnalysisStageSectionCard` for subject display; remove ad-hoc states in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/LawsuitSubjects.tsx`
- [x] T020 [P] [US2] Rewrite `LawsuitFacts.tsx` to use `AnalysisStepShell` + `useAnalysisStep` — use `AnalysisStageSectionCard` for facts narrative display in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/LawsuitFacts.tsx`
- [x] T021 [P] [US2] Rewrite `LawsuitLegalBasis.tsx` to use `AnalysisStepShell` + `useAnalysisStep` — use `AnalysisStageDocumentCard` for legal texts and `AnalysisStageSectionCard` for cassation rulings in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/LawsuitLegalBasis.tsx`
- [x] T022 [P] [US2] Rewrite `LawsuitRequests.tsx` to use `AnalysisStepShell` + `useAnalysisStep` — use `AnalysisStageSectionCard` for principal/subsidiary/procedural request groups in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/LawsuitRequests.tsx`
- [x] T023 [US2] Rewrite `FinalStatementOfClaims.tsx` to use `AnalysisStepShell` — adopt `AnalysisStageDocumentCard` for draft preview; keep draft editing and auto-save for editor content in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/FinalStatementOfClaims.tsx`
- [x] T024 [US2] Wire `useWorkflowAutoSave` into the Preparing Statement of Claims page — import and configure with `delay: 1500`, connect `onSave` to `statementOfClaimsThunks.saveDraftStep`, integrate `AutoSaveButton` component replacing the existing manual save button in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims.tsx` (depends on T007, T017-T023)
- [x] T025 [US2] Update `preparingStatementOfClaimsUnifiedSlice.ts` to import step output types from `workflowTypes.ts` — replace local type definitions with imports; update `stepHydrators` to cast `result: unknown` instead of `result: any` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice.ts` (depends on T002, T005)

**Checkpoint**: Statement of Claims workflow fully migrated — auto-save functional, unified UI, all 7 steps using AnalysisStepShell.

---

## Phase 5: User Story 3 — Consistent Auto-save Across All 7 Workflows (Priority: P2)

**Goal**: The 5 already-unified workflows (Appeal Brief, Admin Complaint, Ruling Analysis, Legal Warning, Exec Request) also get auto-save wired with the same `AutoSaveButton` component and timing.

**Independent Test**: Open each of the 5 remaining workflow types, edit a step, verify auto-save fires at 1.5s with identical button behavior.

### Implementation for User Story 3

- [x] T026 [P] [US3] Wire `useWorkflowAutoSave` + `AutoSaveButton` into Appeal Brief page — configure `delay: 1500`, connect to `appealBriefThunks.saveDraftStep` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx` (depends on T007)
- [x] T027 [P] [US3] Wire `useWorkflowAutoSave` + `AutoSaveButton` into Admin Complaint page — configure `delay: 1500`, connect to `adminComplaintThunks.saveDraftStep` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/AdminComplaintPage.tsx` (depends on T007)
- [x] T028 [P] [US3] Wire `useWorkflowAutoSave` + `AutoSaveButton` into Ruling Analysis page — configure `delay: 1500`, connect to `rulingAnalysisThunks.saveDraftStep` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage.tsx` (depends on T007)
- [x] T029 [P] [US3] Wire `useWorkflowAutoSave` + `AutoSaveButton` into Legal Warning page — configure `delay: 1500`, connect to `legalWarningThunks.saveDraftStep` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/LegalWarningPage.tsx` (depends on T007)
- [x] T030 [P] [US3] Wire `useWorkflowAutoSave` + `AutoSaveButton` into Exec Request page — configure `delay: 1500`, connect to `execRequestThunks.saveDraftStep` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/ExecRequestPage.tsx` (depends on T007)

**Checkpoint**: All 7 workflows have consistent auto-save behavior with identical button indicator.

---

## Phase 6: User Story 4 & 5 — Unified UI Shell (Priority: P2)

**Goal**: Defense Memo and Statement of Claims step components use identical visual design to appeal brief / admin complaint steps. (Implementation covered by T008-T014 for US1 and T017-T023 for US2 — this phase verifies the visual unification.)

**Independent Test**: Compare defense memo step 1 against appeal brief step 1 — card layouts, loading spinners, error banners should be visually identical.

> Note: The implementation tasks for US4 and US5 are already embedded in Phase 3 (T008-T014) and Phase 4 (T017-T023) since the component rewrites include visual unification. This phase is a verification checkpoint only.

---

## Phase 7: User Story 6 — Type-Safe Workflow Step Outputs (Priority: P3)

**Goal**: Eliminate all `any`-typed workflow output references across all 7 workflow slices.

**Independent Test**: Run `npx tsc --noEmit` — zero `any`-typed references in workflow slice files and step components.

### Implementation for User Story 6

- [x] T031 [P] [US6] Add typed step output interfaces for Appeal Brief (steps 1-6) to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/workflowTypes.ts` — define `TAppealJudgmentData`, `TAppealAnalysis`, `TAppealGrounds`, `TAppealRequests`, `TAppealLegalBasis`, types matching the backend DTOs
- [x] T032 [P] [US6] Add typed step output interfaces for Admin Complaint (steps 1-5) to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/workflowTypes.ts` — define `TComplaintClassification`, `TComplaintFactsDraft`, `TComplaintViolationAnalysis`, `TComplaintRequestsDraft` types
- [x] T033 [P] [US6] Add typed step output interfaces for Ruling Analysis (steps 1-4) to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/workflowTypes.ts` — define `TVerdictAnalysis`, `TReasonsAnalysis`, `TDefectsEvaluation`, `TAppealViability` types
- [x] T034 [P] [US6] Add typed step output interfaces for Legal Warning (steps 1-3) and Exec Request (steps 1-3) to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/workflowTypes.ts` — define `TWarningClassification`, `TWarningDraft`, `TExecClassification`, `TExecDrafting` types
- [x] T035 [US6] Update `appealBriefSlice.ts` to use typed step outputs from `workflowTypes.ts` — replace `any` in stepHydrators and slice generic parameter in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/appealBrief/appealBriefSlice.ts` (depends on T005, T031)
- [x] T036 [US6] Update `adminComplaintSlice.ts` to use typed step outputs from `workflowTypes.ts` — replace `any` in stepHydrators and slice generic parameter in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/adminComplaint/adminComplaintSlice.ts` (depends on T005, T032)
- [x] T037 [US6] Update `rulingAnalysisAiSlice.ts` to use typed step outputs from `workflowTypes.ts` — replace `any` in stepHydrators and slice generic parameter in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/rulingAnalysis/rulingAnalysisAiSlice.ts` (depends on T005, T033)
- [x] T038 [US6] Update `legalWarningSlice.ts` and `execRequestSlice.ts` to use typed step outputs from `workflowTypes.ts` — replace `any` in stepHydrators and slice generic parameter in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/legalWarning/legalWarningSlice.ts` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/execRequest/execRequestSlice.ts` (depends on T005, T034)
- [x] T039 [US6] Update `useAnalysisStep.ts` generic type — change default type parameter from `any` to `unknown` in `UseAnalysisStepOptions<T = any>` and `UseAnalysisStepReturn<T = any>` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/hooks/useAnalysisStep.ts`

**Checkpoint**: TypeScript compiler reports zero `any` in workflow Redux code. Run `npx tsc --noEmit` to verify.

---

## Phase 8: User Story 7 — Legacy Dead Code Removal (Priority: P3)

**Goal**: Remove all legacy files no longer referenced after migration.

**Independent Test**: `grep -r` for legacy import paths returns zero results; `npm run build` succeeds.

### Implementation for User Story 7

- [ ] T040 [US7] Search for and remove any remaining unused legacy thunk files or Redux code in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/analysis/` — verify with `grep -r` that no component imports them; delete unreferenced files (depends on T016, T025)
- [ ] T041 [US7] Verify `rulingAnalysisAiSlice.ts` is actively imported — if no page or component imports it, delete `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/rulingAnalysis/rulingAnalysisAiSlice.ts` and remove from store registration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/store.ts`
- [ ] T042 [US7] Run `npm run build` to confirm zero TypeScript errors and measure bundle size baseline in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/` — compare JS bundle output size to pre-migration (target: no increase, ideally decrease)

**Checkpoint**: Codebase clean — no dead code, build succeeds, bundle size stable or reduced.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation.

- [ ] T043 Verify auto-save mutual exclusion by manually testing concurrent manual + auto-save across all 7 workflows — document results in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/046-frontend-unification-autosave/checklists/requirements.md` (update checklist items)
- [ ] T044 Verify dark mode rendering for all migrated step components (defense memo 5 steps + statement of claims 7 steps) — ensure `AutoSaveButton` success/error states are visible in dark mode
- [ ] T045 Run final production build `npm run build` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/` and confirm zero errors, zero warnings related to workflow code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001-T003) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — Defense Memo migration
- **US2 (Phase 4)**: Depends on Phase 2 — Statement of Claims migration (can run in parallel with US1)
- **US3 (Phase 5)**: Depends on Phase 2 (T007 only) — auto-save wiring for 5 existing workflows (can run in parallel with US1/US2)
- **US6 (Phase 7)**: Depends on Phase 2 — type definitions (can run in parallel with US1/US2/US3)
- **US7 (Phase 8)**: Depends on US1 + US2 completion — dead code can only be verified after migration
- **Polish (Phase 9)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: After Phase 2. No cross-story dependencies.
- **US2 (P1)**: After Phase 2. No cross-story dependencies. Can run in parallel with US1.
- **US3 (P2)**: After T007 (AutoSaveButton). Can run in parallel with US1/US2.
- **US4/US5 (P2)**: Covered by US1/US2 implementation tasks.
- **US6 (P3)**: After Phase 2. Can run in parallel with US1-US3.
- **US7 (P3)**: After US1 + US2 complete. Cannot be parallelized.

### Parallel Opportunities

```text
After Phase 2 completes, 4 streams can run simultaneously:
  Stream A: US1 (T008-T016) — Defense Memo migration
  Stream B: US2 (T017-T025) — Statement of Claims migration
  Stream C: US3 (T026-T030) — Auto-save wiring for existing workflows
  Stream D: US6 (T031-T039) — Type safety across all slices

Within US2, steps T017-T022 are all [P] (independent files, can parallel).
Within US3, all tasks T026-T030 are [P] (independent workflow pages).
Within US6, T031-T034 are [P] (independent type definitions).
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007)
3. Complete Phase 3: US1 — Defense Memo (T008-T016)
4. **STOP and VALIDATE**: Test defense memo auto-save and unified UI independently
5. Demo/deploy if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Defense Memo) → Test → Verify ✅
3. US2 (Statement of Claims) → Test → Verify ✅
4. US3 (Auto-save all workflows) → Test → Verify ✅
5. US6 (Type safety) → `tsc --noEmit` → Verify ✅
6. US7 (Dead code cleanup) → Build → Verify ✅
7. Polish → Final verification ✅

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each legacy step component rewrite MUST use `AnalysisStepShell`, `AnalysisStageLayout`, `AnalysisStageSectionCard` from `/src/components/analysisWorkflow/`
- Reference implementation: `AppealStep1JudgmentData.tsx` for simplest unified pattern example
- Auto-save button state changes happen inside the button itself (no toasts, no adjacent text)
- All UI text must be in Arabic with RTL layout preserved
- Debounce delay: 1500ms across all workflows
