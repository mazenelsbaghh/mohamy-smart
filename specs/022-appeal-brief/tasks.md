# Tasks: Appeal Brief Preparation (صحيفة الطعن)

**Feature branch**: `022-appeal-brief`
**Input**: `specs/022-appeal-brief/`
**Exact paths**: All paths relative to repo root `mohamy-smart/`

> **LLM execution note**: Each task is one file or one targeted edit. Read the referenced design docs for exact field names and JSON schemas before implementing.

## Format: `[ID] [P?] [Story?] Description — exact file path`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Enums and shared types that block everything else.

- [x] T001 Create `WorkflowStatus` enum in `mohamy-smart-backend/Lawyer.Core/Enum/WorkflowStatus.cs`. Namespace: `Lawyer.Core.Enum`. Values: `InProgress = 0`, `Completed = 1`, `Abandoned = 2`. This enum is shared by all workflow features (022–026) — create it once here.

- [x] T002 Add 6 new values to the `AiStepType` enum in `mohamy-smart-backend/Lawyer.Core/Enum/AiStepType.cs`. Add after the existing `Chat = 30` line: `AppealBriefJudgmentData = 40`, `AppealBriefReasoningAnalysis = 41`, `AppealBriefGrounds = 42`, `AppealBriefRequests = 43`, `AppealBriefLegalBasis = 44`, `AppealBriefAssembly = 45`. Keep the existing values untouched.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entity, DB, service, controller stubs — must complete before any step can be implemented.

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

- [x] T003 Create `AppealWorkflow` entity in `mohamy-smart-backend/Lawyer.Core/Models/AppealWorkflow.cs`. Namespace: `Lawyer.Core.Models`. Properties: `Id` (int, PK), `CaseId` (Guid, FK to Case), `LawyerId` (string, max 450), `CurrentStep` (int, default 1), `Status` (WorkflowStatus, default InProgress), `Step1Output` (string?, nullable), `Step2Output` (string?, nullable), `Step3Output` (string?, nullable), `Step4Output` (string?, nullable), `Step5Output` (string?, nullable), `Step6Output` (string?, nullable), `CreatedAt` (DateTime, `= DateTime.UtcNow`), `UpdatedAt` (DateTime, `= DateTime.UtcNow`). Add nav property: `public Case Case { get; set; } = null!;`. Import `Lawyer.Core.Enum`.

- [x] T004 Add `DbSet<AppealWorkflow> AppealWorkflows { get; }` property to the `IApplicationDbContext` interface in `mohamy-smart-backend/Lawyer.Core/Interface/IApplicationDbContext.cs`. Add using: `using Lawyer.Core.Models;`. Pattern: follow how `DbSet<AiJob> AiJobs { get; }` is declared.

- [x] T005 Add `public DbSet<AppealWorkflow> AppealWorkflows { get; set; } = null!;` to `AppDbContext` class in `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`. Place it after the `AiStageModelConfigs` DbSet line. Add using if needed.

- [x] T006 [P] Create 3 DTO files for Appeal Brief in `mohamy-smart-backend/Lawyer.Application/Dtos/AppealBrief/` (create folder):
  - `StartAppealWorkflowRequest.cs`: namespace `Lawyer.Application.Dtos.AppealBrief`; one property: `public Guid CaseId { get; set; }`.
  - `RunStepRequest.cs`: namespace `Lawyer.Application.Dtos.AppealBrief`; one property: `public string? Input { get; set; }` (lawyer's raw text input; null for steps 2–6 which use prior outputs automatically).
  - `AppealWorkflowDto.cs`: namespace `Lawyer.Application.Dtos.AppealBrief`; properties matching `AppealWorkflow` entity: `Id` (int), `CaseId` (Guid), `LawyerId` (string), `CurrentStep` (int), `Status` (string — the enum name, not int), `Step1Output` through `Step6Output` (string?, nullable each), `CreatedAt` (DateTime).

- [x] T007 Create `IAppealBriefService` interface in `mohamy-smart-backend/Lawyer.Application/IServices/IAppealBriefService.cs`. Namespace: `Lawyer.Application.IServices`. Import `Lawyer.Application.Dtos.AppealBrief`, `Lawyer.Core.Exceptions`. Methods:
  ```
  Task<Result<AppealWorkflowDto>> StartWorkflowAsync(StartAppealWorkflowRequest request, string lawyerId, CancellationToken ct);
  Task<Result<AppealWorkflowDto>> GetWorkflowAsync(int id, string lawyerId, CancellationToken ct);
  Task<Result<List<AppealWorkflowDto>>> GetWorkflowsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct);
  Task<Result<object>> RunStepAsync(int workflowId, int stepNumber, RunStepRequest request, string lawyerId, CancellationToken ct);
  Task<Result<object>> SaveEditedStepAsync(int workflowId, int stepNumber, string editedOutputJson, string lawyerId, CancellationToken ct);
  Task<Result<bool>> AbandonWorkflowAsync(int id, string lawyerId, CancellationToken ct);
  ```

- [x] T008 Register the service in `mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs`. Add line: `services.AddScoped<IAppealBriefService, AppealBriefService>();` after the existing `AddScoped` calls. Add usings: `using Lawyer.Application.IServices; using Lawyer.Application.Services;`.

- [x] T009 Create `AppealBriefService` class stub in `mohamy-smart-backend/Lawyer.Application/Services/AppealBriefService.cs`. Namespace: `Lawyer.Application.Services`. Implements `IAppealBriefService`. Constructor injects: `IApplicationDbContext db`, `IAIProviderFactory aiProviderFactory`, `ILogger<AppealBriefService> logger`. Implement all 6 interface methods as stubs returning `Result<>.Failure("Not implemented")` for now. Step methods will be filled in Phases 3–8.

- [x] T010 Generate EF Core migration from the backend solution root. Run: `cd mohamy-smart-backend && dotnet ef migrations add AddAppealWorkflows --project Lawyer.Infrastracture --startup-project Lawyer`. Then open the generated migration file in `Lawyer.Infrastracture/Migrations/` and add the following `InsertData` calls inside the `Up` method AFTER the `CreateTable` call:
  ```csharp
  migrationBuilder.InsertData(
      table: "AiStageModelConfigs",
      columns: new[] { "Id", "ModelIdentifier", "StepType", "UpdatedAt", "UpdatedBy" },
      values: new object[,]
      {
          { 13, "gemini-3.1-pro-preview", 40, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 14, "gemini-3.1-pro-preview", 41, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 15, "gemini-3.1-pro-preview", 42, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 16, "gemini-3.1-pro-preview", 43, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 17, "gemini-3.1-pro-preview", 44, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
          { 18, "gemini-3.1-pro-preview", 45, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
      });
  ```
  The Id values (13–18) must be higher than the last existing seed row Id (12 in the prior migration).

- [x] T011 Add the 6 new `AiStepType` values to the `StageDefinitions` static list in `mohamy-smart-backend/Lawyer.Application/Services/AiModelConfigService.cs`. Add inside the list after `(AiStepType.Chat, "المحادثة", "المحادثة", 4),`:
  ```csharp
  (AiStepType.AppealBriefJudgmentData, "استخراج بيانات الحكم", "صحيفة الطعن", 5),
  (AiStepType.AppealBriefReasoningAnalysis, "تحليل أسباب الحكم", "صحيفة الطعن", 5),
  (AiStepType.AppealBriefGrounds, "تحديد أوجه الطعن", "صحيفة الطعن", 5),
  (AiStepType.AppealBriefRequests, "صياغة الطلبات", "صحيفة الطعن", 5),
  (AiStepType.AppealBriefLegalBasis, "السند القانوني", "صحيفة الطعن", 5),
  (AiStepType.AppealBriefAssembly, "تجميع الصحيفة النهائية", "صحيفة الطعن", 5),
  ```

- [x] T012 Create `AppealBriefController` in `mohamy-smart-backend/Lawyer/Controllers/AppealBriefController.cs`. Namespace: `Lawyer.Controllers`. Inherits `AppControllerBase`. Add `[Route("api/[controller]")]`, `[ApiController]`, `[Authorize(Roles = "Lawyer")]` on the class. Inject `IAppealBriefService _service`. Add using `System.Security.Claims`. Helper: `private string GetLawyerId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;`. Implement endpoints:
  - `POST /` → `StartWorkflowAsync(request, GetLawyerId(), ct)` → 201 Created
  - `GET /{id}` → `GetWorkflowAsync(id, GetLawyerId(), ct)` → 200
  - `GET /case/{caseId}` → `GetWorkflowsByCaseAsync(caseId, GetLawyerId(), ct)` → 200
  - `POST /{id}/step/{stepNumber}` → `RunStepAsync(id, stepNumber, request, GetLawyerId(), ct)` → 200
  - `PUT /{id}/step/{stepNumber}` → `SaveEditedStepAsync(id, stepNumber, request.EditedOutputJson, GetLawyerId(), ct)` → 200 (add `EditedOutputJson` string property to a new `SaveStepRequest` DTO inline or in the Dtos folder)
  - `DELETE /{id}` → `AbandonWorkflowAsync(id, GetLawyerId(), ct)` → 200

**Checkpoint**: Compile the solution. All 6 methods are stubs — the app builds and the migration runs. Step implementation begins next.

---

## Phase 3: User Story 1 — Judgment Data Extraction (Priority: P1) 🎯 MVP

**Goal**: Lawyer inputs raw judgment text → system extracts and returns structured judgment data (case number, date, court, parties, pronouncement, judgment type, any missing fields).

**Independent Test**: `POST /api/AppealBrief/{id}/step/1` with `{"input": "قضت المحكمة بإدانة المتهم..."}` returns a JSON object with fields: `caseNumber`, `judgmentDate`, `courtName`, `parties` (plaintiff, defendant), `pronouncement`, `judgmentType`, `missingFields` array.

- [x] T013 [US1] Implement `RunStep` for step 1 in `AppealBriefService.cs`. In the `RunStepAsync` method, add a `case 1:` branch that:
  1. Fetches the `AppealWorkflow` from `_db.AppealWorkflows` by `id` and `lawyerId`. Return 404 if not found.
  2. Builds `systemPrompt`: Arabic expert extracting judgment data. Output ONLY valid JSON matching the schema: `{"caseNumber":"","judgmentDate":"","courtName":"","parties":{"plaintiff":"","defendant":""},"pronouncement":"","judgmentType":"","missingFields":[]}`. Fill `missingFields` with field names that cannot be determined from the input — never invent data.
  3. `userPrompt` = `request.Input` (the raw judgment text).
  4. Calls: `var model = await _aiProviderFactory.GetModelForStepAsync(AiStepType.AppealBriefJudgmentData);`
  5. Calls: `var options = AIRequestOptions.ForAnalysis with { Model = model };`
  6. Calls: `var aiResult = await _aiProviderFactory.GetProvider().SendChatCompletionAsync(systemPrompt, userPrompt, options, ct);`
  7. On success: sets `workflow.Step1Output = aiResult.Data`, `workflow.CurrentStep = 2`, `workflow.UpdatedAt = DateTime.UtcNow`, saves changes, returns the parsed JSON as `Result<object>`.
  8. On AI failure: returns `Result<object>.Failure` with Arabic error message.

- [x] T014 [P] [US1] Add API route constant to `mohamy-smart-lawyer-dashboard/src/APIs/routes.ts`:
  ```typescript
  APPEAL_BRIEF_START: '/AppealBrief',
  APPEAL_BRIEF_GET: (id: number) => `/AppealBrief/${id}`,
  APPEAL_BRIEF_BY_CASE: (caseId: string) => `/AppealBrief/case/${caseId}`,
  APPEAL_BRIEF_RUN_STEP: (id: number, step: number) => `/AppealBrief/${id}/step/${step}`,
  APPEAL_BRIEF_SAVE_STEP: (id: number, step: number) => `/AppealBrief/${id}/step/${step}`,
  APPEAL_BRIEF_ABANDON: (id: number) => `/AppealBrief/${id}`,
  ```

- [x] T015 [P] [US1] Create Redux slice in `mohamy-smart-lawyer-dashboard/src/redux/appealBrief/AppealBrief.ts`. Pattern: copy `SmartAnalysis.ts` structure. State type `TAppealBriefState`: `workflowId: number | null`, `currentStep: number`, `status: string`, `step1Output: object | null`, `step2Output: object | null`, `step3Output: object | null`, `step4Output: object | null`, `step5Output: object | null`, `step6Output: object | null`, `loading: TLoading`, `error: string | null`. Initial state: all outputs null, currentStep 1, loading 'idle'. Reducers: `resetAppealBrief` (reset to initial). Use `createSlice` from `@reduxjs/toolkit`.

- [x] T016 [P] [US1] Create thunk `thunkRunAppealStep` in `mohamy-smart-lawyer-dashboard/src/redux/appealBrief/thunk/thunkRunAppealStep.ts`. Pattern: copy `thunkFactAnalysis.ts`. Props: `{ workflowId: number; stepNumber: number; input?: string }`. Calls `api.post(API_ROUTES.APPEAL_BRIEF_RUN_STEP(workflowId, stepNumber), { input })`. Returns `res.data.data`.

- [x] T017 [P] [US1] Create thunk `thunkStartAppealWorkflow` in `mohamy-smart-lawyer-dashboard/src/redux/appealBrief/thunk/thunkStartAppealWorkflow.ts`. Props: `{ caseId: string }`. Calls `api.post(API_ROUTES.APPEAL_BRIEF_START, { caseId })`. Returns `res.data.data`.

- [x] T018 [US1] Add `thunkStartAppealWorkflow` and `thunkRunAppealStep` extraReducers to `AppealBrief.ts` slice. On `thunkStartAppealWorkflow.fulfilled`: set `workflowId`, `currentStep = 1`, `status`. On `thunkRunAppealStep.fulfilled` for step 1: set `step1Output = payload`, `currentStep = 2`. Follow the pending/fulfilled/rejected pattern from `SmartAnalysis.ts`.

- [x] T019 [US1] Register `AppealBrief` reducer in `mohamy-smart-lawyer-dashboard/src/redux/store.ts`. Add `appealBrief: AppealBriefReducer` to the `combineReducers` call (or `configureStore` reducers object). Import from `./appealBrief/AppealBrief`.

- [x] T020 [US1] Create page file `mohamy-smart-lawyer-dashboard/src/pages/appealBrief/AppealBriefPage.tsx`. RTL (`dir="rtl"`), Tajawal font. Component renders a 6-step wizard with a step indicator at top. For now implement Step 1 only:
  - A `<textarea>` labeled "أدخل نص الحكم" for the lawyer to input the judgment text.
  - A "تشغيل الخطوة الأولى" button that dispatches `thunkRunAppealStep({ workflowId, stepNumber: 1, input: text })`.
  - When loading: show Arabic loading text "جارٍ التحليل...".
  - When step1Output is set: render a structured display of the judgment data fields. Mark any items in `missingFields` with a red label "⚠ غير متوفر".
  - A "التالي" button that becomes enabled when `step1Output` is not null.

**Checkpoint**: Step 1 is fully functional end-to-end. A lawyer can input a judgment and see structured extraction output.

---

## Phase 4: User Story 2 — Reasoning Analysis (Priority: P1)

**Goal**: System produces a neutral, purely descriptive analysis of the court's reasoning. Zero evaluative terms. Criminal/civil split.

**Independent Test**: `POST /api/AppealBrief/{id}/step/2` (no input body needed) returns JSON with `reasoningSummary` (descriptive only), `evidenceList` (array), `responseToDefense`, `criminalAspect`, `civilAspect`.

- [x] T021 [US2] Implement `case 2:` branch in `RunStepAsync` in `AppealBriefService.cs`. Requires `Step1Output` to be non-null (return 400 if null). System prompt (Arabic): You are analyzing court reasoning in neutral, purely descriptive terms only. Use ONLY: "استند الحكم إلى", "أوضح الحكم", "اعتمد على", "تناول". NEVER use: "يقين قضائي", "اطمأنت المحكمة", "أدلة متسقة", "صائب", "سليم". Output ONLY valid JSON: `{"reasoningSummary":"","evidenceList":[],"responseToDefense":"","criminalAspect":null,"civilAspect":null}`. User prompt: the content of `Step1Output`. Resolve model via `AiStepType.AppealBriefReasoningAnalysis`. On success: set `Step2Output`, `CurrentStep = 3`.

- [x] T022 [P] [US2] Create thunk `thunkGetAppealWorkflow` in `mohamy-smart-lawyer-dashboard/src/redux/appealBrief/thunk/thunkGetAppealWorkflow.ts`. Props: `{ workflowId: number }`. Calls `api.get(API_ROUTES.APPEAL_BRIEF_GET(workflowId))`. Returns `res.data.data`. (Used to resume workflow on page load.)

- [x] T023 [US2] Add Step 2 UI to `AppealBriefPage.tsx`. When `currentStep >= 2`: show Step 2 panel with a "تشغيل تحليل الأسباب" button that dispatches `thunkRunAppealStep({ workflowId, stepNumber: 2 })` (no input). When `step2Output` is set: show `reasoningSummary`, `evidenceList` as a bulleted list, `criminalAspect` / `civilAspect` in two labeled sections. Add Step 2 fulfilled case to the `AppealBrief.ts` extraReducers: set `step2Output = payload`, `currentStep = 3`.

**Checkpoint**: Steps 1 and 2 work end-to-end.

---

## Phase 5: User Story 3 — Appeal Grounds Identification (Priority: P2)

**Goal**: System analyzes reasoning and identifies specific legal defects (عيوب) as valid grounds for appeal.

**Independent Test**: `POST /api/AppealBrief/{id}/step/3` returns JSON: `{"isSufficient": false, "defectType": "string", "diagnosticChain": "A → B → C → D"}`.

- [x] T024 [US3] Implement `case 3:` branch in `RunStepAsync` in `AppealBriefService.cs`. Requires `Step2Output` non-null. System prompt (Arabic): You are a legal expert identifying specific technical defects in court reasoning. Output ONLY valid JSON: `{"isSufficient":true,"defectType":null,"diagnosticChain":null}`. If a defect exists: `isSufficient = false`, `defectType` = the classified defect name in legal Arabic, `diagnosticChain` = the diagnostic chain in "أ → ب → ج → د" format. If no defect: `isSufficient = true`, other fields null. NEVER fabricate defects. User prompt: content of `Step2Output`. Model: `AiStepType.AppealBriefGrounds`. On success: set `Step3Output`, `CurrentStep = 4`.

- [x] T025 [US3] Add Step 3 UI to `AppealBriefPage.tsx`. When `currentStep >= 3`: "تشغيل تحديد أوجه الطعن" button. When `step3Output` is set: show `isSufficient` as a badge (أخضر = كافٍ / أحمر = قاصر)، `defectType`، `diagnosticChain`. Add Step 3 fulfilled extraReducer: set `step3Output = payload`, `currentStep = 4`.

**Checkpoint**: Steps 1–3 work end-to-end.

---

## Phase 6: User Story 4 — Requests Drafting (Priority: P2)

**Goal**: System drafts the formal requests section of the brief (طلبات إجرائية، موضوعية، عاجلة).

**Independent Test**: `POST /api/AppealBrief/{id}/step/4` returns JSON: `{"proceduralRequests":[],"substantiveRequests":[],"urgentRequests":[]}`.

- [x] T026 [US4] Implement `case 4:` branch in `RunStepAsync` in `AppealBriefService.cs`. Requires `Step3Output` non-null. System prompt (Arabic): Draft formal requests for an Egyptian criminal appeal brief based on the identified grounds. Output ONLY valid JSON: `{"proceduralRequests":[],"substantiveRequests":[],"urgentRequests":[]}`. `urgentRequests` is an empty array if no urgent measures are warranted — do NOT fabricate. All values must be in formal legal Arabic. User prompt: content of `Step3Output`. Model: `AiStepType.AppealBriefRequests`. On success: set `Step4Output`, `CurrentStep = 5`.

- [x] T027 [US4] Add Step 4 UI to `AppealBriefPage.tsx`. When `currentStep >= 4`: button. When output set: show 3 request categories as labeled lists. Empty `urgentRequests` shows "لا توجد طلبات عاجلة". Add fulfilled extraReducer: set `step4Output`, `currentStep = 5`.

**Checkpoint**: Steps 1–4 work end-to-end.

---

## Phase 7: User Story 5 — Legal Basis Citation (Priority: P3)

**Goal**: System identifies legal articles and Cassation principles supporting the appeal grounds.

**Independent Test**: `POST /api/AppealBrief/{id}/step/5` returns JSON with `articles` array (lawName, articleNumber, articleText) and `cassationPrinciples` array.

- [x] T028 [US5] Implement `case 5:` branch in `RunStepAsync` in `AppealBriefService.cs`. Requires `Step4Output` non-null. System prompt (Arabic): Identify and cite specific legal articles and Cassation Court principles supporting these appeal grounds. Output ONLY valid JSON: `{"articles":[{"lawName":"","articleNumber":"","articleText":""}],"cassationPrinciples":[{"caseNumber":"","year":"","date":"","principleText":"","applicationNotes":""}]}`. If a Cassation principle is uncertain, flag it with `applicationNotes: "يُنصح بالتحقق"`. Do NOT fabricate rulings. User prompt: combine `Step3Output` + `Step4Output`. Model: `AiStepType.AppealBriefLegalBasis`. On success: set `Step5Output`, `CurrentStep = 6`.

- [x] T029 [US5] Add Step 5 UI to `AppealBriefPage.tsx`. When `currentStep >= 5`: button. When output set: show articles as expandable cards, Cassation principles as a table. Add fulfilled extraReducer.

**Checkpoint**: Steps 1–5 work end-to-end.

---

## Phase 8: User Story 6 — Final Appeal Brief Assembly (Priority: P3)

**Goal**: System assembles all prior step outputs into a complete, court-ready Arabic appeal brief document.

**Independent Test**: `POST /api/AppealBrief/{id}/step/6` returns JSON `{"documentText": "...full Arabic brief..."}`. Document includes: header, parties, pronouncement, grounds with arguments and legal basis, requests, signature block.

- [x] T030 [US6] Implement `case 6:` branch in `RunStepAsync` in `AppealBriefService.cs`. Requires `Step5Output` non-null. System prompt (Arabic): Assemble a complete formal Egyptian criminal appeal brief (صحيفة طعن بالنقض) from the provided structured data. Follow standard Egyptian judicial format exactly. All content must be in formal legal Arabic. Output ONLY valid JSON: `{"documentText":""}` where `documentText` is the full brief. User prompt: JSON object containing all 5 prior step outputs. Model: `AiStepType.AppealBriefAssembly`. On success: set `Step6Output`, `CurrentStep = 6`, `Status = WorkflowStatus.Completed`.

- [x] T031 [US6] Add Step 6 UI to `AppealBriefPage.tsx`. When `currentStep >= 6`: "تجميع الصحيفة النهائية" button. When `step6Output` is set: show full document text in a styled RTL `<pre>` or `<div>`. Add a "تحميل كـ DOCX" button (use existing `docx` + `file-saver` packages already in lawyer dashboard). Add fulfilled extraReducer: set `step6Output`, `status = "Completed"`.

- [x] T032 [US6] Create thunk `thunkSaveEditedStep` in `mohamy-smart-lawyer-dashboard/src/redux/appealBrief/thunk/thunkSaveEditedStep.ts`. Props: `{ workflowId: number; stepNumber: number; editedOutputJson: string }`. Calls `api.put(API_ROUTES.APPEAL_BRIEF_SAVE_STEP(workflowId, stepNumber), { editedOutputJson })`. Returns `res.data.data`. This allows the lawyer to edit any step output and re-trigger downstream.

- [x] T033 [US6] Add "تعديل" (edit) button to each completed step panel in `AppealBriefPage.tsx`. On click: show the step's raw JSON in an `<textarea>` for editing. On save: dispatch `thunkSaveEditedStep`. Show a warning banner: "تعديل هذه الخطوة سيحذف مخرجات الخطوات التالية."

**Checkpoint**: Full 6-step workflow is complete end-to-end.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [x] T034 [P] Add route for `AppealBriefPage` in `mohamy-smart-lawyer-dashboard/src/router/AppRouter.tsx`. Inside the `<ProtectedRoute>` block: `<Route path="/appeal-brief/:workflowId?" element={<AppealBriefPage />} />`. Import `AppealBriefPage`.

- [x] T035 [P] Add "صحيفة الطعن" link to sidebar in `mohamy-smart-lawyer-dashboard/src/components/public/sidebar/Sidebar.tsx`. Follow the existing sidebar link pattern. Icon: use an existing icon from the icon library already used (e.g., document/file icon).

- [x] T036 Implement `StartWorkflowAsync` in `AppealBriefService.cs`. Validate `CaseId` exists in `_db.Cases`. Create new `AppealWorkflow { CaseId = request.CaseId, LawyerId = lawyerId }`. Add to `_db.AppealWorkflows`, save, return mapped DTO with status 201.

- [x] T037 Implement `GetWorkflowAsync`, `GetWorkflowsByCaseAsync`, `AbandonWorkflowAsync` in `AppealBriefService.cs`. For Get: fetch by id + lawyerId guard. For list by case: filter by `CaseId` and `LawyerId`. For Abandon: set `Status = WorkflowStatus.Abandoned`, save.

- [x] T038 Implement `SaveEditedStepAsync` in `AppealBriefService.cs`. Fetch workflow, validate step number (1–6), set the corresponding `StepNOutput` column to `editedOutputJson`, clear all subsequent step outputs (set to null), reset `CurrentStep` to the edited step number, save. Return the list of cleared step numbers.

- [x] T039 Apply migration: `cd mohamy-smart-backend && dotnet ef database update --project Lawyer.Infrastracture --startup-project Lawyer`. Verify with `make db-migrate` if Makefile is running.

- [x] T040 [P] Run frontend lint and type check: `cd mohamy-smart-lawyer-dashboard && npm run lint && npx tsc --noEmit`. Fix any TypeScript errors.

---

## Dependencies & Execution Order

- Phase 1 (T001, T002) → blocks Phase 2
- Phase 2 (T003–T012) → blocks all user story phases; T010 (migration) must run after T003–T006
- T013–T020 (US1) → can start once Phase 2 is complete
- T021–T023 (US2) → needs US1 complete (service pattern established)
- T024–T025 (US3) → needs US2 complete
- T026–T027 (US4) → needs US3 complete
- T028–T029 (US5) → needs US4 complete
- T030–T033 (US6) → needs US5 complete
- T034–T040 (Polish) → can run after Phase 8 complete; T034, T035, T040 are [P] with T036–T039

## Parallel Opportunities Within Phases

```
Phase 2 parallel (different files):
  Task: T006 (DTOs folder)   ←→   Task: T007 (interface)

Phase 3 parallel (different repos):
  Task: T014 (routes.ts)   ←→   Task: T015 (slice)   ←→   Task: T016 (thunk)   ←→   Task: T017 (thunk)
```

## MVP Scope

Complete Phase 1 + Phase 2 + Phase 3 only → Step 1 (Judgment Extraction) is the MVP. Ship and validate before proceeding.
