# Tasks: Backend Unification

**Input**: Design documents from `/specs/045-backend-unification/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story. Migration order follows R-001 (simplest → hardest).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared types and entities required by all subsequent phases.

- [x] T001 [P] Create canonical `JsonOptions` static class with `Deserialize` and `Serialize` presets in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Common/JsonOptions.cs` — `Deserialize`: `PropertyNameCaseInsensitive=true`, `AllowTrailingCommas=true`; `Serialize`: `CamelCase` naming policy (per R-002)

- [x] T002 [P] Create `ValidationFailureRecord` entity inheriting `BaseEntity` with fields: `WorkflowType` (string, required, max 100), `StepType` (int), `OccurredAt` (DateTime), `ErrorSummary` (string, max 2000), `RawOutput` (string?, max 2000), `CaseId` (Guid?), `LawyerId` (string?) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/ValidationFailureRecord.cs`

- [x] T003 [P] Create `ValidationFailureDto` record with properties: `Id`, `WorkflowType`, `StepType`, `OccurredAt`, `ErrorSummary`, `CaseId`, `LawyerId` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Admin/ValidationFailureDto.cs`

- [x] T004 Register `ValidationFailureRecord` as a `DbSet` in the `ApplicationDbContext` and add EF Core model configuration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Data/ApplicationDbContext.cs` (depends on T002)

- [x] T005 Generate EF Core migration for `ValidationFailureRecord` table by running `dotnet ef migrations add AddValidationFailureRecord` from the backend project root (depends on T004)

- [x] T006 Create custom `SchemaValidationException` class inheriting `Exception` with `WorkflowType`, `StepType`, `ErrorSummary`, and `RawOutput` properties in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Exceptions/SchemaValidationException.cs`

**Checkpoint**: Shared types ready — foundational phase can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Upgrade the shared base infrastructure — `StepOutputSchemas`, `WorkflowServiceBase`, and `AnalysisHelpers` — so migrated services inherit all unified behaviors automatically.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Update `StepOutputSchemas._jsonOptions` to use the new `JsonOptions.Deserialize` preset instead of `SnakeCaseLower` policy. Replace `PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower` with `PropertyNameCaseInsensitive = true` (no naming policy) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputSchemas.cs` (depends on T001)

- [x] T008 Add dual-format detection to `StepOutputSchemas.Normalize()`: before deserialization, parse `cleanJson` to a `JsonDocument`, check if any root-level property name contains an underscore — if yes, re-serialize the document with `CamelCase` naming policy, then proceed to typed deserialization (per R-004) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputSchemas.cs` (depends on T007)

- [x] T009 Change `StepOutputSchemas.Normalize()` to throw `SchemaValidationException` instead of returning an anonymous error object when deserialization fails. Catch `JsonException`, wrap `WorkflowType` (new parameter), `StepType`, error message, and truncated raw output into `SchemaValidationException` and throw in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputSchemas.cs` (depends on T006, T008)

- [x] T010 Update `WorkflowServiceBase.RunStepBaseAsync()` to catch `SchemaValidationException`, persist a `ValidationFailureRecord` to the database via `_unitOfWork`, log the failure via `_logger.LogWarning`, and return a `Result<object>.Error(HttpStatusCode.BadGateway, "فشل التحقق من صحة مخرجات الذكاء الاصطناعي: {errorSummary}")` — do NOT persist the step output in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T002, T009)

- [x] T011 Update `WorkflowServiceBase.RunStepBaseAsync()` serialization: replace `System.Text.Json.JsonSerializer.Serialize(validatedOutput)` with `JsonSerializer.Serialize(validatedOutput, JsonOptions.Serialize)` to enforce camelCase output in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T001)

- [x] T012 Add `string GetWorkflowTypeName()` abstract method to `WorkflowServiceBase` and pass its result as the `workflowType` parameter to `StepOutputSchemas.Normalize()` in the `RunStepBaseAsync` call in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T009)

**Checkpoint**: Foundation ready — service migrations can begin sequentially.

---

## Phase 3: User Story 1 — Consistent Data Format Across All Workflows (Priority: P1) 🎯 MVP

**Goal**: All 7 workflows return step outputs in camelCase via `System.Text.Json`, eliminating snake_case inconsistencies.

**Independent Test**: Trigger AI analysis in each workflow, verify dashboard receives camelCase fields without parsing errors.

### Service Migration 1: LegalWarningService (3 steps)

- [x] T013 [US1] Refactor `LegalWarningService` to extend `WorkflowServiceBase<LegalWarningWorkflow, LegalWarningWorkflowDto>`. Remove all duplicated fields (`_unitOfWork`, `_logger`, `_result`, `_aiProviderFactory`, `_contentRootPath`), constructor boilerplate, and duplicated methods (`StartWorkflowAsync`, `GetWorkflowAsync`, `GetWorkflowsByCaseAsync`, `AbandonWorkflowAsync`, `SaveEditedStepAsync`, `SaveDraftAsync`). Implement abstract methods: `TotalSteps => 3`, `GetPromptFolderName()`, `GetStepFileName(int)`, `GetStepType(int)`, `MapToDto()`, `BuildPreviousStepsContext()`, `CreateNewWorkflow()`, `GetWorkflowTypeName() => "legal-warning"` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/LegalWarningService.cs`

- [x] T014 [US1] Update `ILegalWarningService` interface to extend `IWorkflowServiceBase<LegalWarningWorkflowDto>` and remove duplicated method signatures that are now inherited from the base interface in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/ILegalWarningService.cs` (depends on T013)

- [x] T015 [US1] Verify `LegalWarningService` DI registration in `Program.cs` still compiles and resolve any constructor parameter changes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs` (depends on T014)

- [x] T016 [US1] Build the backend (`dotnet build`) and verify zero compilation errors after LegalWarningService migration (depends on T015)

### Service Migration 2: ExecRequestService (3 steps)

- [x] T017 [US1] Refactor `ExecRequestService` to extend `WorkflowServiceBase<ExecRequestWorkflow, ExecRequestWorkflowDto>`. Remove all duplicated boilerplate (same pattern as T013). Implement abstract methods: `TotalSteps => 3`, `GetPromptFolderName() => "المرحلة السابعة طلبات التنفيذ"`, `GetStepFileName(int)`, `GetStepType(int)`, `MapToDto()`, `BuildPreviousStepsContext()`, `CreateNewWorkflow()`, `GetWorkflowTypeName() => "exec-request"`. Override `BuildStepSpecificUserPrompt()` to include `ExecutiveTitleType` context in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/ExecRequestService.cs` (depends on T016)

- [x] T018 [US1] Update `IExecRequestService` interface to extend `IWorkflowServiceBase<ExecRequestWorkflowDto>` and remove duplicated method signatures in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IExecRequestService.cs` (depends on T017)

- [x] T019 [US1] Build the backend and verify zero compilation errors after ExecRequestService migration (depends on T018)

### Service Migration 3: AdminComplaintService — Audit

- [x] T020 [US1] Audit `AdminComplaintService` which already extends `WorkflowServiceBase`: verify it uses `ICaseAccessValidator` in constructor, calls `BuildPreviousStepsContext()` from `AnalysisHelpers`, uses `JsonOptions.Serialize` for output serialization, and implements `GetWorkflowTypeName() => "admin-complaint"`. Fix any deviations in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminComplaintService.cs` (depends on T019)

### Service Migration 4: AppealBriefService — Audit

- [x] T021 [US1] Audit `AppealBriefService` which already extends `WorkflowServiceBase`: verify it implements `GetWorkflowTypeName() => "appeal-brief"`, uses `JsonOptions.Serialize` in any direct `JsonSerializer.Serialize()` calls (line 100: `JsonSerializer.Serialize(dict)`), and confirm `ICaseAccessValidator` is properly injected and used. Fix any deviations in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AppealBriefService.cs` (depends on T020)

### Service Migration 5: RulingAnalysisService (4 steps)

- [x] T022 [US1] Refactor `RulingAnalysisService` (349 LOC) to extend `WorkflowServiceBase<RulingAnalysisWorkflow, RulingAnalysisWorkflowDto>`. Remove all duplicated boilerplate including inline `switch` blocks for step assignment (`workflow.Step1Output = cleanedJson`), reflection-based step clearing (`typeof(RulingAnalysisWorkflow).GetProperty`), and duplicated methods. Implement abstract methods: `TotalSteps => 4`, `GetPromptFolderName() => "المرحلة الخامسة تحليل حكم قضائي صادر"`, `GetStepFileName(int)`, `GetStepType(int)`, `MapToDto()`, `BuildPreviousStepsContext()`, `CreateNewWorkflow()`, `GetWorkflowTypeName() => "ruling-analysis"` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/RulingAnalysisService.cs` (depends on T021)

- [x] T023 [US1] Update `IRulingAnalysisService` interface to extend `IWorkflowServiceBase<RulingAnalysisWorkflowDto>` and remove duplicated method signatures in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IRulingAnalysisService.cs` (depends on T022)

- [x] T024 [US1] Build the backend and verify zero compilation errors after RulingAnalysisService migration (depends on T023)

### Legacy Compatibility Migration 6: SmartAnalysisService

- [x] T025 [US1] Replace `SmartAnalysisService.SnakeCaseOptions` and `CamelCaseOptions` static fields with `JsonOptions.Deserialize` and `JsonOptions.Serialize` respectively. Update all `JsonSerializer.Serialize(...)` and `JsonSerializer.Deserialize(...)` calls in the service to use the canonical `JsonOptions` presets in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs` (depends on T001)

### Legacy Compatibility Migration 7: PreparingStatementOfClaimsService

- [x] T026 [US1] Replace all inline `CleanJsonResponse(jsonText)` calls (6 occurrences) with `AnalysisHelpers.CleanJsonResponse(jsonText)` if not already using the static import, and replace any local JSON serialization options with `JsonOptions.Serialize` / `JsonOptions.Deserialize` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs` (depends on T001)

### Newtonsoft Removal

- [x] T027 [US1] Migrate `GeminiProvider` from `Newtonsoft.Json` to `System.Text.Json`: replace `Newtonsoft.Json.JsonConvert` calls with `System.Text.Json.JsonSerializer` using `JsonOptions.Deserialize` / `JsonOptions.Serialize`, and remove the `using Newtonsoft.Json;` directive in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AI/GeminiProvider.cs`

- [x] T028 [US1] Migrate `CaseOcrService` from `Newtonsoft.Json` / `Newtonsoft.Json.Linq` to `System.Text.Json`: replace `JObject`, `JArray`, `JsonConvert` usage with `JsonDocument`, `JsonElement`, `JsonSerializer` using canonical `JsonOptions`, and remove Newtonsoft usings in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/CaseOcrService.cs`

- [x] T029 [US1] Migrate `OcrController` from `Newtonsoft.Json` to `System.Text.Json` and remove the `using Newtonsoft.Json;` directive in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/OcrController.cs` (depends on T028)

- [x] T030 [US1] Remove `Newtonsoft.Json` package reference from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Lawyer.Application.csproj` and verify `dotnet build` succeeds with zero Newtonsoft references (depends on T027, T028, T029)

**Checkpoint**: All workflows now produce camelCase output via `System.Text.Json`. SC-001 and SC-008 verifiable.

---

## Phase 4: User Story 2 — Validated AI Outputs Before Storage (Priority: P1)

**Goal**: Schema validation covers 100% of known step types (~35). Invalid outputs are rejected with descriptive errors — never persisted.

**Independent Test**: Submit malformed AI output for each step type, verify rejection with clear error.

- [x] T031 [US2] Review `StepOutputDtos.cs` and ensure every step type in `StepOutputSchemas.Normalize()` switch statement has a corresponding typed DTO with explicit `[JsonPropertyName]` attributes for all expected fields. Add any missing DTOs for step types that currently fall through to `DynamicStepOutput` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs`

- [x] T032 [US2] Eliminate the `default: return ValidateAndParse<DynamicStepOutput>(cleanJson)` fallback in `StepOutputSchemas.Normalize()` for all KNOWN step types. Change the `default` case to throw `SchemaValidationException` with message "Unknown step type: {stepTypeAsInt}" for truly unknown types, while ensuring all ~35 known step types are explicitly mapped in the switch statement in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputSchemas.cs` (depends on T031)

- [x] T033 [US2] Update `ValidateAndParse<T>()` in `StepOutputSchemas` to check for null/empty required fields on the deserialized DTO result. If the result is `null` or all properties are null/empty, throw `SchemaValidationException` with message "AI output is structurally valid JSON but contains no expected fields for step type {stepType}" in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputSchemas.cs` (depends on T032)

- [x] T034 [US2] Update `SmartAnalysisService` parse methods (`ParseCaseAnalysisJson`, `ParseDefensesJson`, `ParseDefenseAnalysisJson`, `ParseFinalRequirementsJson`) to use `StepOutputSchemas.Normalize()` with the appropriate step type int instead of inline deserialization, ensuring schema validation is applied to legacy workflows in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs` (depends on T032)

- [x] T035 [US2] Update `PreparingStatementOfClaimsService` step processing methods to call `StepOutputSchemas.Normalize()` with the appropriate step type int for each of the 6 steps instead of inline `JsonSerializer.Deserialize()`, ensuring schema validation in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs` (depends on T032)

**Checkpoint**: SC-002 verifiable — all ~35 step types have typed schema validation.

---

## Phase 5: User Story 3 — Uniform Security Enforcement Across All Workflows (Priority: P1)

**Goal**: `ICaseAccessValidator.ValidateAsync()` is called at every workflow entry point across all 7 services.

**Independent Test**: For each workflow, attempt to start/access with a non-owning lawyer — must get authorization error.

- [x] T036 [US3] Audit `SmartAnalysisService` — verify `ICaseAccessValidator` is injected and called in ALL public methods: `AnalyzeCaseFactsAsync`, `GetFactAnalysisByCaseIdAsync`, `GenerateCaseDefensesAsync`, `GetDefensesByCaseIdAsync`, `AnalyzeDefenseAsync`, `GetDefenseAnalysisByDefenseIdAsync`, `GenerateFinalRequirementsAsync`, `ChatAsync`. Confirm no method relies on inline `caseEntity.LawyerId.ToString() != lawyerId` comparison — all must use `_caseAccessValidator.ValidateAsync()` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`

- [x] T037 [US3] Audit `PreparingStatementOfClaimsService` — verify `ICaseAccessValidator` is injected (add if missing) and called at every public workflow entry point. Replace any inline `caseEntity.LawyerId.ToString() != lawyerId` checks with `_caseAccessValidator.ValidateAsync()` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`

- [x] T038 [US3] Audit `RulingAnalysisService` (now extends `WorkflowServiceBase`) — verify that `StartWorkflowAsync` correctly delegates to `StartWorkflowBaseAsync` which uses `_caseAccessValidator`, and that no residual inline ownership checks remain from the pre-migration code in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/RulingAnalysisService.cs` (depends on T022)

- [x] T039 [US3] Audit `ExecRequestService` (now extends `WorkflowServiceBase`) — same verification as T038 in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/ExecRequestService.cs` (depends on T017)

- [x] T040 [US3] Audit `LegalWarningService` (now extends `WorkflowServiceBase`) — same verification as T038 in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/LegalWarningService.cs` (depends on T013)

**Checkpoint**: SC-003 verifiable — case ownership enforced in 100% of workflow entry points.

---

## Phase 6: User Story 4 — Centralized Utility Logic for Reliable AI Processing (Priority: P2)

**Goal**: Zero duplicate copies of `CleanJsonResponse`, `BuildCaseContext`, or `BuildPreviousStepsContext` remain outside `AnalysisHelpers`.

**Independent Test**: Search codebase for duplicate utility method calls — count must be zero outside `AnalysisHelpers.cs`.

- [x] T041 [US4] Remove the private `BuildPreviousStepsContext` static method from `RulingAnalysisService` (if still present after T022 migration) — it should now use the base class abstract method which delegates to `AnalysisHelpers.BuildPreviousStepsContext()` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/RulingAnalysisService.cs`

- [x] T042 [US4] Remove the private `BuildPreviousStepsContext` static method from `ExecRequestService` (if still present after T017 migration) — same pattern as T041 in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/ExecRequestService.cs`

- [x] T043 [US4] Verify `SmartAnalysisService` uses `AnalysisHelpers.BuildCaseContext()` and `AnalysisHelpers.CleanJsonResponse()` for all AI processing — remove any inline or local re-implementations of these methods in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`

- [x] T044 [US4] Verify `PreparingStatementOfClaimsService` uses `AnalysisHelpers.BuildCaseContext()` for all AI prompt building — remove any inline case context builder logic in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`

- [x] T045 [US4] Run `grep -rn "CleanJsonResponse\|BuildCaseContext\|BuildPreviousStepsContext" Lawyer.Application/Services/ --include="*.cs"` and verify that all utility calls resolve to `AnalysisHelpers` (single source) — no inline implementations remain. Document results in a build verification step (depends on T041, T042, T043, T044)

**Checkpoint**: SC-004 verifiable — exactly 1 copy of each shared utility.

---

## Phase 7: User Story 5 — Standardized Error Responses Across Workflows (Priority: P2)

**Goal**: All workflow services use `Result<T>.Error(HttpStatusCode, message)` consistently — no mixed error patterns.

**Independent Test**: Trigger identical errors in each workflow, verify response structure is uniform.

- [x] T046 [US5] In `WorkflowServiceBase`, replace all `_result.BadRequest<T>()`, `_result.NotFound<T>()`, `_result.Forbidden<T>()`, `_result.ServerError<T>()` calls with `Result<T>.Error(HttpStatusCode.BadRequest, ...)`, `Result<T>.Error(HttpStatusCode.NotFound, ...)`, `Result<T>.Error(HttpStatusCode.Forbidden, ...)`, `Result<T>.Error(HttpStatusCode.InternalServerError, ...)` respectively in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs`

- [x] T047 [US5] Remove `ApiExceptionResponse _result` field and constructor parameter from `WorkflowServiceBase` if no remaining usages exist after T046. Update all inheriting services' constructors accordingly in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T046)

- [x] T048 [US5] Update `SmartAnalysisService` to replace all `_result.NotFound<T>()`, `_result.BadRequest<T>()`, `_result.ServerError<T>()`, `_result.Forbidden<T>()` calls with `Result<T>.Error(HttpStatusCode.*, message)` pattern in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`

- [x] T049 [US5] Update `PreparingStatementOfClaimsService` to replace all `_result.*<T>(message)` calls with `Result<T>.Error(HttpStatusCode.*, message)` pattern in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`

- [x] T050 [US5] Build the backend and verify zero compilation errors after error response standardization (depends on T047, T048, T049)

**Checkpoint**: SC-005 verifiable — all workflows use `Result<T>.Error()`.

---

## Phase 8: User Story 6 — Simplified Addition of New Workflow Pipelines (Priority: P3)

**Goal**: Adding an 8th workflow requires ≤5 pipeline-specific files — shared base handles everything else.

**Independent Test**: Count the files needed to define a new workflow — must be ≤5.

- [x] T051 [US6] Verify that `WorkflowServiceBase` abstract methods form a complete contract for new workflows: `TotalSteps`, `GetPromptFolderName()`, `GetStepFileName(int)`, `GetStepType(int)`, `MapToDto()`, `BuildPreviousStepsContext()`, `CreateNewWorkflow()`, `GetWorkflowTypeName()`. Add inline XML documentation comments explaining each abstract method's purpose for future developers in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs`

- [x] T052 [US6] Verify that `PipelineRegistry` correctly lists all 7 pipelines with their step definitions, and that a new pipeline can be added by adding a single `PipelineDefinition` entry in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/PipelineRegistry.cs`

- [x] T053 [US6] Add a `README.md` developer guide documenting how to add a new workflow pipeline: (1) create entity inheriting `WorkflowBase`, (2) create service extending `WorkflowServiceBase`, (3) register step DTOs in `StepOutputDtos.cs`, (4) add step mappings in `StepOutputSchemas.cs`, (5) register pipeline in `PipelineRegistry.cs`. Include checklist format in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/README.md`

**Checkpoint**: SC-006 verifiable — new workflow ≤5 files.

---

## Phase 9: Validation Failure Observability (Admin Endpoint)

**Purpose**: Admin dashboard can query schema validation failure records (FR-014 / SC-009).

- [x] T054 Create `IValidationFailureService` interface with method `GetFailuresAsync(int page, int pageSize, string? workflowType, int? stepType, DateTime? from, DateTime? to)` returning `Result<PaginatedResult<ValidationFailureDto>>` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IValidationFailureService.cs`

- [x] T055 Implement `ValidationFailureService` that queries `ValidationFailureRecord` via `IUnitOfWork` with pagination, optional filtering by `WorkflowType`, `StepType`, and date range, and maps to `ValidationFailureDto` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/ValidationFailureService.cs` (depends on T054)

- [x] T056 Register `IValidationFailureService` → `ValidationFailureService` in DI container in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs` (depends on T055)

- [x] T057 Add `GET /api/admin/validation-failures` endpoint to `AdminController` with `[Authorize(Roles = "Admin")]`, accepting query parameters `page`, `pageSize`, `workflowType`, `stepType`, `from`, `to` — delegating to `IValidationFailureService.GetFailuresAsync()` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminController.cs` (depends on T056)

**Checkpoint**: SC-009 verifiable — admin can view validation failures.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and verification.

- [x] T058 Remove `IHttpContextAccessor` injection from `CaseAccessValidator` constructor if it is no longer needed (currently used only for admin role bypass and background job detection — verify these still work via alternative means) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/CaseAccessValidator.cs`

- [x] T059 Run full `dotnet build` on the backend solution and fix any remaining compilation errors across all projects in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/`

- [x] T060 Run `grep -rn "Newtonsoft" mohamy-smart-backend/ --include="*.cs" --include="*.csproj"` and verify zero results — confirm SC-008 in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/`

- [x] T061 Run `grep -rn "snake_case\|SnakeCaseLower" mohamy-smart-backend/Lawyer.Application/Services/ --include="*.cs"` and verify zero results in workflow services — confirm no residual snake_case policies

- [x] T062 Verify `AiJobWorker` compatibility: confirm that the `ExecuteStepAsync` switch statement still correctly delegates to all 7 workflow services after their migrations, and that `SerializeWorkflowResult` uses `JsonOptions.Serialize` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — sequential service migrations within
- **US2 (Phase 4)**: Depends on Phase 3 (needs migrated services + strict schemas)
- **US3 (Phase 5)**: Depends on Phase 3 (needs migrated services to audit)
- **US4 (Phase 6)**: Depends on Phase 3 (needs migrated services to verify utility consolidation)
- **US5 (Phase 7)**: Can start after Phase 2, but most effective after Phase 3
- **US6 (Phase 8)**: Depends on Phase 3 (needs the final WorkflowServiceBase shape)
- **Observability (Phase 9)**: Depends on Phase 1 (entity) — can run in parallel with Phases 3-8
- **Polish (Phase 10)**: Depends on all prior phases

### User Story Dependencies

- **US1 (P1)**: Foundational → then sequential service migrations (critical path)
- **US2 (P1)**: US1 must complete (schemas need unified services)
- **US3 (P1)**: US1 must complete (security audit on migrated services)
- **US4 (P2)**: US1 must complete (verify utility consolidation)
- **US5 (P2)**: US1 must complete (error patterns in migrated services)
- **US6 (P3)**: US1 must complete (base class finalized)

### Within US1 (Service Migration Order — per R-001)

Migrations are SEQUENTIAL — each service must compile and pass before the next begins:
1. LegalWarningService (T013–T016)
2. ExecRequestService (T017–T019)
3. AdminComplaintService audit (T020)
4. AppealBriefService audit (T021)
5. RulingAnalysisService (T022–T024)
6. SmartAnalysisService compatibility (T025)
7. PreparingStatementOfClaimsService compatibility (T026)
8. Newtonsoft removal (T027–T030)

---

## Parallel Opportunities

### Phase 1 (Setup)
```
T001 (JsonOptions) ‖ T002 (ValidationFailureRecord) ‖ T003 (ValidationFailureDto) ‖ T006 (SchemaValidationException)
```

### Phase 9 (Observability) — can run in parallel with Phases 4-8
```
T054 → T055 → T056 → T057  (independent of service migrations)
```

### Phases 4, 5, 6, 7, 8 — after US1 completes
```
US2 (T031-T035) ‖ US3 (T036-T040) ‖ US4 (T041-T045) ‖ US5 (T046-T050) ‖ US6 (T051-T053)
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T001–T006)
2. Complete Phase 2: Foundational (T007–T012)
3. Complete Phase 3: US1 — Service Migrations (T013–T030)
4. **STOP and VALIDATE**: All workflows produce camelCase, Newtonsoft removed
5. This alone delivers SC-001, SC-008

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 (Service Migrations) → Unified format ✅ → Deploy
3. US2 (Schema Validation) → Validated outputs ✅ → Deploy
4. US3 (Security Enforcement) → All workflows secured ✅ → Deploy
5. US4 + US5 (Utilities + Errors) → Consolidated codebase ✅ → Deploy
6. US6 (Developer Experience) → Documentation ✅ → Deploy
7. Phase 9 (Observability) → Admin visibility ✅ → Deploy

---

## Notes

- Service migrations in US1 are SEQUENTIAL per FR-013 and R-001
- `SmartAnalysisService` and `PreparingStatementOfClaimsService` get compatibility layers only (no base class extension) per R-005
- Dual-format detection (T008) is temporary — remove once legacy jobs complete
- No frontend changes in this phase — frontend unification is Phase 2 (separate feature)
- Arabic error messages must be preserved in all migrated services
