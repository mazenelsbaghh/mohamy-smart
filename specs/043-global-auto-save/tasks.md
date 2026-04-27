# Tasks: Global Auto-save and Drafts

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/043-global-auto-save/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/auto-save-api.md`

**Tests**: No automated test tasks were added because the feature spec defines manual independent test scenarios but does not request TDD or explicit automated coverage.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Introduce the shared contracts and hook entry points that the rest of the feature builds on.

- [x] T001 Create the shared backend draft-save request DTO with `stepIndex`, `isDraft`, and raw `payload` fields in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Workflows/SaveWorkflowDraftRequest.cs`
- [x] T002 Create the shared debounced auto-save hook skeleton with timer refs and flush/cancel API in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/hooks/useWorkflowAutoSave.ts`
- [x] T003 [P] Extend shared workflow state typing with `lastSavedAt`, `isAutoSaving`, and `autoSaveError` fields in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/workflowTypes.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared Redux and backend primitives that every workflow draft save depends on.

**⚠️ CRITICAL**: No user story work should start before this phase is complete.

- [x] T004 Implement the shared `saveDraftStep` PATCH thunk for controller-specific `/auto-save` routes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/createWorkflowThunks.ts` (depends on T001)
- [x] T005 Update the shared workflow slice to store `lastSavedAt`, `isAutoSaving`, and draft-save failures from T004 in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/createWorkflowSlice.ts` (depends on T003, T004)
- [x] T006 Extend `IWorkflowServiceBase` and `WorkflowServiceBase` with `SaveDraftAsync` that overwrites one step JSON and returns `lastSavedAt` without advancing AI execution in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IWorkflowServiceBase.cs` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T001)
- [x] T007 [P] Add a reusable workflow catalog registry with route, Arabic label, and completion-step metadata in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/workflowCatalog.ts`

**Checkpoint**: Shared draft-save infrastructure is ready for story work.

---

## Phase 3: User Story 1 - Continue Draft Workflows (Priority: P1) 🎯 MVP

**Goal**: Show saved workflows clearly on the case analysis hub and let the lawyer re-enter each workflow at the correct saved step.

**Independent Test**: Create a saved draft, return to the case analysis tab, confirm the hub shows "المسودات والمراحل المنجزة", then reopen the workflow and land on the persisted step with the previous content restored.

### Implementation for User Story 1

- [x] T008 [US1] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/CaseAnalysis.tsx` to load workflow summaries from the catalog and render per-workflow resume cards for saved drafts and completed stages (depends on T007)
- [x] T009 [P] [US1] Hydrate saved workflow state on page mount in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/AdminComplaintPage.tsx`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/LegalWarningPage.tsx` (depends on T004, T005)
- [x] T010 [P] [US1] Hydrate saved workflow state on page mount in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/ExecRequestPage.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage.tsx`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx` (depends on T004, T005)
- [x] T011 [US1] Hydrate saved statement-of-claims outputs and resume the active tab from persisted workflow data in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims.tsx` (depends on T004, T005)
- [x] T012 [US1] Expose saved defense-memo draft metadata for the hub resume cards in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/analysis/smartAnalysisSlice.ts` (depends on T008)

**Checkpoint**: User Story 1 is independently functional when saved workflows can be resumed from the case hub.

---

## Phase 4: User Story 2 - Ubiquitous Auto-save During Editing (Priority: P1)

**Goal**: Persist draft edits automatically across workflow editors and show the lawyer the latest successful save time.

**Independent Test**: Edit a saved draft, pause for 2 seconds, verify the "آخر حفظ تلقائي للتعديلات" timestamp updates, close the tab, reopen the workflow, and confirm the edited text is still present.

### Implementation for User Story 2

- [x] T013 [P] [US2] Add `PATCH {id}/step/{stepNumber}/auto-save` controller actions that forward `SaveWorkflowDraftRequest` to workflow services in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AppealBriefController.cs`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminComplaintController.cs`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/LegalWarningController.cs` (depends on T006)
- [x] T014 [P] [US2] Add `PATCH .../auto-save` controller actions that forward `SaveWorkflowDraftRequest` to workflow services in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/ExecRequestController.cs`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/RulingAnalysisController.cs`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/PreparingStatementOfClaimsController.cs` (depends on T006)
- [x] T015 [US2] Add a defense-memo draft persistence endpoint and service method that saves final-note HTML without triggering AI work in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/SmartAnalysisController.cs` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs` (depends on T001)
- [x] T016 [P] [US2] Route appeal, admin complaint, and legal warning services through shared `SaveDraftAsync` and return `lastSavedAt` payloads in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AppealBriefService.cs`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminComplaintService.cs`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/LegalWarningService.cs` (depends on T006, T013)
- [x] T017 [P] [US2] Route execution request, ruling analysis, and statement-of-claims services through shared `SaveDraftAsync` and return `lastSavedAt` payloads in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/ExecRequestService.cs`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/RulingAnalysisService.cs`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs` (depends on T006, T014)
- [x] T018 [US2] Implement the 2000ms debounced save, cancel, and flush behavior in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/hooks/useWorkflowAutoSave.ts` and connect it to the shared slice metadata from T005 (depends on T002, T005)
- [x] T019 [P] [US2] Replace the simulated local save flow with real auto-save and live `lastSavedAt` status in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/FinalStatementOfClaims.tsx` (depends on T015, T017, T018)
- [x] T020 [P] [US2] Make the final draft surface editable and auto-saved in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep6Assembly.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep5FinalAssembly.tsx`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep3FinalAssembly.tsx` (depends on T013, T016, T018)
- [x] T021 [P] [US2] Add draft auto-save to mid-workflow drafting editors in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep2FactsDraft.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep2WarningDraft.tsx`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/steps/ExecStep2Drafting.tsx` (depends on T013, T014, T018)
- [x] T022 [P] [US2] Show shared "saving / saved / failed" draft indicators in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/analysisWorkflow/AnalysisStageLayout.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/analysisWorkflow/AnalysisStepShell.tsx`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/analysisWorkflow/AnalysisWorkflow.css` (depends on T018)
- [x] T023 [US2] Normalize `lastSavedAt` parsing for both generic workflows and defense memo state in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/shared/createWorkflowSlice.ts` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/analysis/smartAnalysisSlice.ts` (depends on T005, T015)

**Checkpoint**: User Story 2 is independently functional when edited workflow text survives refreshes and closed tabs after the debounce window.

---

## Phase 5: User Story 3 - Exploring Available Workflows (Priority: P2)

**Goal**: Present the analysis area as a safe workflow catalog that emphasizes drafts, available paths, and automatic saving.

**Independent Test**: Open a case with no prior workflow data, confirm the hub shows "المسودات ومسارات العمل", and verify the workflow selection cards explain that drafts are created and saved automatically.

### Implementation for User Story 3

- [x] T024 [P] [US3] Update the hub headline, helper text, and CTA copy in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/CaseAnalysis.tsx` to emphasize draft-safe exploration (depends on T008)
- [x] T025 [P] [US3] Update the workflow catalog cards to explain automatic draft creation in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/DocumentSelection.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/analysisWorkflow/AnalysisSelectionCard.tsx`
- [x] T026 [US3] Add reusable Arabic helper text and visual status treatments for draft and completed workflow cards in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/analysisWorkflow/AnalysisWorkflowShell.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/analysisWorkflow/AnalysisWorkflow.css` (depends on T025)
- [x] T027 [US3] Align defense-memo and statement-of-claims header copy with the new draft terminology in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims.tsx` (depends on T024)

**Checkpoint**: User Story 3 is independently functional when a new case reads as a safe workflow catalog with clear auto-save guidance.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize the operational docs and harden cross-workflow behavior.

- [x] T028 [P] Update the validation walkthrough for resume flow, auto-save timestamps, and tab-close recovery in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/043-global-auto-save/quickstart.md`
- [x] T029 Harden draft-save authorization and invalid-step error messages in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs` (depends on T015, T016, T017)
- [x] T030 [P] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/043-global-auto-save/contracts/auto-save-api.md` with the finalized route variants and response examples that match the implemented controllers

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all story work.
- **User Story 1 (Phase 3)**: Starts after Foundational.
- **User Story 2 (Phase 4)**: Starts after Foundational and can proceed in parallel with US1.
- **User Story 3 (Phase 5)**: Starts after Foundational; best done after US1 so the final copy matches the resume-card structure.
- **Polish (Phase 6)**: Starts after the desired stories are complete.

### User Story Dependencies

- **US1**: Depends on T004, T005, and T007.
- **US2**: Depends on T006 plus the shared frontend infrastructure from T004 and T005.
- **US3**: Depends on the hub structure from T008 and benefits from the saved-status treatments from US2.

### Within Each User Story

- Shared contracts and thunks before page wiring.
- Backend save endpoints before frontend auto-save hook integration.
- Page hydration before copy-only refinements.
- Draft status UI after the save metadata exists in Redux.

### Parallel Opportunities

- T003 and T007 can run in parallel after T001-T002.
- T013 and T014 can run in parallel after T006.
- T016 and T017 can run in parallel after their controller tasks.
- T019, T020, T021, and T022 can run in parallel once T018 and the required backend endpoints are ready.
- T024 and T025 can run in parallel once the hub structure from T008 is in place.

---

## Parallel Example: User Story 1

```bash
Task: "Hydrate saved workflow state on page mount in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx, /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/AdminComplaintPage.tsx, and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/LegalWarningPage.tsx"
Task: "Hydrate saved workflow state on page mount in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/ExecRequestPage.tsx, /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage.tsx, and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Add PATCH {id}/step/{stepNumber}/auto-save controller actions in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AppealBriefController.cs, /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminComplaintController.cs, and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/LegalWarningController.cs"
Task: "Add PATCH .../auto-save controller actions in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/ExecRequestController.cs, /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/RulingAnalysisController.cs, and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/PreparingStatementOfClaimsController.cs"
Task: "Route appeal, admin complaint, and legal warning services through shared SaveDraftAsync and return lastSavedAt payloads in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AppealBriefService.cs, /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminComplaintService.cs, and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/LegalWarningService.cs"
Task: "Route execution request, ruling analysis, and statement-of-claims services through shared SaveDraftAsync and return lastSavedAt payloads in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/ExecRequestService.cs, /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/RulingAnalysisService.cs, and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs"
```

## Parallel Example: User Story 3

```bash
Task: "Update the hub headline, helper text, and CTA copy in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/CaseAnalysis.tsx to emphasize draft-safe exploration"
Task: "Update the workflow catalog cards to explain automatic draft creation in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/DocumentSelection.tsx and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/analysisWorkflow/AnalysisSelectionCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate that saved workflows are visible and resumable from the case hub.

### Incremental Delivery

1. Ship US1 to make saved drafts discoverable and resumable.
2. Ship US2 to make edits durable with real auto-save and timestamps.
3. Ship US3 to finish the draft-safe workflow catalog language and card treatments.

### Parallel Team Strategy

1. One developer handles shared backend primitives (T001, T006, T013-T017).
2. One developer handles shared frontend primitives (T002-T005, T018, T022-T023).
3. After foundations land, story owners can split US1 page hydration, US2 editor wiring, and US3 copy/styling workstreams.

---

## Notes

- All tasks use the required checklist format with sequential IDs, optional `[P]` markers, and `[US#]` labels for story work.
- Each task names exact file paths so another model can implement it without rediscovering the target files.
- The suggested MVP scope is **User Story 1** because it delivers immediate draft visibility and resume safety with the fewest moving parts.
