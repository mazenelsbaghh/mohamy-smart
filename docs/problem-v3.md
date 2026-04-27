# تقرير المشاكل الشامل V3 — مراجعة شاملة + خطة الإصلاح

**التاريخ:** 2026-04-14
**الإصدار:** V3
**المرجع الأساسي:** تحليل 7 مراحل تحليل + فرع 043-global-auto-save + مراجعة البنية الكاملة
**النطاق:** Backend + Lawyer Dashboard + Admin Dashboard + Infrastructure
**التحديث عن V2:**
- إضافة مشاكل فرع 043 (auto-save race conditions، branch instability)
- تحديث حالة المراحل (DefenseMemo/PrepStatements لا تزال Legacy)
- إضافة مشاكل Frontend Type Safety و Data Flow الجديدة
- **إضافة خطة تنفيذية واضحة: Phase 0 → Phase 1 → Phase 2**

---

## جدول المحتويات

1. [الوضع الحالي — لقطة شاملة](#1-الوضع-الحالي--لقطة-شاملة)
2. [المشاكل الحرجة P0 — يجب الحل قبل أي دمج](#2-المشاكل-الحرجة-p0)
3. [المشاكل عالية الأولوية P1 — Phase 1](#3-المشاكل-عالية-الأولوية-p1)
4. [المشاكل متوسطة الأولوية P2 — Phase 2](#4-المشاكل-متوسطة-الأولوية-p2)
5. [المشاكل منخفضة الأولوية P3 — مؤجلة](#5-المشاكل-منخفضة-الأولوية-p3)
6. [خطة التنفيذ — Phase 0 → 2](#6-خطة-التنفيذ)
7. [مؤشرات النجاح لكل مرحلة](#7-مؤشرات-النجاح)
8. [الفروق عن V2](#8-الفروق-عن-v2)

---

## 1. الوضع الحالي — لقطة شاملة

### أنماط Backend الفعلية (4 أنماط — يجب التوحيد إلى نمط واحد)

| # | المرحلة | الخطوات | نمط Backend | JSON Library | Case Access |
|---|---------|---------|-------------|--------------|-------------|
| 1 | مذكرة الدفاع | 5 | ❌ Legacy Direct | ❌ Newtonsoft | ✅ HttpContext |
| 2 | صحيفة الدعوى | 6 | ❌ Legacy Direct | ❌ Newtonsoft | ✅ HttpContext |
| 3 | صحيفة الطعن | 6 | ❌ Standalone (IApplicationDbContext) | ✅ STJ | ❌ **غائب** |
| 4 | الشكاوى الإدارية | 5 | ✅ WorkflowServiceBase | ✅ STJ | ✅ ICaseAccessValidator |
| 5 | تحليل حكم | 4 | ❌ Standalone copy-paste | ✅ STJ | ✅ LawyerId check |
| 6 | الإنذار الرسمي | 3 | ✅ WorkflowServiceBase | ✅ STJ | ✅ ICaseAccessValidator |
| 7 | طلبات التنفيذ | 3 | ❌ Standalone copy-paste | ✅ STJ | ✅ LawyerId check |

### أنماط Frontend الفعلية (3 أنماط — يجب التوحيد إلى نمط واحد)

| # | المرحلة | Redux Pattern | SignalR | Auto-save |
|---|---------|---------------|---------|-----------|
| 1 | مذكرة الدفاع | ❌ Legacy Thunks | ❌ لا | ❌ لا |
| 2 | صحيفة الدعوى | ❌ Legacy Thunks | ❌ لا | ❌ لا |
| 3 | صحيفة الطعن | ✅ createWorkflowSlice | ✅ | ⚠️ غير مكتمل |
| 4 | الشكاوى الإدارية | ✅ createWorkflowSlice | ✅ | ⚠️ غير مكتمل |
| 5 | تحليل حكم | ⚠️ Dual slice (dead code) | ✅ | ⚠️ غير مكتمل |
| 6 | الإنذار الرسمي | ✅ createWorkflowSlice | ✅ | ⚠️ غير مكتمل |
| 7 | طلبات التنفيذ | ✅ createWorkflowSlice | ✅ | ⚠️ غير مكتمل |

### حالة فرع 043-global-auto-save

| الحالة | التفاصيل |
|--------|----------|
| ⚠️ **غير مستقر** | 76 ملف محدّل، عدة ملفات جديدة untracked |
| ❌ **race condition** | Manual + auto-save يمكن تشغيلهما بالتزامن |
| ⚠️ **debounce** | 2000ms قد تكون aggressive على اتصالات بطيئة |
| ❌ **cleanup** | لا يوجد unmount cleanup مؤكد في useWorkflowAutoSave |
| ❌ **integration** | المرحلتان 1-2 (Legacy) لا تستخدمان useWorkflowAutoSave |

---

## 2. المشاكل الحرجة P0

> **تعريف P0:** مشاكل تمنع الإنتاج أو تخلق ثغرات أمنية أو تسبب data corruption.
> **يجب الحل في Phase 0 قبل أي دمج.**

---

### CRIT-01: `StepOutputSchemas` — لا يُغطي إلا RulingAnalysis

**التصنيف:** Architecture / Data Validation
**المكان:** `Lawyer.Application/Services/Workflows/StepOutputSchemas.cs`
**المشكلة:** `Normalize()` يُغطي step types 51-54 فقط (RulingAnalysis).
كل step types أخرى تعود `DynamicStepOutput` بدون أي validation.

```csharp
// الحالة الفعلية:
// StepTypes 51-54  → typed validation ✅
// ALL other types → DynamicStepOutput (no validation) ❌
```

**التأثير:** AI output خاطئ يُخزن في DB في 6 من 7 مراحل بدون اكتشاف.
**المراحل المتأثرة:** 1، 2، 3، 4، 6، 7
**الحل:** تعريف typed schemas لكل step type في الملف.

---

### CRIT-02: `AppealBriefService` — لا يتحقق من ملكية المحامي ❌ **أمني**

**التصنيف:** Security / Authorization
**المكان:** `Lawyer.Application/Services/AppealBriefService.cs`
**المشكلة:**
```csharp
// الكود الحالي:
var caseExists = await _context.Cases.AnyAsync(c => c.Id == request.CaseId, ct);
if (!caseExists) return Result<AppealBriefWorkflowDto>.Error(...);
// ❌ مفقود: التحقق أن المحامي يملك القضية
```

**التأثير:** أي محامي يمكنه تشغيل تحليل على قضية لا يملكها.
**المراحل المتأثرة:** صحيفة الطعن (3)
**الحل:** إضافة `ICaseAccessValidator` أو فحص `case.LawyerId == requestingLawyerId`.

---

### CRIT-03: مكتبتا JSON مختلفتان في نفس الـ Backend

**التصنيف:** Parsing / Consistency
**المكان:** كامل `Lawyer.Application/Services/`
**المشكلة:**

| الخدمة | المكتبة | Naming |
|--------|---------|--------|
| SmartAnalysisService | ❌ Newtonsoft.Json | SnakeCase |
| PreparingStatementOfClaimsService | ❌ Newtonsoft.Json | SnakeCase |
| AppealBriefService + الباقي | ✅ System.Text.Json | camelCase |

**التأثير:** Frontend يتلقى snake_case من المرحلتين 1-2 و camelCase من 3-7.
لا يمكن ضمان توافق الـ schemas. `parseJobResult()` يفشل بصمت.
**الحل:** حذف Newtonsoft من المرحلتين 1-2 والمعالجة بـ STJ + camelCase.

---

### CRIT-04: `CleanJsonResponse` مكرر في 5 خدمات

**التصنيف:** Duplication / Reliability
**المكان:** SmartAnalysis، PrepStatements، RulingAnalysis، AppealBrief، ExecRequest
**المشكلة:** كل خدمة تنفذ منطق تنظيف JSON بشكل مختلف.
**التأثير:** Bug في parsing يتطلب إصلاح في 5 أماكن مستقلة.
**الحل:** نقل إلى `AnalysisHelpers.CleanJsonResponse()` واستخدامه عبر `WorkflowServiceBase`.

---

### CRIT-05: Workflow Models — 5 نماذج شبه متطابقة + عدم استخدام `SetStepOutput`

**التصنيف:** Architecture / Duplication
**المكان:** `Lawyer.Core/Models/`
**المشكلة:**
1. كل workflow كُتب model مستقل (~35 سطر بدلاً من وراثة `WorkflowBase`)
2. `RulingAnalysisService` و `ExecRequestService` يعيّنان steps مباشرة:
```csharp
workflow.Step1Output = cleanedJson;  // ❌ direct assignment
// بدلاً من:
workflow.SetStepOutput(1, cleanedJson);  // ✅ base class method
```

**التأثير:** إضافة field مشترك يتطلب 5 migrations.
`SetStepOutput` موجود لكن غير مستخدم في 2 خدمات.
**الحل:** توحيد Models تحت `WorkflowBase`، استخدام `SetStepOutput` في كل الخدمات.

---

### CRIT-06: فرع 043 — Auto-save Race Condition

**التصنيف:** Data Integrity / Concurrency
**المكان:** `mohamy-smart-lawyer-dashboard/src/hooks/useWorkflowAutoSave.ts`
**المشكلة:** لا يوجد `isSaving` guard flag يمنع تشغيل save يدوي أثناء auto-save أو العكس.
```typescript
// الخطر:
// Auto-save fires (debounce resolves)
// User clicks "حفظ" manually at same time
// → Two concurrent API calls writing to same record
```

**التأثير:** آخر write يفوز — يمكن فقدان بيانات أو تناقض في الـ state.
**الحل:** `isSaving` ref مشترك بين manual و auto-save، أو cancel debounce عند manual save.

---

### CRIT-07: فرع 043 — حالة غير مستقرة (Untracked Files)

**التصنيف:** Branch Stability
**المشكلة:** الفرع يحتوي على ملفات جديدة غير tracked:
- `useWorkflowAutoSave.ts` — hook جديد غير مكتمل
- `thunkCancelAiJob.ts` — cancel functionality غير مكتمل
- `parseJobResult.ts` — JSON parsing utility
- `workflowCatalog.ts` — central registry غير موجود فعلياً
- 3 migration files جديدة غير مُطبقة

**التأثير:** الفرع لا يمكن دمجه في حالته الحالية.
**الحل:** track/commit كل الملفات أو حذف ما لن يستخدم قبل الدمج.

---

## 3. المشاكل عالية الأولوية P1

> **تعريف P1:** مشاكل تؤثر على قابلية الصيانة، الأمان، أو التوسع.
> **الهدف:** حلها في Phase 1.

---

### HIGH-01: `AiJobWorker` — God Object (404 سطر، 9 خدمات)

**المشكلة:** AiJobWorker يحتوي على switch statement بـ 110+ سطر لـ 8+ step types.
إضافة pipeline جديد تتطلب تعديل AiJobWorker مباشرة.
**الحل:** Strategy pattern — كل workflow يعرّف `IWorkflowStepHandler`.

---

### HIGH-02: Frontend Dead Code — RulingAnalysis Legacy Slice

**المشكلة:** 5 ملفات Redux لا تُستخدم من أي صفحة:
- `RulingAnalysis.ts` (122 سطر — dead)
- 4 thunks مرتبطة بها (dead)
**الحل:** حذف الملفات الخمسة.

---

### HIGH-03: `BuildCaseContext` — مكرر في 4 خدمات

**المشكلة:** `AnalysisHelpers.BuildCaseContext` موجود لكن 4 خدمات لا تستخدمه.
**الحل:** حذف النسخ الخاصة، استخدام `AnalysisHelpers` في كل مكان.

---

### HIGH-04: `BuildPreviousStepsContext` — مكرر في 5 خدمات Workflow

**المشكلة:** كل خدمة تبني سياق الخطوات السابقة بأسماء عربية مختلفة.
**الحل:** تنفيذ واحد في `WorkflowServiceBase` مع pipeline descriptor.

---

### HIGH-05: `MapToDto` — مكرر في 5 خدمات Workflow

**المشكلة:** لا يوجد generic mapping في WorkflowServiceBase.
**الحل:** `protected abstract TDto MapToDto(TWorkflow workflow)` في base class.

---

### HIGH-06: Workflow DTOs — 5 DTOs متطابقة هيكلياً

**المشكلة:** كل workflow له DTO منفصل بنفس الـ structure تقريباً.
**الحل:** `GenericWorkflowDto` مع step outputs dictionary، أو base DTO class.

---

### HIGH-07: `RulingAnalysisService` و `ExecRequestService` — نسخ متطابقة (334-354 سطر)

**المشكلة:** نفس الـ 6 methods بالضبط. الاختلاف فقط: اسم الـ workflow، عدد الخطوات، مجلد الـ prompts.
**الحل:** كلاهما يرث من `WorkflowServiceBase` بـ configuration parameters.

---

### HIGH-08: Case Access Validation — 3 أنماط مختلفة

**المشكلة:** SmartAnalysis (HttpContext)، RulingAnalysis/ExecRequest (LawyerId check)،
AppealBrief (**لا شيء**).
**الحل:** `ICaseAccessValidator` في `WorkflowServiceBase` — إلزامي لكل workflow.

---

### HIGH-09: Error Response Pattern — مختلف بين الخدمات

**المشكلة:** `Result<T>.Error()` في بعض الخدمات، `_result.BadRequest<T>()` في أخرى.
**الحل:** توحيد على `Result<T>.Error()` في `WorkflowServiceBase`.

---

### HIGH-10: مذكرة الدفاع — تخزين في جداول منفصلة (لا workflow entity موحد)

**المشكلة:** كل خطوة في table مختلف (FactAnalysis، Defense، FinalPrayer).
لا يوجد atomic tracking أو unified status.
**الحل (طويل المدى):** migration لـ `DefenseMemoWorkflow` موحد.
**ملاحظة:** هذا أكبر من Phase 1 — ضعه في backlog.

---

### HIGH-11: إضافة Pipeline جديد تتطلب 15+ ملف

**المشكلة:** لا يوجد scaffold أو template. كل workflow بُني من الصفر.
**الحل:** `WorkflowServiceBase` + `createWorkflowSlice` factory يُقلل إلى ~5 ملفات.

---

### HIGH-12: Frontend — لا يوجد أي Type للـ Workflow Step Outputs

**المشكلة:** 57+ استخدام لـ `any` في Redux slices وthunks.
`workflowTypes.ts` لا تعرّف أنواع مخرجات الخطوات.
**الحل:** تعريف `CaseAnalysisResultDto`، `DefenseDetailDto`، إلخ في `workflowTypes.ts`.

---

### HIGH-13: `ForgotPassword` صفحة — API غير مربوط

**المشكلة:** TODO صريح في الكود: "TODO: dispatch thunk for forgot-password when API is ready"
**الحل:** ربط الـ thunk بعد التحقق من backend endpoint.

---

### HIGH-14: `console.log` في كود الإنتاج

**المشكلة:** 3 استخدامات في:
- `AddNewContractsForm.tsx` (onSubmit)
- `TasksPage.tsx` (2 statements)
**الحل:** حذف كل `console.log` من production code.

---

## 4. المشاكل متوسطة الأولوية P2

> **تعريف P2:** مشاكل تؤثر على جودة الكود والتجربة لكن لا تمنع الإنتاج.
> **الهدف:** حلها في Phase 2.

---

### MED-01: Frontend Legacy Slices — مذكرة الدفاع وصحيفة الدعوى

**المشكلة:** المرحلتان 1-2 تستخدمان Legacy Thunks بدلاً من `createWorkflowSlice`.
لا تستخدمان SignalR، لا auto-save، error handling مختلف.
**الحل:** migration إلى `createWorkflowSlice` في Phase 2.

---

### MED-02: Frontend Legacy Step Components

**المشكلة:** ~10 step components في المرحلتين 1-2 لا تستخدم `useAnalysisStep` hook.
**الحل:** refactor بعد MED-01.

---

### MED-03: Auto-save لا يُغطي المرحلتين 1-2

**المشكلة:** `useWorkflowAutoSave` مبني على `createWorkflowSlice` — لن يعمل مع Legacy.
**الحل:** تأتي بعد MED-01 (migrate أولاً، ثم auto-save تلقائياً).

---

### MED-04: Hangfire — لا يوجد retry logic واضح في `AiJobWorker`

**المشكلة:** Step failures لا تُعيد المحاولة تلقائياً.
**الحل:** تكوين `AutomaticRetryAttribute` في Hangfire jobs.

---

### MED-05: لا يوجد Correlation IDs في الـ Logs

**المشكلة:** لا يمكن تتبع request واحد عبر كامل النظام (Backend + Hangfire + AI).
**الحل:** إضافة `X-Correlation-Id` header + Serilog enricher.

---

### MED-06: Database — N+1 Queries محتملة في CaseService

**المشكلة:** لا يوجد `Include/ThenInclude` واضح في queries.
**الحل:** audit CaseService queries وإضافة eager loading.

---

### MED-07: Database — لا يوجد index على AiJobs(CaseId, LawyerId)

**المشكلة:** queries على AiJobs بـ CaseId أو LawyerId بدون index = full scan.
**الحل:** إضافة migration بـ composite index.

---

### MED-08: `DefendingParty` — string بدون enum constraint

**المشكلة:** الحقل يقبل أي string (`"client"` أو `"opponent"` أو أي شيء آخر).
**الحل:** enum في Core + FluentValidation rule.

---

### MED-09: لا يوجد FluentValidation لـ 28 Controller endpoint

**المشكلة:** Input validation غائب عن معظم endpoints.
**الحل:** إضافة validators تدريجياً بدءاً من الأكثر أهمية (CaseController، ClientController).

---

### MED-10: `appsettings.json` في git (يجب أن يكون example فقط)

**المشكلة:** الملف committed وقد يحتوي على values حساسة في التاريخ.
**الحل:** rename إلى `appsettings.example.json`، إضافة `appsettings.json` إلى `.gitignore`.

---

## 5. المشاكل منخفضة الأولوية P3

> **مؤجلة لما بعد Phase 2 — لا تمنع الإنتاج ولا تؤثر بشكل فوري**

| # | المشكلة | الملاحظة |
|---|---------|----------|
| P3-01 | لا يوجد OpenAPI/Swagger documentation | مفيد لكن غير ضروري الآن |
| P3-02 | لا يوجد Rate Limiting على AI endpoints | مهم قبل public launch |
| P3-03 | لا يوجد PII encryption للـ national IDs وأرقام الهاتف | مطلوب قبل compliance review |
| P3-04 | لا يوجد Audit Trail لـ draft saves | مفيد للـ lawyers |
| P3-05 | لا يوجد Document Versioning | يُضاف لاحقاً |
| P3-06 | مذكرة الدفاع — Migration إلى unified workflow entity | تغيير schema ضخم |
| P3-07 | Test coverage لـ SmartAnalysis و PrepStatements | 0% حالياً |
| P3-08 | Sentry DSN check بـ `startsWith("TODO")` — يمكن يخفي errors | نادر |

---

## 6. خطة التنفيذ

---

### Phase 0 — Stabilize & Patch (الأسبوع الحالي)
**الهدف:** إخراج الفرع من حالة الـ unstable، وسد الثغرات الأمنية.
**المعيار:** فرع 043 جاهز للمراجعة، لا توجد ثغرات P0 مفتوحة.

#### 0.1 — تثبيت فرع 043 (يومان)

| المهمة | الملف | الأولوية |
|--------|-------|----------|
| Track/commit أو حذف كل untracked files | useWorkflowAutoSave.ts، thunkCancelAiJob.ts، إلخ | 🔴 |
| تطبيق الـ 3 migrations الجديدة وتحديث Snapshot | `Migrations/` | 🔴 |
| التحقق من compilation بدون errors | Frontend + Backend | 🔴 |
| إضافة `isSaving` guard flag في `useWorkflowAutoSave` | `hooks/useWorkflowAutoSave.ts` | 🔴 |
| اختبار manual save + auto-save لا يتزامنان | يدوي | 🔴 |
| إضافة cleanup (cancel debounce) عند component unmount | `useWorkflowAutoSave.ts` | 🟡 |

#### 0.2 — إصلاح الثغرة الأمنية في AppealBriefService (نصف يوم)

```csharp
// الإضافة المطلوبة في AppealBriefService:
var caseEntity = await _context.Cases
    .FirstOrDefaultAsync(c => c.Id == request.CaseId, ct);
if (caseEntity == null)
    return Result<AppealBriefWorkflowDto>.Error("القضية غير موجودة");
if (caseEntity.LawyerId != requestingLawyerId)
    return Result<AppealBriefWorkflowDto>.Error("غير مصرح لك بالوصول إلى هذه القضية");
```

| المهمة | الملف |
|--------|-------|
| إضافة LawyerId validation | `AppealBriefService.cs` |
| إضافة test case للتحقق | `Lawyer.Tests/` |

#### 0.3 — تنظيف سريع (نصف يوم)

| المهمة | الملف |
|--------|-------|
| حذف `console.log` من `AddNewContractsForm.tsx` | Lawyer Dashboard |
| حذف `console.log` من `TasksPage.tsx` (2 statements) | Lawyer Dashboard |
| حذف dead Redux code (5 ملفات RulingAnalysis legacy) | `src/redux/rulingAnalysis/` |
| ربط `ForgotPassword` thunk (إذا كان backend endpoint موجود) | `ForgotPasswordPage.tsx` |

---

### Phase 1 — Backend Unification (أسبوعان)
**الهدف:** كل الـ 7 workflows تمر عبر `WorkflowServiceBase` الموحد.
**المعيار:** مكتبة JSON واحدة، validation موحد، no code duplication في workflow services.

#### 1.1 — توحيد JSON Library (يومان)

**الخطوات:**
1. حذف `Newtonsoft.Json` من `SmartAnalysisService` و `PreparingStatementOfClaimsService`
2. استبدال كل `JsonConvert.SerializeObject(..., SnakeCaseNamingStrategy)` بـ STJ + camelCase
3. تحديث Frontend `parseJobResult()` لضمان التوافق
4. Test: كل step outputs تصل Frontend بـ camelCase

```csharp
// قبل (Newtonsoft):
var json = JsonConvert.SerializeObject(result, new JsonSerializerSettings {
    ContractResolver = new DefaultContractResolver {
        NamingStrategy = new SnakeCaseNamingStrategy()
    }
});

// بعد (STJ):
var json = JsonSerializer.Serialize(result, new JsonSerializerOptions {
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
});
```

#### 1.2 — توحيد Utility Methods في AnalysisHelpers (يوم واحد)

| المهمة | الملفات المتأثرة |
|--------|-----------------|
| دمج 5 نسخ `CleanJsonResponse` إلى `AnalysisHelpers.CleanJsonResponse()` | 5 خدمات |
| دمج 4 نسخ `BuildCaseContext` إلى `AnalysisHelpers.BuildCaseContext()` | 4 خدمات |
| تأكيد أن كل خدمة تستدعي الـ Helpers وليس نسختها الخاصة | كل خدمات AI |

#### 1.3 — ترحيل الخدمات إلى WorkflowServiceBase (3 أيام)

**الترتيب (من الأسهل للأصعب):**

1. **RulingAnalysisService** (مشابه لـ AdminComplaint بالفعل):
   - تغيير التوريث
   - استبدال `workflow.Step1Output = x` بـ `SetStepOutput(1, x)`
   - استبدال inline `BuildPreviousStepsContext` بالـ base method

2. **ExecRequestService** (مطابق تقريباً لـ RulingAnalysis):
   - نفس الخطوات

3. **AppealBriefService** (يستخدم `IApplicationDbContext` بدلاً من `IUnitOfWork`):
   - التحول إلى `IUnitOfWork`
   - إضافة `ICaseAccessValidator` (من Phase 0.2)
   - ترحيل إلى WorkflowServiceBase

4. **SmartAnalysisService + PreparingStatementOfClaimsService** (الأصعب — Legacy):
   - هذان يتطلبان schema migration لـ workflow entity
   - **استراتيجية مؤقتة:** لف الخدمتين بـ adapter يستخدم `ICaseAccessValidator`
   - ترحيل كامل في backlog (P3-06)

#### 1.4 — توحيد StepOutputSchemas (يوم واحد)

| المهمة | التفاصيل |
|--------|----------|
| تعريف typed schemas لكل AiStepType | 7 مراحل × متوسط 5 خطوات = ~35 type |
| اختبار كل step type في `Normalize()` | Unit tests |
| إزالة `DynamicStepOutput` fallback للـ known types | `StepOutputSchemas.cs` |

#### 1.5 — توحيد Error Handling و MapToDto (يوم واحد)

| المهمة | الملفات |
|--------|---------|
| توحيد كل خدمات workflow على `Result<T>.Error()` | 7 خدمات |
| إضافة `protected abstract TDto MapToDto(TWorkflow)` في WorkflowServiceBase | base class |
| نقل 5 نسخ MapToDto إلى implementations | 5 خدمات |

---

### Phase 2 — Frontend Unification + Auto-save Complete (أسبوعان)
**الهدف:** كل الـ 7 workflows تستخدم `createWorkflowSlice` + auto-save يعمل بشكل صحيح.
**المعيار:** لا Legacy patterns، auto-save مفعّل في كل المراحل، لا `any` types في workflow Redux.

#### 2.1 — تعريف Workflow Types (يوم واحد)

```typescript
// workflowTypes.ts — الإضافات المطلوبة:
export interface CaseAnalysisStepOutput { /* ... */ }
export interface DefenseMemoStep1Output { /* ... */ }
export interface PrepStatementsStep1Output { /* ... */ }
// ... باقي step outputs
```

#### 2.2 — ترحيل مذكرة الدفاع إلى createWorkflowSlice (يومان)

**الخطوات:**
1. إنشاء `defenseMemoWorkflow.ts` باستخدام `createWorkflowSlice`
2. تعريف `stepHydrators` لكل step output type
3. ترحيل الـ 5 step components إلى `useAnalysisStep` + `AnalysisStepShell`
4. ترحيل الـ thunks إلى `createWorkflowThunks`
5. حذف الـ legacy slice والـ 8+ legacy thunks
6. Test: كل الخطوات الـ 5 تعمل بشكل صحيح

#### 2.3 — ترحيل صحيفة الدعوى إلى createWorkflowSlice (يومان)

نفس خطوات 2.2.

#### 2.4 — تفعيل Auto-save في كل المراحل (يوم واحد)

بعد انتهاء 2.2 و 2.3، كل المراحل تستخدم `createWorkflowSlice`، و `useWorkflowAutoSave` يعمل تلقائياً.

| المهمة | التفاصيل |
|--------|----------|
| ربط `useWorkflowAutoSave` في كل workflow page | 7 صفحات |
| تأكيد `isSaving` guard يعمل في كل مرحلة | اختبار يدوي |
| ضبط debounce على 1500ms (بدلاً من 2000ms) | `useWorkflowAutoSave.ts` |
| إضافة toast "تم الحفظ تلقائياً" / "فشل الحفظ" | UX |

#### 2.5 — إصلاح Medium Priority (موازٍ، نصف يوم لكل مهمة)

| المهمة | الأولوية |
|--------|----------|
| إضافة Index على `AiJobs(CaseId, LawyerId)` | 🟡 |
| Fix `DefendingParty` → enum + FluentValidation | 🟡 |
| حذف Correlation IDs (أو إضافة X-Request-Id) | 🟡 |
| FluentValidation لـ CaseController و ClientController | 🟡 |

---

## 7. مؤشرات النجاح لكل مرحلة

### Phase 0 ✅ معايير الاكتمال:
- [x] فرع 043 يُصرّف بدون أخطاء (Backend + Frontend)
- [x] `useWorkflowAutoSave` يحتوي على `isSaving` guard
- [x] `AppealBriefService` يتحقق من LawyerId ownership
- [x] لا يوجد `console.log` في production files
- [x] ~~Dead Redux code محذوف~~ (متجاوز - الكود مستخدم فعلياً كما تبين في البحث)
- [x] كل untracked files مُطبّقة أو محذوفة

### Phase 1 ✅ معايير الاكتمال:
- [x] لا يوجد `Newtonsoft.Json` في أي workflow service
- [x] كل workflow outputs تصل Frontend بـ camelCase
- [x] كل workflow services ترث من `WorkflowServiceBase` (أو adapter مؤقت للـ legacy)
- [x] `CleanJsonResponse` + `BuildCaseContext` + `BuildPreviousStepsContext` في مكان واحد
- [x] `StepOutputSchemas.Normalize()` يُغطي كل step types المعروفة
- [ ] كل workflow services تستخدم `Result<T>.Error()` فقط

### Phase 2 ✅ معايير الاكتمال:
- [x] لا يوجد Legacy Thunks pattern — كل الـ 7 workflows تستخدم `createWorkflowSlice`
- [x] Auto-save مفعّل ويعمل في كل الـ 7 مراحل (RulingAnalysis مُحوَّل إلى `rulingAnalysisWorkflowSlice`)
- [x] لا يوجد `any` في workflow Redux slice definitions
- [x] Dead code محذوف — `rulingAnalysisAiSlice.ts` حُذف، الـ 7 workflows موحّدة
- [x] كل step outputs لها TypeScript type مُعرَّف في `workflowTypes.ts`

---

## 8. الفروق عن V2

| البند | V2 | V3 |
|-------|----|----|
| **فرع 043** | غير موجود | مُحلَّل بالكامل — 6 مشاكل جديدة |
| **Race Condition** | غير موجود | CRIT-06 (جديد) |
| **Branch Instability** | غير موجود | CRIT-07 (جديد) |
| **Type Safety Frontend** | HIGH | HIGH-12 موثق بشكل أوضح |
| **خطة التنفيذ** | مجرد phases مذكورة | خطوات تفصيلية كاملة Phase 0-2 |
| **Phase 0** | لم يكن موجوداً | مُضاف للـ P0 security/stability issues |
| **مؤشرات النجاح** | لم تكن موجودة | مُضافة لكل phase |
| **ترتيب الترحيل** | مذكور بشكل عام | تفصيلي: من الأسهل للأصعب |
| **HIGH-13 → HIGH-06** | كانت 2 مشاكل منفصلة | دُمجتا لوضوح أكبر |
| **DefendingParty enum** | غير موجود | MED-08 (جديد من 043 analysis) |

---

*آخر تحديث: 2026-04-14 | المرجع: problem-analyzing-v2.md + تحليل فرع 043-global-auto-save*
