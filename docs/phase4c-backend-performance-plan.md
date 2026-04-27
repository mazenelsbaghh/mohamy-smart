# Phase 4c — Backend Performance Plan

**التاريخ:** 2026-04-25
**المرجع:** PERFORMANCE_AUDIT.md — Phase 4c

## التحليل

### 1. `new HttpClient()` → `IHttpClientFactory`
✅ **خلاص اتعمل** — مفيش `new HttpClient()` في أي ملف cs في الـ backend.
كل الـ services (`GeminiProvider`, `CaseOcrService`, `PaymobService`) بالفعل بتستخدم `IHttpClientFactory`.

### 2. `GetCaseAnalysisSummaryAsync()` في SmartAnalysisService
الـ N+1 pattern في `GenerateFinalRequirementsAsync` (lines 764-790):
- Query 1: `Case` (line 765-767)
- Query 2: `FactAnalysis` (line 777-779)
- Query 3: `Defense` (line 785-787)
كل واحد query منفصل. هنعمل helper method `GetCaseWithAnalysisDataAsync()` يجمعهم.

### 3. `.AsNoTracking()` في AiJobService
الـ read methods في lines 34-47 و 49-63 مش بيستخدمو `.AsNoTracking()`.
`GetAllByCaseAsync` و `GetByCaseAndStepAsync` — read-only queries.

### 4. `IMemoryCache` على `AiModelConfigService`
الـ cache موجود في الـ constructor بالفعل وبيتستخدم في `UpdateConfigsAsync`!
بس `GetAllConfigsAsync` مش بتستخدم cache — بتروح الـ DB كل مرة.
هنضيف caching على `GetAllConfigsAsync`.

### 5. `.Select()` projection في `ClientService.GetByIdAsync`
`GetByIdAsync` (line 69-95) بيستخدم `.Include(Files).Include(Cases)` وبعدين بيعمل mapping.
هنستبدل بـ projection query.

## الخطوات
- [x] ~~1. استبدل `new HttpClient()`~~ — **خلاص اتعمل سابقاً**
- [x] 2. `GetCaseWithAnalysisDataAsync()` في SmartAnalysisService
- [x] 3. `.AsNoTracking()` في AiJobService read methods
- [x] 4. Cache `GetAllConfigsAsync` في AiModelConfigService
- [x] 5. Projection `.Select()` في `ClientService.GetByIdAsync`
