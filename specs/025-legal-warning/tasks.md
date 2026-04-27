# Tasks: Official Legal Warning / Judicial Notice (الإنذار الرسمي)

**Feature branch**: `025-legal-warning`
**Input**: `specs/025-legal-warning/`
**Exact paths**: All paths relative to repo root `mohamy-smart/`

> **LLM execution note**: `WorkflowStatus` enum already exists from 022-appeal-brief T001. Do NOT recreate it. Each task is one file or one targeted edit.

---

## Phase 1: Setup

- [x] T001 Add 3 new values to `mohamy-smart-backend/Lawyer.Core/Enum/AiStepType.cs` after the existing `RulingAnalysisFeasibilityReport = 63` (or after the last existing value): `LegalWarningClassification = 70`, `LegalWarningBodyDraft = 71`, `LegalWarningAssembly = 72`. Keep all existing values untouched.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

- [x] T002 Create `LegalWarningWorkflow` entity in `mohamy-smart-backend/Lawyer.Core/Models/LegalWarningWorkflow.cs`. Namespace: `Lawyer.Core.Models`. Properties: `Id` (int, PK), `CaseId` (Guid, FK), `LawyerId` (string, max 450), `CurrentStep` (int, default 1), `Status` (WorkflowStatus, import `Lawyer.Core.Enum`), `Step1Output` (string?, nullable), `Step2Output` (string?, nullable), `Step3Output` (string?, nullable), `CreatedAt` (DateTime, `= DateTime.UtcNow`), `UpdatedAt` (DateTime, `= DateTime.UtcNow`). Nav prop: `public Case Case { get; set; } = null!;`.

- [x] T003 Add `DbSet<LegalWarningWorkflow> LegalWarningWorkflows { get; }` to `IApplicationDbContext` in `mohamy-smart-backend/Lawyer.Core/Interface/IApplicationDbContext.cs`.

- [x] T004 Add `public DbSet<LegalWarningWorkflow> LegalWarningWorkflows { get; set; } = null!;` to `AppDbContext` in `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`.

- [x] T005 [P] Create 3 DTO files in `mohamy-smart-backend/Lawyer.Application/Dtos/LegalWarning/`:
  - `StartLegalWarningRequest.cs`: `public Guid CaseId { get; set; }`.
  - `RunWarningStepRequest.cs`: `public string? Input { get; set; }` (used only in step 1).
  - `LegalWarningWorkflowDto.cs`: properties `Id` (int), `CaseId` (Guid), `LawyerId` (string), `CurrentStep` (int), `Status` (string), `Step1Output`, `Step2Output`, `Step3Output` (string?, nullable each), `CreatedAt` (DateTime).

- [x] T006 Create `ILegalWarningService` in `mohamy-smart-backend/Lawyer.Application/IServices/ILegalWarningService.cs`. Methods:
  ```
  Task<Result<LegalWarningWorkflowDto>> StartWorkflowAsync(StartLegalWarningRequest request, string lawyerId, CancellationToken ct);
  Task<Result<LegalWarningWorkflowDto>> GetWorkflowAsync(int id, string lawyerId, CancellationToken ct);
  Task<Result<List<LegalWarningWorkflowDto>>> GetWorkflowsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct);
  Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunWarningStepRequest request, string lawyerId, CancellationToken ct);
  Task<Result<object>> SaveEditedStepAsync(int workflowId, int stepNumber, string editedOutputJson, string lawyerId, CancellationToken ct);
  Task<Result<bool>> AbandonWorkflowAsync(int id, string lawyerId, CancellationToken ct);
  ```

- [x] T007 Register in `mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs`: `services.AddScoped<ILegalWarningService, LegalWarningService>();`

- [x] T008 Create `LegalWarningService` in `mohamy-smart-backend/Lawyer.Application/Services/LegalWarningService.cs`. Implements `ILegalWarningService`. Inject `IApplicationDbContext db`, `IAIProviderFactory aiProviderFactory`, `ILogger<LegalWarningService> logger`. Implement CRUD methods fully (same pattern as other workflow services). `RunStepAsync` is a stub `switch (stepNumber)`.

- [x] T009 Generate migration: `cd mohamy-smart-backend && dotnet ef migrations add AddLegalWarningWorkflows --project Lawyer.Infrastracture --startup-project Lawyer`. Add InsertData in `Up()`:
  ```csharp
  migrationBuilder.InsertData(
      table: "AiStageModelConfigs",
      columns: new[] { "Id", "ModelIdentifier", "StepType", "UpdatedAt", "UpdatedBy" },
      values: new object[,]
      {
          { 28, "gemini-3.1-pro-preview", 70, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 29, "gemini-3.1-pro-preview", 71, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 30, "gemini-3.1-pro-preview", 72, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
      });
  ```
  Adjust Id values to be higher than last existing seed row.

- [x] T010 Add 3 entries to `StageDefinitions` in `mohamy-smart-backend/Lawyer.Application/Services/AiModelConfigService.cs`:
  ```csharp
  (AiStepType.LegalWarningClassification, "تصنيف الإنذار والتحليل القانوني", "الإنذار الرسمي", 8),
  (AiStepType.LegalWarningBodyDraft, "صياغة متن الإنذار", "الإنذار الرسمي", 8),
  (AiStepType.LegalWarningAssembly, "تجميع الإنذار النهائي", "الإنذار الرسمي", 8),
  ```

- [x] T011 Create `LegalWarningController` in `mohamy-smart-backend/Lawyer/Controllers/LegalWarningController.cs`. `[Route("api/[controller]")]`, `[ApiController]`, `[Authorize(Roles = "Lawyer")]`. Inject `ILegalWarningService _service`. Helper: `private string GetLawyerId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;`. Endpoints:
  - `POST /` → `StartWorkflowAsync` → 201
  - `GET /{id}` → `GetWorkflowAsync` → 200
  - `GET /case/{caseId}` → `GetWorkflowsByCaseAsync` → 200
  - `POST /{id}/step/{stepNumber}` → `RunStepAsync` → 200
  - `PUT /{id}/step/{stepNumber}` → `SaveEditedStepAsync` → 200
  - `DELETE /{id}` → `AbandonWorkflowAsync` → 200

**Checkpoint**: Solution compiles. Migration applies.

---

## Phase 3: User Story 1 — Warning Classification & Legal Analysis (Priority: P1) 🎯 MVP

**Goal**: Lawyer inputs obligation facts → system classifies warning type, determines legal default status (مطل قانوني), provides legal summary (6 elements) and factual grounds (4 categories).

**Independent Test**: `POST /api/LegalWarning/{id}/step/1` with `{"input": "المدين مدين بمبلغ 50,000 جنيه..."}` returns JSON with `warningType`, `triggersLegalDefault` (bool), `legalDefaultJustification`, `legalSummary` (6 sub-fields), `factualGrounds` (4 sub-fields), `missingElements` array.

- [x] T012 [US1] Implement `case 1:` in `RunStepAsync` in `LegalWarningService.cs`. System prompt (Arabic): You are an Egyptian civil law expert analyzing obligation facts to classify the legal warning type. CRITICAL: Do NOT invent any amounts, dates, names, or facts not explicitly provided. Use (.....) for any missing factual data. Output ONLY valid JSON:
  ```json
  {"warningType":"","triggersLegalDefault":false,"legalDefaultJustification":"","legalSummary":{"relationshipNature":"","debtCause":"","writtenProof":null,"amountCertainty":"","dueDate":"","legalEffectOfNonPayment":""},"factualGrounds":{"debtSource":"","deliveryFact":"","deadlineAgreement":"","refusalToPay":""},"missingElements":[]}
  ```
  `warningType` examples: "تكليف بالوفاء", "عذر قضائي", "إنذار رسمي". If a field cannot be determined from the input, add its name to `missingElements` and use "(.....)" as the value. All in Arabic. User prompt: `request.Input`. Model: `AiStepType.LegalWarningClassification`. On success: set `Step1Output`, `CurrentStep = 2`.

- [x] T013 [P] [US1] Add API routes to `mohamy-smart-lawyer-dashboard/src/APIs/routes.ts`:
  ```typescript
  LEGAL_WARNING_START: '/LegalWarning',
  LEGAL_WARNING_GET: (id: number) => `/LegalWarning/${id}`,
  LEGAL_WARNING_BY_CASE: (caseId: string) => `/LegalWarning/case/${caseId}`,
  LEGAL_WARNING_RUN_STEP: (id: number, step: number) => `/LegalWarning/${id}/step/${step}`,
  LEGAL_WARNING_SAVE_STEP: (id: number, step: number) => `/LegalWarning/${id}/step/${step}`,
  LEGAL_WARNING_ABANDON: (id: number) => `/LegalWarning/${id}`,
  ```

- [x] T014 [P] [US1] Create Redux slice in `mohamy-smart-lawyer-dashboard/src/redux/legalWarning/LegalWarning.ts`. State: `workflowId: number | null`, `currentStep: number` (default 1), `status: string`, `step1Output` / `step2Output` / `step3Output` (object | null), `loading: TLoading`, `error: string | null`. Reducer: `resetLegalWarning`.

- [x] T015 [P] [US1] Create `thunkRunWarningStep` in `mohamy-smart-lawyer-dashboard/src/redux/legalWarning/thunk/thunkRunWarningStep.ts`. Props: `{ workflowId: number; stepNumber: number; input?: string }`. Calls `api.post(API_ROUTES.LEGAL_WARNING_RUN_STEP(workflowId, stepNumber), { input })`.

- [x] T016 [P] [US1] Create `thunkStartLegalWarning` in `mohamy-smart-lawyer-dashboard/src/redux/legalWarning/thunk/thunkStartLegalWarning.ts`. Props: `{ caseId: string }`. Calls `api.post(API_ROUTES.LEGAL_WARNING_START, { caseId })`.

- [x] T017 [US1] Add extraReducers to `LegalWarning.ts`. Step 1 fulfilled: set `step1Output`, `currentStep=2`. Start fulfilled: set `workflowId`, `currentStep=1`.

- [x] T018 [US1] Register in `mohamy-smart-lawyer-dashboard/src/redux/store.ts`: `legalWarning: LegalWarningReducer`.

- [x] T019 [US1] Create `mohamy-smart-lawyer-dashboard/src/pages/legalWarning/LegalWarningPage.tsx`. RTL, Tajawal. 3-step wizard indicator. Step 1: `<textarea>` labeled "أدخل وقائع الالتزام". Button: "تشغيل التحليل القانوني". When `step1Output` set:
  - Show `triggersLegalDefault` as a large prominent banner (أخضر = "ينشأ مطل قانوني" / رمادي = "لا ينشأ مطل قانوني").
  - Show `warningType` badge.
  - Show `legalSummary` as a 6-row labeled table.
  - Show `factualGrounds` as a 4-item labeled list.
  - If `missingElements` is non-empty: show warning banner "⚠ بيانات مطلوبة مفقودة" listing the missing elements. The lawyer must be warned before proceeding.
  - "التالي" button enabled when output is non-null.

**Checkpoint**: Step 1 works end-to-end.

---

## Phase 4: User Story 2 — Warning Body Drafting (Priority: P1)

**Goal**: System drafts formal 5-element warning body paragraph in dry Legal Arabic.

**Independent Test**: `POST /api/LegalWarning/{id}/step/2` returns JSON `{"warningBodyText": "...formal 5-element Arabic paragraph..."}`. Must NOT introduce amounts, dates, or facts not established in Step 1.

- [x] T020 [US2] Implement `case 2:` in `RunStepAsync`. Requires `Step1Output` non-null. System prompt (Arabic): Draft the formal body (متن) of this official legal warning. The body must include all 5 required structural elements: (1) preamble linking parties, (2) statement of the obligation, (3) statement of breach/delay, (4) explicit demand (التكليف), (5) general warning of legal consequences. Use formal, dry Legal Arabic. Do NOT introduce any amounts, dates, or party names not explicitly stated in the classification data — use (.....) for any missing data. Output ONLY valid JSON: `{"warningBodyText":""}`. User prompt: content of `Step1Output`. Model: `AiStepType.LegalWarningBodyDraft`. On success: set `Step2Output`, `CurrentStep = 3`.

- [x] T021 [US2] Add Step 2 UI to `LegalWarningPage.tsx`. Button: "صياغة متن الإنذار". When `step2Output` set: render `warningBodyText` in styled RTL text block. Any "(....." placeholders should be visually highlighted in orange (as a signal to the lawyer that they need to fill these in before submission). Add extraReducer.

---

## Phase 5: User Story 3 — Final Official Warning Document Assembly (Priority: P2)

**Goal**: Assemble complete official warning document in Egyptian bailiff format. Placeholders for missing data. No new legal claims.

**Independent Test**: `POST /api/LegalWarning/{id}/step/3` returns JSON `{"documentText": "...complete Arabic warning document in Egyptian bailiff format..."}`. Document contains all required sections. No new legal claims beyond prior steps.

- [x] T022 [US3] Implement `case 3:` in `RunStepAsync`. Requires `Step2Output` non-null. System prompt (Arabic): Assemble a complete official legal warning document in the standard Egyptian bailiff format (إنذار رسمي على يد محضر). Include all required sections in order: (1) document date — if unknown use "[التاريخ]", (2) notifier data — if unknown use "(....)", (3) notified party data — if unknown use "(....)", (4) bailiff preamble, (5) warning body (from step 2), (6) closing bailiff block, (7) signature block. Do NOT add any new legal claims or obligations beyond what was established in prior steps. Output ONLY valid JSON: `{"documentText":""}`. User prompt: combine content of `Step1Output` + `Step2Output`. Model: `AiStepType.LegalWarningAssembly`. On success: set `Step3Output`, `Status = WorkflowStatus.Completed`, `CurrentStep = 3`.

- [x] T023 [US3] Add Step 3 UI to `LegalWarningPage.tsx`. Button: "تجميع الإنذار النهائي". When `step3Output` set: render `documentText` in RTL block. Highlight all "(....)" and "[التاريخ]" placeholders in orange/amber with a tooltip "يجب على المحامي تعبئة هذا الحقل قبل التقديم". "تحميل كـ DOCX" button using `docx` + `file-saver`. Add extraReducer: `step3Output`, `status = "Completed"`.

---

## Phase 6: Polish

- [x] T024 [P] Add route in `mohamy-smart-lawyer-dashboard/src/router/AppRouter.tsx`: `<Route path="/legal-warning/:workflowId?" element={<LegalWarningPage />} />`.

- [x] T025 [P] Add "الإنذار الرسمي" sidebar link in `mohamy-smart-lawyer-dashboard/src/components/public/sidebar/Sidebar.tsx`.

- [x] T026 Apply migration: `cd mohamy-smart-backend && dotnet ef database update --project Lawyer.Infrastracture --startup-project Lawyer`.

- [x] T027 [P] Frontend lint: `cd mohamy-smart-lawyer-dashboard && npm run lint && npx tsc --noEmit`. Fix errors.

---

## Dependencies

- T001 → T002–T011 → US phases → Polish

## MVP: Phase 1 + Phase 2 + Phase 3 (Step 1 classification + legal default status only).
