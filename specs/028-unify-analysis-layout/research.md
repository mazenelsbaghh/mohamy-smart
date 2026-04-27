# Research: توحيد صفحات التحليل القانوني

**Feature**: 028-unify-analysis-layout  
**Date**: 2026-04-10

---

## ⚠️ تحديث معماري جوهري

**القرار الجديد**: جميع المسارات ستتحول من **Direct API call** إلى **AI Jobs queue + polling** — نفس pattern مذكرة الدفاع وصحيفة الدعوى تمامًا.

**السبب**: تجربة المستخدم المتسقة — المحامي يضغط زر "التالية" فينتقل فورًا للمرحلة التالية ويرى `SmartAnalysisLoader` أثناء معالجة الـ AI، لا ينتظر على الصفحة الحالية.

---

## Q1: Redux State Shape — القرار المعماري الجديد

**Decision**: نتخلى عن `stepsOutputs[]` و`step{n}Output` الخاصة بالمسارات القديمة — كل مسار سيستخدم:
1. **`aiJobs.jobs[stepType]`** لمتابعة حالة كل Job (Queued/Processing/Completed/Failed)
2. **Redux slice خاص بكل مسار** لتخزين النتائج بعد hydration من `resultJson`

**الـ flow الجديد لكل step**:
```
[المستخدم يضغط "تشغيل"]
  → dispatch(thunkSubmitAiJob({ caseId, stepType, inputJson }))
  → setActive(nextStep) — ينتقل فورًا للمرحله التالية
  → المرحلة التالية تعرض SmartAnalysisLoader
  → polling: useEffect يراقب job.status
  → عند status === 'Completed': dispatch(hydrateXResult(JSON.parse(job.resultJson)))
  → SmartAnalysisLoader يختفي وتظهر النتيجة المهيكلة
```

**Alternatives Considered**: الإبقاء على direct API — رُفض لأن المستخدم يريد نفس UX pattern بالضبط.

---

## Q2: AiStepType — Backend Integration

**Discovery**: `AiStepType` enum في `aiJobsSlice.ts` يحتوي حاليًا على:
```typescript
| 'FactAnalysis' | 'GenerateDefenses' | 'AnalysisDefense' | 'FinalRequirements'
| 'LawsuitCaseType' | 'LawsuitParties' | 'LawsuitSubjects'
| 'LawsuitFacts' | 'LawsuitLegalBasis' | 'LawsuitRequests' | 'Ocr'
```

**يجب إضافة step types جديدة** للمسارات الخمسة:

```typescript
// Legal Warning
| 'WarningClassification' | 'WarningDraft' | 'WarningFinalAssembly'

// Ruling Analysis
| 'RulingVerdictAnalysis' | 'RulingReasonsAnalysis'
| 'RulingDefectsEvaluation' | 'RulingAppealViability'

// Admin Complaint
| 'ComplaintClassification' | 'ComplaintFactsDraft'
| 'ComplaintViolationAnalysis' | 'ComplaintRequestsDraft' | 'ComplaintFinalAssembly'

// Appeal Brief — يستخدم بالفعل API مختلف — يُراجع
// Exec Request — يُضاف لو قررنا التحويل
| 'ExecRequestClassification' | 'ExecRequestDrafting' | 'ExecRequestAssembly'
```

**⚠️ BLOCKER**: هذه الأنواع يجب أن تكون مسجلة في الـ Backend أيضًا — يلزم التنسيق مع Backend قبل التنفيذ أو التأكد من أن `/cases/{caseId}/ai-jobs` يقبل أي `stepType` string.

**Decision**: إضافة الأنواع الجديدة في `aiJobsSlice.ts` في Lawyer Dashboard + التنسيق مع Backend لتسجيلها.

---

## Q3: SmartAnalysisLoader — الاستخدام

**Discovery**: `SmartAnalysisLoader` يقبل `title` و`subtitle` اختياريين — يُعرض عبر الـ Layout الكامل (min-h-500px).

**القاعدة الجديدة**: في كل مرحلة، إذا كان `job.status === 'Queued' || job.status === 'Processing'` أو `job.status === 'Completed' && !result` → يُعرض `SmartAnalysisLoader` بعنوان مناسب للخطوة.

**Pattern في كل step component**:
```typescript
const isProcessingJob = job?.status === 'Queued' || job?.status === 'Processing';
const isWaitingForHydration = job?.status === 'Completed' && !result;
const showLoader = isProcessingJob || isWaitingForHydration;

if (showLoader) return <SmartAnalysisLoader title="..." subtitle="..." />;
```

---

## Q4: Hydration Pattern

**Discovery**: كل مسار يحتاج:
1. **Redux slice جديد** (أو تحديث الموجود) يخزن النتائج بعد parse من `resultJson`
2. **hydrate actions** تُطلق في `useEffect` عند `job.status === 'Completed'`
3. **`thunkGetAllAiJobs({ caseId })`** يُستدعى عند mount لاسترجاع الـ jobs الموجودة

**Decision**: إنشاء slices جديدة لكل مسار تحتوي على الـ hydrated state — أو استخدام Zustand-style في نفس الـ slice مع تقسيم الـ state حسب المسار.

**المقترح الأبسط**: إنشاء slice جديد لكل مسار:
- `legalWarningSlice` → `{ classification, warningDraft, finalDocument }`
- `rulingAnalysisSlice` → `{ verdictAnalysis, reasonsAnalysis, defects, appealViability }`
- `adminComplaintSlice` → `{ classification, facts, violations, requests, finalDocument }`

---

## Q5: Transition Pattern (الانتقال من Step لـ Step)

**القرار**: نفس pattern `LawsuitFacts.tsx` بالضبط:

```
[المستخدم في Step (N) يضغط "التالية"]
  → dispatch(thunkSubmitAiJob) لـ Step (N+1)  
  → nextStep() — ينتقل فورًا
  → Step (N+1) يرى job.status === 'Queued' → يعرض SmartAnalysisLoader
  → polling/useEffect ينتظر 'Completed'
  → hydration → نتيجة مهيكلة
```

**ملاحظة**: بعض المراحل تحتاج input من المستخدم (مثل Step 1 في LegalWarning — حقل الوقائع). في هذه الحالة:
- Step 1 يحتوي Textarea + زر "تشغيل"
- بعد الضغط: `dispatch(submit)` + `nextStep()` في نفس الوقت

---

## Q6: AppealBrief — هل يتحول أيضًا؟

**Discovery**: `AppealBriefPage` له Redux pattern خاص به — يبدو أنه يستخدم system مختلف.

**Decision**: يُراجع AppealBriefPage بشكل منفصل — لو كان يستخدم AI Jobs بالفعل يُحافظ عليه، لو لا يُحوَّل أيضًا.

---

## Q7: ExecRequest — هل يتحول أيضًا؟

**الوضع الحالي**: ExecRequest يستخدم `thunkRunExecStep` (direct API) — تم بناء steps جديدة له مؤخرًا.

**Decision**: يُحوَّل أيضًا لـ AI Jobs pattern — يلزم:
1. إضافة step types: `ExecRequestClassification`, `ExecRequestDrafting`, `ExecRequestAssembly`
2. إنشاء `execRequestAiSlice` جديد بدلًا من استخدام `execRequest` slice الحالي
3. إعادة كتابة الـ step components الثلاثة

**⚠️ هذا يعني أن ExecStep1-3 التي بُنيت مؤخرًا ستُعاد كتابتها بالـ AI Jobs pattern.**

---

## Rule التسلسل الصحيح لكل Step Component

```typescript
const StepN = ({ nextStep }) => {
  const dispatch = useAppDispatch();
  const { caseId } = useParams();
  const aiJobsState = useAppSelector(s => s.aiJobs);
  const job = aiJobsState.jobs['StepNType'];
  const result = useAppSelector(s => s.xSlice.stepNResult);

  const isProcessingJob = job?.status === 'Queued' || job?.status === 'Processing';
  const isWaitingForHydration = job?.status === 'Completed' && !result;
  const showLoader = isProcessingJob || isWaitingForHydration;

  // Hydration
  useEffect(() => {
    if (job?.status === 'Completed' && job.resultJson && !result) {
      try {
        const parsed = JSON.parse(job.resultJson);
        dispatch(hydrateStepN(parsed));
      } catch { /* ignore */ }
    }
  }, [job?.status, job?.resultJson, result]);

  // Auto-submit (للمراحل التي لا تحتاج input)
  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    if (hasAutoSubmitted.current || result || job) return;
    hasAutoSubmitted.current = true;
    dispatch(thunkSubmitAiJob({ caseId, stepType: 'StepNType', inputJson: '{}' }));
  }, [result, job]);

  if (showLoader) return <SmartAnalysisLoader title="..." subtitle="..." />;
  if (job?.status === 'Failed') return <ErrorBanner />;
  if (!result) return <ReadyToRunPlaceholder />;

  return (
    <div className="w-full mt-4 pb-12">
      <SubTitle title="..." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6 items-start">
        {/* 2/3: structured output */}
        {/* 1/3: sticky sidebar + nextStep button */}
      </div>
    </div>
  );
};
```
