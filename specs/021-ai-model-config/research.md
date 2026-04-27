# Research: AI Model Configuration per Stage

**Feature**: 021-ai-model-config
**Date**: 2026-04-09

## Decision 1: Model Identifier Mapping

**Decision**: Use a static dictionary mapping display names to Gemini API model IDs, configurable via a new DB-backed settings entity.

**Rationale**: The three Gemini models (3.1 Pro, 3.1 Flash, 3.1 Flash Lite) map to specific API model identifiers (`gemini-3-pro-preview`, `gemini-3-flash-preview`, `gemini-3-flash-lite-preview`). A static mapping in the service layer is the simplest approach — the admin selects by display name, the system resolves to the correct API model ID. No dynamic model discovery needed since the list is fixed and small.

**Alternatives considered**:
- Dynamic model discovery via Gemini API's `models:list` endpoint — rejected: adds unnecessary complexity, the model list is known and fixed.
- Configuration-file-only mapping — rejected: the spec requires admin dashboard control, so DB persistence is needed.

## Decision 2: Per-Stage Model Resolution Strategy

**Decision**: Extend `AIProviderFactory` with a `GetModelForStep(AiStepType)` method that reads from a cached DB lookup. The factory returns the model ID string that gets passed via `AIRequestOptions.Model` to the provider's `SendChatCompletionAsync`. The existing `AIRequestOptions.Model` property (already nullable override) is the injection point.

**Rationale**: The `AIRequestOptions` record already has a `Model` property designed for overriding the default model. Each AI service method (in `SmartAnalysisService`, `PreparingStatementOfClaimsService`) already calls `_aiProviderFactory.GetProvider()` and passes `AIRequestOptions` presets (e.g., `ForAnalysis`, `ForDefenses`). We only need to resolve the per-step model from DB and set it on the options before the call. This requires minimal changes to existing service code.

**Alternatives considered**:
- New interface `IModelResolver` — rejected: unnecessary abstraction; the factory already manages provider resolution, model resolution is a natural extension.
- Passing model in each controller endpoint — rejected: leaks admin configuration concerns into the API layer; model selection should be transparent to API consumers.

## Decision 3: Persistence — New Entity vs. Key-Value Settings

**Decision**: Create a new `AiStageModelConfig` entity with `AiStepType` (enum) as key and `ModelIdentifier` (string) as value, stored in SQL Server via EF Core. Add a `DbSet<AiStageModelConfig>` to `AppDbContext`.

**Rationale**: The existing `EmailSettings` pattern uses a flat class bound from `appsettings.json` — that's file-based, not admin-editable. For admin-dashboard-controlled settings, a proper DB entity with CRUD API is needed. The entity is simple (two columns), maps directly to the spec's "AI Stage Model Configuration" entity, and integrates naturally with the existing EF Core / Clean Architecture stack.

**Alternatives considered**:
- JSON column in a generic `Settings` table — rejected: adds complexity for a simple key-value need; a dedicated entity is clearer and easier to validate.
- AppSettings cache with file fallback — rejected: doesn't support admin dashboard writes; contradicts spec requirement for persistence across restarts.

## Decision 4: How to Integrate with Existing AI Service Calls

**Decision**: Add a helper method to each AI service (`SmartAnalysisService`, `PreparingStatementOfClaimsService`, `CaseOcrService`) that resolves the model for the current step type. The method reads from `IAIProviderFactory.GetModelForStep(stepType)` and sets it on the `AIRequestOptions` before passing to the provider.

**Rationale**: Looking at the code, each AI call site in `SmartAnalysisService` uses hardcoded option presets:
```csharp
var aiProvider = _aiProviderFactory.GetProvider();
var aiResult = await aiProvider.SendChatCompletionAsync(
    systemPrompt, userPrompt, AIRequestOptions.ForAnalysis, ct);
```
We change this to:
```csharp
var aiProvider = _aiProviderFactory.GetProvider();
var options = AIRequestOptions.ForAnalysis with { Model = await _aiProviderFactory.GetModelForStepAsync(AiStepType.FactAnalysis) };
var aiResult = await aiProvider.SendChatCompletionAsync(systemPrompt, userPrompt, options, ct);
```
This is a minimal, surgical change at each call site.

**Alternatives considered**:
- Middleware/interceptor that auto-resolves model — rejected: over-engineered, hard to trace which step type maps to which call.
- Changing `AIRequestOptions` to carry step type — rejected: concerns mixing; options should be about request parameters, not about which config key to read.

## Decision 5: Caching Strategy

**Decision**: Use `IMemoryCache` with a 5-minute sliding expiration to cache the AI model configuration. Cache invalidates on admin save.

**Rationale**: Model config changes are rare (admin edits occasionally), but read on every AI request. DB round-trip per AI call is unnecessary overhead. A simple in-memory cache with a short TTL ensures eventual consistency without complexity. When the admin saves config, the API controller explicitly invalidates the cache.

**Alternatives considered**:
- No caching (always read DB) — rejected: adds unnecessary latency to every AI call.
- Distributed cache (Redis) — rejected: single-instance deployment; `IMemoryCache` is sufficient.

## Decision 6: Frontend Tab Structure

**Decision**: Add a third tab "نماذج الذكاء الاصطناعي" (AI Models) to the existing Settings page tab bar (alongside "الملف الشخصي" and "تغيير كلمة المرور"). Create a new `AiModelSettings` component within the settings page.

**Rationale**: The existing `Settings.tsx` uses a simple `activeTab` state with two tabs. Adding a third tab is straightforward and consistent with the existing pattern. The AI Models tab will contain grouped sections with dropdown selectors.

**Alternatives considered**:
- Separate settings page/route — rejected: the spec explicitly says "tab" alongside existing tabs; keeps admin settings consolidated.
- Modal dialog — rejected: 12 stages with dropdowns is too much for a modal; a full tab is more usable.

## Decision 7: Chat Step Type

**Decision**: Add a new `Chat = 30` member to the `AiStepType` enum for the AI Chat feature, enabling model configuration for chat interactions.

**Rationale**: The current `AiStepType` enum does not include a Chat entry. The spec requires model configuration for chat. Adding `Chat = 30` follows the existing numbering convention (Smart Analysis: 1-4, Lawsuit Prep: 10-15, OCR: 20, Chat: 30).

**Alternatives considered**:
- Reuse existing step type — rejected: chat is a distinct feature with potentially different model needs.
- String-based key instead of enum — rejected: loses type safety and compile-time checking.
