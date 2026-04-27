# Research: AI Usage & Cost Tracking

**Branch**: `048-ai-usage-tracking` | **Date**: 2026-04-16 | **Phase**: 0

---

## R1: How to Capture Token Usage from Gemini API Response

**Decision**: Parse `usageMetadata` from the JSON response body in `GeminiProvider.SendChatCompletionAsync`, then propagate it through the return type.

**Rationale**: The Gemini API response includes a `usageMetadata` object at the root level:
```json
{
  "candidates": [...],
  "usageMetadata": {
    "promptTokenCount": 1234,
    "candidatesTokenCount": 567,
    "totalTokenCount": 1801
  }
}
```
This is already parsed by `JsonDocument` in `GeminiProvider.cs` (line 106: `using var doc = JsonDocument.Parse(responseContent)`). Currently only `candidates[0].content.parts[0].text` is extracted (lines 107-112). The `usageMetadata` is simply ignored.

**Alternatives considered**:
- **HTTP response headers**: Gemini REST API does not return usage in headers — only in the JSON body.
- **Separate API call for usage**: No such endpoint exists.
- **Estimate tokens client-side**: Inaccurate due to multimodal content and tokenization differences.

**Implementation approach**:
1. Add `AIUsageMetadata` record (InputTokens, OutputTokens, TotalTokens) and `AIResponse` record (Content, Usage) to `IAIProvider.cs`
2. Change `SendChatCompletionAsync` return type from `Result<string>` to `Result<AIResponse>`
3. In `GeminiProvider`, after parsing text content, also parse `usageMetadata`:
   ```csharp
   if (doc.RootElement.TryGetProperty("usageMetadata", out var usageMeta))
   {
       usage = new AIUsageMetadata(
           usageMeta.GetProperty("promptTokenCount").GetInt32(),
           usageMeta.TryGetProperty("candidatesTokenCount", out var ct) ? ct.GetInt32() : 0,
           usageMeta.GetProperty("totalTokenCount").GetInt32()
       );
   }
   ```
4. All callers unwrap `.Content` from the `AIResponse` — this is the bulk of the code changes (~13 call sites)

---

## R2: LawyerId Availability Across All AI-Calling Services

**Decision**: Use the LawyerId already available in each service method (from parameters or HttpContext) and pass it to the tracking service alongside the AI call result.

**Research findings**: LawyerId availability varies by caller:

| Caller | LawyerId Source | Available Before AI Call? |
|--------|----------------|--------------------------|
| SmartAnalysisService (4 methods) | `UserContextHelper.GetUserId(_httpContextAccessor)` | Yes — used for `_caseAccessValidator` |
| SmartAnalysisService.ChatAsync | Explicit `Guid lawyerId` parameter | Yes |
| PreparingStatementOfClaimsService (6 methods) | `UserContextHelper.GetUserId(_httpContextAccessor)` | Yes — used for `_caseAccessValidator` |
| ClarifyFactsService | Explicit `string lawyerId` parameter | Yes |
| WorkflowServiceBase.RunStepBaseAsync | Explicit `string lawyerId` parameter | Yes |
| CaseOcrService.GenerateCaseFromTextAsync | **Not available** | No — pure text conversion |
| CaseOcrService.ExtractTextFromImagesAsync | Not available (OCR only) | No |

**For OCR tracking**: The OCR flow goes through `OcrController` which has `[Authorize]`. The lawyer can be resolved from the controller's `HttpContext` and passed down. For the `AiJobWorker` OCR path, `GetLawyerIdForCaseAsync(caseId)` already resolves the LawyerId.

**Implementation approach**: Each service method already has access to LawyerId (via `UserContextHelper`, method parameter, or case lookup). After the AI call succeeds, pass `{lawyerId, caseId, stepType, model, usageMetadata}` to `IAiUsageTrackingService.RecordAsync()`.

---

## R3: Asynchronous Usage Recording Pattern

**Decision**: Use `Task.Run` fire-and-forget with error logging for usage recording. No need for Hangfire or message queues — the write is lightweight and non-critical.

**Rationale**: 
- Usage recording is a simple INSERT into a single table with no external dependencies.
- If the insert fails, the AI response has already been returned to the user — no user-facing impact.
- The data is analytics, not transactional — occasional dropped records are acceptable.
- Using Hangfire would add unnecessary complexity for a simple INSERT.

**Alternatives considered**:
- **Hangfire background job**: Overkill for a single INSERT. Adds queue overhead and database backing-store contention.
- **In-memory queue + background processor**: More complex, risks data loss on process crash.
- **Synchronous write**: Blocks the AI response pipeline — violates SC-002 (< 100ms overhead).

**Implementation approach**:
```csharp
public async Task RecordAsync(AiUsageRecord record, CancellationToken ct)
{
    _ = Task.Run(async () =>
    {
        try
        {
            _unitOfWork.Repository<AiUsageRecord>().Add(record);
            await _unitOfWork.SaveChangesAsync(default);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record AI usage for lawyer {LawyerId}", record.LawyerId);
        }
    }, ct);
}
```

---

## R4: Gemini Pricing Model (Actual Rates — April 2026)

**Decision**: Hardcode pricing per model as constants, overridable via `appsettings.json`.

**Pricing (per 1M tokens, USD)**:

| Model Identifier | Input Price | Output Price (incl. thinking) |
|-----------------|-------------|------------------------------|
| `gemini-3.1-pro-preview` | $2.00 | $12.00 |
| `gemini-3-flash-preview` | $0.50 | $3.00 |
| `gemini-3.1-flash-lite-preview` | $0.25 | $1.50 |

**Additional costs**:
- **Google Search Grounding**: 5,000 prompts/month free (shared across Gemini 3), then $14 / 1,000 search queries. The system uses `tools: [{ googleSearch: {} }]` on every request.
- **Google Vision OCR**: $1.50 per 1,000 images.

**Rationale**: The Pro model is 24x more expensive than Flash Lite per output token ($12 vs $0.50). This makes tracking essential for cost optimization decisions.

**Implementation approach**: Static `AiCostCalculator` class with pricing dictionary. Cost = `(inputTokens * inputPrice/1M) + (outputTokens * outputPrice/1M)`. For OCR, flat rate per call.

---

## R5: How to Track OCR Costs Separately from AI Costs

**Decision**: Use the `Provider` field on `AiUsageRecord` to distinguish "Gemini" calls from "GoogleVision" calls.

**Rationale**: OCR has two cost components:
1. **Google Vision API** for text extraction — fixed cost per image ($1.50/1000)
2. **Gemini AI call** for case generation from text — token-based cost

Both should be recorded as separate `AiUsageRecord` entries:
- OCR image processing: `Provider = "GoogleVision"`, `StepType = Ocr`, tokens = 0, cost = flat rate
- AI case generation: `Provider = "Gemini"`, `StepType = Ocr`, tokens from response, cost calculated

This allows the admin to see OCR image costs and AI text processing costs separately in reports.

---

## R6: Admin Report Query Patterns

**Decision**: Use EF Core LINQ with `GroupBy` for aggregation. Add indexes on `LawyerId`, `CreatedAt`, `StepType`, and `Provider` for query performance.

**Key queries needed**:
1. **Summary**: `SUM(EstimatedCostUsd)`, `COUNT(*)` grouped by `Provider` (Gemini vs GoogleVision)
2. **Per-lawyer**: `GroupBy(LawyerId)` with `SUM` and `COUNT`
3. **Per-model**: `GroupBy(ModelIdentifier)` with `SUM` and `COUNT`
4. **Per-step**: `GroupBy(StepType)` with `SUM` and `COUNT`
5. **Daily trend**: `GroupBy(Date)` for line chart data

All queries accept optional `DateTime? from` and `DateTime? to` filters on `CreatedAt`.

**Rationale**: With ~50 lawyers and moderate usage, the record count will stay manageable (estimated < 100K rows/month). EF Core GroupBy with proper indexes will be performant (< 2s for admin reports).

---

## R7: Frontend Integration Pattern

**Decision**: Follow existing admin dashboard patterns (Redux slice + Axios thunks + HeroUI components).

**Rationale**: The admin dashboard already uses:
- `StatsCards` component for the home page (reuse for 4 cost cards)
- `CustomTable` component for lawyer lists (reuse for lawyer usage table)
- `Recharts` for charts (already in `package.json` — used by `LineChartHome`, `PieChartHome`)
- Redux Toolkit with `createAsyncThunk` for all API calls
- `AdminRoute` guard for all authenticated pages

The new AI Usage page will follow the exact same patterns established in `Home.tsx`, `SubscriptionReports.tsx`, and `AiModelSettings.tsx`.

**Navigation**: The sidebar already has a "تحليل الاداء" (Performance Analysis) link pointing to `/documents`. This will be repurposed/updated to point to `/ai-usage` with the label "تكاليف الذكاء الاصطناعي".
