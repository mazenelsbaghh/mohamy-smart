# Tasks: AI Usage & Cost Tracking

**Input**: Design documents from `/specs/048-ai-usage-tracking/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ai-usage-api.md

**Tests**: Not explicitly requested — no test tasks included.

**Organization**: Tasks grouped by user story. US1 = MVP (cost summary), US2+US3 = per-model + per-lawyer breakdown, US4 = lawyer detail page.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Paths are relative to workspace root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the data entity, cost calculator, and database migration

- [x] T001 Create `AiUsageRecord` entity with fields Id, LawyerId, CaseId, AiStepType, ModelIdentifier, Provider, InputTokens, OutputTokens, TotalTokens, EstimatedCostUsd, CreatedAt in `mohamy-smart-backend/Lawyer.Core/Models/AiUsageRecord.cs`
- [x] T002 Add `DbSet<AiUsageRecord>` and configure indexes (LawyerId, CreatedAt, AiStepType, Provider, composite LawyerId+CreatedAt, composite Provider+CreatedAt) and relationships (Lawyer with NoAction, Case with NoAction) in `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`
- [x] T003 [P] Create `AiCostCalculator` static class with Gemini pricing dictionary (Pro $2/$12, Flash $0.50/$3, Flash Lite $0.25/$1.50 per 1M tokens), `CalculateGeminiCost(modelId, inputTokens, outputTokens)`, `CalculateOcrCost()` ($1.50/1000), and fallback to Pro pricing in `mohamy-smart-backend/Lawyer.Application/Services/AiCostCalculator.cs`
- [x] T004 Run EF Core migration `AddAiUsageRecords` — verify migration file is generated and `make db-migrate` succeeds

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modify AI provider to capture usage metadata, create tracking service, and instrument all AI-calling services

**CRITICAL**: No user story work can begin until this phase is complete. Every AI call must be tracked after this phase.

### Provider Interface Changes

- [x] T005 Add `AIUsageMetadata` record (InputTokens, OutputTokens, TotalTokens) and `AIResponse` record (Content, Usage) to `mohamy-smart-backend/Lawyer.Application/IServices/AI/IAIProvider.cs`. Change `SendChatCompletionAsync` return type from `Task<Result<string>>` to `Task<Result<AIResponse>>`
- [x] T006 Modify `GeminiProvider.SendChatCompletionAsync` in `mohamy-smart-backend/Lawyer.Application/Services/AI/GeminiProvider.cs` to: (1) return `Result<AIResponse>` instead of `Result<string>`, (2) parse `usageMetadata` from JSON response (promptTokenCount → InputTokens, candidatesTokenCount → OutputTokens, totalTokenCount → TotalTokens) with null fallback, (3) wrap content in `new AIResponse(content, usage)`

### Tracking Service

- [x] T007 [P] Create `IAiUsageTrackingService` interface with `RecordGeminiUsageAsync(Guid lawyerId, Guid? caseId, AiStepType stepType, string modelIdentifier, AIUsageMetadata usage, CancellationToken ct)` and `RecordOcrUsageAsync(Guid lawyerId, Guid? caseId, CancellationToken ct)` in `mohamy-smart-backend/Lawyer.Application/IServices/IAiUsageTrackingService.cs`
- [x] T008 Implement `AiUsageTrackingService` in `mohamy-smart-backend/Lawyer.Application/Services/AiUsageTrackingService.cs`: inject `IUnitOfWork` + `ILogger`. `RecordGeminiUsageAsync` creates `AiUsageRecord` with Provider="Gemini", cost from `AiCostCalculator.CalculateGeminiCost`, saves via fire-and-forget `Task.Run` with error logging. `RecordOcrUsageAsync` creates record with Provider="GoogleVision", tokens=0, cost from `AiCostCalculator.CalculateOcrCost`, same fire-and-forget pattern

### Instrument All AI-Calling Services

- [x] T009 Update `SmartAnalysisService` in `mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`: (1) inject `IAiUsageTrackingService`, (2) update all 5 AI call sites (AnalyzeCaseFactsAsync line ~152, GenerateCaseDefensesAsync line ~295, AnalyzeDefenseAsync line ~450, GenerateFinalRequirementsAsync line ~752, ChatAsync line ~1538) to unwrap `AIResponse.Content` and call `_trackingService.RecordGeminiUsageAsync(lawyerId, caseId, stepType, model, usage)` after success. LawyerId comes from `UserContextHelper.GetUserId()` for first 4 methods, from parameter for ChatAsync
- [x] T010 Update `PreparingStatementOfClaimsService` in `mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`: (1) inject `IAiUsageTrackingService`, (2) update all 6 AI call sites (ClassifyLawSuitCaseTypeAsync, ExtractLawSuitPartiesAsync, GenerateLawSuitSubjectsAsync, GenerateLawSuitFactsAsync, GenerateLawSuitLegalBasisAsync, GenerateLawSuitRequestsAsync) to unwrap `AIResponse.Content` and record usage. LawyerId from `UserContextHelper.GetUserId()`, caseId from request DTO
- [x] T011 Update `WorkflowServiceBase` in `mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs`: (1) inject `IAiUsageTrackingService`, (2) in `RunStepBaseAsync` (line ~158), unwrap `AIResponse.Content` and call `_trackingService.RecordGeminiUsageAsync(lawyerId, caseId, stepType, model, usage)`. This instruments all 5 workflow services (AppealBrief, AdminComplaint, RulingAnalysis, LegalWarning, ExecRequest)
- [x] T012 [P] Update `ClarifyFactsService` in `mohamy-smart-backend/Lawyer.Application/Services/ClarifyFactsService.cs`: (1) inject `IAiUsageTrackingService`, (2) update `EvaluateFactsGapsAsync` (line ~92) to unwrap `AIResponse.Content` and record usage. LawyerId from method parameter
- [x] T013 Update `CaseOcrService` in `mohamy-smart-backend/Lawyer.Application/Services/CaseOcrService.cs`: (1) inject `IAiUsageTrackingService`, (2) add OCR usage recording after Google Vision call in `ExtractTextWithGoogleVisionAsync` (record with Provider="GoogleVision", flat OCR cost per call), (3) update `GenerateCaseFromTextAsync` (line ~258) to unwrap `AIResponse.Content` and record Gemini usage with stepType=Ocr. For OCR: LawyerId must be resolved from Case lookup or passed from caller

### DTOs and DI Registration

- [x] T014 [P] Create DTO folder and files in `mohamy-smart-backend/Lawyer.Application/Dtos/AiUsageReport/`: AiUsageSummaryDto.cs, ModelUsageDto.cs, LawyerUsageDto.cs, LawyerUsageDetailDto.cs, StepUsageDto.cs, DailyCostDto.cs — per field definitions in data-model.md
- [x] T015 Register `AiUsageTrackingService`, `AiUsageReportService` in DI container in `mohamy-smart-backend/Lawyer/Extensions/` (wherever other services are registered, likely `ServiceCollectionExtensions.cs` or `Program.cs`)
- [x] T016 Verify all existing AI workflows still function by running any AI operation (e.g., Smart Analysis) and confirming `AiUsageRecords` table gets a new row

**Checkpoint**: Foundation ready — every AI/OCR call now writes a usage record. User story implementation can begin.

---

## Phase 3: User Story 1 — Cost Summary Page (Priority: P1) MVP

**Goal**: Admin sees a page with 4 stat cards (Total Cost, AI Cost, OCR Cost, Total Requests) filterable by date range

**Independent Test**: Open `/ai-usage` as admin, verify 4 cards show correct totals, change date filter and verify numbers update

### Backend for US1

- [x] T017 Create `IAiUsageReportService` interface with `GetUsageSummaryAsync(DateTime? from, DateTime? to, CancellationToken ct)` in `mohamy-smart-backend/Lawyer.Application/IServices/IAiUsageReportService.cs`
- [x] T018 Implement `GetUsageSummaryAsync` in `mohamy-smart-backend/Lawyer.Application/Services/AiUsageReportService.cs`: query `AiUsageRecords` with optional date filter, compute TotalCostUsd/AiCostUsd/OcrCostUsd by grouping on Provider, compute TotalInputTokens/TotalOutputTokens, group by ModelIdentifier for PerModel list with display names. Return `AiUsageSummaryDto`
- [x] T019 Create `AiUsageController` in `mohamy-smart-backend/Lawyer/Controllers/AiUsageController.cs` with `[Authorize(Roles = "Admin")]`, inject `IAiUsageReportService`. Add `GET /api/ai-usage/summary` endpoint accepting `DateTime? from, DateTime? to` query params, returning `Result<AiUsageSummaryDto>`. Register controller implicitly via DI

### Frontend for US1

- [x] T020 [P] Add `AI_USAGE` route object to `mohamy-smart-admin-dashboard/src/APIs/routes.ts` with SUMMARY, LAWYERS, LAWYER_DETAIL, MODELS paths
- [x] T021 [P] Add TypeScript interfaces to `mohamy-smart-admin-dashboard/src/types/index.ts`: `AiUsageSummary`, `ModelUsage`, `LawyerUsage`, `LawyerUsageDetail`, `StepUsage`, `DailyCost`, `AiUsageState` — matching backend DTOs
- [x] T022 Create `mohamy-smart-admin-dashboard/src/redux/aiUsage/aiUsageSlice.ts` with `createSlice`, initial state (summary, lawyers, lawyerDetail, modelUsage, isLoading, error, dateFrom, dateTo), and `fetchAiUsageSummary` async thunk calling `GET /api/ai-usage/summary`
- [x] T023 Add `aiUsage: aiUsageReducer` to store in `mohamy-smart-admin-dashboard/src/redux/store.ts`
- [x] T024 Create `AiUsage.tsx` page in `mohamy-smart-admin-dashboard/src/pages/aiUsage/AiUsage.tsx`: (1) fetch summary on mount via `useEffect` + dispatch, (2) render 4 StatsCards (Total Cost USD, AI Cost, OCR Cost, Total Requests) reusing existing `StatsCards` component from Home.tsx pattern, (3) add date range inputs (from/to) that dispatch filter and refetch data, (4) show Spinner while loading, (5) handle empty state with "لا توجد بيانات" message
- [x] T025 [P] Create `AiUsage.css` in `mohamy-smart-admin-dashboard/src/pages/aiUsage/AiUsage.css` with RTL-compatible styles matching existing page patterns (Home.css, Subscriptions.css)
- [x] T026 Update `AppRouter.tsx` in `mohamy-smart-admin-dashboard/src/router/AppRouter.tsx`: add `<Route path="/ai-usage" element={<AiUsage />} />` and `<Route path="/ai-usage/:id" element={<LawyerUsageDetail />} />` inside AdminRoute section
- [x] T027 Update `Sidebar.tsx` in `mohamy-smart-admin-dashboard/src/components/public/sidebar/Sidebar.tsx`: change the "تحليل الاداء" NavLink from `/documents` to `/ai-usage` and update label to "تكاليف الذكاء الاصطناعي"

**Checkpoint**: Admin can open `/ai-usage`, see cost summary cards, and filter by date. Data is sourced from real AI usage records.

---

## Phase 4: User Story 2 — Per-Model Cost Breakdown (Priority: P2)

**Goal**: Admin sees a chart/table showing cost and request count per AI model (Pro, Flash, Flash Lite)

**Independent Test**: Open `/ai-usage`, scroll to model breakdown section, verify each model shows correct request count and cost

### Backend for US2

- [x] T028 Implement `GetModelUsageAsync` in `mohamy-smart-backend/Lawyer.Application/Services/AiUsageReportService.cs`: query `AiUsageRecords` where Provider="Gemini", group by ModelIdentifier, compute RequestCount/TotalCostUsd/InputTokens/OutputTokens per model, map to display names, return `List<ModelUsageDto>`. Include all 3 models even if count is 0
- [x] T029 Add `GET /api/ai-usage/models` endpoint to `AiUsageController` in `mohamy-smart-backend/Lawyer/Controllers/AiUsageController.cs` accepting `DateTime? from, DateTime? to`, returning `Result<List<ModelUsageDto>>`

### Frontend for US2

- [x] T030 Add `fetchModelUsage` thunk to `mohamy-smart-admin-dashboard/src/redux/aiUsage/aiUsageSlice.ts` calling `GET /api/ai-usage/models`
- [x] T031 Add model breakdown section to `AiUsage.tsx` in `mohamy-smart-admin-dashboard/src/pages/aiUsage/AiUsage.tsx`: render a table or bar chart (using Recharts `BarChart`) below the stats cards showing each model's RequestCount and TotalCostUsd. Fetch on mount alongside summary. Apply same date filter

**Checkpoint**: Admin sees per-model cost breakdown alongside the summary cards.

---

## Phase 5: User Story 3 — Per-Lawyer Cost Table (Priority: P2)

**Goal**: Admin sees a paginated table of all lawyers with their AI cost, OCR cost, total cost, and request count

**Independent Test**: Open `/ai-usage`, scroll to lawyer table, verify each lawyer row shows correct cost breakdown, click a lawyer to open detail page

### Backend for US3

- [x] T032 Implement `GetLawyerUsageAsync` in `mohamy-smart-backend/Lawyer.Application/Services/AiUsageReportService.cs`: query `AiUsageRecords` grouped by LawyerId, join with Lawyer+ApplicationUser for names, compute TotalCostUsd/AiCostUsd/OcrCostUsd/TotalRequests/AiRequests/OcrRequests per lawyer, return paginated `PagedResponse<LawyerUsageDto>` ordered by TotalCostUsd descending
- [x] T033 Add `GET /api/ai-usage/lawyers` endpoint to `AiUsageController` in `mohamy-smart-backend/Lawyer/Controllers/AiUsageController.cs` accepting `int pageNumber=1, int pageSize=20, DateTime? from, DateTime? to`, returning `Result<PagedResponse<LawyerUsageDto>>`

### Frontend for US3

- [x] T034 Add `fetchLawyerUsage` thunk to `mohamy-smart-admin-dashboard/src/redux/aiUsage/aiUsageSlice.ts` calling `GET /api/ai-usage/lawyers` with pagination params
- [x] T035 Add lawyer table section to `AiUsage.tsx` in `mohamy-smart-admin-dashboard/src/pages/aiUsage/AiUsage.tsx`: render `CustomTable` below model breakdown with columns: LawyerName (الاسم), AiCostUsd (تكلفة AI), OcrCostUsd (تكلفة OCR), TotalCostUsd (الإجمالي), TotalRequests (الطلبات). Add pagination. Make lawyer name clickable → navigate to `/ai-usage/:lawyerId`

**Checkpoint**: Admin sees per-lawyer cost table with pagination. Clicking a lawyer navigates to detail (US4).

---

## Phase 6: User Story 4 — Lawyer Usage Detail Page (Priority: P3)

**Goal**: Admin sees detailed analytics for a specific lawyer: daily cost trend chart, per-step breakdown table, per-model breakdown table

**Independent Test**: Click a lawyer in the table, verify detail page shows daily chart, step table, model table, and back button returns to main page

### Backend for US4

- [x] T036 Implement `GetLawyerUsageDetailAsync` in `mohamy-smart-backend/Lawyer.Application/Services/AiUsageReportService.cs`: query records for specific LawyerId with date filter, compute summary (reuse LawyerUsageDto fields), group by AiStepType for PerStep list, group by ModelIdentifier for PerModel list, group by Date for DailyCosts list. Return `LawyerUsageDetailDto`
- [x] T037 Add `GET /api/ai-usage/lawyers/{lawyerId}` endpoint to `AiUsageController` in `mohamy-smart-backend/Lawyer/Controllers/AiUsageController.cs` accepting `Guid lawyerId` + `DateTime? from, DateTime? to`, returning `Result<LawyerUsageDetailDto>`. Return 404 if lawyer not found

### Frontend for US4

- [x] T038 Add `fetchLawyerUsageDetail` thunk to `mohamy-smart-admin-dashboard/src/redux/aiUsage/aiUsageSlice.ts` calling `GET /api/ai-usage/lawyers/:id`
- [x] T039 Create `LawyerUsageDetail.tsx` in `mohamy-smart-admin-dashboard/src/pages/aiUsage/LawyerUsageDetail.tsx`: (1) extract lawyerId from URL params, (2) fetch detail on mount, (3) render 4 summary cards (AiCost, OcrCost, Total, Requests), (4) render daily cost trend using Recharts `LineChart` with AiCost + OcrCost lines, (5) render per-step table using `CustomTable` with StepName/RequestCount/Cost columns, (6) render per-model table with Model/Requests/Tokens/Cost columns, (7) "رجوع" button navigates back to `/ai-usage` preserving date filter via URL search params, (8) show "لا توجد بيانات" if all values are zero

**Checkpoint**: Full feature complete — admin has end-to-end visibility into AI costs per model, per lawyer, with drill-down detail.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, validation, and final quality

- [x] T040 Handle empty data states across all pages: when no usage records exist (first deploy), all cards show $0 / 0 requests with a clear Arabic message "لا توجد بيانات استخدام بعد" — in `mohamy-smart-admin-dashboard/src/pages/aiUsage/AiUsage.tsx` and `LawyerUsageDetail.tsx`
- [x] T041 Validate Gemini API responses without `usageMetadata` are handled gracefully: verify `GeminiProvider` returns null usage, tracking service records $0 cost — in `mohamy-smart-backend/Lawyer.Application/Services/AI/GeminiProvider.cs`
- [ ] T042 Run quickstart validation per `specs/048-ai-usage-tracking/quickstart.md`: apply migration, make an AI call, verify record in DB, verify admin endpoint returns correct data, verify dashboard page renders

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — backend tracking must be recording data first
- **US2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1 (different API endpoint + different UI section)
- **US3 (Phase 5)**: Depends on Phase 2 — can run in parallel with US1/US2
- **US4 (Phase 6)**: Depends on US3 (needs lawyer table with clickable links)
- **Polish (Phase 7)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — MVP deliverable
- **US2 (P2)**: Depends on Foundational only — adds model section to same page
- **US3 (P2)**: Depends on Foundational only — adds lawyer table to same page
- **US4 (P3)**: Depends on US3 (clickable lawyer links) — adds detail page

### Within Each User Story

- Backend service implementation before controller endpoint
- Backend endpoint before frontend thunk
- Frontend thunk before page component
- Page component before router/sidebar updates

### Parallel Opportunities

**Phase 1**: T001, T002, T003 can partially overlap (T001 before T002)
**Phase 2**: T007+T008 (tracking service) independent from T009-T013 (caller updates). T014 (DTOs) independent from all. T009-T012 can run in parallel (different files). T011 instruments ALL workflows via base class.
**Phase 3**: T020, T021 parallel. T024, T025 parallel.
**Phase 4**: T028+T029 (backend) parallel with T030 (thunk)
**Phase 5**: T032+T033 (backend) parallel with T034 (thunk)
**US2 + US3**: Can run fully in parallel — different API endpoints + different UI sections

---

## Parallel Example: Phase 2

```
# Run these in parallel (different files):
Task T009: "Update SmartAnalysisService (5 AI calls)"
Task T010: "Update PreparingStatementOfClaimsService (6 AI calls)"
Task T012: "Update ClarifyFactsService (1 AI call)"
Task T014: "Create all DTOs in AiUsageReport/"

# Sequential (T005 before T006, T007 before T008):
Task T005 → T006: "IAIProvider interface change → GeminiProvider update"
Task T007 → T008: "IAiUsageTrackingService interface → AiUsageTrackingService implementation"

# Then T011 (WorkflowServiceBase) after T005+T006 (needs AIResponse type)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (entity + migration)
2. Complete Phase 2: Foundational (provider change + tracking instrumentation)
3. Complete Phase 3: US1 (summary endpoint + page)
4. **STOP and VALIDATE**: Make AI calls, verify records appear, verify admin page shows costs
5. Deploy/demo if ready — admin already has cost visibility

### Incremental Delivery

1. Setup + Foundational → Tracking infrastructure live
2. Add US1 → Cost summary page (MVP!)
3. Add US2 → Model cost breakdown chart
4. Add US3 → Per-lawyer cost table with pagination
5. Add US4 → Lawyer detail drill-down page
6. Polish → Edge cases validated

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Phase 2 is the heaviest (T009-T013 update ~13 AI call sites across 5 service files)
- T011 (WorkflowServiceBase) instruments ALL 5 workflow services in one task
- US2 and US3 can be developed fully in parallel
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
