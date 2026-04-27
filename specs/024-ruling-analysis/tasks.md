# Tasks: Judicial Ruling Analysis (تحليل الأحكام القضائية)

**Feature branch**: `024-ruling-analysis`
**Input**: `specs/024-ruling-analysis/`
**Exact paths**: All paths relative to repo root `mohamy-smart/`

> **LLM execution note**: `WorkflowStatus` enum already exists from 022-appeal-brief T001. Do NOT recreate it. Each task is one file or one targeted edit.

---

## Phase 1: Setup

- [x] T001 Add 4 new values to `mohamy-smart-backend/Lawyer.Core/Enum/AiStepType.cs` after the existing `AdminComplaintAssembly = 54` line (or after `AppealBriefAssembly = 45` if 023 is not yet applied): `RulingAnalysisOperative = 60`, `RulingAnalysisReasoning = 61`, `RulingAnalysisDefectEvaluation = 62`, `RulingAnalysisFeasibilityReport = 63`. Keep all existing values untouched.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

- [x] T002 Create `RulingAnalysisWorkflow` entity in `mohamy-smart-backend/Lawyer.Core/Models/RulingAnalysisWorkflow.cs`. Namespace: `Lawyer.Core.Models`. Properties: `Id` (int, PK), `CaseId` (Guid, FK), `LawyerId` (string, max 450), `CurrentStep` (int, default 1), `Status` (WorkflowStatus, import `Lawyer.Core.Enum`), `Step1Output` through `Step4Output` (string?, nullable each), `CreatedAt` (DateTime, `= DateTime.UtcNow`), `UpdatedAt` (DateTime, `= DateTime.UtcNow`). Nav prop: `public Case Case { get; set; } = null!;`.

- [x] T003 Add `DbSet<RulingAnalysisWorkflow> RulingAnalysisWorkflows { get; }` to `IApplicationDbContext` in `mohamy-smart-backend/Lawyer.Core/Interface/IApplicationDbContext.cs`.

- [x] T004 Add `public DbSet<RulingAnalysisWorkflow> RulingAnalysisWorkflows { get; set; } = null!;` to `AppDbContext` in `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`.

- [x] T005 [P] Create 3 DTO files in `mohamy-smart-backend/Lawyer.Application/Dtos/RulingAnalysis/`:
  - `StartRulingWorkflowRequest.cs`: `public Guid CaseId { get; set; }`.
  - `RunRulingStepRequest.cs`: `public string? Input { get; set; }` (used only in step 1).
  - `RulingAnalysisWorkflowDto.cs`: properties `Id` (int), `CaseId` (Guid), `LawyerId` (string), `CurrentStep` (int), `Status` (string), `Step1Output` through `Step4Output` (string?, nullable), `CreatedAt` (DateTime).

- [x] T006 Create `IRulingAnalysisService` in `mohamy-smart-backend/Lawyer.Application/IServices/IRulingAnalysisService.cs`. Namespace: `Lawyer.Application.IServices`. Methods:
  ```
  Task<Result<RulingAnalysisWorkflowDto>> StartWorkflowAsync(StartRulingWorkflowRequest request, string lawyerId, CancellationToken ct);
  Task<Result<RulingAnalysisWorkflowDto>> GetWorkflowAsync(int id, string lawyerId, CancellationToken ct);
  Task<Result<List<RulingAnalysisWorkflowDto>>> GetWorkflowsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct);
  Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunRulingStepRequest request, string lawyerId, CancellationToken ct);
  Task<Result<object>> SaveEditedStepAsync(int workflowId, int stepNumber, string editedOutputJson, string lawyerId, CancellationToken ct);
  Task<Result<bool>> AbandonWorkflowAsync(int id, string lawyerId, CancellationToken ct);
  ```

- [x] T007 Register in `mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs`: `services.AddScoped<IRulingAnalysisService, RulingAnalysisService>();`

- [x] T008 Create `RulingAnalysisService` stub in `mohamy-smart-backend/Lawyer.Application/Services/RulingAnalysisService.cs`. Implements `IRulingAnalysisService`. Constructor injects `IApplicationDbContext db`, `IAIProviderFactory aiProviderFactory`, `ILogger<RulingAnalysisService> logger`. Implement CRUD methods (`StartWorkflowAsync`, `GetWorkflowAsync`, `GetWorkflowsByCaseAsync`, `AbandonWorkflowAsync`, `SaveEditedStepAsync`) fully — follow the same logic as 022's `AppealBriefService`. `RunStepAsync` is a stub `switch (stepNumber)` returning "Not implemented" for now.

- [x] T009 Generate migration: `cd mohamy-smart-backend && dotnet ef migrations add AddRulingAnalysisWorkflows --project Lawyer.Infrastracture --startup-project Lawyer`. In the generated migration file add InsertData for AiStageModelConfig in `Up()`:
  ```csharp
  migrationBuilder.InsertData(
      table: "AiStageModelConfigs",
      columns: new[] { "Id", "ModelIdentifier", "StepType", "UpdatedAt", "UpdatedBy" },
      values: new object[,]
      {
          { 24, "gemini-3.1-pro-preview", 60, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 25, "gemini-3.1-pro-preview", 61, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 26, "gemini-3.1-pro-preview", 62, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 27, "gemini-3.1-pro-preview", 63, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
      });
  ```
  Adjust Id values to be higher than the last existing seed row.

- [x] T010 Add 4 entries to `StageDefinitions` in `mohamy-smart-backend/Lawyer.Application/Services/AiModelConfigService.cs`:
  ```csharp
  (AiStepType.RulingAnalysisOperative, "تحليل المنطوق", "تحليل الأحكام", 7),
  (AiStepType.RulingAnalysisReasoning, "تحليل الأسباب", "تحليل الأحكام", 7),
  (AiStepType.RulingAnalysisDefectEvaluation, "تقييم العيوب", "تحليل الأحكام", 7),
  (AiStepType.RulingAnalysisFeasibilityReport, "تقرير جدوى الطعن", "تحليل الأحكام", 7),
  ```

- [x] T011 Create `RulingAnalysisController` in `mohamy-smart-backend/Lawyer/Controllers/RulingAnalysisController.cs`. Namespace: `Lawyer.Controllers`. Inherits `AppControllerBase`. `[Route("api/[controller]")]`, `[ApiController]`, `[Authorize(Roles = "Lawyer")]`. Inject `IRulingAnalysisService _service`. Helper: `private string GetLawyerId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;`. Endpoints: `POST /`, `GET /{id}`, `GET /case/{caseId}`, `POST /{id}/step/{stepNumber}`, `PUT /{id}/step/{stepNumber}`, `DELETE /{id}`. Same pattern as `AiModelConfigController` and `AppealBriefController`.

**Checkpoint**: Solution compiles. Migration applies.

---

## Phase 3: User Story 1 — Operative Part Analysis (Priority: P1) 🎯 MVP

**Goal**: Lawyer inputs criminal judgment text → system extracts operative part (منطوق) and classifies judgment type and legal effect.

**Independent Test**: `POST /api/RulingAnalysis/{id}/step/1` with judgment text returns JSON: `{"judgmentSummary":"","judgmentType":"","legalEffect":"","criminalAspect":null,"civilAspect":null}`.

- [x] T012 [US1] Implement `case 1:` in `RunStepAsync` in `RulingAnalysisService.cs`. System prompt (Arabic): Extract and classify the operative part of this criminal court judgment. Output ONLY valid JSON: `{"judgmentSummary":"","judgmentType":"","legalEffect":"","criminalAspect":null,"civilAspect":null}`. If both criminal and civil aspects exist, populate both fields separately. `judgmentType` examples: "إدانة", "براءة", "حفظ", "وقف تنفيذ". `legalEffect`: describes what the judgment legally produces (e.g., "يجوز الطعن فيه" or "نهائي واجب النفاذ"). All in Arabic. User prompt: `request.Input`. Model: `AiStepType.RulingAnalysisOperative`. On success: set `Step1Output`, `CurrentStep = 2`.

- [x] T013 [P] [US1] Add API routes to `mohamy-smart-lawyer-dashboard/src/APIs/routes.ts`:
  ```typescript
  RULING_ANALYSIS_START: '/RulingAnalysis',
  RULING_ANALYSIS_GET: (id: number) => `/RulingAnalysis/${id}`,
  RULING_ANALYSIS_BY_CASE: (caseId: string) => `/RulingAnalysis/case/${caseId}`,
  RULING_ANALYSIS_RUN_STEP: (id: number, step: number) => `/RulingAnalysis/${id}/step/${step}`,
  RULING_ANALYSIS_SAVE_STEP: (id: number, step: number) => `/RulingAnalysis/${id}/step/${step}`,
  RULING_ANALYSIS_ABANDON: (id: number) => `/RulingAnalysis/${id}`,
  ```

- [x] T014 [P] [US1] Create Redux slice in `mohamy-smart-lawyer-dashboard/src/redux/rulingAnalysis/RulingAnalysis.ts`. State: `workflowId: number | null`, `currentStep: number` (default 1), `status: string`, `step1Output` through `step4Output` (object | null), `loading: TLoading`, `error: string | null`. Reducer: `resetRulingAnalysis`. Pattern: `SmartAnalysis.ts`.

- [x] T015 [P] [US1] Create `thunkRunRulingStep` in `mohamy-smart-lawyer-dashboard/src/redux/rulingAnalysis/thunk/thunkRunRulingStep.ts`. Props: `{ workflowId: number; stepNumber: number; input?: string }`. Calls `api.post(API_ROUTES.RULING_ANALYSIS_RUN_STEP(workflowId, stepNumber), { input })`. Returns `res.data.data`.

- [x] T016 [P] [US1] Create `thunkStartRulingWorkflow` in `mohamy-smart-lawyer-dashboard/src/redux/rulingAnalysis/thunk/thunkStartRulingWorkflow.ts`. Props: `{ caseId: string }`. Calls `api.post(API_ROUTES.RULING_ANALYSIS_START, { caseId })`. Returns `res.data.data`.

- [x] T017 [US1] Add extraReducers to `RulingAnalysis.ts`. `thunkStartRulingWorkflow.fulfilled`: set `workflowId`, `currentStep=1`. `thunkRunRulingStep.fulfilled` step 1: set `step1Output`, `currentStep=2`. Pending/rejected cases: set loading/error.

- [x] T018 [US1] Register reducer in `mohamy-smart-lawyer-dashboard/src/redux/store.ts`: `rulingAnalysis: RulingAnalysisReducer`.

- [x] T019 [US1] Create `mohamy-smart-lawyer-dashboard/src/pages/rulingAnalysis/RulingAnalysisPage.tsx`. RTL, Tajawal. 4-step wizard indicator. Step 1: `<textarea>` labeled "أدخل نص الحكم الجنائي". Button dispatches `thunkRunRulingStep(...)` for step 1. When `step1Output` set: show `judgmentType` badge, `judgmentSummary`, `legalEffect`, then `criminalAspect` / `civilAspect` in two labeled sections (hide sections that are null). "التالي" enabled when output set.

**Checkpoint**: Step 1 works end-to-end.

---

## Phase 4: User Story 2 — Reasoning Analysis (Neutral Descriptive) (Priority: P1)

**Goal**: Neutral-only description of court reasoning. Zero evaluative terms.

**Independent Test**: `POST /api/RulingAnalysis/{id}/step/2` returns JSON with `reasoningSummary`, `evidenceList`, `responseToDefense`, `criminalAspectReasoning`, `civilAspectReasoning`. No evaluative terms.

- [x] T020 [US2] Implement `case 2:` in `RunStepAsync`. Requires `Step1Output` non-null. System prompt (Arabic): Analyze the court reasoning in NEUTRAL DESCRIPTIVE terms only. PERMITTED phrases: "استند الحكم إلى", "أوضح الحكم أن", "اعتمدت المحكمة على", "تناول الحكم", "أشار الحكم إلى". FORBIDDEN terms (must never appear): "يقين قضائي", "اطمأنت المحكمة", "أدلة متسقة", "منطق سليم", "صائب". Output ONLY valid JSON: `{"reasoningSummary":"","evidenceList":[],"responseToDefense":null,"criminalAspectReasoning":null,"civilAspectReasoning":null}`. Model: `AiStepType.RulingAnalysisReasoning`. On success: set `Step2Output`, `CurrentStep = 3`.

- [x] T021 [US2] Add Step 2 UI to `RulingAnalysisPage.tsx`. Panel labeled "تحليل وصفي محايد" (important: label this clearly so lawyer knows it's intentionally neutral). Button: "تشغيل تحليل الأسباب". When `step2Output` set: render reasoning summary, evidence list as bullets, criminal/civil reasoning in separate labeled sections. Add extraReducer.

---

## Phase 5: User Story 3 — Defect Evaluation (Priority: P2)

**Goal**: Evaluate whether court reasoning is legally sufficient; identify defect type and diagnostic chain.

**Independent Test**: `POST /api/RulingAnalysis/{id}/step/3` returns JSON: `{"isSufficient": false, "defectType": "string", "diagnosticChain": "A → B → C → D"}`.

- [x] T022 [US3] Implement `case 3:` in `RunStepAsync`. Requires `Step2Output` non-null. System prompt (Arabic): Evaluate the legal sufficiency of this court reasoning and identify any technical defects. Do NOT use pleading language ("يجب نقضه", "نطلب"). Output ONLY valid JSON: `{"isSufficient":true,"defectType":null,"diagnosticChain":null}`. If defect exists: `isSufficient = false`, `defectType` = classified defect in legal Arabic, `diagnosticChain` = "أ → ب → ج → د" format explanation. If no defect: `isSufficient = true`, other fields null — never fabricate. Model: `AiStepType.RulingAnalysisDefectEvaluation`. On success: set `Step3Output`, `CurrentStep = 4`.

- [x] T023 [US3] Add Step 3 UI to `RulingAnalysisPage.tsx`. Show `isSufficient` as large badge (أخضر="كافٍ" / أحمر="قاصر"). If defect: show `defectType` and `diagnosticChain`. Add extraReducer.

---

## Phase 6: User Story 4 — Appeal Feasibility Report (Priority: P2)

**Goal**: Generate formal client-advisory appeal feasibility report. No deadline calculations. No Article 406. No success predictions.

**Independent Test**: `POST /api/RulingAnalysis/{id}/step/4` returns JSON with `isAppealable`, `appealType`, `legalBasisForAppealability` (NO Article 406), `appealGrounds`, `appealScope`, `notes`. Must NOT contain any deadline date calculations.

- [x] T024 [US4] Implement `case 4:` in `RunStepAsync`. Requires `Step3Output` non-null. System prompt (Arabic): Generate a formal appeal feasibility report. STRICT RULES: (1) Do NOT cite Article 406 or calculate specific deadline days. (2) Do NOT predict the probability of appeal success or failure. (3) Do NOT state "the appeal suspends execution" as an absolute rule. (4) Use generic statements like "يكفل القانون حق الطعن خلال المدة المقررة قانوناً" for deadline references. Output ONLY valid JSON: `{"isAppealable":true,"appealType":"","legalBasisForAppealability":"","appealGrounds":[],"appealScope":"","notes":null}`. Model: `AiStepType.RulingAnalysisFeasibilityReport`. On success: set `Step4Output`, `Status = WorkflowStatus.Completed`, `CurrentStep = 4`.

- [x] T025 [US4] Add Step 4 UI to `RulingAnalysisPage.tsx`. Panel labeled "تقرير جدوى الطعن". Show `isAppealable` badge, `appealType`, `legalBasisForAppealability`, `appealGrounds` as numbered list, `appealScope`, and `notes` if present. "تحميل كـ DOCX" button. Add extraReducer: `step4Output`, `status = "Completed"`.

---

## Phase 7: Polish

- [x] T026 [P] Add route in `mohamy-smart-lawyer-dashboard/src/router/AppRouter.tsx`: `<Route path="/ruling-analysis/:workflowId?" element={<RulingAnalysisPage />} />`.

- [x] T027 [P] Add "تحليل الأحكام" sidebar link in `mohamy-smart-lawyer-dashboard/src/components/public/sidebar/Sidebar.tsx`.

- [x] T028 Apply migration: `cd mohamy-smart-backend && dotnet ef database update --project Lawyer.Infrastracture --startup-project Lawyer`.

- [x] T029 [P] Frontend lint: `cd mohamy-smart-lawyer-dashboard && npm run lint && npx tsc --noEmit`. Fix errors.

---

## Dependencies

- T001 → T002–T011 → US phases (sequential per step) → Polish

## MVP: Phase 1 + Phase 2 + Phase 3 (Step 1 operative analysis only).
