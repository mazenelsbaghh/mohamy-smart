# Tasks: Executive & Precautionary Requests (الطلبات التنفيذية والتحفظية)

**Feature branch**: `026-exec-requests`
**Input**: `specs/026-exec-requests/`
**Exact paths**: All paths relative to repo root `mohamy-smart/`

> **LLM execution note**: `WorkflowStatus` enum already exists from 022-appeal-brief T001. Do NOT recreate it. Each task is one file or one targeted edit.

---

## Phase 1: Setup

- [x] T001 Add 3 new values to `mohamy-smart-backend/Lawyer.Core/Enum/AiStepType.cs` after the existing `LegalWarningAssembly = 72` (or after the last existing value): `ExecRequestClassification = 80`, `ExecRequestDrafting = 81`, `ExecRequestAssembly = 82`. Keep all existing values untouched.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

- [x] T002 Create `ExecRequestWorkflow` entity in `mohamy-smart-backend/Lawyer.Core/Models/ExecRequestWorkflow.cs`. Namespace: `Lawyer.Core.Models`. Properties: `Id` (int, PK), `CaseId` (Guid, FK), `LawyerId` (string, max 450), `ExecutiveTitleType` (string, e.g., "judicial" / "contractual" / "commercial"), `CurrentStep` (int, default 1), `Status` (WorkflowStatus, import `Lawyer.Core.Enum`), `Step1Output` (string?, nullable), `Step2Output` (string?, nullable), `Step3Output` (string?, nullable), `CreatedAt` (DateTime, `= DateTime.UtcNow`), `UpdatedAt` (DateTime, `= DateTime.UtcNow`). Nav prop: `public Case Case { get; set; } = null!;`.

- [x] T003 Add `DbSet<ExecRequestWorkflow> ExecRequestWorkflows { get; }` to `IApplicationDbContext` in `mohamy-smart-backend/Lawyer.Core/Interface/IApplicationDbContext.cs`.

- [x] T004 Add `public DbSet<ExecRequestWorkflow> ExecRequestWorkflows { get; set; } = null!;` to `AppDbContext` in `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`.

- [x] T005 [P] Create 3 DTO files in `mohamy-smart-backend/Lawyer.Application/Dtos/ExecRequest/`:
  - `StartExecRequestRequest.cs`: properties `public Guid CaseId { get; set; }` and `public string ExecutiveTitleType { get; set; } = "judicial";` (one of: "judicial", "contractual", "commercial").
  - `RunExecStepRequest.cs`: property `public string? Input { get; set; }` (used only in step 1 for case facts).
  - `ExecRequestWorkflowDto.cs`: properties `Id` (int), `CaseId` (Guid), `LawyerId` (string), `ExecutiveTitleType` (string), `CurrentStep` (int), `Status` (string), `Step1Output` / `Step2Output` / `Step3Output` (string?, nullable each), `CreatedAt` (DateTime).

- [x] T006 Create `IExecRequestService` in `mohamy-smart-backend/Lawyer.Application/IServices/IExecRequestService.cs`. Methods:
  ```
  Task<Result<ExecRequestWorkflowDto>> StartWorkflowAsync(StartExecRequestRequest request, string lawyerId, CancellationToken ct);
  Task<Result<ExecRequestWorkflowDto>> GetWorkflowAsync(int id, string lawyerId, CancellationToken ct);
  Task<Result<List<ExecRequestWorkflowDto>>> GetWorkflowsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct);
  Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunExecStepRequest request, string lawyerId, CancellationToken ct);
  Task<Result<object>> SaveEditedStepAsync(int workflowId, int stepNumber, string editedOutputJson, string lawyerId, CancellationToken ct);
  Task<Result<bool>> AbandonWorkflowAsync(int id, string lawyerId, CancellationToken ct);
  ```

- [x] T007 Register in `mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs`: `services.AddScoped<IExecRequestService, ExecRequestService>();`

- [x] T008 Create `ExecRequestService` in `mohamy-smart-backend/Lawyer.Application/Services/ExecRequestService.cs`. Implements `IExecRequestService`. Inject `IApplicationDbContext db`, `IAIProviderFactory aiProviderFactory`, `ILogger<ExecRequestService> logger`. Implement CRUD methods fully. `RunStepAsync` is a stub `switch (stepNumber)`. In `StartWorkflowAsync`: persist `ExecutiveTitleType` from the request to the new `ExecRequestWorkflow` entity.

- [x] T009 Generate migration: `cd mohamy-smart-backend && dotnet ef migrations add AddExecRequestWorkflows --project Lawyer.Infrastracture --startup-project Lawyer`. Add InsertData in `Up()`:
  ```csharp
  migrationBuilder.InsertData(
      table: "AiStageModelConfigs",
      columns: new[] { "Id", "ModelIdentifier", "StepType", "UpdatedAt", "UpdatedBy" },
      values: new object[,]
      {
          { 31, "gemini-3.1-pro-preview", 80, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 32, "gemini-3.1-pro-preview", 81, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 33, "gemini-3.1-pro-preview", 82, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
      });
  ```
  Adjust Id values to be higher than last existing seed row.

- [x] T010 Add 3 entries to `StageDefinitions` in `mohamy-smart-backend/Lawyer.Application/Services/AiModelConfigService.cs`:
  ```csharp
  (AiStepType.ExecRequestClassification, "تحليل وتصنيف طبيعة الطلب", "الطلبات التنفيذية", 9),
  (AiStepType.ExecRequestDrafting, "صياغة الطلبات", "الطلبات التنفيذية", 9),
  (AiStepType.ExecRequestAssembly, "تجميع العريضة النهائية", "الطلبات التنفيذية", 9),
  ```

- [x] T011 Create `ExecRequestController` in `mohamy-smart-backend/Lawyer/Controllers/ExecRequestController.cs`. `[Route("api/[controller]")]`, `[ApiController]`, `[Authorize(Roles = "Lawyer")]`. Inject `IExecRequestService _service`. Helper: `private string GetLawyerId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;`. Endpoints:
  - `POST /` → `StartWorkflowAsync(request, GetLawyerId(), ct)` → 201 Created
  - `GET /{id}` → `GetWorkflowAsync(id, GetLawyerId(), ct)` → 200
  - `GET /case/{caseId}` → `GetWorkflowsByCaseAsync(caseId, GetLawyerId(), ct)` → 200
  - `POST /{id}/step/{stepNumber}` → `RunStepAsync(id, stepNumber, request, GetLawyerId(), ct)` → 200
  - `PUT /{id}/step/{stepNumber}` → `SaveEditedStepAsync(id, stepNumber, request.EditedOutputJson, GetLawyerId(), ct)` → 200
  - `DELETE /{id}` → `AbandonWorkflowAsync(id, GetLawyerId(), ct)` → 200

**Checkpoint**: Solution compiles. Migration applies.

---

## Phase 3: User Story 1 — Request Nature Analysis & Classification (Priority: P1) 🎯 MVP

**Goal**: Lawyer inputs case facts → system classifies whether it needs executive petition, precautionary measure, service request, or combination. Identifies court competency and service requirements.

**Independent Test**: `POST /api/ExecRequest/{id}/step/1` with `{"input": "صدر حكم بإلزام المدعى عليه..."}` returns JSON with `requestNature` array, `detailedRequestType`, `legalBasis`, `courtCompetency`, `serviceRequirements`, `factsSummary`, `classificationStatement`.

- [x] T012 [US1] Implement `case 1:` in `RunStepAsync` in `ExecRequestService.cs`. Fetch the workflow to get `ExecutiveTitleType`. System prompt (Arabic): You are an Egyptian civil execution and procedural law expert. Classify the legal request nature strictly. Possible values for `requestNature` array: "Executive" (تنفيذي), "Precautionary" (تحفظي), "Service" (إعلان) — include all that apply. `legalBasis.type` must be one of: "judicial" / "contractual" / "legal". For combined requests: include both in the array. Output ONLY valid JSON:
  ```json
  {"requestNature":[],"detailedRequestType":"","legalBasis":{"type":"","description":""},"courtCompetency":{"courtName":"","proceduralStage":""},"serviceRequirements":{"isServiceRequired":false,"previousWarningDetails":null},"factsSummary":"","classificationStatement":""}
  ```
  All values in Arabic. User prompt: `request.Input` + `ExecutiveTitleType` from the workflow. Model: `AiStepType.ExecRequestClassification`. On success: set `Step1Output`, `CurrentStep = 2`.

- [x] T013 [P] [US1] Add API routes to `mohamy-smart-lawyer-dashboard/src/APIs/routes.ts`:
  ```typescript
  EXEC_REQUEST_START: '/ExecRequest',
  EXEC_REQUEST_GET: (id: number) => `/ExecRequest/${id}`,
  EXEC_REQUEST_BY_CASE: (caseId: string) => `/ExecRequest/case/${caseId}`,
  EXEC_REQUEST_RUN_STEP: (id: number, step: number) => `/ExecRequest/${id}/step/${step}`,
  EXEC_REQUEST_SAVE_STEP: (id: number, step: number) => `/ExecRequest/${id}/step/${step}`,
  EXEC_REQUEST_ABANDON: (id: number) => `/ExecRequest/${id}`,
  ```

- [x] T014 [P] [US1] Create Redux slice in `mohamy-smart-lawyer-dashboard/src/redux/execRequest/ExecRequest.ts`. State: `workflowId: number | null`, `executiveTitleType: string` (default "judicial"), `currentStep: number` (default 1), `status: string`, `step1Output` / `step2Output` / `step3Output` (object | null), `loading: TLoading`, `error: string | null`. Reducer: `resetExecRequest`.

- [x] T015 [P] [US1] Create `thunkRunExecStep` in `mohamy-smart-lawyer-dashboard/src/redux/execRequest/thunk/thunkRunExecStep.ts`. Props: `{ workflowId: number; stepNumber: number; input?: string }`. Calls `api.post(API_ROUTES.EXEC_REQUEST_RUN_STEP(workflowId, stepNumber), { input })`.

- [x] T016 [P] [US1] Create `thunkStartExecRequest` in `mohamy-smart-lawyer-dashboard/src/redux/execRequest/thunk/thunkStartExecRequest.ts`. Props: `{ caseId: string; executiveTitleType: string }`. Calls `api.post(API_ROUTES.EXEC_REQUEST_START, { caseId, executiveTitleType })`.

- [x] T017 [US1] Add extraReducers to `ExecRequest.ts`. `thunkStartExecRequest.fulfilled`: set `workflowId`, `executiveTitleType`, `currentStep=1`. `thunkRunExecStep.fulfilled` step 1: set `step1Output`, `currentStep=2`.

- [x] T018 [US1] Register in `mohamy-smart-lawyer-dashboard/src/redux/store.ts`: `execRequest: ExecRequestReducer`.

- [x] T019 [US1] Create `mohamy-smart-lawyer-dashboard/src/pages/execRequest/ExecRequestPage.tsx`. RTL, Tajawal. 3-step wizard indicator. **Start screen** (before workflow exists): show a `<select>` dropdown labeled "نوع السند التنفيذي" with options: `{ value: "judicial", label: "حكم قضائي" }`, `{ value: "contractual", label: "عقد موثق" }`, `{ value: "commercial", label: "ورقة تجارية" }`. "ابدأ العريضة" button dispatches `thunkStartExecRequest({ caseId, executiveTitleType: selected })`.

  **Step 1 panel**: `<textarea>` labeled "ملخص وقائع القضية". Button: "تشغيل التصنيف". When `step1Output` set:
  - Show `requestNature` as tag chips (e.g., orange chip "تنفيذي", blue chip "تحفظي").
  - Show `detailedRequestType` in a labeled field.
  - Show `courtCompetency` (courtName, proceduralStage) in a two-cell table.
  - Show `serviceRequirements.isServiceRequired` as a prominent banner (أخضر="الإعلان مطلوب" / رمادي="الإعلان غير مطلوب"). If `isServiceRequired = false`: note this clearly so the lawyer knows service fields will be empty in step 2.
  - Show `classificationStatement` in a styled text block.
  - "التالي" enabled when output set.

**Checkpoint**: Step 1 works end-to-end.

---

## Phase 4: User Story 2 — Request Drafting (Priority: P1)

**Goal**: System drafts formal legal requests, service requests, and supporting document lists.

**Independent Test**: `POST /api/ExecRequest/{id}/step/2` returns JSON with `legalRequests` array, `serviceRequests` array (empty `[]` if service not required), `executivePetitionDocuments` array, `serviceRequestDocuments` array (empty if N/A). No fabricated service content when `isServiceRequired = false`.

- [x] T020 [US2] Implement `case 2:` in `RunStepAsync`. Requires `Step1Output` non-null. Parse `Step1Output` JSON to check `serviceRequirements.isServiceRequired`. System prompt (Arabic): Draft formal legal requests based on the classification. If service is not required, output empty arrays for service fields — do NOT fabricate service content. Output ONLY valid JSON: `{"legalRequests":[],"serviceRequests":[],"executivePetitionDocuments":[],"serviceRequestDocuments":[]}`. All values in formal legal Arabic. User prompt: content of `Step1Output`. Model: `AiStepType.ExecRequestDrafting`. On success: set `Step2Output`, `CurrentStep = 3`.

- [x] T021 [US2] Add Step 2 UI to `ExecRequestPage.tsx`. Button: "صياغة الطلبات". When `step2Output` set: show `legalRequests` as numbered list. If `serviceRequests` is non-empty array: show service section. If empty array: show "لا توجد طلبات إعلان في هذه المرحلة" (do NOT show the section header at all). Show document lists as bulleted lists. Add extraReducer.

---

## Phase 5: User Story 3 — Final Executive Petition Template Assembly (Priority: P2)

**Goal**: Assemble complete petition template in Egyptian judicial format. Placeholders for unknown data. Style differs between executive and precautionary petitions.

**Independent Test**: `POST /api/ExecRequest/{id}/step/3` returns JSON `{"documentText": "...complete Arabic petition in Egyptian judicial format..."}`. Structure/language reflects petition type (executive vs. precautionary).

- [x] T022 [US3] Implement `case 3:` in `RunStepAsync`. Requires `Step2Output` non-null. Parse `Step1Output` to determine petition style (if `requestNature` includes "Precautionary": use precautionary style; otherwise: use executive style). System prompt (Arabic): Assemble a complete petition template in the standard Egyptian judicial format. Required sections: (1) document header, (2) subject, (3) facts with legal basis, (4) formal requests (from step 2), (5) supporting documents list (from step 2), (6) closing, (7) signature block. For precautionary petitions: use precautionary petition language (أمر على عريضة). For unknown data: use standard placeholders (..... for text, [التاريخ] for dates). Do NOT add new legal claims. Output ONLY valid JSON: `{"documentText":""}`. User prompt: combine `Step1Output` + `Step2Output`. Model: `AiStepType.ExecRequestAssembly`. On success: set `Step3Output`, `Status = WorkflowStatus.Completed`, `CurrentStep = 3`.

- [x] T023 [US3] Add Step 3 UI to `ExecRequestPage.tsx`. Button: "تجميع العريضة النهائية". When `step3Output` set: render `documentText` in RTL styled block. Highlight "(....." and "[التاريخ]" placeholders in amber. "تحميل كـ DOCX" button using `docx` + `file-saver`. Add extraReducer: `step3Output`, `status = "Completed"`.

---

## Phase 6: Polish

- [x] T024 [P] Add route in `mohamy-smart-lawyer-dashboard/src/router/AppRouter.tsx`: `<Route path="/exec-request/:workflowId?" element={<ExecRequestPage />} />`.

- [x] T025 [P] Add "الطلبات التنفيذية" sidebar link in `mohamy-smart-lawyer-dashboard/src/components/public/sidebar/Sidebar.tsx`.

- [x] T026 Apply migration: `cd mohamy-smart-backend && dotnet ef database update --project Lawyer.Infrastracture --startup-project Lawyer`.

- [x] T027 [P] Frontend lint: `cd mohamy-smart-lawyer-dashboard && npm run lint && npx tsc --noEmit`. Fix errors.

---

## Dependencies

- T001 → T002–T011 → US phases → Polish

## MVP: Phase 1 + Phase 2 + Phase 3 (Step 1 classification only).
