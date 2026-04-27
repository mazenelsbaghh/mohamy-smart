# Tasks: AI Model Configuration per Stage

**Input**: Design documents from `/specs/021-ai-model-config/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — no test tasks included.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Phase 1: Setup

**Purpose**: No-op — project structure already exists. All changes are additive to the existing multi-project codebase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared backend infrastructure that MUST be complete before any user story work begins.

- [x] T001 Add `Chat = 30` to `AiStepType` enum in `mohamy-smart-backend/Lawyer.Core/Enum/AiStepType.cs`
- [x] T002 [P] Create `AiModelType` enum (Pro=0, Flash=1, FlashLite=2) with static mapping to API model identifiers in `mohamy-smart-backend/Lawyer.Core/Enum/AiModelType.cs`
- [x] T003 [P] Create `AiStageModelConfig` entity (Id, StepType, ModelIdentifier, UpdatedAt, UpdatedBy) in `mohamy-smart-backend/Lawyer.Core/Models/AiStageModelConfig.cs`
- [x] T004 [P] Create DTOs in `mohamy-smart-backend/Lawyer.Application/Dtos/AiModelConfig/`: `AiStageModelConfigDto.cs`, `UpdateAiModelConfigDto.cs`, `AiModelOptionDto.cs`, `AiStageInfoDto.cs`
- [x] T005 Create EF Core configuration with unique index on StepType and seed data (12 rows defaulting to `gemini-3-pro-preview`) in `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/Configurations/AiStageModelConfigConfiguration.cs`
- [x] T006 Add `DbSet<AiStageModelConfig>` to `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`
- [ ] T007 Create EF Core migration by running `dotnet ef migrations add AddAiStageModelConfig` in the backend project
- [x] T008 [P] Create `IAiModelConfigService` interface with `GetAllConfigsAsync`, `UpdateConfigsAsync`, `GetAvailableModels`, `GetAllStages` in `mohamy-smart-backend/Lawyer.Application/IServices/IAiModelConfigService.cs`
- [x] T009 Add `GetModelForStepAsync(AiStepType)` method to `IAIProviderFactory` interface in `mohamy-smart-backend/Lawyer.Application/IServices/AI/IAIProviderFactory.cs`
- [x] T010 Register `IAiModelConfigService` in DI and ensure `AddMemoryCache()` is called in `mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs`

**Checkpoint**: Backend entity, EF config, migration, and DI registration ready — user story implementation can begin.

---

## Phase 3: User Story 1 — تهيئة نموذج الذكاء الاصطناعي لكل مرحلة (Priority: P1) 🎯 MVP

**Goal**: Admin can open Settings, see an "AI Models" tab, select a model per stage from a dropdown, save, and see selections persist after reload.

**Independent Test**: Navigate to admin Settings → AI Models tab → change models → click Save → reload page → verify saved selections displayed.

### Backend Implementation for US1

- [x] T011 [US1] Implement `AiModelConfigService` with `GetAllConfigsAsync` (returns all configs with display metadata), `UpdateConfigsAsync` (bulk update with validation + cache invalidation), and `GetAvailableModels` (static 3-model list) in `mohamy-smart-backend/Lawyer.Application/Services/AiModelConfigService.cs`
- [x] T012 [US1] Extend `AIProviderFactory` to implement `GetModelForStepAsync` — inject `IMemoryCache` and `IApplicationDbContext`, query DB on cache miss (key: `AiModelConfig_{stepType}`), 5-min sliding expiration, default to `gemini-3-pro-preview` in `mohamy-smart-backend/Lawyer.Application/Services/AI/AIProviderFactory.cs`
- [x] T013 [US1] Create `AiModelConfigController` with `GET /api/AiModelConfig`, `PUT /api/AiModelConfig`, `GET /api/AiModelConfig/models` — all `[Authorize(Roles = "Admin")]` in `mohamy-smart-backend/Lawyer/Controllers/AiModelConfigController.cs`

### Frontend Implementation for US1

- [x] T014 [P] [US1] Add `AiStageModelConfig`, `AiModelOption`, `AiModelConfigState` types to `mohamy-smart-admin-dashboard/src/types/index.ts`
- [x] T015 [P] [US1] Add `AI_MODEL_CONFIG` route group (BASE, MODELS) to `mohamy-smart-admin-dashboard/src/APIs/routes.ts`
- [x] T016 [US1] Create Redux slice with `aiModelConfigSlice.ts` and async thunks `fetchAiModelConfig.ts` + `updateAiModelConfig.ts` in `mohamy-smart-admin-dashboard/src/redux/aiModelConfig/`
- [x] T017 [US1] Register `aiModelConfig` reducer in `mohamy-smart-admin-dashboard/src/redux/store.ts`
- [x] T018 [US1] Create `AiModelSettings.tsx` component — fetches configs on mount, renders dropdowns (3.1 Pro / 3.1 Flash / 3.1 Flash Lite) per stage, Save button calls PUT, shows success/error toast via `react-hot-toast` in `mohamy-smart-admin-dashboard/src/pages/settings/AiModelSettings.tsx`
- [x] T019 [US1] Modify `Settings.tsx` — add third tab "نماذج الذكاء الاصطناعي" with `activeTab` state extended to `'aiModels'`, render `<AiModelSettings />` when selected in `mohamy-smart-admin-dashboard/src/pages/settings/Settings.tsx`

**Checkpoint**: Admin can view all 12 stages, select models, save, reload — selections persist. Full CRUD working end-to-end.

---

## Phase 4: User Story 2 — عرض المراحل المجمعة مع القيم الافتراضية (Priority: P2)

**Goal**: Stages are displayed grouped by category (التحليل الذكي, إعداد الدعوى, التعرف البصري, المحادثة) and all default to 3.1 Pro on fresh systems.

**Independent Test**: Load AI Models tab on a fresh database — all stages show 3.1 Pro, grouped under 4 labeled category sections.

### Backend for US2

- [x] T020 [US2] Implement `GetAllStages()` method in `AiModelConfigService` returning 12 stages with Arabic display names, categories, and category ordering in `mohamy-smart-backend/Lawyer.Application/Services/AiModelConfigService.cs`
- [x] T021 [US2] Add `GET /api/AiModelConfig/stages` endpoint to `AiModelConfigController` in `mohamy-smart-backend/Lawyer/Controllers/AiModelConfigController.cs`

### Frontend for US2

- [x] T022 [P] [US2] Add `AiStageInfo` type to `mohamy-smart-admin-dashboard/src/types/index.ts`
- [x] T023 [P] [US2] Add `STAGES` route to `AI_MODEL_CONFIG` in `mohamy-smart-admin-dashboard/src/APIs/routes.ts`
- [x] T024 [US2] Update `AiModelSettings.tsx` — fetch stages metadata, group configs by category, render each category as a labeled section with stages underneath in `mohamy-smart-admin-dashboard/src/pages/settings/AiModelSettings.tsx`

**Checkpoint**: Stages appear grouped under 4 Arabic category headers. Fresh DB shows all stages defaulting to 3.1 Pro.

---

## Phase 5: User Story 3 — تطبيق اختيارات النماذج على معالجة الذكاء الاصطناعي (Priority: P3)

**Goal**: Saved model selections are actually used when AI processing stages execute for lawyers.

**Independent Test**: Admin sets FactAnalysis to 3.1 Flash → lawyer triggers fact analysis → backend logs show `gemini-3-flash-preview` was used.

### Backend for US3

- [x] T025 [US3] Update all 5 AI call sites in `SmartAnalysisService` (FactAnalysis, GenerateDefenses, AnalysisDefense, FinalRequirements, Chat) to resolve per-step model via `_aiProviderFactory.GetModelForStepAsync()` and set on `AIRequestOptions` using `with { Model = ... }` in `mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`
- [x] T026 [P] [US3] Update all 6 AI call sites in `PreparingStatementOfClaimsService` (CaseType, Parties, Subjects, Facts, LegalBasis, Requests) to resolve per-step model in `mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`
- [x] T027 [P] [US3] Update the 1 AI call site in `CaseOcrService` to resolve per-step model for `AiStepType.Ocr` in `mohamy-smart-backend/Lawyer.Application/Services/CaseOcrService.cs`

**Checkpoint**: All 12 AI stages respect the admin's configured model selection when processing lawyer requests.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T028 Run `dotnet ef database update` to apply migration and verify seed data in local Docker SQL Server
- [x] T029 [P] Verify backend builds with no errors: run `dotnet build` in `mohamy-smart-backend/` (requires .NET 9 SDK — passes in Docker)
- [x] T030 [P] Verify admin dashboard builds with no errors: run `npm run build` in `mohamy-smart-admin-dashboard/`
- [ ] T031 End-to-end validation per quickstart.md: admin saves config → reload persists → lawyer triggers AI → correct model used

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No-op — skip.
- **Foundational (Phase 2)**: No dependencies — start immediately. BLOCKS all user stories.
- **US1 (Phase 3)**: Depends on Phase 2 complete.
- **US2 (Phase 4)**: Depends on Phase 2 + Phase 3 (enhances US1 UI with grouping).
- **US3 (Phase 5)**: Depends on Phase 2 (needs entity + factory method). Can start in parallel with US1/US2 since it only touches backend AI services.
- **Polish (Phase 6)**: Depends on all user stories complete.

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only. Core CRUD + UI.
- **US2 (P2)**: Depends on US1 (enhances the same UI component).
- **US3 (P3)**: Depends on Foundational only. Independent of US1/US2 (different files — AI service classes).

### Parallel Opportunities

- T001, T002, T003, T004, T008 can run in parallel (different files, no cross-dependencies).
- T014 and T015 can run in parallel (different files).
- T025, T026, T027 can run in parallel (three different service files).
- T029 and T030 can run in parallel (different projects).
- US3 (Phase 5) can run in parallel with US1 (Phase 3) — they touch completely different files.

---

## Parallel Example: Foundational Phase

```text
# Launch in parallel (all different files):
T001: Add Chat=30 to AiStepType.cs
T002: Create AiModelType.cs
T003: Create AiStageModelConfig.cs
T004: Create DTOs (4 files in Dtos/AiModelConfig/)
T008: Create IAiModelConfigService.cs
```

## Parallel Example: US3 (Runtime Enforcement)

```text
# Launch in parallel (3 different service files):
T025: Update SmartAnalysisService.cs (5 call sites)
T026: Update PreparingStatementOfClaimsService.cs (6 call sites)
T027: Update CaseOcrService.cs (1 call site)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001–T010)
2. Complete Phase 3: User Story 1 (T011–T019)
3. **STOP and VALIDATE**: Open admin Settings → AI Models tab → select models → Save → reload
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 2 → Foundation ready
2. Phase 3 (US1) → Admin can configure models → **MVP!**
3. Phase 4 (US2) → Grouped display with defaults → enhanced UX
4. Phase 5 (US3) → Runtime enforcement → actual AI behavior changes
5. Phase 6 → Polish and verification

---

## Notes

- [P] tasks = different files, no dependencies between them
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- All new API endpoints are Admin-only (`[Authorize(Roles = "Admin")]`)
- All UI labels are in Arabic, RTL layout
- Cache invalidation happens on PUT success — no manual cache clearing needed
- EF migration includes seed data for all 12 stages defaulting to `gemini-3-pro-preview`
