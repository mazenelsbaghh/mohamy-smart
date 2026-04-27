# Research: Backend Unification (045)

## R-001: Service Migration Complexity Ordering

**Decision**: Migrate services in this order — easiest to hardest.

| Order | Service | Reason |
|-------|---------|--------|
| 1 | LegalWarningService | 3 steps, standalone, no legacy DB schema |
| 2 | ExecRequestService | 3 steps, standalone, minor custom prompt logic (ExecutiveTitleType) |
| 3 | AdminComplaintService | Already extends `WorkflowServiceBase` — verify + enforce consistency |
| 4 | AppealBriefService | Already extends `WorkflowServiceBase` — verify + enforce consistency |
| 5 | RulingAnalysisService | 4 steps, standalone, inline step output assignment (reflection) |
| 6 | SmartAnalysisService | 1573 LOC monolith, 4 steps + Chat + PDF export, mixed snake_case/camelCase, uses `IHttpContextAccessor` directly, stores to separate entity tables (FactAnalysis, Defense, FinalPrayer) |
| 7 | PreparingStatementOfClaimsService | 60KB monolith, 6 steps, stores to 9+ child entity tables, complex per-step prompt building, most custom logic |

**Rationale**: AdminComplaintService and AppealBriefService already extend `WorkflowServiceBase` — they just need audit/enforcement. LegalWarning and ExecRequest are the simplest standalone services to migrate first as proof-of-concept. SmartAnalysis and PrepStatements are deferred to last because they use a fundamentally different persistence pattern (separate entity tables rather than Step1Output–Step6Output JSON columns).

**Alternatives considered**: Alphabetical ordering — rejected because it would interleave simple and complex services, reducing confidence during migration.

---

## R-002: JSON Library Consolidation Strategy

**Decision**: Standardize on `System.Text.Json` with `JsonNamingPolicy.CamelCase` as the single naming policy.

**Current state**:
- `WorkflowServiceBase` already uses `System.Text.Json` (no policy = PascalCase serialization in output)
- `StepOutputSchemas` uses `JsonNamingPolicy.SnakeCaseLower` for _deserialization_ with `PropertyNameCaseInsensitive = true`
- `SmartAnalysisService` has both `CamelCaseOptions` and `SnakeCaseOptions`
- `AiJobWorker` uses `CamelCase`
- `Newtonsoft.Json` is used in: `CaseOcrService`, `GeminiProvider`, `OcrController`

**Migration approach**:
1. Define a canonical `JsonOptions` static class in `Lawyer.Application.Common` with two presets:
   - `JsonOptions.Deserialize`: `PropertyNameCaseInsensitive = true`, `AllowTrailingCommas = true` (for reading AI output — tolerant)
   - `JsonOptions.Serialize`: `PropertyNamingPolicy = CamelCase` (for writing/storage — canonical)
2. Update `StepOutputSchemas` to use the canonical deserialize options.
3. Migrate OCR and Gemini provider from Newtonsoft to System.Text.Json in a separate commit.
4. Remove `Newtonsoft.Json` package reference from `Lawyer.Application.csproj`.

**Rationale**: The Constitution (Principle VIII) mandates `System.Text.Json` with camelCase. `PropertyNameCaseInsensitive = true` handles legacy snake_case input without a separate policy.

---

## R-003: Schema Validation Failure Persistence

**Decision**: Create a new `ValidationFailureRecord` entity in `Lawyer.Core.Models` and a corresponding DB table.

**Schema**:
```csharp
public class ValidationFailureRecord : BaseEntity
{
    public string WorkflowType { get; set; }     // e.g. "AppealBrief"
    public int StepType { get; set; }             // AiStepType int value
    public DateTime OccurredAt { get; set; }
    public string ErrorSummary { get; set; }      // validation error detail
    public string? RawOutput { get; set; }        // truncated AI output (first 2000 chars)
    public Guid? CaseId { get; set; }
    public string? LawyerId { get; set; }
}
```

**Admin endpoint**: `GET /api/admin/validation-failures?page=1&pageSize=20&workflowType=AppealBrief`

**Rationale**: Storing in the DB enables the admin dashboard to track patterns (which AI provider fails most, which step type has most validation errors) without server SSH access. Raw output is truncated to prevent table bloat.

---

## R-004: Dual-Format Detection for In-Flight Jobs

**Decision**: Implement format detection in `StepOutputSchemas.Normalize()` as a pre-processing step.

**Detection heuristic**:
1. Parse JSON to a `JsonDocument`
2. Check if any root-level property name contains an underscore (`_`)
3. If yes → treat as snake_case → re-serialize with `PropertyNamingPolicy.CamelCase` before validation
4. If no → treat as camelCase → proceed to validation directly

**Rationale**: This is a lightweight, non-intrusive approach that handles the transitional period without requiring format metadata in the AI job payload. The detection is removed once all legacy jobs have completed (tracked by a boolean feature flag or a hardcoded date threshold).

---

## R-005: Legacy Workflow Compatibility (SmartAnalysis + PrepStatements)

**Decision**: These two services will NOT extend `WorkflowServiceBase<TWorkflow, TDto>` in Phase 1 because they persist to separate entity tables (FactAnalysis, Defense, FinalPrayer, LawSuitFacts, etc.) rather than using WorkflowBase's Step1Output–Step6Output pattern.

**Phase 1 approach**:
1. Inject `ICaseAccessValidator` and enforce it at every entry point (already partially done in SmartAnalysis).
2. Remove duplicate `CleanJsonResponse` / `BuildCaseContext` calls and use `AnalysisHelpers` directly.
3. Consolidate JSON serialization options to the canonical `JsonOptions` class.
4. Wrap schema validation via `StepOutputSchemas.Normalize()` calls.
5. These remain standalone services implementing their specific interfaces.

**Phase 2 (future)**: Full database schema migration to WorkflowBase pattern.

**Rationale**: Forcing a database schema migration for 9+ entity tables in the same phase as the architectural unification adds too much risk. The compatibility layer achieves security and utility consolidation without schema changes.

---

## R-006: Error Response Standardization

**Decision**: Standardize on `Result<T>.Error(HttpStatusCode, message)` as the canonical error pattern in `WorkflowServiceBase`. Remove usage of `_result.BadRequest<T>()`, `_result.Forbidden<T>()`, `_result.NotFound<T>()`, `_result.ServerError<T>()` from workflow services, keeping only the unified `Result<T>` pattern.

**Rollout**: During each service migration, replace `_result.*<T>(message)` calls with `Result<T>.Error(HttpStatusCode.*, message)`.

**Rationale**: `Result<T>.Error()` is a clean static factory method with no dependency injection required. The `ApiExceptionResponse` instance methods are a legacy convenience wrapper. Unifying on `Result<T>.Error()` eliminates the need for `_result` in the base class constructor.

**Note**: This is a gradual change — some existing callers in the base class already use `_result.*()`. We standardize during each service migration rather than a big-bang refactor.
