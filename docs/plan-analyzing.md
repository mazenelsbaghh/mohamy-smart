# خطة التنفيذ — حل مشاكل مراحل التحليل

**التاريخ:** 2026-04-11  
**المرجع:** `problem-analyzing.md`  
**⚠️ القاعدة الأساسية:** لا يتم تعديل أو إعادة صياغة أي prompt موجود في أي مرحلة

---

## جدول المحتويات

1. [نظرة عامة](#1-نظرة-عامة)
2. [Phase 1: Shared Backend Utilities](#2-phase-1-shared-backend-utilities)
3. [Phase 2: Generic Workflow Infrastructure](#3-phase-2-generic-workflow-infrastructure)
4. [Phase 3: Unified Parsing & Schema Validation](#4-phase-3-unified-parsing--schema-validation)
5. [Phase 4: Frontend Shared Components & Hooks](#5-phase-4-frontend-shared-components--hooks)
6. [Phase 5: Frontend Redux Unification](#6-phase-5-frontend-redux-unification)
7. [Phase 6: Appeal Brief Frontend Implementation](#7-phase-6-appeal-brief-frontend-implementation)
8. [Phase 7: Consistency & Naming Fixes](#8-phase-7-consistency--naming-fixes)
9. [Phase 8: Documentation & Developer Experience](#9-phase-8-documentation--developer-experience)
10. [الخريطة الزمنية](#10-الخريطة-الزمنية)
11. [مؤشرات النجاح](#11-مؤشرات-النجاح)

---

## 1. نظرة عامة

### الهدف
الوصول إلى نظام منظم، مترابط، قابل للتوسع، بدون تضارب بين المراحل، بحيث إضافة pipeline جديد تتطلب أقل عدد ممكن من الملفات الجديدة.

### المبادئ التوجيهية
1. **لا تعديل أي prompt** — جميع التعديلات هي code-level فقط
2. **التوحيد التدريجي** — لا نعيد كتابة كل شيء مرة واحدة
3. **الـ source of truth** — مذكرة الدفاع كمرجع، وباقي المراحل تتوافق معها
4. **الحد الأدنى من التغييرات الكاسرة** — كل phase يجب أن تكون backward-compatible

### مشاكل الـ Prompts — تحليل فقط

> **ملاحظة مهمة:** مشاكل الـ prompts (PROMPT-01 إلى PROMPT-05) تم تحليلها في `problem-analyzing.md` ولن يتم تعديل أي محتوى prompt. التعديلات المذكورة أدناه تتعلق فقط بـ **طريقة تحميل واستخدام** الـ prompts (infrastructure)، وليس محتواها.

---

## 2. Phase 1: Shared Backend Utilities

**الأولوية:** 🔴 حرية  
**المدة المتوقعة:** 2-3 أيام  
**المشاكل المعالجة:** DUP-01, DUP-02, DUP-09

### 2.1 الهدف
استخراج الـ utility methods المكررة في مكان واحد.

### 2.2 التعديلات المطلوبة

#### 2.2.1 إنشاء `AnalysisHelpers.cs`

**المكان:** `Lawyer.Application/Common/AnalysisHelpers.cs`

```csharp
public static class AnalysisHelpers
{
    // DUP-01: CleanJsonResponse موحد
    public static string CleanJsonResponse(string jsonText)
    {
        if (string.IsNullOrWhiteSpace(jsonText)) return string.Empty;
        jsonText = jsonText.Trim();
        if (jsonText.StartsWith("```json")) jsonText = jsonText.Substring(7);
        else if (jsonText.StartsWith("```")) jsonText = jsonText.Substring(3);
        if (jsonText.EndsWith("```")) jsonText = jsonText.Substring(0, jsonText.Length - 3);
        return jsonText.Trim();
    }

    // DUP-02: BuildCaseContext موحد
    public static string BuildCaseContext(Case c)
    {
        var sb = new StringBuilder();
        if (!string.IsNullOrWhiteSpace(c.ClientName))
            sb.AppendLine($"اسم الموكل: {c.ClientName}");
        if (!string.IsNullOrWhiteSpace(c.ApponentName))
            sb.AppendLine($"اسم الخصم: {c.ApponentName}");
        if (!string.IsNullOrWhiteSpace(c.Number))
            sb.AppendLine($"رقم القضية: {c.Number}");
        if (!string.IsNullOrWhiteSpace(c.Court))
            sb.AppendLine($"المحكمة: {c.Court}");
        if (!string.IsNullOrWhiteSpace(c.Title))
            sb.AppendLine($"عنوان القضية: {c.Title}");
        if (!string.IsNullOrWhiteSpace(c.Description))
            sb.AppendLine($"وصف مختصر: {c.Description}");
        if (!string.IsNullOrWhiteSpace(c.Facts))
            sb.AppendLine($"وقائع القضية: {c.Facts}");
        if (!string.IsNullOrWhiteSpace(c.LegalClaims))
            sb.AppendLine($"الطلبات أو الغاية القانونية: {c.LegalClaims}");
        return sb.ToString().Trim();
    }

    // DUP-09: DeserializeOutput موحد
    public static object DeserializeOutput(string normalizedJson)
    {
        try
        {
            return JsonSerializer.Deserialize<object>(normalizedJson) ?? new();
        }
        catch
        {
            return new { rawText = normalizedJson };
        }
    }

    // TryExtractJsonPayload (من AdminComplaintService)
    public static string TryExtractJsonPayload(string text)
    {
        // ... نفس logic من AdminComplaintService
    }

    public static bool IsValidJson(string text)
    {
        // ... same as AdminComplaintService
    }
}
```

#### 2.2.2 تحديث كل الخدمات لاستخدام `AnalysisHelpers`

- `SmartAnalysisService.cs`: استبدال `CleanJsonResponse` المحلي بـ `AnalysisHelpers.CleanJsonResponse`
- `PreparingStatementOfClaimsService.cs`: نفس الشيء
- `RulingAnalysisService.cs`: استبدال `CleanJsonResponse` + `BuildCaseContext` + `DeserializeOutput`
- `AdminComplaintService.cs`: استبدال `CleanJsonResponse` + `BuildCaseContext` + `DeserializeOutput` + `TryExtractJsonPayload` + `IsValidJson`
- `LegalWarningService.cs`: استبدال `CleanJsonResponse` + `BuildCaseContext` + `DeserializeOutput`
- `ExecRequestService.cs`: استبدال `CleanJsonResponse` + `BuildCaseContext` + `DeserializeOutput`

### 2.3 النتيجة المتوقعة
- إزالة ~120 سطر من الكود المكرر
- unified behavior في clean/build/deserialize
- bug fix واحد ينتشر تلقائياً

---

## 3. Phase 2: Generic Workflow Infrastructure

**الأولوية:** 🔴 حرية  
**المدة المتوقعة:** 5-7 أيام  
**المشاكل المعالجة:** ARCH-02, DUP-05, DUP-06, DUP-10, SCALE-01 (partial), SCALE-02

### 3.1 الهدف
إنشاء generic workflow base يُقلل تكرار الـ services من 400+ سطر إلى ~50 سطر configuration.

### 3.2 التعديلات المطلوبة

#### 3.2.1 إنشاء `WorkflowBase` Model

**المكان:** `Lawyer.Core/Models/WorkflowBase.cs`

```csharp
public abstract class WorkflowBase
{
    public int Id { get; set; }
    public Guid CaseId { get; set; }
    public Case Case { get; set; } = null!;
    public string LawyerId { get; set; } = string.Empty;
    public int CurrentStep { get; set; } = 1;
    public WorkflowStatus Status { get; set; } = WorkflowStatus.InProgress;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public abstract int TotalSteps { get; }
    public abstract string? GetStepOutput(int stepNumber);
    public abstract void SetStepOutput(int stepNumber, string? json);
}
```

#### 3.2.2 إنشاء Generic `WorkflowService<TWorkflow, TDto>`

**المكان:** `Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs`

```csharp
public abstract class WorkflowServiceBase<TWorkflow, TDto>
    where TWorkflow : WorkflowBase, new()
    where TDto : class
{
    // StartWorkflowAsync — generic
    // GetWorkflowAsync — generic
    // GetWorkflowsByCaseAsync — generic
    // RunStepAsync — generic (abstract hook for step-specific logic)
    // SaveEditedStepAsync — generic
    // AbandonWorkflowAsync — generic
    // MapToDto — abstract

    protected abstract TWorkflow CreateNewWorkflow(Guid caseId, string lawyerId);
    protected abstract TDto MapToDto(TWorkflow workflow);
    protected abstract string GetPromptFolderName();
    protected abstract string GetStepFileName(int stepNumber);
    protected abstract AiStepType GetStepType(int stepNumber);
    protected abstract string GetStepLabel(int stepNumber);
    protected abstract string? GetPreviousStepOutput(TWorkflow workflow, int stepNumber);
    protected virtual string BuildStepSpecificUserPrompt(
        TWorkflow workflow, Case caseEntity, int stepNumber, string? input)
    {
        // default implementation using shared helpers
        var caseContext = AnalysisHelpers.BuildCaseContext(caseEntity);
        var previousSteps = BuildPreviousStepsContext(workflow, stepNumber);
        return $"{caseContext}\n\n{previousSteps}\n\nمدخلات إضافية: {(string.IsNullOrWhiteSpace(input) ? "لا يوجد" : input)}";
    }
}
```

#### 3.2.3 تحويل كل Workflow Service لـ inherit من الـ Base

كل service تصبح:

```csharp
public class RulingAnalysisService 
    : WorkflowServiceBase<RulingAnalysisWorkflow, RulingAnalysisWorkflowDto>,
      IRulingAnalysisService
{
    // فقط configuration + step-specific hooks
    protected override int TotalSteps => 4;
    protected override string GetPromptFolderName() => "المرحلة الخامسة تحليل حكم قضائي صادر";
    protected override string GetStepFileName(int step) => step switch { 1 => "ruling-step1-operative.txt", ... };
    protected override AiStepType GetStepType(int step) => step switch { 1 => AiStepType.RulingAnalysisOperative, ... };
    // etc.
}
```

#### 3.2.4 تحديث AiJobWorker

**المشكلة:** DUP-10 — ResolveLatestWorkflow مكرر 5 مرات

**الحل:** Generic method:

```csharp
private async Task<WorkflowInvocationContext> ResolveLatestWorkflowAsync<TWorkflow>(
    DbSet<TWorkflow> dbSet, Guid caseId, CancellationToken ct)
    where TWorkflow : WorkflowBase, new()
{
    var workflow = await dbSet
        .Where(w => w.CaseId == caseId)
        .OrderByDescending(w => w.CreatedAt)
        .FirstOrDefaultAsync(ct);

    if (workflow == null)
    {
        var lawyerId = await GetLawyerIdForCaseAsync(caseId, ct);
        workflow = new TWorkflow { CaseId = caseId, LawyerId = lawyerId };
        dbSet.Add(workflow);
        await _db.SaveChangesAsync(ct);
    }

    return new WorkflowInvocationContext(workflow.Id, workflow.LawyerId);
}
```

### 3.3 النتيجة المتوقعة
- كل pipeline service ينخفض من ~400 سطر إلى ~80-100 سطر
- إضافة pipeline جديد: فقط configuration class
-统一的 error handling و lifecycle management
- bug fix واحد يصلح كل pipelines

---

## 4. Phase 3: Unified Parsing & Schema Validation

**الأولوية:** 🔴 حريرة  
**المدة المتوقعة:** 3-4 أيام  
**المشاكل المعالجة:** PARSE-01, PARSE-02, PARSE-03, PARSE-04, MAP-01, MAP-03

### 4.1 الهدف
توحيد مكتبة JSON، إضافة schema validation لكل step output.

### 4.2 التعديلات المطلوبة

#### 4.2.1 توحيد استخدام `System.Text.Json`

- إزالة جميع `Newtonsoft.Json` references من services التحليلية
- تحديث الـ SnakeCase deserialization لاستخدام `System.Text.Json` مع `JsonNamingPolicy.SnakeCaseLower`
- تحديث DTOs لإضافة `[JsonPropertyName]` attributes حيث لزم

> **ملاحظة:** هذا قد يتطلب تحديث Frontend ليتوافق مع الـ naming الجديد. يجب مراجعة الـ DTOs field by field.

#### 4.2.2 إنشاء Step Output Schema Definitions

**المكان:** `Lawyer.Application/Services/Workflows/StepOutputSchema.cs`

```csharp
public static class StepOutputSchemas
{
    // كل pipeline/step له schema definition
    // يُستخدم لـ validate AI output قبل التخزين
    
    public static bool Validate(string pipelineType, int stepNumber, string json)
    {
        // JSON schema validation
        // Returns true/false
    }
    
    public static string Normalize(string pipelineType, int stepNumber, string rawAiOutput)
    {
        // Clean + Extract + Validate + Fallback
        // Returns guaranteed-valid JSON
    }
}
```

#### 4.2.3 Typed Step Output DTOs

بدلاً من `string? Step1Output`:

```csharp
// RulingAnalysis specific DTOs
public class RulingStep1Output { /* verdict fields */ }
public class RulingStep2Output { /* reasoning fields */ }
// etc.
```

> **ملاحظة:** الـ Workflow model يظل يخزن raw JSON (لسهولة المرونة)، لكن الـ parsing يتم في الـ service layer مع validation.

#### 4.2.4 Input Schema Standardization

**MAP-01:** توحيد الـ input mapping:

```csharp
public record RunWorkflowStepRequest
{
    public string? Input { get; init; }
    // standard fields
}
```

كل service تستقبل نفس نوع الـ input وتتعامل معه بنفس الطريقة.

### 4.3 النتيجة المتوقعة
- Parsing behavior متطابق عبر كل pipelines
- AI output خاطئ يتم اكتشافه مبكراً
- Frontend يضمن شكل البيانات

---

## 5. Phase 4: Frontend Shared Components & Hooks

**الأولوية:** 🟠 عالي  
**المدة المتوقعة:** 3-4 أيام  
**المشاكل المعالجة:** REUSE-03, DUP-08, CONSIST-03

### 5.1 الهدف
إنشاء generic step component hook يُقلل boilerplate في كل step.

### 5.2 التعديلات المطلوبة

#### 5.2.1 إنشاء `useAnalysisStep` Hook

**المكان:** `src/hooks/useAnalysisStep.ts`

```typescript
type UseAnalysisStepOptions = {
    caseId: string;
    workflowId: number | null;
    stepNumber: number;
    stepType: AiStepType;
    autoSubmit?: boolean;
    parseResult?: (json: string) => unknown;
    onHydrate?: (parsed: unknown) => void;
};

type UseAnalysisStepReturn = {
    isLoading: boolean;
    isSubmitting: boolean;
    hasFailed: boolean;
    errorMessage: string | null;
    result: unknown;
    submit: (input?: string) => void;
    retry: () => void;
};

function useAnalysisStep(options: UseAnalysisStepOptions): UseAnalysisStepReturn;
```

هذا الـ hook يوحد:
- AI Job submission
- SignalR status monitoring
- Auto-submission logic
- Result parsing and hydration
- Error handling
- Retry logic

#### 5.2.2 إنشاء `AnalysisStepShell` Component

**المكان:** `src/components/analysisWorkflow/AnalysisStepShell.tsx`

```tsx
type AnalysisStepShellProps = {
    isLoading: boolean;
    hasFailed: boolean;
    errorMessage?: string;
    onRetry?: () => void;
    children: React.ReactNode;
};

// Provides: loading skeleton → error state → content
// Replaces the repeated loading/error pattern in every step component
```

#### 5.2.3 تحديث كل Step Components

كل step component يصبح:

```tsx
const RulingStep1 = () => {
    const { caseId } = useParams();
    const { workflowId } = useAppSelector(state => state.rulingAnalysis);
    
    const { isLoading, hasFailed, errorMessage, result, submit, retry } = useAnalysisStep({
        caseId,
        workflowId,
        stepNumber: 1,
        stepType: 'RulingAnalysisOperative',
        autoSubmit: true,
        parseResult: (json) => JSON.parse(json),
        onHydrate: (parsed) => dispatch(hydrateVerdictAnalysis(parsed)),
    });

    return (
        <AnalysisStepShell isLoading={isLoading} hasFailed={hasFailed} errorMessage={errorMessage} onRetry={retry}>
            <AnalysisStageLayout title="..." sidebar={...}>
                {/* step-specific content */}
            </AnalysisStageLayout>
        </AnalysisStepShell>
    );
};
```

### 5.3 النتيجة المتوقعة
- كل step component ينخفض من ~130 سطر إلى ~40-60 سطر
- loading/error behavior متطابق
- إضافة pipeline جديد = فقط content rendering

---

## 6. Phase 5: Frontend Redux Unification

**الأولوية:** 🟠 عالي  
**المدة المتوقعة:** 4-5 أيام  
**المشاكل المعالجة:** ARCH-03, DUP-07, FLOW-03

### 6.1 الهدف
إزالة التعايش بين Legacy و AI Jobs slices، توحيد Redux pattern.

### 6.2 التعديلات المطلوبة

#### 6.2.1 إنشاء Generic `createWorkflowSlice`

**المكان:** `src/redux/shared/createWorkflowSlice.ts`

```typescript
type WorkflowSliceConfig<TStepOutputs> = {
    name: string;
    stepHydrators: {
        [stepNumber: number]: (state: Draft<TStepOutputs>, result: unknown) => void;
    };
};

function createWorkflowSlice<TStepOutputs>(config: WorkflowSliceConfig<TStepOutputs>) {
    // Creates:
    // - workflow state (workflowId, currentStep, status)
    // - step outputs state (typed per pipeline)
    // - start/get/run/save thunks
    // - AI job hydrate reducers
    // - loading/error state
}
```

#### 6.2.2 تحديث كل Pipeline Slice

بدلاً من slice مزدوج (legacy + AI)، كل pipeline يصبح slice واحد:

```typescript
// Before: rulingAnalysis.ts + rulingAnalysisAiSlice.ts
// After: rulingAnalysisSlice.ts (unified)

const rulingAnalysisSlice = createWorkflowSlice<RulingAnalysisState>({
    name: 'rulingAnalysis',
    stepHydrators: {
        1: (state, result) => { state.verdictAnalysis = result as TVerdictAnalysis; },
        2: (state, result) => { state.reasonsAnalysis = result as TReasonsAnalysis; },
        3: (state, result) => { state.defectsEvaluation = result as TDefectsEvaluation; },
        4: (state, result) => { state.appealViability = result as TAppealViability; },
    },
});
```

#### 6.2.3 Unified Thunk Factory

**المكان:** `src/redux/shared/createWorkflowThunks.ts`

```typescript
function createWorkflowThunks(config: {
    apiBase: string;
    name: string;
}) {
    return {
        startWorkflow: thunk,
        getWorkflow: thunk,
        runStep: thunk,
        saveEditedStep: thunk,
    };
}
```

### 6.3 النتيجة المتوقعة
- إزالة 8 Redux files مكررة (4 legacy + 4 AI hydrate)
- كل pipeline: ملف واحد بدلاً من اثنين
-统一的 thunk pattern

---

## 7. Phase 6: Appeal Brief Frontend Implementation

**الأولوية:** 🔴 حرية  
**المدة المتوقعة:** 3-4 أيام  
**المشاكل المعالجة:** REUSE-04

### 7.1 الهدف
إكمال الـ Frontend لمرحلة صحيفة الطعن باستخدام الـ shared components الجديدة.

### 7.2 التعديلات المطلوبة

#### 7.2.1 إنشاء 6 Step Components

**المكان:** `src/pages/cases/subPagesCases/analysis/appeal-brief/steps/`

باستخدام `useAnalysisStep` + `AnalysisStageLayout` من Phase 4:

1. `AppealStep1JudgmentData.tsx` — استخراج بيانات الحكم
2. `AppealStep2Analysis.tsx` — تحليل الأسباب
3. `AppealStep3Grounds.tsx` — أوجه الطعن
4. `AppealStep4Requests.tsx` — الطلبات
5. `AppealStep5LegalBasis.tsx` — السند القانوني
6. `AppealStep6Assembly.tsx` — التجميع النهائي

#### 7.2.2 تحديث `AppealBriefPage.tsx`

استخدام `AnalysisWorkflowShell` مع 6 steps و step routing.

### 7.3 النتيجة المتوقعة
- المرحلة 3 تصبح functional بالكامل
- استخدام shared components
- consistent UX مع باقي المراحل

---

## 8. Phase 7: Consistency & Naming Fixes

**الأولوية:** 🟡 متوسط  
**المدة المتوقعة:** 2-3 أيام  
**المشاكل المعالجة:** CONSIST-01, CONSIST-02, CONSIST-04, ARCH-04, NAME-01, NAME-02

### 8.1 الهدف
توحيد الـ patterns غير المتسقة.

### 8.2 التعديلات المطلوبة

#### 8.2.1 توحيد Error Handling (CONSIST-01)

- تحويل `AdminComplaintService` لاستخدام `_result.BadRequest<T>()` مثل باقي الخدمات
- أو العكس: تحويل الكل لاستخدام `Result<T>.Error()` (الأفضل — أكثر وضوحاً)

#### 8.2.2 توحيد Case Access Validation (CONSIST-02)

- إنشاء `CaseAccessValidator` service مشترك
- كل services تستخدم نفس الـ validation logic

```csharp
public interface ICaseAccessValidator
{
    Task<Result<bool>> ValidateAsync(Guid caseId, string lawyerId, CancellationToken ct);
}
```

#### 8.2.3 توحيد DI Pattern (ARCH-04)

- تحويل `AdminComplaintService` لاستخدام `IUnitOfWork` مثل باقي الخدمات
- أو العكس: تحويل الكل لاستخدام `IApplicationDbContext`

#### 8.2.4 توحيد Abandon Functionality (CONSIST-04)

- إضافة abandon endpoint لكل pipeline controller
- أو إضافته في الـ base WorkflowService

#### 8.2.5 إصلاح Naming (NAME-01, NAME-02)

- إعادة تسمية مجلد `appeal-brief` → `appealBrief`
- إضافة comments توضيحية للعلاقة بين `smartAnalysis` و `defenseMemoPage`

### 8.3 النتيجة المتوقعة
- Error handling متطابق
- Security validation متطابق
- Naming أكثر وضوحاً

---

## 9. Phase 8: Documentation & Developer Experience

**الأولوية:** 🟢 منخفض  
**المدة المتوقعة:** 1-2 يوم  
**المشاكل المعالجة:** PROMPT-03, SCALE-03

### 9.1 الهدف
تسهيل إضافة pipelines جديدة.

### 9.2 التعديلات المطلوبة

#### 9.2.1 إنشاء Pipeline Configuration Registry

```csharp
public static class PipelineRegistry
{
    public static PipelineDefinition Get(string pipelineType) => pipelineType switch
    {
        "defense-memo" => new() { Name = "مذكرة الدفاع", Steps = 5, ... },
        "statement-of-claims" => new() { Name = "صحيفة الدعوى", Steps = 6, ... },
        // etc.
    };
}
```

#### 9.2.2 إنشاء mapping.txt لكل المراحل

إضافة `mapping.txt` للمراحل 1, 2, 7.

#### 9.2.3 تحديث AiModelConfigService

استخدام `PipelineRegistry` بدلاً من hardcoded `StageDefinitions`.

### 9.3 النتيجة المتوقعة
- developer guide واضح لإضافة pipeline جديد
- كل pipeline metadata في مكان واحد

---

## 10. الخريطة الزمنية

```
الأسبوع 1-2:  Phase 1 (Shared Backend Utilities)
الأسبوع 2-3:  Phase 2 (Generic Workflow Infrastructure)
الأسبوع 3-4:  Phase 3 (Unified Parsing & Schema Validation)
الأسبوع 4-5:  Phase 4 (Frontend Shared Components)
الأسبوع 5-6:  Phase 5 (Frontend Redux Unification)
الأسبوع 6-7:  Phase 6 (Appeal Brief Frontend)
الأسبوع 7-8:  Phase 7 (Consistency Fixes)
الأسبوع 8:    Phase 8 (Documentation)
```

---

## 11. مؤشرات النجاح

### قبل التطبيق
| المقياس | القيمة الحالية |
|---------|---------------|
| عدد سطور الـ Backend per pipeline | ~400 سطر |
| عدد ملفات Frontend per pipeline | ~10 ملفات |
| Duplication count | 44 مشكلة |
| إضافة pipeline جديد | 15+ ملف |
| JSON library | مكتبتان مختلفتان |
| Workflow patterns | 3 أنماط مختلفة |

### بعد التطبيق (المتوقع)
| المقياس | القيمة المتوقعة |
|---------|---------------|
| عدد سطور الـ Backend per pipeline | ~80-100 سطر (configuration only) |
| عدد ملفات Frontend per pipeline | ~5-6 ملفات |
| Duplication count | < 5 مشاكل |
| إضافة pipeline جديد | 3-4 ملفات (config + prompts + step UI) |
| JSON library | مكتبة واحدة (System.Text.Json) |
| Workflow patterns | نمط واحد موحد |

### معايير القبول
1. ✅ كل pipeline يستخدم `AnalysisHelpers` المشترك
2. ✅ كل pipeline service يرث من `WorkflowServiceBase`
3. ✅ JSON parsing متطابق عبر كل pipelines
4. ✅ كل step component يستخدم `useAnalysisStep` hook
5. ✅ كل pipeline slice يستخدم `createWorkflowSlice`
6. ✅ Appeal Brief Frontend مكتمل
7. ✅ Error handling متطابق
8. ✅ لا يوجد `CleanJsonResponse` مكرر
9. ✅ لا يوجد `BuildCaseContext` مكرر
10. ✅ لا تعديل على أي prompt موجود
