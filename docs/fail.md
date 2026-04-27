# Audit Failures — AI Jobs Queue + Polling Pattern (Phases 3-7)

**Date**: 2026-04-11  
**Branch**: `029-ai-jobs-worker`

---

## ✅ تم الحل — كل المشاكل

### FIXED-001 — AppealBrief migrated to Queue pattern

**الملفات المتغيرة:**

| الملف | التغيير |
|-------|---------|
| `src/redux/aiJobs/aiJobsSlice.ts` | أُضيف `AppealBriefJudgmentData`, `AppealBriefReasoningAnalysis`, `AppealBriefGrounds`, `AppealBriefRequests`, `AppealBriefLegalBasis`, `AppealBriefAssembly` لـ `AiStepType` |
| `src/redux/appealBrief/AppealBrief.ts` | أُضيف `hydrateStep` action + extra reducer لـ `thunkGetAppealWorkflowByCase` |
| `src/redux/appealBrief/thunk/thunkGetAppealWorkflowByCase.ts` | ملف جديد — يجيب آخر workflow للـ case عبر `GET /AppealBrief/case/{caseId}` |
| `src/pages/.../appeal-brief/AppealBriefPage.tsx` | تم استبدال `thunkRunAppealStep` + `thunkStartAppealWorkflow` بـ `thunkSubmitAiJob` + `useAiJobSignalR` |

**التدفق الجديد:**
1. على mount: `thunkGetAppealWorkflowByCase` → يستعيد الـ workflow والـ workflowId (للـ edit feature)
2. `useAiJobSignalR` → يشترك في SignalR + polling للـ active jobs
3. زر "بدء مسار" → `thunkSubmitAiJob(AppealBriefJudgmentData, { caseId, input: selectedFacts })`
4. أزرار "تشغيل المرحلة" → `thunkSubmitAiJob(AppealBriefStep*, { caseId })`
5. عند اكتمال الـ job → `hydrateStep` من `job.resultJson`
6. بعد اكتمال أي job → re-fetch الـ workflow لتحديث الـ workflowId
7. Edit (حفظ تعديل) → `thunkSaveEditedStep` لا يزال يعمل بالـ workflowId

---

### FIXED-002 — `Chat` و `Ocr` موجودين في الـ switch (كانت مصلوحة مسبقاً)

`AiJobWorker.cs` عنده cases صح لكل step types.

---

### FIXED-003 — Admin dashboard `strictPort: true` (تم تلقائياً)

`mohamy-smart-admin-dashboard/vite.config.ts` عنده `strictPort: true` على port 5079.

---

## الحالة النهائية

| الميزة | Pattern | Worker Switch | Frontend Submit |
|--------|---------|---------------|-----------------|
| مذكرة الدفاع | Queue ✅ | ✅ | thunkSubmitAiJob ✅ |
| صحيفة الدعوى | Queue ✅ | ✅ | thunkSubmitAiJob ✅ |
| مذكرة الطعن | Queue ✅ | ✅ | thunkSubmitAiJob ✅ **← تم الإصلاح** |
| شكوى إدارية | Queue ✅ | ✅ | thunkSubmitAiJob ✅ |
| تحليل حكم | Queue ✅ | ✅ | thunkSubmitAiJob ✅ |
| إنذار قانوني | Queue ✅ | ✅ | thunkSubmitAiJob ✅ |
| طلب تنفيذ | Queue ✅ | ✅ | thunkSubmitAiJob ✅ |
