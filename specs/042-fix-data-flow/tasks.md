# Tasks: Fix AI Stages Data Flow

**Input**: Design documents from `/specs/042-fix-data-flow/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 = Backend Normalization, US2 = Frontend Output Unwrapping)
- All file paths are relative to repo root `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Enhance the shared frontend utility so both user stories can rely on correct key normalization.

- [x] T001 Enhance `toCamelKey` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/utils/parseJobResult.ts` to also convert snake_case keys to camelCase. Currently `toCamelKey` only lowercases the first letter (PascalCase → camelCase). Add a `snakeToCamel` transform **before** the existing `toCamelKey`. The new logic: add a helper `const snakeToCamel = (key: string): string => key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());` and change line 25 from `[toCamelKey(k), deepCamelize(v)]` to `[toCamelKey(snakeToCamel(k)), deepCamelize(v)]`. Also update the `hasPascalKeys` check on line 40 to ALWAYS run `deepCamelize` (remove the `if (hasPascalKeys)` guard) so snake_case keys are normalised too. The function should unconditionally camelize all parsed results.

---

## Phase 2: Foundational (Backend — Remove `[JsonPropertyName]` Overrides)

**Purpose**: Remove all `[JsonPropertyName("snake_case")]` attributes from AI step DTOs so the global CamelCase serializer works. Switch parse options to SnakeCaseLower. MUST complete before frontend stories.

**⚠️ CRITICAL**: These tasks modify the serialization pipeline. All must be done together for consistency.

### StepOutputDtos.cs — Remove all `[JsonPropertyName]` attributes

- [x] T002 [P] Remove ALL `[JsonPropertyName(...)]` attribute lines from records `RulingStep1Output`, `RulingStep2Output`, `RulingStep3Output`, `RulingStep4Output` (lines 11-51) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs`. Keep the `using System.Text.Json.Serialization;` import because `[JsonExtensionData]` still uses it. Only remove the `[JsonPropertyName("...")]` lines — do NOT remove the property declarations themselves.

- [x] T003 [P] Remove ALL `[JsonPropertyName(...)]` attribute lines from records `FactAnalysisStepOutput`, `GenerateDefensesStepOutput`, `AnalysisDefenseStepOutput`, `FinalRequirementsStepOutput` (lines 55-101) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs`. Only remove `[JsonPropertyName("...")]` lines, keep property declarations intact.

- [x] T004 [P] Remove ALL `[JsonPropertyName(...)]` attribute lines from records `LawsuitCaseTypeStepOutput`, `LawsuitPartiesStepOutput`, `LawsuitPartyDto`, `LawsuitFactsStepOutput`, `LawsuitSubjectsStepOutput`, `LawsuitLegalBasisStepOutput`, `LawsuitLegalTextDto`, `LawsuitCassationRulingDto`, `LawsuitRequestsStepOutput`, `LawsuitRequestItemDto` (lines 103-226) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs`. Only remove `[JsonPropertyName("...")]` lines, keep property declarations intact.

- [x] T005 [P] Remove ALL `[JsonPropertyName(...)]` attribute lines from records `AppealBriefStepOutput`, `AdminComplaintStepOutput`, `LegalWarningStepOutput`, `ExecRequestStepOutput` (lines 233-288) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs`. Keep `[JsonExtensionData]` attributes — only remove `[JsonPropertyName("...")]` lines. Keep property declarations intact.

### StepOutputSchemas.cs — Switch parser to SnakeCaseLower

- [x] T006 Change `_jsonOptions` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputSchemas.cs` from `PropertyNamingPolicy = JsonNamingPolicy.CamelCase` (line 12) to `PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower`. This ensures the AI's snake_case response is correctly deserialized into the C# PascalCase properties after `[JsonPropertyName]` removal.

### PreparingStatementOfClaims DTOs — Remove `[JsonPropertyName]`

- [x] T007 [P] Remove ALL `[JsonPropertyName(...)]` attribute lines from the `LawSuitCaseTypeResponseDto` class in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/PreparingStatementOfClaims/LawSuitCaseTypeDto.cs`. Keep property declarations intact.

- [x] T008 [P] Remove ALL `[JsonPropertyName(...)]` attribute lines from the `PartyDto` class in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/PreparingStatementOfClaims/LawSuitPartiesDto.cs`. Keep property declarations intact.

- [x] T009 [P] Remove ALL `[JsonPropertyName(...)]` attribute lines from the `LawSuitSubjectsResponseDto` class in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/PreparingStatementOfClaims/LawSuitSubjectsDto.cs`. Keep property declarations intact.

- [x] T010 [P] Remove ALL `[JsonPropertyName(...)]` attribute lines from the `LawSuitFactsResponseDto` class in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/PreparingStatementOfClaims/LawSuitFactsDto.cs`. Keep property declarations intact.

- [x] T011 [P] Remove ALL `[JsonPropertyName(...)]` attribute lines from ALL classes (`LawSuitLegalBasisResponseDto`, `LegalTextDto`, `CassationRulingDto`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/PreparingStatementOfClaims/LawSuitLegalBasisDto.cs`. Keep property declarations intact.

- [x] T012 [P] Remove ALL `[JsonPropertyName(...)]` attribute lines from ALL classes (`LawSuitRequestsResponseDto`, `LawSuitRequestItemDto`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/PreparingStatementOfClaims/LawSuitRequestsDto.cs`. Keep property declarations intact.

### PreparingStatementOfClaimsService.cs — Switch parser to SnakeCaseOptions

- [x] T013 In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`, change the `CamelCaseOptions` definition (around line 27) from `PropertyNamingPolicy = JsonNamingPolicy.CamelCase` to `PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower`. Also rename the field from `CamelCaseOptions` to `SnakeCaseOptions` for clarity. Then find-and-replace all 6 usages of `CamelCaseOptions` in the file (lines ~206, 367, 511, 655, 856, 1072) with `SnakeCaseOptions`.

### Compile check

- [x] T014 Run `dotnet build` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/` to verify the backend compiles successfully after all `[JsonPropertyName]` removals and parser option changes. Fix any compilation errors if they arise. (depends on T002, T003, T004, T005, T006, T007, T008, T009, T010, T011, T012, T013)

**Checkpoint**: Backend serialization is now correct. New AI results will be stored as camelCase. Phase 2 complete.

---

## Phase 3: User Story 1 — Backend & Frontend Normalization for PrepStatement (Priority: P1) 🎯 MVP

**Goal**: PreparingStatementOfClaims pipeline hydrates correctly in the frontend with proper camelCase data.

**Independent Test**: Trigger each of the 6 PrepStatement steps, verify the Redux state has camelCase keys (e.g. `state.preparingStatementOfClaims.outputs[1].caseMainType` is defined, not `undefined`). Refresh the page and verify data re-hydrates from getWorkflow path identically.

### Implementation for User Story 1

- [x] T015 [US1] Add `stepHydrators` to the `createWorkflowSlice` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice.ts`. The slice currently has NO `stepHydrators` property (line 104-116). Add a `stepHydrators` config object with normalizers for steps 1, 3, 4, 5, and 6. Each hydrator should use `??` fallback chains to handle BOTH camelCase (new data) AND snake_case (legacy data). Exact normalizer bodies are documented in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/ai-stages-data-flow.md` section 2 (lines 146-210). Step 2 (Parties) does NOT need a custom hydrator — the default assignment is sufficient because `LawsuitParties.tsx` already normalizes manually. (depends on T001)

- [x] T016 [US1] Run `npm run build` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/` to verify the frontend compiles after the slice changes. Fix any TypeScript type errors if they arise. (depends on T015)

**Checkpoint**: PreparingStatementOfClaims pipeline is fully fixed end-to-end.

---

## Phase 4: User Story 2 — Frontend Output Unwrapping for Workflow Pipelines (Priority: P1)

**Goal**: All workflow-based step components correctly unwrap the `{ output: "..." }` wrapper from AI job results AND normalize snake_case keys.

**Independent Test**: For each pipeline (AppealBrief, AdminComplaint, LegalWarning, ExecRequest, RulingAnalysis), trigger each step. Verify data appears in the UI. Refresh page and verify data re-hydrates correctly via getWorkflow path.

### 4a. AppealBrief Steps (use `useAnalysisStep` — add `parseResult`)

All 6 appeal steps use `useAnalysisStep` but do NOT pass a `parseResult` callback. Add one to each.
The pattern for ALL appeal steps is identical:

```typescript
import { parseJobResult, deepCamelize } from '../../../../../../utils/parseJobResult';
// ... in the useAnalysisStep call, add:
parseResult: (resultJson: string) => {
    const outer = parseJobResult(resultJson);
    const actual = typeof outer?.output === 'string' ? parseJobResult(outer.output) : outer;
    return deepCamelize(actual);
},
```

- [x] T017 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep1JudgmentData.tsx`. Import `parseJobResult` and `deepCamelize` from `../../../../../../utils/parseJobResult`. Add the `parseResult` property to the `useAnalysisStep` options object (after `inputJson`, before `onHydrate`). The parseResult function: parse the raw JSON, check if `outer.output` is a string → parse that inner string, then `deepCamelize` the result. (depends on T001)

- [x] T018 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep2Analysis.tsx`. Same pattern as T017: import `parseJobResult` and `deepCamelize`, add `parseResult` that unwraps `output` string and camelizes. (depends on T001)

- [x] T019 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep3Grounds.tsx`. Same pattern as T017. (depends on T001)

- [x] T020 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep4Requests.tsx`. Same pattern as T017. (depends on T001)

- [x] T021 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep5LegalBasis.tsx`. Same pattern as T017. (depends on T001)

- [x] T022 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep6Assembly.tsx`. Same pattern as T017. (depends on T001)

### 4b. AdminComplaint Steps (manual `JSON.parse` — replace with unwrapping logic)

All 5 complaint steps use manual `JSON.parse(job.resultJson)` inside a `useEffect`. Replace that inline parse with proper unwrapping. These files do NOT use `useAnalysisStep`.

The pattern for ALL complaint steps is identical. In the `useEffect` that handles hydration (the one checking `job?.status === 'Completed'`), replace:
```typescript
const parsed = JSON.parse(job.resultJson);
dispatch(hydrateStep({ stepNumber: N, result: parsed }));
```
with:
```typescript
import { parseJobResult, deepCamelize } from '../../../../../../utils/parseJobResult';
// ... inside useEffect:
const outer = parseJobResult(job.resultJson);
const actual = typeof outer?.output === 'string' ? parseJobResult(outer.output) : outer;
dispatch(hydrateStep({ stepNumber: N, result: deepCamelize(actual) }));
```
Also remove the `try/catch` wrapper since `parseJobResult` already handles parse errors safely.

- [x] T023 [P] [US2] Replace inline `JSON.parse` hydration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep1Classification.tsx`. Import `parseJobResult` and `deepCamelize` from `../../../../../../utils/parseJobResult`. In the `useEffect` around line 36-41, replace the `try { const parsed = JSON.parse(job.resultJson); dispatch(hydrateStep({ stepNumber: 1, result: parsed })); } catch {}` block with: `const outer = parseJobResult(job.resultJson); const actual = typeof outer?.output === 'string' ? parseJobResult(outer.output) : outer; dispatch(hydrateStep({ stepNumber: 1, result: deepCamelize(actual) }));`. (depends on T001)

- [x] T024 [P] [US2] Replace inline `JSON.parse` hydration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep2FactsDraft.tsx`. Same pattern as T023 but with `stepNumber: 2`. Import `parseJobResult` and `deepCamelize`, replace the try/catch JSON.parse block in the hydration useEffect. (depends on T001)

- [x] T025 [P] [US2] Replace inline `JSON.parse` hydration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep3ViolationAnalysis.tsx`. Same pattern as T023 but with `stepNumber: 3`. (depends on T001)

- [x] T026 [P] [US2] Replace inline `JSON.parse` hydration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep4RequestsDraft.tsx`. Same pattern as T023 but with `stepNumber: 4`. (depends on T001)

- [x] T027 [P] [US2] Replace inline `JSON.parse` hydration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep5FinalAssembly.tsx`. Same pattern as T023 but with `stepNumber: 5`. (depends on T001)

### 4c. LegalWarning Steps (manual `JSON.parse` — replace with unwrapping logic)

All 3 warning steps use manual `JSON.parse(job.resultJson)`. Same replacement pattern as complaint steps.

- [x] T028 [P] [US2] Replace inline `JSON.parse` hydration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep1Classification.tsx`. Import `parseJobResult` and `deepCamelize` from `../../../../../../utils/parseJobResult`. Replace the try/catch JSON.parse block in the hydration useEffect with: `const outer = parseJobResult(job.resultJson); const actual = typeof outer?.output === 'string' ? parseJobResult(outer.output) : outer; dispatch(hydrateStep({ stepNumber: 1, result: deepCamelize(actual) }));`. (depends on T001)

- [x] T029 [P] [US2] Replace inline `JSON.parse` hydration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep2WarningDraft.tsx`. Same pattern as T028 but with `stepNumber: 2`. This file hydrates on line 38-40 with `const parsed = JSON.parse(job.resultJson); dispatch(hydrateStep({ stepNumber: 2, result: parsed }));`. Replace with the unwrapping pattern. (depends on T001)

- [x] T030 [P] [US2] Replace inline `JSON.parse` hydration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep3FinalAssembly.tsx`. Same pattern as T028 but with `stepNumber: 3`. (depends on T001)

### 4d. ExecRequest Steps (use `useAnalysisStep` — add `parseResult`)

All 3 exec request steps use `useAnalysisStep`. Add `parseResult` callback. Same pattern as appeal steps.

- [x] T031 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/steps/ExecStep1Classification.tsx`. Import `parseJobResult` and `deepCamelize` from `../../../../../../utils/parseJobResult`. Add `parseResult` that unwraps the `output` string and camelizes. Same pattern as T017. (depends on T001)

- [x] T032 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/steps/ExecStep2Drafting.tsx`. Same pattern as T017. (depends on T001)

- [x] T033 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/steps/ExecStep3Assembly.tsx`. Same pattern as T017. (depends on T001)

### 4e. RulingAnalysis Steps (use `useAnalysisStep` — add `parseResult`)

All 4 ruling steps use `useAnalysisStep`. Add `parseResult` callback. Same pattern as appeal steps — unwrap `output` string and `deepCamelize`.

- [x] T034 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep1VerdictAnalysis.tsx`. Import `parseJobResult` and `deepCamelize` from `../../../../../../utils/parseJobResult`. Add `parseResult` that unwraps `output` string and camelizes. Same pattern as T017. (depends on T001)

- [x] T035 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep2ReasonsAnalysis.tsx`. Same pattern as T017. (depends on T001)

- [x] T036 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep3DefectsEvaluation.tsx`. Same pattern as T017. (depends on T001)

- [x] T037 [P] [US2] Add `parseResult` callback to the `useAnalysisStep` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep4AppealViability.tsx`. Same pattern as T017. (depends on T001)

### Frontend compile check

- [x] T038 [US2] Run `npm run build` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/` to verify the entire frontend compiles after all step component changes. Fix any TypeScript errors. (depends on T017-T037)

**Checkpoint**: All workflow-based pipelines now correctly unwrap and normalize AI job results.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation

- [x] T039 [P] Update the status markers in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/ai-stages-data-flow.md` for all pipeline sections. Change `⚠️ يحتاج إصلاح` to `✅ مكتمل` for sections 2 (PrepStatement), 3 (AppealBrief), 4 (AdminComplaint), 5 (LegalWarning), 6 (ExecRequest), and 7 (RulingAnalysis). (depends on T014, T038)

- [x] T040 Run full backend build AND frontend build together to confirm no cross-cutting regressions. Commands: `cd mohamy-smart-backend && dotnet build` and `cd mohamy-smart-lawyer-dashboard && npm run build`. Both must complete without errors. (depends on T014, T038)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. T001 is the foundation for all frontend tasks.
- **Phase 2 (Backend)**: All tasks T002-T013 can run in parallel (different files). T014 (compile check) depends on all of them.
- **Phase 3 (US1)**: T015 depends on T001. Can start in parallel with Phase 2.
- **Phase 4 (US2)**: All step-component tasks (T017-T037) depend only on T001. Can start in parallel with Phase 2 and Phase 3.
- **Phase 5 (Polish)**: T039-T040 depend on both T014 (backend) and T038 (frontend).

### User Story Dependencies

- **US1 (PrepStatement normalization)**: Depends on T001 (deepCamelize enhancement). Independent from US2.
- **US2 (Workflow output unwrapping)**: Depends on T001 (deepCamelize enhancement). Independent from US1.
- Both stories depend on Phase 2 (backend) for NEW data to be correct, but the frontend changes are backward-compatible with legacy data.

### Within Each User Story

- Frontend utility (T001) before any consumer
- Backend [JsonPropertyName] removal (T002-T012) in any order (different files)
- Backend parser option changes (T006, T013) in any order
- Frontend step component changes (T017-T037) all parallelizable (different files)
- Compile checks (T014, T016, T038) after their dependencies

### Parallel Opportunities

All `[P]` tasks within each phase can be executed simultaneously:
- Phase 2: T002-T013 (12 tasks in parallel — all different files)
- Phase 4a: T017-T022 (6 appeal steps in parallel)
- Phase 4b: T023-T027 (5 complaint steps in parallel)
- Phase 4c: T028-T030 (3 warning steps in parallel)
- Phase 4d: T031-T033 (3 exec steps in parallel)
- Phase 4e: T034-T037 (4 ruling steps in parallel)

---

## Parallel Example: Phase 2 Backend

```bash
# All Phase 2 tasks touch different files and can run simultaneously:
Task T002: "Remove [JsonPropertyName] from RulingStep DTOs in StepOutputDtos.cs"
Task T003: "Remove [JsonPropertyName] from SmartAnalysis DTOs in StepOutputDtos.cs"
Task T004: "Remove [JsonPropertyName] from Lawsuit DTOs in StepOutputDtos.cs"
Task T005: "Remove [JsonPropertyName] from workflow DTOs in StepOutputDtos.cs"
# NOTE: T002-T005 are in the SAME FILE — execute sequentially or merge into one task.
# T006-T013 are in DIFFERENT files — true parallel.
```

## Parallel Example: Phase 4 Frontend

```bash
# All step component tasks are in different files — true parallel:
Task T017: "AppealStep1JudgmentData.tsx"
Task T023: "ComplaintStep1Classification.tsx"
Task T028: "WarningStep1Classification.tsx"
Task T031: "ExecStep1Classification.tsx"
Task T034: "RulingStep1VerdictAnalysis.tsx"
# ... all 21 step files can be done simultaneously
```

---

## Implementation Strategy

### MVP First (Phase 1 + Phase 2 + US1)

1. Complete T001 (deepCamelize enhancement)
2. Complete T002-T014 (backend fixes + compile)
3. Complete T015-T016 (PrepStatement hydrators + compile)
4. **STOP and VALIDATE**: Test PrepStatement pipeline end-to-end
5. If passing → proceed to US2

### Incremental Delivery

1. T001 → Enhanced utility ready
2. T002-T014 → Backend serialization fixed → deploy-safe
3. T015-T016 → PrepStatement pipeline fixed → test independently
4. T017-T038 → All remaining pipelines fixed → test independently
5. T039-T040 → Documentation + final validation

---

## Notes

- T002-T005 modify the SAME file (`StepOutputDtos.cs`) — they must be executed **sequentially** or merged by the implementer into a single edit session, despite being logically parallel tasks.
- The `[JsonExtensionData]` attribute on `AppealBriefStepOutput`, `AdminComplaintStepOutput`, `LegalWarningStepOutput`, `ExecRequestStepOutput` must be PRESERVED — only remove `[JsonPropertyName]`.
- The `using System.Text.Json.Serialization;` import in `StepOutputDtos.cs` must be PRESERVED because `[JsonExtensionData]` needs it.
- Complaint steps (T023-T027) and Warning steps (T028-T030) do NOT use `useAnalysisStep` — they have manual `JSON.parse` + `useEffect` hydration that must be replaced differently from the appeal/exec/ruling steps.
- After backend changes, existing data in the DB will still have snake_case keys (legacy). The enhanced `deepCamelize` (T001) and the `??` fallback chains (T015) ensure backward compatibility.
