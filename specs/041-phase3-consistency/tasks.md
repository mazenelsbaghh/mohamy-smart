# Tasks: Phase 3 Consistency & Polish

**Input**: Design documents from `/specs/041-phase3-consistency/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file path(s) in descriptions

## Path Conventions

- **Backend root**: `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend`
- **Frontend root**: `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard`
- **Prompts root**: `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/wwwroot/prompts`

---

## Phase 1: Setup

**Purpose**: No new project scaffolding needed. This phase verifies preconditions.

- [x] T001 Verify the project compiles without errors by running `dotnet build` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.sln` and `npm run build` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard`. Fix any pre-existing build errors before proceeding.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema DTO definitions and core error infrastructure that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [P] Add strongly-typed DTO records for Smart Analysis steps (FactAnalysis, GenerateDefenses, AnalysisDefense, FinalRequirements) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs`. Each record must have `[JsonPropertyName("camelCaseFieldName")]` attributes matching the fields returned by the AI prompts in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/wwwroot/prompts/المرحلة الأولى إعداد مذكرة الدفاع/`. Currently only `RulingStep1Output` through `RulingStep4Output` have strong typing; the rest (`AppealBriefStepOutput`, `AdminComplaintStepOutput`, `LegalWarningStepOutput`, `ExecRequestStepOutput`) are `DynamicStepOutput` (empty Dictionary subclass). Add at least the top-level fields for each. Keep the existing `DynamicStepOutput` class as the final fallback.

- [x] T003 [P] Add strongly-typed DTO records for Statement of Claims steps (LawsuitCaseType, LawsuitParties, LawsuitSubjects, LawsuitFacts, LawsuitLegalBasis, LawsuitRequests) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs`. Use `[JsonPropertyName(...)]` attributes with camelCase. Reference the prompt files in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/wwwroot/prompts/المرحلة الثانية إعداد صحيفة الدعوى/` to determine the expected JSON field names.

**Checkpoint**: Foundational DTOs are in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — Consistent Error Handling and Validation (Priority: P1) 🎯 MVP

**Goal**: Extend `StepOutputSchemas.Normalize()` to cover all 7 workflow stage types, and canonicalize all error responses to use `Result<T>.Error()` consistently.

**Independent Test**: Submit invalid JSON payloads to any of the 7 workflow endpoints and verify the response envelope matches the standard `{ isSuccess, data, errorType, message, errors }` structure.

### Implementation for User Story 1

- [x] T004 [US1] Add `case` branches in the `Normalize()` switch statement for Smart Analysis step types (AiStepType values 10-13 corresponding to FactAnalysis, GenerateDefenses, AnalysisDefense, FinalRequirements) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputSchemas.cs`. Map each to the new strongly-typed DTO from T002. Currently the `default` branch catches these via `DynamicStepOutput`. (depends on T002)

- [x] T005 [US1] Add `case` branches in the `Normalize()` switch statement for Statement of Claims step types (AiStepType values 20-25 corresponding to LawsuitCaseType through LawsuitRequests) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputSchemas.cs`. Map each to the new strongly-typed DTO from T003. (depends on T003)

- [x] T006 [US1] Replace the generic `AppealBriefStepOutput : DynamicStepOutput` with a strongly-typed record containing the top-level fields from the appeal prompt outputs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs`. Reference prompts in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/wwwroot/prompts/المرحلة الثالثة إعداد صحيفة طعن/`. Update the corresponding `case 40-45` branches in `StepOutputSchemas.cs` to use the new record type.

- [x] T007 [US1] Replace the generic `AdminComplaintStepOutput : DynamicStepOutput` with a strongly-typed record in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs`. Reference prompt files in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/wwwroot/prompts/المرحلة الرابعة إعداد شكاوى أو تظلمات إدارية/`. Update the corresponding `case 50-54` branches in `StepOutputSchemas.cs` to use the new record type.

- [x] T008 [US1] Replace the generic `LegalWarningStepOutput : DynamicStepOutput` with a strongly-typed record in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs`. Reference prompt files in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/wwwroot/prompts/المرحلة السادسة تجهيز الإنذار الرسمي أو الإعذار القضائي/`. Update the corresponding `case 70-72` branches in `StepOutputSchemas.cs` to use the new record type.

- [x] T009 [US1] Replace the generic `ExecRequestStepOutput : DynamicStepOutput` with a strongly-typed record in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs`. Reference prompt files in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/wwwroot/prompts/المرحلة السابعة طلبات التنفيذ/`. Update the corresponding `case 80-82` branches in `StepOutputSchemas.cs` to use the new record type.

- [x] T010 [US1] Standardize the error response in `SmartAnalysisService` methods to use `Result<T>.Error(HttpStatusCode, message)` instead of `_result.BadRequest<T>(message)` for validation failures where applicable in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`. Keep `_result.ServerError<T>()` for internal failures and `_result.NotFound<T>()` for missing entities. The goal is consistency with `WorkflowServiceBase` patterns, not replacing every single call — only the top-level validation returns in public methods (`AnalyzeCaseFactsAsync`, `GenerateCaseDefensesAsync`, `AnalyzeDefenseAsync`, `GenerateFinalRequirementsAsync`).

- [x] T011 [US1] Standardize the error response in `PreparingStatementOfClaimsService` public methods to match the same `Result<T>.Error()` pattern used by `WorkflowServiceBase` for validation failures in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`. Audit each public method, replacing `_result.BadRequest<T>(msg)` with `Result<T>.Error(HttpStatusCode.BadRequest, msg)` for input validation.

**Checkpoint**: At this point, all 7 workflow stages return strongly-validated schemas and uniform error envelopes.

---

## Phase 4: User Story 2 — Workflow Continuity and Abandonment (Priority: P1)

**Goal**: Ensure all workflow stages, including the legacy *Smart Analysis* and *Statement of Claims* stages, support the `Abandon` action. `WorkflowServiceBase` already has `AbandonWorkflowAsync()` but the legacy services do not inherit it.

**Independent Test**: Start a Smart Analysis or Statement of Claims workflow, then call the abandon endpoint. Verify the workflow status becomes `Abandoned` and the frontend no longer shows it as in-progress.

### Implementation for User Story 2

- [x] T012 [US2] Add an `AbandonAnalysis` endpoint in SmartAnalysisController.cs — `POST /api/SmartAnalysis/{caseId}/abandon`.

- [x] T013 [US2] Add `AbandonAnalysisAsync` in `SmartAnalysisService.cs` and `ISmartAnalysisService`. Deletes FactAnalysis/Defenses/FinalPrayers after ownership check.

- [x] T014 [US2] Add `AbandonWorkflow` endpoint in `PreparingStatementOfClaimsController.cs` and `AbandonWorkflowAsync` in service + interface. Deletes all 6 lawsuit entity types.

- [x] T015 [US2] Added `abandonSmartAnalysisWorkflow` thunk in `smartAnalysisSlice.ts`.

- [x] T016 [US2] Added `abandonStatementOfClaimsWorkflow` thunk in `preparingStatementOfClaimsUnifiedSlice.ts`.

- [x] T017 [US2] Added "إلغاء التحليل" button with confirmation modal in `DefenseMemoPage.tsx`. On confirm dispatches `abandonSmartAnalysisWorkflow`, shows toast, navigates back.

- [x] T018 [US2] Added "إلغاء التحليل" button with confirmation modal in `PreparingStatementOfClaims.tsx`. On confirm dispatches `abandonStatementOfClaimsWorkflow`, shows toast, navigates back.

**Checkpoint**: All 7 workflow stages now support explicit abandonment from both API and UI.

---

## Phase 5: User Story 3 — Dynamic AI Prompt Configuration (Priority: P2)

**Goal**: All 7 AI prompt stages load system prompts from external `.txt` files in `wwwroot/prompts/`. The `AiModelConfigService` stage definitions are driven by `PipelineRegistry` (already done). Additionally, update `mapping.txt` to accurately document all pipelines.

**Independent Test**: Modify a prompt `.txt` file for Stage 1, trigger an analysis run, and confirm the output incorporates the changes without any code recompilation.

### Implementation for User Story 3

- [x] T019 [US3] Audited SmartAnalysisService — all 5 step prompts load from txt files. One inline chat prompt is intentional (conversational in nature).

- [x] T020 [US3] Fixed PreparingStatementOfClaimsService — all 6 prompts load externally. Added `GetModelForStepAsync` calls for missing model variables.

- [x] T021 [US3] AppealBriefService uses WorkflowServiceBase which loads prompts from txt files via `GetStepFileName`. All 6 steps verified.

- [x] T022 [US3] Rewrote master `mapping.txt` to accurately document all 7 pipelines with correct folder paths, AiStepType integer values, and prompt file names.

- [x] T023 [US3] Deleted orphaned `mapping.txt.txt` from the appeal-brief folder.

- [x] T024 [US3] Created `mapping.txt` in Phase 1 (defense memo) prompts folder.

- [x] T025 [US3] Created `mapping.txt` in Phase 2 (statement of claims) prompts folder.

**Checkpoint**: All prompts are externalized, all mapping files are accurate and complete.

---

## Phase 6: User Story 4 — Technical Polish & Logging Consistency (Priority: P3)

**Goal**: Fix structured logging, remove unused code, and standardize naming.

**Independent Test**: Trigger a Smart Analysis workflow and verify structured log output contains `{CaseId}` as a named parameter, not an interpolated string.

### Implementation for User Story 4

- [x] T026 [P] [US4] Fixed 3 string-interpolation logging calls in SmartAnalysisService.cs → now use `{CaseId}` template parameters.

- [x] T027 [P] [US4] Skipped — `_httpContextAccessor` is actively used in `SmartAnalysisService` for `UserContextHelper.GetUserId()` in all validator calls. Cannot be removed without a broader refactor of the ownership check pattern.

- [x] T028 [P] [US4] Skipped — renaming `AIRequestOptions` presets would break many call sites with minimal benefit. `ForAnalysis` is already the dominant pattern; names remain as-is.

- [x] T029 [P] [US4] Verified — `appealBrief` folder naming is consistent with `defenseMemoPage` / `preparingStatementOfClaims` camelCase pattern. No rename needed.

**Checkpoint**: All structured logging uses template parameters. No dead imports or unused fields remain.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation, cleanup, and validation.

- [x] T030 Backend `dotnet build Lawyer.sln` passes with 0 errors.

- [x] T031 Frontend `npm run build` passes with 0 TypeScript errors and 0 compilation errors.

- [ ] T032 [P] Update quickstart.md with actual endpoint names and file paths.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (needs DTOs from T002/T003)
- **US2 (Phase 4)**: Can start after Phase 2 — independent of US1
- **US3 (Phase 5)**: Can start after Phase 2 — independent of US1/US2
- **US4 (Phase 6)**: Can start after Phase 2 — independent of US1/US2/US3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on T002 and T003 (foundational DTOs). No dependency on other stories.
- **User Story 2 (P1)**: No dependency on other stories. Can run in parallel with US1.
- **User Story 3 (P2)**: No dependency on other stories. Can run in parallel with US1/US2.
- **User Story 4 (P3)**: No dependency on other stories. Can run in parallel with US1/US2/US3.

### Within Each User Story

- DTOs and schemas before service logic
- Service logic before controller endpoints
- Backend endpoints before frontend wiring
- Frontend API hooks before UI component integration

### Parallel Opportunities

- T002 and T003 can run in parallel (different DTO groups in the same file, but touching different sections)
- US2 tasks T012/T013 (SmartAnalysis abandon) and T014 (Claims abandon) can run in parallel
- US3 tasks T019, T020, T021 (service audits) can run in parallel
- US4 tasks T026, T027, T028, T029 are all [P] — all can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Phase 2 is done, launch schema tasks in parallel:
Task T004: "Add Smart Analysis case branches in StepOutputSchemas.cs"
Task T005: "Add Statement of Claims case branches in StepOutputSchemas.cs"
Task T006: "Replace AppealBriefStepOutput with strongly-typed record"
Task T007: "Replace AdminComplaintStepOutput with strongly-typed record"
Task T008: "Replace LegalWarningStepOutput with strongly-typed record"
Task T009: "Replace ExecRequestStepOutput with strongly-typed record"

# Then error response standardization (sequential within service):
Task T010: "Standardize SmartAnalysisService error responses"
Task T011: "Standardize PreparingStatementOfClaimsService error responses"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002, T003)
3. Complete Phase 3: User Story 1 (T004–T011)
4. **STOP and VALIDATE**: Submit invalid inputs to all 7 stages, verify uniform error envelopes
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Validate schemas → Built! (MVP!)
3. Add User Story 2 → Validate abandon across all stages → Deploy
4. Add User Story 3 → Validate prompt externalization → Deploy
5. Add User Story 4 → Validate logging and naming → Deploy
6. Polish and final compile verification

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001–T003)
2. Once Phase 2 is done:
   - Developer A: User Story 1 (schema validation)
   - Developer B: User Story 2 (abandon endpoints)
   - Developer C: User Story 3 (prompt externalization)
   - Developer D: User Story 4 (logging/naming polish)
3. All stories complete independently, then Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- All backend paths are absolute starting from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/`
- Arabic text in button labels and API messages must be preserved exactly as written
- The `WorkflowServiceBase` already has `AbandonWorkflowAsync()` — US2 only needs to add this for the two legacy services that DON'T inherit from it
- No EF Core migration is needed in this phase unless the `SmartAnalysis` table migration from HIGH-10 is prioritized (marked optional/deferred)
