# Quickstart: AI Model Configuration

**Feature**: 021-ai-model-config
**Date**: 2026-04-09

## Backend Changes

### 1. Add Entity & Enum

- **New entity**: `Lawyer.Core/Models/AiStageModelConfig.cs`
- **Modified enum**: `Lawyer.Core/Enum/AiStepType.cs` — add `Chat = 30`
- **New enum**: `Lawyer.Core/Enum/AiModelType.cs`

### 2. Add EF Core Configuration

- **New**: `Lawyer.Infrastracture/Persistence/Configurations/AiStageModelConfigConfiguration.cs`
- **Modified**: `Lawyer.Infrastracture/Persistence/AppDbContext.cs` — add `DbSet<AiStageModelConfig>`
- **Migration**: `dotnet ef migrations add AddAiStageModelConfig`

### 3. Add Service Layer

- **New interface**: `Lawyer.Application/IServices/IAiModelConfigService.cs`
- **New service**: `Lawyer.Application/Services/AiModelConfigService.cs`
  - `GetAllConfigsAsync()` → returns all stage configs with display metadata
  - `UpdateConfigsAsync(updateDto, adminEmail)` → bulk update + cache invalidation
  - `GetAvailableModels()` → static list of 3 models
  - `GetAllStages()` → static list of 12 stages with categories
- **Modified**: `Lawyer.Application/Services/AI/AIProviderFactory.cs`
  - Add `GetModelForStepAsync(AiStepType)` method
  - Inject `IMemoryCache` and `IApplicationDbContext`

### 4. Add Controller

- **New**: `Lawyer/Controllers/AiModelConfigController.cs`
  - `GET /api/AiModelConfig` — `[Authorize(Roles = "Admin")]`
  - `PUT /api/AiModelConfig` — `[Authorize(Roles = "Admin")]`
  - `GET /api/AiModelConfig/models` — `[Authorize(Roles = "Admin")]`
  - `GET /api/AiModelConfig/stages` — `[Authorize(Roles = "Admin")]`

### 5. Modify AI Service Call Sites

- **Modified**: `Lawyer.Application/Services/SmartAnalysisService.cs`
  - 5 call sites: resolve model from factory, set on `AIRequestOptions`
- **Modified**: `Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`
  - 6 call sites: resolve model from factory, set on `AIRequestOptions`
- **Modified**: `Lawyer.Application/Services/CaseOcrService.cs`
  - 1 call site: resolve model from factory, set on `AIRequestOptions`

### 6. Register DI

- **Modified**: `Lawyer.Application/DependencyInjection.cs`
  - Add `services.AddScoped<IAiModelConfigService, AiModelConfigService>()`
  - Add `services.AddMemoryCache()` if not already registered

## Frontend Changes (Admin Dashboard)

### 7. Add Types

- **Modified**: `src/types/index.ts`
  - Add `AiStageModelConfig`, `AiModelOption`, `AiStageInfo`, `AiModelConfigState`

### 8. Add API Routes

- **Modified**: `src/APIs/routes.ts`
  - Add `AI_MODEL_CONFIG` route group

### 9. Add Redux State

- **New**: `src/redux/aiModelConfig/aiModelConfigSlice.ts`
- **New**: `src/redux/aiModelConfig/thunk/fetchAiModelConfig.ts`
- **New**: `src/redux/aiModelConfig/thunk/updateAiModelConfig.ts`

### 10. Add UI Component

- **New**: `src/pages/settings/AiModelSettings.tsx` — the AI Models tab content
- **Modified**: `src/pages/settings/Settings.tsx` — add third tab + render `AiModelSettings`

### 11. Add Validation

- **New**: `src/validations/aiModelConfigSchema.ts` — Zod schema for config updates

## Verification Steps

1. Run migration: `dotnet ef database update`
2. Verify seed data: all 12 stages default to `gemini-3-pro-preview`
3. Login as admin, navigate to Settings → AI Models tab
4. Change a model, save, reload — verify persistence
5. Login as lawyer, trigger an AI step — verify correct model used in backend logs
