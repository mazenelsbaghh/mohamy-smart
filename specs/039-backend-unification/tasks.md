# Tasks: Phase 1 — Backend Unification

**Input**: Design documents from `/specs/039-backend-unification/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks are omitted.

**Organization**: Tasks grouped by user story for independent implementation.

**Root**: `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4)
- Each task targets one file (max 3 if tightly related)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure `AnalysisHelpers.cs` is the single source for all reusable utility methods before any service is refactored.

- [x] T001 Remove the duplicate `CleanJsonResponse` private method (lines 53-61) inside `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputSchemas.cs`. Replace its internal call on line 17 with `AnalysisHelpers.CleanJsonResponse(rawAiOutput)`. Add `using Lawyer.Application.Common;` if not already present. The file already has this method duplicated — the canonical version lives in `AnalysisHelpers.cs`.

- [x] T002 Remove the duplicate `CleanJsonResponse` private method (lines 295-306), the duplicate `DeserializeOutput` private method (lines 308-318), the duplicate `TryExtractJsonPayload` private method (lines 416-444), and the duplicate `IsValidJson` private method (lines 446-460) from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AppealBriefService.cs`. Replace each call to these methods throughout the file with calls to `AnalysisHelpers.CleanJsonResponse(...)`, `AnalysisHelpers.TryExtractJsonPayload(...)`, `AnalysisHelpers.IsValidJson(...)` respectively. For `DeserializeOutput`, use `AnalysisHelpers.DeserializeOutput(...)`. Add `using static Lawyer.Application.Common.AnalysisHelpers;` or qualify the calls directly. Ensure the file compiles cleanly after removal.

- [x] T003 Add a generic `BuildPreviousStepsContext` method to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Common/AnalysisHelpers.cs`. The method signature should be: `public static string BuildPreviousStepsContext<TWorkflow>(TWorkflow workflow, int currentStep) where TWorkflow : WorkflowBase`. It should iterate from step 1 to `currentStep - 1`, call `workflow.GetStepOutput(stepNumber)` for each, and concatenate non-null outputs into a labelled string like `"الخطوة {i}: {output}\n"`. Add `using Lawyer.Core.Models;` for `WorkflowBase`. This replaces the 5 duplicate implementations scattered across `RulingAnalysisService.cs`, `ExecRequestService.cs`, `AppealBriefService.cs`, `LegalWarningService.cs`, and `AdminComplaintService.cs`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure `WorkflowServiceBase` and `StepOutputSchemas` are fully capable before migrating specific services.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Update the `StepOutputSchemas.Normalize` method in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputSchemas.cs` to change the `_jsonOptions` `PropertyNamingPolicy` from `JsonNamingPolicy.SnakeCaseLower` (line 11) to `JsonNamingPolicy.CamelCase`. This enforces camelCase globally for step output validation, aligning with the unification goal. Everything else in this file stays the same.

- [x] T005 Extend the `switch` statement in `StepOutputSchemas.Normalize` (lines 22-34) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputSchemas.cs` to add typed schemas for the remaining pipeline step types. Add case blocks for AppealBrief steps (mapped via `AiStepType` enum integer values), AdminComplaint steps, LegalWarning steps, and ExecRequest steps. For each, either create strongly-typed DTO classes in the same file or in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs`, then add `case XX: return ValidateAndParse<XxxStepOutput>(cleanJson);` entries. Keep the `default` fallback to `DynamicStepOutput`. Verify the integer values match the `AiStepType` enum values in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Enum/AiStepType.cs`.

- [x] T006 Add a `GetStepNumber(AiStepType stepType)` static method to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/PipelineRegistry.cs`. This method should find the `PipelineDefinition` whose `Steps` list contains the given `stepType`, then return the 1-based index of that step within the pipeline's `Steps` list. If not found, throw `ArgumentOutOfRangeException`. This replaces the 5 duplicate `GetXxxStepNumber` switch expressions in `AiJobWorker.cs` (lines 330-374).

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Centralized Operations Processing (Priority: P1) 🎯 MVP

**Goal**: Every service delegates text cleaning \u0026 context building to `AnalysisHelpers` — no local copies remain.

**Independent Test**: Run any workflow step through `SmartAnalysisService` or `ExecRequestService` and confirm `AnalysisHelpers.CleanJsonResponse` is the only JSON cleaning codepath.

### Implementation for User Story 1

- [x] T007 [US1] In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`: Replace every call to `JsonConvert.SerializeObject(...)` with the `SnakeCaseSettings` variant with `System.Text.Json.JsonSerializer.Serialize(...)`. Replace every call to `JsonConvert.DeserializeObject<T>(...)` with `System.Text.Json.JsonSerializer.Deserialize<T>(..., new JsonSerializerOptions { PropertyNameCaseInsensitive = true })`. Remove the `using Newtonsoft.Json;` import (line 7) and the `SnakeCaseSettings` field (lines 31-38). Add `using System.Text.Json;` if not already present. There are approximately 15+ usages of `JsonConvert` throughout this 1371-line file. **Important**: After migration, all serialized output will be camelCase instead of snake_case. This is the intended behavior.

- [x] T008 [US1] In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`: Replace the 4 hardcoded system prompt `const string` fields (lines 41-44: `AnalysisSystemPrompt`, `DefensesSystemPrompt`, `DefenseAnalysisSystemPrompt`, `FinalRequirementsSystemPrompt`) with file-based prompt loading. Each prompt should be loaded from external `.txt` files under `wwwroot/prompts/المرحلة الأولى إعداد مذكرة الدفاع/` using `await File.ReadAllTextAsync(Path.Combine(_contentRootPath, "wwwroot", "prompts", ...))` at method invocation time (not at construction time). Remove the `const` fields. The prompt file names already exist and are used by other methods in this file (e.g., `defense-step2-legal-analysis.txt`). Create any missing prompt files as empty `.txt` files if they do not exist yet.

- [x] T009 [US1] In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`: Replace the manually inlined `BuildCaseContext(caseEntity)` code (wherever case context strings are built inline using `$"اسم الموكل: {caseEntity.ClientName}..."`) with calls to `AnalysisHelpers.BuildCaseContext(caseEntity)`. The existing `AnalysisHelpers.BuildCaseContext` method at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Common/AnalysisHelpers.cs` lines 77-97 already has the canonical implementation. Ensure `using static Lawyer.Application.Common.AnalysisHelpers;` is present.

- [x] T010 [US1] In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`: Replace every call to `JsonConvert.SerializeObject(...)` and `JsonConvert.DeserializeObject<T>(...)` with `System.Text.Json.JsonSerializer.Serialize(...)` and `System.Text.Json.JsonSerializer.Deserialize<T>(..., new JsonSerializerOptions { PropertyNameCaseInsensitive = true })`. Remove the `using Newtonsoft.Json;` import (line 7) and the `SnakeCaseSettings` field (lines 26-33). Add `using System.Text.Json;`. This is a 1122-line file with approximately 20+ usages. **Important**: After migration, all serialized output changes from snake_case to camelCase. This is deliberate and matches the global unification.

- [x] T011 [US1] In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`: Replace the 6 hardcoded system prompt `const string` fields (lines 35-40: `LawSuitCaseTypeSystemPrompt`, `LawSuitPartiesSystemPrompt`, `LawSuitSubjectsSystemPrompt`, `LawSuitFactsSystemPrompt`, `LawSuitLegalBasisSystemPrompt`, `LawSuitRequestsSystemPrompt`) with file-based prompt loading similar to T008. Each prompt should use `await File.ReadAllTextAsync(Path.Combine(_contentRootPath, "wwwroot", "prompts", "المرحلة الثانية إعداد صحيفة الدعوى", "<filename>.txt"))`. The prompt template files already exist at that path. Remove the `const` fields.

- [x] T012 [US1] In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`: Fix all structured logging violations. Replace every interpolated string loggers like `_logger.LogInformation($"Sending analysis request for Case ID: {request.CaseId}")` (e.g., lines 114, 160, 166, 212, 363) with template-based logging like `_logger.LogInformation("Sending analysis request for Case ID: {CaseId}", request.CaseId)`. Search for all `$"` inside `_logger.Log*` calls across the entire file and fix them all.

**Checkpoint**: User Story 1 complete. `SmartAnalysisService` and `PreparingStatementOfClaimsService` now use `AnalysisHelpers`, `System.Text.Json`, and file-based prompts exclusively.

---

## Phase 4: User Story 2 — Unified Processing Pipeline (Priority: P1)

**Goal**: Migrate `AppealBriefService` from standalone `IApplicationDbContext` pattern to inherit `WorkflowServiceBase`, and unify `AiJobWorker` to use `PipelineRegistry` dynamic dispatch.

**Independent Test**: Invoke any appeal-brief workflow step and verify it runs through the `WorkflowServiceBase` path. Verify AiJobWorker dispatches RulingAnalysis/ExecRequest/LegalWarning/AdminComplaint steps using `PipelineRegistry.GetStepNumber()`.

### Implementation for User Story 2

- [x] T013 [US2] Refactor `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AppealBriefService.cs` to inherit from `WorkflowServiceBase<AppealWorkflow, AppealWorkflowDto>`. Remove `IApplicationDbContext _db` field and replace with constructor calling `base(unitOfWork, logger, result, aiProviderFactory, config, caseAccessValidator)`. The new constructor should accept: `IUnitOfWork unitOfWork`, `ILogger<AppealBriefService> logger`, `ApiExceptionResponse result`, `IAIProviderFactory aiProviderFactory`, `IConfiguration config`, `ICaseAccessValidator caseAccessValidator`. Override the abstract members: `TotalSteps => 6`, `GetPromptFolderName() => "appeal-brief"`, `GetStepFileName(int step)` returning `"step{step}.txt"`, `GetStepType(int step)` mapping step 1-6 to `AiStepType.AppealBrief*`, `MapToDto(AppealWorkflow w)` using the existing `MapToDto` private method logic, `BuildPreviousStepsContext(...)` delegating to `AnalysisHelpers.BuildPreviousStepsContext(workflow, currentStep)`, `CreateNewWorkflow(Guid caseId, string lawyerId)` returning `new AppealWorkflow { CaseId = caseId, LawyerId = lawyerId }`. Keep the step-specific `RunStep1..RunStep6` methods as `RunStepAsync` overrides if needed for unique logic. Remove `StartWorkflowAsync`, `GetWorkflowAsync`, `GetWorkflowsByCaseAsync`, `AbandonWorkflowAsync`, `SaveEditedStepAsync` methods since they are now inherited from the base class.

- [x] T014 [US2] Update the DI registration for `AppealBriefService` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs` (or wherever services are registered). Change the `AddScoped<IAppealBriefService, AppealBriefService>()` registration to inject the new constructor dependencies: `IUnitOfWork`, `ILogger<AppealBriefService>`, `ApiExceptionResponse`, `IAIProviderFactory`, `IConfiguration`, `ICaseAccessValidator`. If the existing DI container already resolves these, no changes may be needed — just verify the constructor signature matches.

- [x] T015 [US2] Replace the 5 duplicate `GetXxxStepNumber(AiStepType)` switch expressions in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs` (lines 330-374: `GetAppealBriefStepNumber`, `GetAdminComplaintStepNumber`, `GetLegalWarningStepNumber`, `GetRulingAnalysisStepNumber`, `GetExecRequestStepNumber`) with calls to `PipelineRegistry.GetStepNumber(step)` (the method created in T006). Delete the 5 private methods after replacing all their call sites. Each call site is in `ExecuteAppealBriefStepAsync`, `ExecuteAdminComplaintStepAsync`, `ExecuteLegalWarningStepAsync`, `ExecuteRulingAnalysisStepAsync`, `ExecuteExecRequestStepAsync`.

- [ ] T016 [US2] Create a generic `WorkflowDto<TStepOutput>` class in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Workflows/WorkflowDto.cs`. The class should have properties: `int Id`, `Guid CaseId`, `string LawyerId`, `int CurrentStep`, `string Status`, `Dictionary<int, TStepOutput> Outputs`, `DateTime CreatedAt`, `string? ExecuteTitleType`. Serialized with `System.Text.Json` and camelCase naming. This class will eventually replace the per-workflow DTOs (`RulingAnalysisWorkflowDto`, `ExecRequestWorkflowDto`, `AppealWorkflowDto`, etc.) but for now it is a parallel addition — existing DTOs remain.

- [x] T017 [US2] In the `MapToDto` override method inside `RulingAnalysisService` at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/RulingAnalysisService.cs`, replace the `BuildPreviousStepsContext` local implementation with a call to `AnalysisHelpers.BuildPreviousStepsContext(workflow, currentStep)`. Add `using static Lawyer.Application.Common.AnalysisHelpers;` if not present. Also remove the `_httpContextAccessor` field and its import if it is unused elsewhere in the file (referenced in plan as MED-14).

- [x] T018 [US2] In the `MapToDto` override method inside `ExecRequestService` at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/ExecRequestService.cs`, replace the `BuildPreviousStepsContext` local implementation with a call to `AnalysisHelpers.BuildPreviousStepsContext(workflow, currentStep)`. Add `using static Lawyer.Application.Common.AnalysisHelpers;` if not present. Also remove the `_httpContextAccessor` field and its import if it is unused elsewhere in the file (referenced in plan as MED-14).

**Checkpoint**: User Story 2 complete. `AppealBriefService` inherits `WorkflowServiceBase`. `AiJobWorker` uses `PipelineRegistry` for step number resolution.

---

## Phase 5: User Story 3 — Unified Data Formatting (Priority: P2)

**Goal**: Ensure all 7 services output camelCase JSON uniformly via `System.Text.Json`.

**Independent Test**: Call each workflow API endpoint and verify every response payload uses camelCase property names without any snake_case remnants.

### Implementation for User Story 3

- [x] T019 [US3] In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AppealBriefService.cs`: Verify that after the refactor in T013, all `JsonSerializer.Serialize(...)` calls use the default `System.Text.Json` options (which produces camelCase when configured globally in ASP.NET Core). Remove any local `JsonSerializerOptions` with `SnakeCaseLower`. Confirm `using Newtonsoft.Json;` is NOT present anywhere in this file 

- [x] T020 [US3] Verify global JSON serialization settings in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`. Ensure `builder.Services.AddControllers().AddJsonOptions(opts => opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase)` (or equivalent) is configured. If this line does not exist, add it. This ensures all controller responses automatically serialize to camelCase without per-service configuration.

- [x] T021 [US3] Search for any remaining `using Newtonsoft.Json;` in the entire backend project by running `grep -rn "using Newtonsoft.Json" /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/`. For each hit that is in a workflow service file (`SmartAnalysisService.cs`, `PreparingStatementOfClaimsService.cs`, `AppealBriefService.cs`, `RulingAnalysisService.cs`, `ExecRequestService.cs`, `LegalWarningService.cs`, `AdminComplaintService.cs`), remove it and replace any remaining `JsonConvert` usages with `System.Text.Json.JsonSerializer`. Do NOT touch non-workflow files (like `PaymobService.cs` or `CaseService.cs`) — they are out of scope.

**Checkpoint**: User Story 3 complete. All 7 workflow services exclusively use `System.Text.Json` with camelCase output.

---

## Phase 6: User Story 4 — Consistent Security Boundaries (Priority: P1)

**Goal**: All workflow services use `ICaseAccessValidator` uniformly — no ad-hoc `LawyerId` checks or inline `HttpContext` user extraction.

**Independent Test**: Call any workflow start/run/get endpoint using a JWT token belonging to a lawyer who does NOT own the target case. All should return 403 Forbidden.

### Implementation for User Story 4

- [x] T022 [US4] In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AppealBriefService.cs`: After the T013 refactor, confirm that `StartWorkflowBaseAsync` (inherited from `WorkflowServiceBase`) calls `_caseAccessValidator.ValidateAsync(caseId, lawyerId, ct)` on line 63 of the base class. The old `AppealBriefService.StartWorkflowAsync` (line 28-43) did NOT check ownership — it only checked `caseExists`. This security gap is now closed by the base class. Verify no residual `StartWorkflowAsync` method bypasses the base class check.

- [x] T023 [US4] In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`: Replace the custom `ValidateCaseAccessAsync` private method (lines 66-99) with a call to `_caseAccessValidator.ValidateAsync(caseEntity.Id, lawyerId, ct)`. Add `ICaseAccessValidator _caseAccessValidator` as a constructor dependency. Update every method that calls `ValidateCaseAccessAsync(caseEntity, cancellationToken)` to instead call `await _caseAccessValidator.ValidateAsync(caseEntity.Id, lawyerId, ct)` where `lawyerId` is obtained from `UserContextHelper.GetUserId(_httpContextAccessor)`. There are approximately 12 call sites throughout the file. Delete the `ValidateCaseAccessAsync` private method after migration.

- [x] T024 [US4] In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`: Pass `CancellationToken` to every `_unitOfWork.Repository<T>().FirstOrDefaultAsync()` call that currently omits it. Search for `.FirstOrDefaultAsync(x =>` without a trailing `, cancellationToken)` or `, ct)` argument. There are approximately 5-8 such calls (e.g., line 88, line 179, line 326, line 461). Add the cancellation token parameter to each. This fixes MED-08 from the plan.

**Checkpoint**: User Story 4 complete. All services use `ICaseAccessValidator`, and `CancellationToken` is properly threaded.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Clean up residual duplication and ensure compilation.

- [x] T025 Verify the entire backend solution compiles cleanly. Run `dotnet build` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/`. Fix any compilation errors caused by the refactoring in T001-T024. Common issues will include: missing `using` statements, changed method signatures in interfaces (`IAppealBriefService`), and constructor parameter mismatches in DI registration.

- [x] T026 Update the `IAppealBriefService` interface at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IAppealBriefService.cs` to match the new method signatures after T013. Remove any methods that are now inherited from `WorkflowServiceBase` (like `StartWorkflowAsync`, `GetWorkflowAsync`, `GetWorkflowsByCaseAsync`, `AbandonWorkflowAsync`, `SaveEditedStepAsync`) if they are only defined in the interface to mirror the base class. Keep `RunStepAsync` if it has a unique signature. The interface should only declare methods NOT provided by the base class.

- [x] T027 [P] Remove the `IHttpContextAccessor` constructor parameter and field from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/RulingAnalysisService.cs` if it is not used anywhere after T017. Also remove `using Microsoft.AspNetCore.Http;` if unused. Do the same check for `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/ExecRequestService.cs`.

- [x] T028 [P] Update the `PreparingStatementOfClaimsService` constructor at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs` to add `ICaseAccessValidator caseAccessValidator` parameter (from T023). Update its DI registration in `Program.cs` or wherever services are registered to ensure `ICaseAccessValidator` is injected.

- [x] T029 Run a final `dotnet build` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/` and ensure zero warnings related to the refactored files. If test projects exist, run `dotnet test` to ensure no regressions.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1: T001-T003)**: No dependencies — start immediately
- **Foundational (Phase 2: T004-T006)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3: T007-T012)**: Depends on Phase 2 completion
- **US2 (Phase 4: T013-T018)**: Depends on Phase 2 completion. Can run in parallel with US1 if careful, but recommended after US1 since `AnalysisHelpers` changes apply
- **US3 (Phase 5: T019-T021)**: Depends on US1 (T007, T010 for Newtonsoft removal), US2 (T013 for AppealBrief)
- **US4 (Phase 6: T022-T024)**: Depends on US2 (T013 for AppealBrief base class migration)
- **Polish (Phase 7: T025-T029)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No dependencies on other stories
- **US2 (P1)**: Can start after Foundational — Recommended after US1 (uses `AnalysisHelpers` additions from T003)
- **US3 (P2)**: Depends on US1 + US2 (Newtonsoft removal must be done first)
- **US4 (P1)**: Depends on US2 (AppealBrief must inherit base class first for security check to apply)

### Within Each User Story

- T001-T003 (Setup) can all run in parallel [P]
- T004, T005, T006 (Foundational) should be sequential: T004 → T005 → T006
- T007, T008, T009 can run in parallel within US1 [P] (they touch the same file but different sections)
- T010, T011 can run in parallel within US1 [P] (PrepStatements is a separate file)
- T013 must complete before T014
- T015 depends on T006

### Parallel Opportunities

```
# Phase 1 setup (all parallel):
T001 | T002 | T003

# Phase 2 foundational:
T004 → T005 → T006

# US1 (SmartAnalysis + PrepStatements migration):
T007 + T008 + T009 (same file, different sections — careful parallel)
T010 + T011 (different file — safe parallel)
T012 (after T007)

# US2 (AppealBrief + AiJobWorker):
T013 → T014
T015 (depends on T006)
T016 (independent — new file)
T017 + T018 (different files — safe parallel)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006)
3. Complete Phase 3: US1 — Centralized Operations (T007-T012)
4. **STOP and VALIDATE**: Build the solution. Verify SmartAnalysis + PrepStatements compile and serialize camelCase.
5. Complete Phase 4: US2 — Unified Pipeline (T013-T018)
6. **STOP and VALIDATE**: Build and verify AppealBrief inherits base class. Test AiJobWorker dispatching.

### Full Delivery

7. Complete Phase 5: US3 — Unified Formatting (T019-T021)
8. Complete Phase 6: US4 — Security (T022-T024)
9. Complete Phase 7: Polish (T025-T029)
10. Final `dotnet build` + `dotnet test`

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps tasks to user stories for traceability
- Each task is designed for a low-cost LLM: exact file paths, exact line numbers where applicable, exact method names to change
- `SmartAnalysisService.cs` (1371 lines) and `PreparingStatementOfClaimsService.cs` (1122 lines) are the largest files — tasks for these are split by concern to keep each change tractable
- The `Newtonsoft.Json` → `System.Text.Json` migration (T007, T010) will break frontend field mapping for Phases 1-2 (snake_case → camelCase) — this is intentional and coordinated with the Phase 2 Frontend plan
