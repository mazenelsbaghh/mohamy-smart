# Research: Fix AI Stages Data Flow

**Feature Branch**: `042-fix-data-flow`
**Created**: 2026-04-11

## Research Question 1: Root cause of snake_case serialization override

### Decision
Remove all `[JsonPropertyName("snake_case")]` attributes from backend DTOs. Rely on `JsonSerializerOptions` naming policies instead.

### Rationale
`[JsonPropertyName]` **overrides** any `JsonNamingPolicy` set in `JsonSerializerOptions`. The backend's global serializer uses `CamelCase` policy, but explicit `[JsonPropertyName("snake_case")]` annotations force the output back to snake_case. The AI sends snake_case → the DTO's `[JsonPropertyName]` catches it for deserialization (which is correct), but then the same attribute also controls serialization → the `resultJson` stored in DB becomes snake_case. When the frontend reads it expecting camelCase, properties are `undefined`.

### Alternatives Considered
1. **Keep `[JsonPropertyName]` and add camelCase aliases** — Rejected because System.Text.Json doesn't support multiple `[JsonPropertyName]` per property.
2. **Custom JsonConverter per DTO** — Over-engineered. Removing the attribute and using `PropertyNameCaseInsensitive = true` with `SnakeCaseLower` policy achieves the same parsing behaviour with zero custom code.

---

## Research Question 2: Correct `JsonSerializerOptions` for AI response parsing

### Decision
Use `JsonNamingPolicy.SnakeCaseLower` + `PropertyNameCaseInsensitive = true` for **parsing** AI responses. The global CamelCase policy handles HTTP serialization separately.

### Rationale
- `SmartAnalysisService` already uses this pattern successfully (`SnakeCaseOptions`).
- `PreparingStatementOfClaimsService` incorrectly uses `CamelCaseOptions` for parsing AI responses that arrive in snake_case.
- `StepOutputSchemas._jsonOptions` uses CamelCase + `PropertyNameCaseInsensitive`, which **accidentally works** for parsing snake_case only because `PropertyNameCaseInsensitive` performs a culture-invariant comparison. However, after removing `[JsonPropertyName]`, we must switch to `SnakeCaseLower` for explicit correctness.

### Alternatives Considered
- Keeping `CamelCase` with `PropertyNameCaseInsensitive = true` — Works today but is fragile. If an AI response has both `legalTexts` and `legal_texts`, the order-dependent match is unpredictable. `SnakeCaseLower` gives a deterministic mapping.

---

## Research Question 3: Workflow output wrapping problem

### Decision
Add a `parseResult` function in each workflow step component's `useAnalysisStep` call that unwraps the `output` string.

### Rationale
Workflow-based steps (AppealBrief, AdminComplaint, LegalWarning, ExecRequest) return a **wrapper** object:
```json
{ "stepNumber": 1, "output": "{\"snake_case_key\":\"...\"}", "currentStep": 2, "status": 1 }
```
The `output` value is a stringified JSON. Without a `parseResult` handler, the hydrator receives the wrapper object, not the actual step data. The `getWorkflow` path (page refresh) sends data differently — directly parsed — causing a dual-format hydration mismatch.

### Alternatives Considered
1. **Fix at `useAnalysisStep` level globally** — Too risky, would affect SmartAnalysis and other non-workflow steps that don't have the wrapper.
2. **Fix at AiJobWorker level** — Would require backend changes to double-parse and re-serialize, adding complexity in the wrong layer.

---

## Research Question 4: `deepCamelize` doesn't handle snake_case

### Decision
Enhance `deepCamelize` in `parseJobResult.ts` to also convert `snake_case` keys to `camelCase`, in addition to the existing PascalCase conversion.

### Rationale
Current `toCamelKey` only lowercases the first character (`Key` → `key`). It does not transform `verdict_summary` → `verdictSummary`. Adding a `snakeToCamel` transform (`key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())`) and chaining it before `toCamelKey` solves both cases.

### Alternatives Considered
- Per-step manual normalizers (e.g., `result.verdictSummary ?? result.verdict_summary`) — This was the approach documented in `ai-stages-data-flow.md` for SmartAnalysis. It's verbose and error-prone. A utility-level fix in `deepCamelize` is far more maintainable, especially since removing `[JsonPropertyName]` from backend DTOs means the backend will now serialize in camelCase (via global policy), so snake_case keys will only appear in legacy DB records.

---

## Research Question 5: Impact on existing SmartAnalysis (already fixed)

### Decision
No regression risk. SmartAnalysis already removed `[JsonPropertyName]` and uses `SnakeCaseOptions`. Frontend normalizers are additive (they use `??` fallback chains).

### Rationale
The `stepHydrators` in `smartAnalysisSlice.ts` already handle both `camelCase` and `snake_case` via `??` fallback. After the backend fix, new data will arrive in camelCase (from the global serializer), and legacy DB records in snake_case will still be handled by the `??` chains.

### Affected Files Inventory

#### Backend (9 files to modify)
| File | Change |
|------|--------|
| `StepOutputDtos.cs` | Remove all `[JsonPropertyName]` from all records (Ruling1-4, SmartAnalysis, Lawsuit, AppealBrief, AdminComplaint, LegalWarning, ExecRequest) |
| `StepOutputSchemas.cs` | Change `_jsonOptions` policy from `CamelCase` → `SnakeCaseLower` |
| `PreparingStatementOfClaimsService.cs` | Change `CamelCaseOptions` → `SnakeCaseOptions` |
| `LawSuitCaseTypeDto.cs` | Remove `[JsonPropertyName]` |
| `LawSuitPartiesDto.cs` | Remove `[JsonPropertyName]` |
| `LawSuitSubjectsDto.cs` | Remove `[JsonPropertyName]` |
| `LawSuitFactsDto.cs` | Remove `[JsonPropertyName]` |
| `LawSuitLegalBasisDto.cs` | Remove `[JsonPropertyName]` |
| `LawSuitRequestsDto.cs` | Remove `[JsonPropertyName]` |

#### Frontend (20+ files to modify)
| File | Change |
|------|--------|
| `parseJobResult.ts` | Enhance `deepCamelize` to handle snake_case → camelCase |
| `preparingStatementOfClaimsUnifiedSlice.ts` | Add `stepHydrators` with normalization |
| 6× `AppealStep*.tsx` | Add `parseResult` for output unwrapping |
| 5× `ComplaintStep*.tsx` | Add `parseResult` for output unwrapping |
| 3× `WarningStep*.tsx` | Add `parseResult` for output unwrapping |
| 3× `ExecStep*.tsx` | Add `parseResult` for output unwrapping |
| 4× `RulingStep*.tsx` | Add `parseResult` for output unwrapping + snake_case normalization |
