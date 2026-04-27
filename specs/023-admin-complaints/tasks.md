# Tasks: Administrative Complaints & Grievances (الشكاوى الإدارية)

**Feature branch**: `023-admin-complaints`
**Input**: `specs/023-admin-complaints/`
**Exact paths**: All paths relative to repo root `mohamy-smart/`

> **LLM execution note**: `WorkflowStatus` enum already exists (created in 022-appeal-brief T001). Do NOT recreate it. Each task is one file or one targeted edit.

---

## Phase 1: Setup

- [x] T001 Add 5 new values to `mohamy-smart-backend/Lawyer.Core/Enum/AiStepType.cs` after the existing `AppealBriefAssembly = 45` line: `AdminComplaintClassification = 50`, `AdminComplaintFacts = 51`, `AdminComplaintViolation = 52`, `AdminComplaintRequests = 53`, `AdminComplaintAssembly = 54`. Keep all existing values untouched.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

- [x] T002 Create `AdminComplaintWorkflow` entity in `mohamy-smart-backend/Lawyer.Core/Models/AdminComplaintWorkflow.cs`. Namespace: `Lawyer.Core.Models`. Properties: `Id` (int, PK), `CaseId` (Guid, FK), `LawyerId` (string, max 450), `CurrentStep` (int, default 1), `Status` (WorkflowStatus, default InProgress — import `Lawyer.Core.Enum`), `Step1Output` through `Step5Output` (string?, nullable each), `CreatedAt` (DateTime, `= DateTime.UtcNow`), `UpdatedAt` (DateTime, `= DateTime.UtcNow`). Nav property: `public Case Case { get; set; } = null!;`.

- [x] T003 Add `DbSet<AdminComplaintWorkflow> AdminComplaintWorkflows { get; }` to `IApplicationDbContext` interface in `mohamy-smart-backend/Lawyer.Core/Interface/IApplicationDbContext.cs`. Follow the existing pattern (e.g., `DbSet<AiJob> AiJobs { get; }`).

- [x] T004 Add `public DbSet<AdminComplaintWorkflow> AdminComplaintWorkflows { get; set; } = null!;` to `AppDbContext` in `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`. Place after the `AppealWorkflows` DbSet (or after `AiStageModelConfigs` if 022 is not yet applied).

- [x] T005 [P] Create 3 DTO files in `mohamy-smart-backend/Lawyer.Application/Dtos/AdminComplaint/` (create folder):
  - `StartComplaintWorkflowRequest.cs`: namespace `Lawyer.Application.Dtos.AdminComplaint`; property: `public Guid CaseId { get; set; }`.
  - `RunComplaintStepRequest.cs`: namespace `Lawyer.Application.Dtos.AdminComplaint`; property: `public string? Input { get; set; }` (used only for step 1; null for steps 2–5).
  - `AdminComplaintWorkflowDto.cs`: namespace `Lawyer.Application.Dtos.AdminComplaint`; properties: `Id` (int), `CaseId` (Guid), `LawyerId` (string), `CurrentStep` (int), `Status` (string), `Step1Output` through `Step5Output` (string?, nullable), `CreatedAt` (DateTime).

- [x] T006 Create `IAdminComplaintService` interface in `mohamy-smart-backend/Lawyer.Application/IServices/IAdminComplaintService.cs`. Namespace: `Lawyer.Application.IServices`. Methods:
  ```
  Task<Result<AdminComplaintWorkflowDto>> StartWorkflowAsync(StartComplaintWorkflowRequest request, string lawyerId, CancellationToken ct);
  Task<Result<AdminComplaintWorkflowDto>> GetWorkflowAsync(int id, string lawyerId, CancellationToken ct);
  Task<Result<List<AdminComplaintWorkflowDto>>> GetWorkflowsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct);
  Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunComplaintStepRequest request, string lawyerId, CancellationToken ct);
  Task<Result<object>> SaveEditedStepAsync(int workflowId, int stepNumber, string editedOutputJson, string lawyerId, CancellationToken ct);
  Task<Result<bool>> AbandonWorkflowAsync(int id, string lawyerId, CancellationToken ct);
  ```

- [x] T007 Register in `mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs`: `services.AddScoped<IAdminComplaintService, AdminComplaintService>();`

- [x] T008 Create `AdminComplaintService` stub in `mohamy-smart-backend/Lawyer.Application/Services/AdminComplaintService.cs`. Namespace: `Lawyer.Application.Services`. Implements `IAdminComplaintService`. Constructor injects: `IApplicationDbContext db`, `IAIProviderFactory aiProviderFactory`, `ILogger<AdminComplaintService> logger`. All methods return stubs. Also implement `StartWorkflowAsync`, `GetWorkflowAsync`, `GetWorkflowsByCaseAsync`, `AbandonWorkflowAsync` in this same file following the same logic as `AppealBriefService` (see T036–T037 in 022 tasks).

- [x] T009 Generate migration: `cd mohamy-smart-backend && dotnet ef migrations add AddAdminComplaintWorkflows --project Lawyer.Infrastracture --startup-project Lawyer`. Then open the generated migration file and add `InsertData` for new AiStageModelConfig rows in `Up()`:
  ```csharp
  migrationBuilder.InsertData(
      table: "AiStageModelConfigs",
      columns: new[] { "Id", "ModelIdentifier", "StepType", "UpdatedAt", "UpdatedBy" },
      values: new object[,]
      {
          { 19, "gemini-3.1-pro-preview", 50, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 20, "gemini-3.1-pro-preview", 51, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 21, "gemini-3.1-pro-preview", 52, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 22, "gemini-3.1-pro-preview", 53, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 23, "gemini-3.1-pro-preview", 54, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
      });
  ```
  Ids (19–23) must be higher than the last existing seed row. Adjust if 022 migration was already applied.

- [x] T010 Add 5 new entries to `StageDefinitions` list in `mohamy-smart-backend/Lawyer.Application/Services/AiModelConfigService.cs`:
  ```csharp
  (AiStepType.AdminComplaintClassification, "تصنيف الشكوى وتحديد الجهة", "الشكاوى الإدارية", 6),
  (AiStepType.AdminComplaintFacts, "صياغة الوقائع", "الشكاوى الإدارية", 6),
  (AiStepType.AdminComplaintViolation, "تحليل المخالفة", "الشكاوى الإدارية", 6),
  (AiStepType.AdminComplaintRequests, "صياغة الطلبات", "الشكاوى الإدارية", 6),
  (AiStepType.AdminComplaintAssembly, "تجميع الشكوى النهائية", "الشكاوى الإدارية", 6),
  ```

- [x] T011 Create `AdminComplaintController` in `mohamy-smart-backend/Lawyer/Controllers/AdminComplaintController.cs`. Namespace: `Lawyer.Controllers`. Inherits `AppControllerBase`. `[Route("api/[controller]")]`, `[ApiController]`, `[Authorize(Roles = "Lawyer")]`. Inject `IAdminComplaintService _service`. Helper: `private string GetLawyerId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;`. Endpoints:
  - `POST /` → `StartWorkflowAsync` → 201
  - `GET /{id}` → `GetWorkflowAsync` → 200
  - `GET /case/{caseId}` → `GetWorkflowsByCaseAsync` → 200
  - `POST /{id}/step/{stepNumber}` → `RunStepAsync` → 200
  - `PUT /{id}/step/{stepNumber}` → `SaveEditedStepAsync` → 200 (request body: `{ "editedOutputJson": "..." }`)
  - `DELETE /{id}` → `AbandonWorkflowAsync` → 200

**Checkpoint**: Solution compiles. Migration applies. Step implementation begins.

---

## Phase 3: User Story 1 — Complaint Classification & Authority Identification (Priority: P1) 🎯 MVP

**Goal**: Lawyer inputs grievance narrative → system classifies action type, identifies competent authority, gives confidence rating.

**Independent Test**: `POST /api/AdminComplaint/{id}/step/1` with `{"input": "تقدم الموكل بطلب ترقية منذ عامين..."}` returns JSON with `actionType`, `competentAuthorities` array, `classificationJustification`, `confidenceRating`.

- [x] T012 [US1] Implement `case 1:` in `RunStepAsync` in `AdminComplaintService.cs`. Requires `Step1Output` to be null (first run) or step is being re-run. System prompt (Arabic): You are an Egyptian administrative law expert. Classify the administrative action and identify the competent authority. Output ONLY valid JSON: `{"actionType":"","competentAuthorities":[{"authorityName":"","authorityLevel":"","targetOfficialTitle":"","isPrimary":true}],"classificationJustification":"","confidenceRating":""}`. `confidenceRating` is one of: "مرتفع", "متوسط", "منخفض". If jurisdiction is ambiguous: use "منخفض" and explain in `classificationJustification`. All values in Arabic. User prompt: `request.Input`. Model: `AiStepType.AdminComplaintClassification`. On success: set `Step1Output`, `CurrentStep = 2`.

- [x] T013 [P] [US1] Add API routes to `mohamy-smart-lawyer-dashboard/src/APIs/routes.ts`:
  ```typescript
  ADMIN_COMPLAINT_START: '/AdminComplaint',
  ADMIN_COMPLAINT_GET: (id: number) => `/AdminComplaint/${id}`,
  ADMIN_COMPLAINT_BY_CASE: (caseId: string) => `/AdminComplaint/case/${caseId}`,
  ADMIN_COMPLAINT_RUN_STEP: (id: number, step: number) => `/AdminComplaint/${id}/step/${step}`,
  ADMIN_COMPLAINT_SAVE_STEP: (id: number, step: number) => `/AdminComplaint/${id}/step/${step}`,
  ADMIN_COMPLAINT_ABANDON: (id: number) => `/AdminComplaint/${id}`,
  ```

- [x] T014 [P] [US1] Create Redux slice in `mohamy-smart-lawyer-dashboard/src/redux/adminComplaint/AdminComplaint.ts`. State: `workflowId: number | null`, `currentStep: number` (default 1), `status: string`, `step1Output` through `step5Output` (object | null), `loading: TLoading`, `error: string | null`. Reducers: `resetAdminComplaint`. Pattern: follow `SmartAnalysis.ts`.

- [x] T015 [P] [US1] Create `thunkRunComplaintStep` in `mohamy-smart-lawyer-dashboard/src/redux/adminComplaint/thunk/thunkRunComplaintStep.ts`. Props: `{ workflowId: number; stepNumber: number; input?: string }`. Calls `api.post(API_ROUTES.ADMIN_COMPLAINT_RUN_STEP(workflowId, stepNumber), { input })`. Returns `res.data.data`.

- [x] T016 [P] [US1] Create `thunkStartComplaintWorkflow` in `mohamy-smart-lawyer-dashboard/src/redux/adminComplaint/thunk/thunkStartComplaintWorkflow.ts`. Props: `{ caseId: string }`. Calls `api.post(API_ROUTES.ADMIN_COMPLAINT_START, { caseId })`. Returns `res.data.data`.

- [x] T017 [US1] Add extraReducers to `AdminComplaint.ts` for `thunkStartComplaintWorkflow` (set `workflowId`, `currentStep=1`) and `thunkRunComplaintStep` step 1 (set `step1Output`, `currentStep=2`). Pattern: pending/fulfilled/rejected.

- [x] T018 [US1] Register `AdminComplaint` reducer in `mohamy-smart-lawyer-dashboard/src/redux/store.ts`. Add `adminComplaint: AdminComplaintReducer`.

- [x] T019 [US1] Create `mohamy-smart-lawyer-dashboard/src/pages/adminComplaint/AdminComplaintPage.tsx`. RTL, Tajawal. 5-step wizard indicator at top. Step 1 panel: `<textarea>` labeled "أدخل وقائع الشكوى". "تشغيل التصنيف" button dispatches `thunkRunComplaintStep({ workflowId, stepNumber: 1, input: text })`. When `step1Output` set: show `actionType` badge, `competentAuthorities` table (name, level, target official, isPrimary badge), confidence rating badge (أخضر=مرتفع, أصفر=متوسط, أحمر=منخفض), justification. "التالي" button enabled when output is non-null.

**Checkpoint**: Step 1 works end-to-end.

---

## Phase 4: User Story 2 — Facts Narrative Drafting (Priority: P1)

**Goal**: System drafts formal Arabic facts section starting with "أولاً: الوقائع".

**Independent Test**: `POST /api/AdminComplaint/{id}/step/2` returns JSON `{"factsText": "أولاً: الوقائع\n..."}`.

- [x] T020 [US2] Implement `case 2:` in `RunStepAsync` in `AdminComplaintService.cs`. Requires `Step1Output` non-null. System prompt (Arabic): Draft a formal Arabic facts narrative for an Egyptian administrative complaint. Begin with the standard phrase "أولاً: الوقائع". Present events chronologically. Remove all emotional, subjective, or opinion-based language. Use only objective, verifiable factual statements. Output ONLY valid JSON: `{"factsText":""}`. User prompt: content of `Step1Output` + original grievance context. Model: `AiStepType.AdminComplaintFacts`. On success: set `Step2Output`, `CurrentStep = 3`.

- [x] T021 [US2] Add Step 2 UI to `AdminComplaintPage.tsx`. When `currentStep >= 2`: "صياغة الوقائع" button dispatches step 2 (no extra input). When `step2Output` set: render `factsText` in a styled Arabic text block. Add extraReducer.

---

## Phase 5: User Story 3 — Violation Analysis (Priority: P2)

**Goal**: System identifies violation type and lists governing rules with sources.

**Independent Test**: `POST /api/AdminComplaint/{id}/step/3` returns JSON with `violationType`, `violationDescription`, `governingRules` array.

- [x] T022 [US3] Implement `case 3:` in `RunStepAsync` in `AdminComplaintService.cs`. Requires `Step2Output` non-null. System prompt (Arabic): Analyze the administrative violation and identify the specific rules that were breached. Output ONLY valid JSON: `{"violationType":"","violationDescription":"","governingRules":[{"sourceLaw":"","articleNumber":"","articleText":""}]}`. If no clear article applies: add an entry with `sourceLaw: "غير محدد"` and explain in `articleText`. All in Arabic. Model: `AiStepType.AdminComplaintViolation`. On success: set `Step3Output`, `CurrentStep = 4`.

- [x] T023 [US3] Add Step 3 UI to `AdminComplaintPage.tsx`. When `currentStep >= 3`: button. Output: show violation type and description, then governing rules as expandable cards. Add extraReducer.

---

## Phase 6: User Story 4 — Requests Drafting (Priority: P2)

**Goal**: System drafts formal closing requests paragraph.

**Independent Test**: `POST /api/AdminComplaint/{id}/step/4` returns JSON `{"requestsText": "..."}`.

- [x] T024 [US4] Implement `case 4:` in `RunStepAsync`. Requires `Step3Output` non-null. System prompt (Arabic): Draft formal closing requests (طلبات ختامية) for this administrative complaint, specifying the exact administrative action or relief demanded. If it involves a disciplinary matter: include appropriate disciplinary request language. Output ONLY valid JSON: `{"requestsText":""}`. All in Arabic. Model: `AiStepType.AdminComplaintRequests`. On success: set `Step4Output`, `CurrentStep = 5`.

- [x] T025 [US4] Add Step 4 UI to `AdminComplaintPage.tsx`. Output: `requestsText` in a styled block. Add extraReducer.

---

## Phase 7: User Story 5 — Full Administrative Complaint Assembly (Priority: P3)

**Goal**: System assembles the complete official complaint document.

**Independent Test**: `POST /api/AdminComplaint/{id}/step/5` returns JSON `{"documentText": "...full Arabic complaint document..."}` with all required sections.

- [x] T026 [US5] Implement `case 5:` in `RunStepAsync`. Requires `Step4Output` non-null. System prompt (Arabic): Assemble a complete formal Egyptian administrative complaint document in "White Paper" professional style. Include all required sections in order: date, addressee, greeting, preamble, facts section (from step 2), violation section (from step 3), requests section (from step 4), closing and signature block. All in formal Arabic. Output ONLY valid JSON: `{"documentText":""}`. Model: `AiStepType.AdminComplaintAssembly`. On success: set `Step5Output`, `Status = WorkflowStatus.Completed`, `CurrentStep = 5`.

- [x] T027 [US5] Add Step 5 UI to `AdminComplaintPage.tsx`. Output: full document text in RTL block. "تحميل كـ DOCX" button using `docx` + `file-saver`. Add fulfilled extraReducer: set `step5Output`, `status = "Completed"`.

- [x] T028 Create `thunkSaveEditedComplaintStep` in `mohamy-smart-lawyer-dashboard/src/redux/adminComplaint/thunk/thunkSaveEditedComplaintStep.ts`. Props: `{ workflowId: number; stepNumber: number; editedOutputJson: string }`. Calls `api.put(API_ROUTES.ADMIN_COMPLAINT_SAVE_STEP(workflowId, stepNumber), { editedOutputJson })`.

---

## Phase 8: Polish

- [x] T029 [P] Add route in `mohamy-smart-lawyer-dashboard/src/router/AppRouter.tsx`: `<Route path="/admin-complaint/:workflowId?" element={<AdminComplaintPage />} />` inside `ProtectedRoute`. Import `AdminComplaintPage`.

- [x] T030 [P] Add "الشكاوى الإدارية" sidebar link in `mohamy-smart-lawyer-dashboard/src/components/public/sidebar/Sidebar.tsx`.

- [x] T031 Implement `SaveEditedStepAsync` in `AdminComplaintService.cs`. Fetch workflow by id+lawyerId. Set the corresponding `StepNOutput` to `editedOutputJson`. Clear all subsequent step outputs (null). Reset `CurrentStep` to edited step number. Save. Return list of cleared steps.

- [x] T032 Apply migration: `cd mohamy-smart-backend && dotnet ef database update --project Lawyer.Infrastracture --startup-project Lawyer`.

- [x] T033 [P] Frontend lint: `cd mohamy-smart-lawyer-dashboard && npm run lint && npx tsc --noEmit`. Fix errors.

---

## Dependencies

- T001 (enum) → blocks T002–T011 (foundational)
- T002–T011 → blocks all US phases; T009 (migration) after T002–T005
- US phases execute sequentially (each US needs prior step's service pattern)
- T029–T033 (polish) after all US phases complete

## MVP: Complete Phase 1 + Phase 2 + Phase 3 (Step 1 classification only).
