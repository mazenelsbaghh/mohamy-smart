# خطة إعادة الهيكلة — 3 مراحل

**التاريخ:** 2026-04-11
**المرجع:** problem-analyzing-v2.md (39 مشكلة)
**الهدف:** توحيد 4 أنماط Backend + 3 أنماط Frontend → نمط واحد لكل طرف

---

## المرحلة 1: Backend Unification
**النطاق:** Utilities + Workflow Infrastructure + Parsing + Security
**المشاكل المغطاة:** CRIT-02, CRIT-03, CRIT-04, CRIT-05, CRIT-06, CRIT-07, HIGH-01, HIGH-03, HIGH-07, HIGH-08, HIGH-11, HIGH-12, HIGH-13, MED-02, MED-03, MED-08
**الملفات المتأثرة:** ~25 ملف Backend

### 1.1 — Shared Utilities (CRIT-04, HIGH-03, HIGH-11, MED-02, MED-03)

**الهدف:** ملف `AnalysisHelpers.cs` يصبح المصدر الوحيد لكل utility methods

| المهمة | المشكلة | الملفات المطلوبة |
|--------|---------|-----------------|
| توحيد `CleanJsonResponse` في `AnalysisHelpers` فقط | CRIT-04 (5 تكرارات → 1) | `AnalysisHelpers.cs` ← حذف النسخ من `AppealBriefService.cs:295`, `StepOutputSchemas.cs:53`, `PreparingStatementOfClaimsService.cs` (6 استدعاءات مباشرة), `ExecRequestService.cs:188`, `RulingAnalysisService.cs:191` |
| توحيد `BuildCaseContext` في `AnalysisHelpers` | HIGH-03 | `AnalysisHelpers.cs` ← تعديل `SmartAnalysisService.cs`, `PreparingStatementOfClaimsService.cs`, `AppealBriefService.cs`, `RulingAnalysisService.cs`, `ExecRequestService.cs` لاستخدامه |
| توحيد `BuildPreviousStepsContext` | HIGH-11 (5 تكرارات → 1) | إضافة generic method في `AnalysisHelpers.cs` أو `WorkflowServiceBase.cs` ← تعديل `RulingAnalysisService.cs`, `ExecRequestService.cs`, `AppealBriefService.cs` |
| توحيد `DeserializeOutput` | MED-02 (4 تكرارات → 1) | إضافة generic method في `AnalysisHelpers.cs` |
| نقل `TryExtractJsonPayload` إلى `AnalysisHelpers` | MED-03 | نقل من `AppealBriefService.cs` ← جعله متاحاً لكل الخدمات |

### 1.2 — Workflow Infrastructure (CRIT-05, CRIT-06, CRIT-07, HIGH-01, HIGH-12, HIGH-13)

**الهدف:** كل خدمات الـ 7 مراحل تعتمد على `WorkflowServiceBase`

| المهمة | المشكلة | التفاصيل |
|--------|---------|----------|
| دمج `RulingAnalysisService` و `ExecRequestService` في `WorkflowServiceBase` | CRIT-06 (~600 سطر مكرر → ~50 configuration) | الخدمتان تحتويان نفس 6 methods بالضبط. الاختلاف فقط في: نوع الـ workflow، عدد الخطوات، مجلد الـ prompts. إنشاء `WorkflowConfig` record يحمل الاختلافات |
| توحيد Workflow Models | CRIT-05 (5 نماذج → 1 base) | `RulingAnalysisWorkflow.cs` و `ExecRequestWorkflow.cs` يجب أن تستخدما `SetStepOutput(int, string?)` الموروث من `WorkflowBase.cs` بدلاً من raw assignment |
| توحيد DTOs | HIGH-13 (5 DTOs → generic) | إنشاء `WorkflowDto<TStepOutput>` في `Lawyer.Application/Dtos/` ← استبدال `RulingAnalysisWorkflowDto.cs`, `ExecRequestWorkflowDto.cs`, `AppealWorkflowDto.cs` |
| إنشاء generic `MapToDto` في `WorkflowServiceBase` | HIGH-12 | بدلاً من 5 نسخ منفصلة |
| توحيد AiJobWorker | HIGH-01 | استبدال 5 `Execute*StepAsync` و 5 `Get*StepNumber` بـ generic dispatch يعتمد على `PipelineRegistry.cs`. الملف: `AiJobWorker.cs` |
| تحويل `AppealBriefService` لوراثة `WorkflowServiceBase` | جزء من CRIT-07 | الانتقال من `IApplicationDbContext` إلى `IUnitOfWork` + base class |

### 1.3 — Parsing Unification (CRIT-03, HIGH-14)

**الهدف:** `System.Text.Json` + `camelCase` لكل المراحل

| المهمة | المشكلة | الملفات |
|--------|---------|---------|
| ترحيل `SmartAnalysisService` من Newtonsoft.Json إلى System.Text.Json | CRIT-03 | `SmartAnalysisService.cs` — إزالة `using Newtonsoft.Json` وتوحيد الـ serialization |
| ترحيل `PreparingStatementOfClaimsService` من Newtonsoft.Json إلى System.Text.Json | CRIT-03 + HIGH-14 | `PreparingStatementOfClaimsService.cs` — إزالة SnakeCase naming + إصلاح أي frontend field mapping |

> **ملاحظة Frontend:** هذا التغيير سيكسر frontend المرحلتين 1-2. يجب تحديث Redux slices و step components لتتوقع `camelCase` بدلاً من `snake_case`. هذا يتم تنسيقه مع المرحلة 2.

### 1.4 — Security Fix (CRIT-02, HIGH-08)

**الهدف:** كل خدمة تستخدم `ICaseAccessValidator`

| المهمة | المشكلة | التفاصيل |
|--------|---------|----------|
| إضافة ownership check في `AppealBriefService` | CRIT-02 | إضافة `case.LawyerId == requestingLawyerId` تحقق. الملف: `AppealBriefService.cs` |
| توحيد Case Access Validation | HIGH-08 | `SmartAnalysisService.cs` (يستخدم `ValidateCaseAccessAsync` يدوياً) و `RulingAnalysisService.cs` / `ExecRequestService.cs` (يستخدمان `caseEntity.LawyerId` مباشرة) → الكل يستخدم `ICaseAccessValidator` عبر `WorkflowServiceBase` |
| إصلاح CancellationToken | MED-08 | `SmartAnalysisService.cs` — تمرير `CancellationToken` لكل `_unitOfWork.Repository<T>().FirstOrDefaultAsync()` |

### مخرجات المرحلة 1 المتوقعة

- **قبل:** 4 أنماط Backend مختلفة (Legacy Direct, Standalone Copy-Paste, Standalone Variant, WorkflowServiceBase)
- **بعد:** نمط واحد — كل خدمات الـ 7 مراحل ترث `WorkflowServiceBase`
- **توفير:** ~1500 سطر كود مكرر
- **إضافة pipeline جديد:** من 15+ ملف → 3-4 ملفات (model + config + prompts + step components)

---

## المرحلة 2: Frontend Unification
**النطاق:** Shared Components + Redux + Dead Code
**المشاكل المغطاة:** HIGH-02, HIGH-05, HIGH-06, HIGH-14, HIGH-15, MED-09, MED-13
**الملفات المتأثرة:** ~35 ملف Frontend
**شرط مسبق:** انتهاء المرحلة 1 (خصوصاً CRIT-03/HIGH-14 ترحيل JSON)

### 2.1 — Dead Code Removal (HIGH-02)

**الهدف:** إزالة كل كود غير مستخدم

| المهمة | الملفات للحذف |
|--------|---------------|
| حذف RulingAnalysis legacy slice | `src/redux/rulingAnalysis/RulingAnalysis.ts` (122 سطر) |
| حذف 4 thunks غير مستخدمة | `src/redux/rulingAnalysis/thunk/thunkGetRulingWorkflow.ts` |
| | `src/redux/rulingAnalysis/thunk/thunkRunRulingStep.ts` |
| | `src/redux/rulingAnalysis/thunk/thunkSaveEditedRulingStep.ts` |
| | `src/redux/rulingAnalysis/thunk/thunkStartRulingWorkflow.ts` |
| تنظيف store.ts | إزالة `rulingAnalysis` legacy slice من `configureStore` |

### 2.2 — Redux Unification (HIGH-06, HIGH-15, MED-13, HIGH-14)

**الهدف:** كل المراحل تستخدم `createWorkflowSlice` + `createWorkflowThunks` + AI Jobs pattern

| المهمة | المشكلة | التفاصيل |
|--------|---------|----------|
| ترحيل مذكرة الدفاع (Phase 1) من Legacy Thunks | HIGH-06, HIGH-15 | `src/redux/analysis/smartAnalysisSlice.ts` — إذا كان legacy، تحويله لـ `createWorkflowSlice`. إنشاء thunks جديدة عبر `createWorkflowThunks` |
| ترحيل صحيفة الدعوى (Phase 2) من Legacy Thunks | HIGH-06, HIGH-15 | `src/redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsSlice.ts` + 12 thunk file ← استبدالها بـ `createWorkflowSlice` + `createWorkflowThunks` |
| تحديث field mapping بعد إزالة SnakeCase | HIGH-14 | تحديث كل step components في المرحلتين 1-2 لتتوقع `camelCase` من backend |
| توحيد تنظيم Redux slices | MED-13 | نقل `src/redux/slices/workflow/appealBriefSlice.ts` → `src/redux/appealBrief/appealBriefSlice.ts` ليتوافق مع باقي الـ slices |

**الملفات للترحيل (صحيفة الدعوى — Legacy Thunks):**

```
src/redux/analysis/preparingStatementOfClaims/thunk/
├── thunkGetLawsuitCaseType.ts      ← حذف (يستبدل بـ createWorkflowThunks)
├── thunkAddLawsuitCaseType.ts      ← حذف
├── thunkGetLawsuitParties.ts       ← حذف
├── thunkAddLawsuitParties.ts       ← حذف
├── thunkGetLawsuitSubjects.ts      ← حذف
├── thunkAddLawsuitSubjects.ts      ← حذف
├── thunkGetLawsuitFacts.ts         ← حذف
├── thunkAddLawsuitFacts.ts         ← حذف
├── thunkGetLawsuitLegalBasis.ts    ← حذف
├── thunkAddLawsuitLegalBasis.ts    ← حذف
├── thunkGetLawsuitRequests.ts      ← حذف
├── thunkAddLawsuitRequests.ts      ← حذف
```

### 2.3 — Shared Components Migration (HIGH-05, MED-09)

**الهدف:** كل step components تستخدم `useAnalysisStep` + `AnalysisStepShell` + `SmartAnalysisLoader`

| المهمة | المشكلة | الملفات |
|--------|---------|---------|
| ترحيل مذكرة الدفاع step components | HIGH-05 | 5 components في `src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/` — `FactsReview.tsx`, `LegalAnalysis.tsx`, `DefensesList.tsx`, `FinalRequirements.tsx`, `FinalNote.tsx` ← لفها بـ `AnalysisStepShell` وربطها بـ `useAnalysisStep` |
| ترحيل صحيفة الدعوى step components | HIGH-05 | 7 components في `src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/steps/` ← نفس العملية |
| توحيد Loading States | MED-09 | `DefenseMemoPage.tsx` — إزالة Mantine Loader واستبداله بـ `SmartAnalysisLoader` |

**البنية الموحدة المستهدفة لكل step component:**
```tsx
// قبل (legacy):
const FactsReview = () => {
  const dispatch = useDispatch();
  const { data, isLoading } = useSelector(state => state.smartAnalysis);
  // loading/error handling يدوي
};

// بعد (unified):
const FactsReview = () => {
  const { stepData, isLoading, error, runStep, saveStep } = useAnalysisStep({
    stepNumber: 1,
    workflowType: 'smartAnalysis',
  });
  return (
    <AnalysisStepShell isLoading={isLoading} error={error}>
      {/* step content */}
    </AnalysisStepShell>
  );
};
```

### مخرجات المرحلة 2 المتوقعة

- **قبل:** 3 أنماط Frontend (Legacy Thunks, AI Jobs + createWorkflowSlice, AI Jobs + Dual Slice)
- **بعد:** نمط واحد — كل المراحل تستخدم `createWorkflowSlice` + `createWorkflowThunks` + `useAiJobSignalR`
- **حذف:** ~17 ملف (12 legacy thunk + 4 dead thunk + 1 dead slice)
- **توفير:** ~800 سطر كود مكرر

---

## المرحلة 3: Consistency & Polish
**النطاق:** Error Handling + Validation + Naming + Code Quality + Documentation
**المشاكل المغطاة:** CRIT-01, HIGH-04, HIGH-09, HIGH-10, MED-01, MED-04, MED-07, MED-10, MED-12, MED-14, LOW-01, LOW-02, LOW-03, MED-05, MED-06, MED-11, MED-15, MED-16
**الملفات المتأثرة:** ~20 ملف
**شرط مسبق:** انتهاء المرحلة 1 + 2

### 3.1 — Error Handling & Validation (CRIT-01, HIGH-04, HIGH-09)

| المهمة | المشكلة | التفاصيل |
|--------|---------|----------|
| توسيع `StepOutputSchemas` لكل 7 مراحل | CRIT-01 | الملف: `Lawyer.Application/Services/Workflows/StepOutputSchemas.cs` — حالياً يغطي RulingAnalysis فقط (step types 51-54). إضافة schemas لكل step types في المراحل 1-4, 6-7 |
| توحيد `ExtractAdditionalInput` أو استخراج generic input mapping | HIGH-04 | `AdminComplaintService.cs` يستخدم `ExtractAdditionalInput` بينما الباقي يمرر input كما هو. توحيد في `WorkflowServiceBase` |
| توحيد Error Response Pattern | HIGH-09 | كل الخدمات تستخدم `Result<T>.Error()` بدلاً من `_result.BadRequest<T>()`. توحيد الاختيار في `WorkflowServiceBase` |

### 3.2 — Consistency Fixes (HIGH-10, MED-01, MED-04, MED-10, MED-14)

| المهمة | المشكلة | التفاصيل |
|--------|---------|----------|
| ترحيل مذكرة الدفاع لـ Workflow Entity موحد | HIGH-10 (طويل المدى) | المرحلة 1 تخزن في 3 جداول منفصلة (`FactAnalysis`, `Defense`, `FinalPrayer`). إنشاء `SmartAnalysisWorkflow` model يرث `WorkflowBase` ← يتطلب EF migration |
| نقل `AppealBriefService` من `IApplicationDbContext` إلى `IUnitOfWork` | MED-01 | جزء من 1.2 — إذا لم يتم تنفيذه في المرحلة 1 |
| إضافة `ExecuteTitleType` للـ DTO | MED-04 | الملف: `ExecRequestWorkflowDto.cs` — إضافة field المفقود |
| توحيد Abandon functionality | MED-10 | إضافة `Abandon` endpoint في `WorkflowServiceBase` ← المرحلتان 1-2 لا يدعمانه |
| إزالة `IHttpContextAccessor` غير المستخدم | MED-14 | `RulingAnalysisService.cs` و `ExecRequestService.cs` — إزالة من constructor و DI |

### 3.3 — Code Quality (MED-07, MED-12)

| المهمة | المشكلة | الملف |
|--------|---------|-------|
| إصلاح structured logging | MED-07 | `SmartAnalysisService.cs` — استبدال `$"..."` بـ template parameters `"...{CaseId}", request.CaseId` |
| إزالة unused variable + duplicate import | MED-12 | `RulingAnalysisService.cs:196-203` (unused `stepOutputProperty`), `lines 10-11` (duplicate `using`) |

### 3.4 — Naming (LOW-01, LOW-02)

| المهمة | المشكلة | التفاصيل |
|--------|---------|----------|
| توحيد Frontend ↔ Backend naming | LOW-01 | `SmartAnalysisService` → `smartAnalysis` (Redux) → `defenseMemoPage` (folder). اعتماد naming واحد متسق |
| إعادة تسمية `appeal-brief` folder | LOW-02 | تحويل لـ camelCase مثل باقي المجلدات |

### 3.5 — Documentation & Prompts (MED-05, MED-06, MED-11, MED-15, MED-16, LOW-03)

| المهمة | المشكلة | التفاصيل |
|--------|---------|----------|
| توحيد طريقة تحميل Prompts | MED-05 | المراحل 1-3 تستخدم hardcoded/inline prompts. نقلها لملفات خارجية مثل المراحل 4-7. **لا يتم تعديل محتوى الـ prompts** |
| إنشاء mapping.txt للمراحل الناقصة | MED-06 | إضافة mapping.txt للمراحل 1, 2, 7 |
| تنظيف ملفات prompts المكررة (إنذار رسمي) | MED-11 | حذف الملفات البديلة غير المستخدمة |
| إزالة hardcoded StageDefinitions | MED-15 | `AiModelConfigService` — تحويل لـ config-driven بدلاً من hardcoded |
| تحديث mapping.txt الرئيسي | MED-16 | الملف يشير لأسماء غير موجودة — تحديثه |
| توثيق AIRequestOptions presets | LOW-03 | إعادة تسمية presets المرتبطة بمذكرة الدفاع فقط |

### مخرجات المرحلة 3 المتوقعة

- كل مرحلة تتبع نفس validation pipeline (StepOutputSchemas)
- Error responses موحدة
- Abandon متاح لكل المراحل
- Zero dead code و zero unused imports
- Naming متسق بين Backend ↔ Frontend
- Prompts في ملفات خارجية لكل المراحل
- توثيق محدث

---

## ملخص التنفيذ

| المرحلة | المدة التقديرية | المشاكل | ملفات Backend | ملفات Frontend |
|---------|----------------|---------|--------------|----------------|
| **1. Backend Unification** | 3-5 أيام | 15 مشكلة (5 P0, 7 P1, 3 P2) | ~25 | 0 |
| **2. Frontend Unification** | 2-4 أيام | 7 مشاكل (0 P0, 5 P1, 2 P2) | 0 | ~35 |
| **3. Consistency & Polish** | 2-3 أيام | 18 مشكلة (1 P0, 4 P1, 9 P2, 4 P3) | ~10 | ~10 |
| **الإجمالي** | **7-12 يوم** | **40 مشكلة** | **~35** | **~45** |

### مخاطر واعتبارات

1. **المرحلة 1.3 (Parsing) + المرحلة 2.2 (Redux) مرتبطتان:** ترحيل Newtonsoft → System.Text.Json سيكسر frontend المرحلتين 1-2. يجب تنسيق الترحيل معاً.
2. **HIGH-10 (مذكرة الدفاع جداول منفصلة):** يتطلب EF migration + data migration. يمكن تأجيله لمرحلة لاحقة إذا كان الوقت ضيقاً.
3. **الاختبار:** كل مرحلة يجب أن تنتهي بـ regression test لكل 7 مراحل تحليل.
4. **الترتيب صارم:** المرحلة 2 تعتمد على 1 ( parsing changes). المرحلة 3 تعتمد على 1+2 (النظام الموحد يجب أن يكون موجوداً قبل polish).

### خريطة المشاكل → المراحل

```
CRIT-01 StepOutputSchemas        → Phase 3.1
CRIT-02 AppealBrief Security     → Phase 1.4
CRIT-03 Mixed JSON Libraries     → Phase 1.3
CRIT-04 CleanJsonResponse ×5     → Phase 1.1
CRIT-05 Workflow Models ×5       → Phase 1.2
CRIT-06 Service Duplication      → Phase 1.2
CRIT-07 New Pipeline = 15 Files  → Phase 1.2
CRIT-08 3+1 Backend Patterns     → Phase 1 (كله)
HIGH-01  AiJobWorker Duplication → Phase 1.2
HIGH-02  Dead Code (Ruling)      → Phase 2.1
HIGH-03  BuildCaseContext ×5      → Phase 1.1
HIGH-04  Input Mapping            → Phase 3.1
HIGH-05  Step Components Legacy   → Phase 2.3
HIGH-06  Thunks Legacy            → Phase 2.2
HIGH-07  Prompt Building          → Phase 1.2 (via WorkflowServiceBase)
HIGH-08  Case Access Validation   → Phase 1.4
HIGH-09  Error Handling           → Phase 3.1
HIGH-10  Separate Tables          → Phase 3.2
HIGH-11  BuildPreviousSteps ×5    → Phase 1.1
HIGH-12  MapToDto ×5              → Phase 1.2
HIGH-13  DTOs ×5                  → Phase 1.2
HIGH-14  SnakeCase 1-2            → Phase 1.3 + 2.2
HIGH-15  Hydration Legacy         → Phase 2.2
MED-01   IApplicationDbContext    → Phase 3.2
MED-02   DeserializeOutput ×4     → Phase 1.1
MED-03   TryExtractJsonPayload    → Phase 1.1
MED-04   Missing DTO Field        → Phase 3.2
MED-05   Prompt Loading           → Phase 3.5
MED-06   mapping.txt Missing      → Phase 3.5
MED-07   Structured Logging       → Phase 3.3
MED-08   CancellationToken        → Phase 1.4
MED-09   Loading States           → Phase 2.3
MED-10   Abandon Functionality    → Phase 3.2
MED-11   Duplicate Prompt Files   → Phase 3.5
MED-12   Unused Variable/Import   → Phase 3.3
MED-13   Redux Slice Org          → Phase 2.2
MED-14   Unused IHttpContextAcc   → Phase 3.2
MED-15   Hardcoded StageDefs      → Phase 3.5
MED-16   Stale mapping.txt        → Phase 3.5
LOW-01   Naming Consistency       → Phase 3.4
LOW-02   Folder Naming            → Phase 3.4
LOW-03   Preset Naming            → Phase 3.5
LOW-04   Single-Use Component     → (لا يتطلب phase)
```
