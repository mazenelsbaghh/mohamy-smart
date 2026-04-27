# Tasks: توحيد صفحات التحليل القانوني (028-unify-analysis-layout)

**Input**: Design documents from `/specs/028-unify-analysis-layout/`  
**Branch**: `028-unify-analysis-layout`  
**Reference files**: `LawsuitFacts.tsx`, `FactsReview.tsx` (do NOT modify these)

---

## Phase 1: Setup (البنية التحتية المشتركة)

**Purpose**: إعداد الـ Redux slices الجديدة وتوسيع `AiStepType` قبل أي عمل على الصفحات

-[x] T001 Add new `AiStepType` values (`WarningClassification`, `WarningDraft`, `WarningFinalAssembly`, `RulingVerdictAnalysis`, `RulingReasonsAnalysis`, `RulingDefectsEvaluation`, `RulingAppealViability`, `ComplaintClassification`, `ComplaintFactsDraft`, `ComplaintViolationAnalysis`, `ComplaintRequestsDraft`, `ComplaintFinalAssembly`, `ExecClassification`, `ExecDrafting`, `ExecAssembly`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/aiJobs/aiJobsSlice.ts`

-[x] T002 [P] Create `legalWarningAiSlice.ts` with state shape `{ classification, warningDraft, finalDocument }` and hydrate actions (`hydrateClassification`, `hydrateWarningDraft`, `hydrateFinalDocument`) and `resetLegalWarningAi` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/legalWarning/legalWarningAiSlice.ts`

-[x] T003 [P] Create `rulingAnalysisAiSlice.ts` with state shape `{ verdictAnalysis, reasonsAnalysis, defectsEvaluation, appealViability }` and hydrate actions and `resetRulingAnalysisAi` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/rulingAnalysis/rulingAnalysisAiSlice.ts`

-[x] T004 [P] Create `adminComplaintAiSlice.ts` with state shape `{ classification, factsDraft, violationAnalysis, requestsDraft, finalDocument }` and hydrate actions and `resetAdminComplaintAi` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/adminComplaint/adminComplaintAiSlice.ts`

-[x] T005 [P] Create `execRequestAiSlice.ts` with state shape `{ classification, drafting, finalAssembly }` and hydrate actions and `resetExecRequestAi` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/execRequest/execRequestAiSlice.ts`

-[x] T006 Register all 4 new slices in the Redux store in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/store.ts` — add `legalWarningAi`, `rulingAnalysisAi`, `adminComplaintAi`, `execRequestAi` keys (depends on T002, T003, T004, T005)

-[x] T007 Create destination directory structure for all migrated pages: `cases/subPagesCases/analysis/legalWarning/steps/`, `cases/subPagesCases/analysis/rulingAnalysis/steps/`, `cases/subPagesCases/analysis/adminComplaint/steps/`, `cases/subPagesCases/analysis/execRequest/steps/`, `cases/subPagesCases/analysis/appeal-brief/` — run `mkdir -p` for each path under `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/`

**Checkpoint**: الـ Redux slices الجديدة مسجلة في الـ store، الـ AiStepType يحتوي على جميع الأنواع الجديدة، مجلدات الوجهة موجودة

---

## Phase 2: Foundational (المتطلبات الأساسية)

**Purpose**: مكون مشترك لرسالة الخطأ، ومجلد الوجهة، وتأكيد الـ SmartAnalysisLoader API

-[x] T008 Verify `SmartAnalysisLoader` props interface (`title?: string`, `subtitle?: string`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/skeleton/SmartAnalysisLoader.tsx` — no changes needed, just confirm import path for use in new steps

-[x] T009 Create shared `StepErrorBanner` inline component pattern (to be copy-pasted into each step): a `div.flex.items-center.gap-3.p-4.mb-4.bg-red-50.border.border-red-200.rounded-xl` with error message text and a "إعادة المحاولة" button — document pattern in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/028-unify-analysis-layout/research.md` under new section "Q8: StepErrorBanner pattern"

**Checkpoint**: الأدوات المشتركة موثقة وجاهزة للاستخدام في كل step

---

## Phase 3: US4 — AI Jobs Queue + SmartAnalysisLoader (Priority: P0) 🎯 أولوية قصوى

**Goal**: تحويل جميع المسارات لـ AI Jobs queue + polling — المحامي ينتقل فورًا للمرحلة التالية ويرى SmartAnalysisLoader

**Independent Test**: ضغط زر "تشغيل" في أي مرحلة → لا blocking → SmartAnalysisLoader في المرحلة التالية

### Implementation for US4 — LegalWarning Steps

-[x] T010 [US4] Create `WarningStep1Classification.tsx` using AI Jobs pattern (auto-submit `WarningClassification` job on mount via `useRef` guard, show `SmartAnalysisLoader` while `job.status === 'Queued'|'Processing'` or `status === 'Completed' && !result`, hydrate `classification` from `resultJson` via `hydrateClassification`, call `nextStep()` only after result is available via button) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep1Classification.tsx` (depends on T002, T006)

-[x] T011 [US4] Create `WarningStep2WarningDraft.tsx` using AI Jobs pattern (submit `WarningDraft` job with `inputJson` from `classification.warningBody`, show `SmartAnalysisLoader`, hydrate `warningDraft`, display in grid 3-col layout with sticky sidebar) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep2WarningDraft.tsx` (depends on T010)

-[x] T012 [US4] Create `WarningStep3FinalAssembly.tsx` using AI Jobs pattern (submit `WarningFinalAssembly` job, show `SmartAnalysisLoader`, hydrate `finalDocument`, display document text with `dangerouslySetInnerHTML` and yellow-highlighted placeholders via `<mark>` tags) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep3FinalAssembly.tsx` (depends on T011)

-[x] T013 [US4] Create `LegalWarningPage.tsx` using `AnalysisWorkflowShell` + `CaseHeaderBanner` + `Container`, dispatch `thunkGetAllAiJobs({ caseId })` on mount to hydrate existing jobs, pass steps array and `activeViewStep`/`setActiveViewStep` state, render start-screen grid (2/3 content + 1/3 sticky sidebar) when no jobs exist in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/LegalWarningPage.tsx` (depends on T002, T010, T011, T012)

### Implementation for US4 — RulingAnalysis Steps

-[x] T014 [P] [US4] Create `RulingStep1VerdictAnalysis.tsx` using AI Jobs pattern (auto-submit `RulingVerdictAnalysis` job, show `SmartAnalysisLoader`, hydrate `verdictAnalysis` with fields `verdictSummary`, `verdictPoints[]`, `charges[]`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep1VerdictAnalysis.tsx` (depends on T003, T006)

-[x] T015 [US4] Create `RulingStep2ReasonsAnalysis.tsx` using AI Jobs pattern (submit `RulingReasonsAnalysis`, show `SmartAnalysisLoader`, hydrate `reasonsAnalysis` with `reasoningPoints[]`, `keyFindings[]`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep2ReasonsAnalysis.tsx` (depends on T014)

-[x] T016 [US4] Create `RulingStep3DefectsEvaluation.tsx` using AI Jobs pattern (submit `RulingDefectsEvaluation`, show `SmartAnalysisLoader`, hydrate `defectsEvaluation` with `defects[{ description, severity }]`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep3DefectsEvaluation.tsx` (depends on T015)

-[x] T017 [US4] Create `RulingStep4AppealViability.tsx` using AI Jobs pattern (submit `RulingAppealViability`, show `SmartAnalysisLoader`, hydrate `appealViability` with `isAppealViable`, `appealStrength`, `recommendedGrounds[]`, `conclusion`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep4AppealViability.tsx` (depends on T016)

-[x] T018 [US4] Create `RulingAnalysisPage.tsx` using `AnalysisWorkflowShell` + `CaseHeaderBanner` + `Container`, dispatch `thunkGetAllAiJobs({ caseId })` on mount, handle start-screen with Textarea for ruling text input, 4-step workflow in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage.tsx` (depends on T003, T014, T015, T016, T017)

### Implementation for US4 — AdminComplaint Steps

-[x] T019 [P] [US4] Create `ComplaintStep1Classification.tsx` using AI Jobs pattern (auto-submit `ComplaintClassification`, show `SmartAnalysisLoader`, hydrate `classification` with `complaintType`, `targetAuthority`, `legalBasis`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep1Classification.tsx` (depends on T004, T006)

-[x] T020 [US4] Create `ComplaintStep2FactsDraft.tsx` using AI Jobs pattern (submit `ComplaintFactsDraft`, show `SmartAnalysisLoader`, hydrate `factsDraft` with `factsSummary`, `keyFacts[]`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep2FactsDraft.tsx` (depends on T019)

-[x] T021 [US4] Create `ComplaintStep3ViolationAnalysis.tsx` using AI Jobs pattern (submit `ComplaintViolationAnalysis`, show `SmartAnalysisLoader`, hydrate `violationAnalysis` with `violations[{ description, legalRef }]`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep3ViolationAnalysis.tsx` (depends on T020)

-[x] T022 [US4] Create `ComplaintStep4RequestsDraft.tsx` using AI Jobs pattern (submit `ComplaintRequestsDraft`, show `SmartAnalysisLoader`, hydrate `requestsDraft` with `requests[]`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep4RequestsDraft.tsx` (depends on T021)

-[x] T023 [US4] Create `ComplaintStep5FinalAssembly.tsx` using AI Jobs pattern (submit `ComplaintFinalAssembly`, show `SmartAnalysisLoader`, hydrate `finalDocument` with `documentText`, display with placeholder highlight via `dangerouslySetInnerHTML`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep5FinalAssembly.tsx` (depends on T022)

-[x] T024 [US4] Create `AdminComplaintPage.tsx` using `AnalysisWorkflowShell` + `CaseHeaderBanner` + `Container`, dispatch `thunkGetAllAiJobs({ caseId })` on mount, handle start-screen with Textarea for complaint facts, 5-step workflow in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/AdminComplaintPage.tsx` (depends on T004, T019, T020, T021, T022, T023)

### Implementation for US4 — ExecRequest Steps (Rewrite)

-[x] T025 [P] [US4] Rewrite `ExecStep1Classification.tsx` from direct-API pattern to AI Jobs pattern (submit `ExecClassification` job, show `SmartAnalysisLoader`, hydrate `classification` from `execRequestAiSlice`, display structured output) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/steps/ExecStep1Classification.tsx` (depends on T005, T006)

-[x] T026 [US4] Rewrite `ExecStep2Drafting.tsx` from direct-API to AI Jobs pattern (submit `ExecDrafting` job, show `SmartAnalysisLoader`, hydrate `drafting`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/steps/ExecStep2Drafting.tsx` (depends on T025)

-[x] T027 [US4] Rewrite `ExecStep3Assembly.tsx` from direct-API to AI Jobs pattern (submit `ExecAssembly` job, show `SmartAnalysisLoader`, hydrate `finalAssembly`, display document with placeholder highlight) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/steps/ExecStep3Assembly.tsx` (depends on T026)

-[x] T028 [US4] Rewrite `ExecRequestPage.tsx` to dispatch `thunkGetAllAiJobs({ caseId })` on mount (replacing `thunkGetExecWorkflow`), remove legacy `workflow.id`/`currentStep` state, use `execRequestAiSlice` instead of `execRequest` slice in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/ExecRequestPage.tsx` (depends on T005, T025, T026, T027)

**Checkpoint**: جميع step components تستخدم AI Jobs pattern — المحامي ينتقل فورًا مع SmartAnalysisLoader بين الخطوات في كل مسار

---

## Phase 4: US1+US2 — نقل الصفحات وتوحيد الشكل (Priority: P1)

**Goal**: نقل جميع الصفحات إلى `cases/subPagesCases/analysis/` وتوحيد الـ shell مع AnalysisWorkflowShell

**Independent Test**: فتح أي مسار عبر router → يحمّل من المسار الجديد بدون 404، يعرض CaseHeaderBanner + AnalysisWorkflowShell

-[x] T029 [P] [US1] Copy `AppealBriefPage.tsx` from `pages/appealBrief/` to `pages/cases/subPagesCases/analysis/appeal-brief/AppealBriefPage.tsx`, update all relative imports to absolute paths from new location in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appeal-brief/AppealBriefPage.tsx`

-[x] T030 [P] [US1] Copy all step files from `pages/appealBrief/steps/` to `pages/cases/subPagesCases/analysis/appeal-brief/steps/`, update all relative imports in each step file in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appeal-brief/steps/`

-[x] T031 [US1] Update `AppRouter.tsx` to import `LegalWarningPage` from new path `cases/subPagesCases/analysis/legalWarning/LegalWarningPage`, `RulingAnalysisPage` from `cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage`, `AdminComplaintPage` from `cases/subPagesCases/analysis/adminComplaint/AdminComplaintPage`, `AppealBriefPage` from `cases/subPagesCases/analysis/appeal-brief/AppealBriefPage`, `ExecRequestPage` from `cases/subPagesCases/analysis/execRequest/ExecRequestPage` — keep all route paths unchanged in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/router/AppRouter.tsx` (depends on T013, T018, T024, T028, T029)

-[x] T032 [US2] Delete legacy page files after confirming AppRouter imports are working: remove `src/pages/legalWarning/`, `src/pages/rulingAnalysis/`, `src/pages/adminComplaint/`, `src/pages/appealBrief/`, `src/pages/execRequest/` directories from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/` (depends on T031 — only after verifying no broken imports)

**Checkpoint**: جميع الصفحات في `cases/subPagesCases/analysis/`، الـ router يحمّلها بدون أخطاء، المجلدات القديمة محذوفة

---

## Phase 5: US5 — Output Mapping (Priority: P1)

**Goal**: كل مرحلة تعرض نتيجة الـ AI بشكل مهيكل (chips/banners/numbered lists) لا raw JSON

**Independent Test**: تشغيل أي مرحلة → النتيجة تظهر كـ chips وlists وbanner — لا `{key: value}` لا `pre` tag

### LegalWarning Output Mapping

-[x] T033 [US5] Update `WarningStep1Classification.tsx` output rendering: display `warningType` as orange chip (`rounded-full px-4 py-1.5 text-sm font-bold bg-orange-100 text-orange-800`), `legalBasis.description` in a `CustomCard` with `text-xs font-bold text-gray-400` label, `obligationDetails` in a separate `CustomCard`, `recommendedAction` as orange banner (`rounded-[22px] px-5 py-4 bg-orange-50 border border-orange-200`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep1Classification.tsx` (depends on T010)

-[x] T034 [US5] Update `WarningStep2WarningDraft.tsx` output rendering: display `warningBody` in a large `CustomCard` with `leading-[2.2]` Tajawal text, `keyPoints` as numbered list items (each in `rounded-[18px] border border-gray-100 bg-[rgba(251,250,232,0.45)] px-4 py-3` with `w-6 h-6 rounded-full bg-orange-100 text-orange-700` index number) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep2WarningDraft.tsx` (depends on T011)

-[x] T035 [US5] Update `WarningStep3FinalAssembly.tsx` output rendering: display `documentText` replacing `{{placeholder}}` patterns with `<mark class="bg-yellow-100 px-1 rounded">{{placeholder}}</mark>` using `dangerouslySetInnerHTML` + regex replace, add copy button to sidebar in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep3FinalAssembly.tsx` (depends on T012)

### RulingAnalysis Output Mapping

-[x] T036 [P] [US5] Update `RulingStep1VerdictAnalysis.tsx` output rendering: display `verdictSummary` in `CustomCard`, `verdictPoints[]` as numbered list, `charges[]` as row of gray chips in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep1VerdictAnalysis.tsx` (depends on T014)

-[x] T037 [P] [US5] Update `RulingStep2ReasonsAnalysis.tsx` output rendering: display `reasoningPoints[]` as numbered list, `keyFindings[]` as cards with `text-xs font-bold text-gray-400` labels in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep2ReasonsAnalysis.tsx` (depends on T015)

-[x] T038 [P] [US5] Update `RulingStep3DefectsEvaluation.tsx` output rendering: display `defects[]` as list — each item has `description` text + `severity` as colored chip (red=خطير, orange=متوسط, gray=بسيط) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep3DefectsEvaluation.tsx` (depends on T016)

-[x] T039 [P] [US5] Update `RulingStep4AppealViability.tsx` output rendering: display `isAppealViable` as green/red banner (`rounded-[22px] px-5 py-4`), `appealStrength` as metric in sidebar (`text-5xl font-extrabold`), `recommendedGrounds[]` as numbered list, `conclusion` in `CustomCard` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep4AppealViability.tsx` (depends on T017)

### AdminComplaint Output Mapping

-[x] T040 [P] [US5] Update `ComplaintStep1Classification.tsx` output rendering: display `complaintType` as orange chip, `targetAuthority` in `CustomCard`, `legalBasis` in `CustomCard` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep1Classification.tsx` (depends on T019)

-[x] T041 [P] [US5] Update `ComplaintStep2FactsDraft.tsx` output rendering: display `factsSummary` in large `CustomCard` with `leading-[2.2]`, `keyFacts[]` as numbered list in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep2FactsDraft.tsx` (depends on T020)

-[x] T042 [P] [US5] Update `ComplaintStep3ViolationAnalysis.tsx` output rendering: display `violations[]` as list — each item has `description` text + `legalRef` as gray chip in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep3ViolationAnalysis.tsx` (depends on T021)

-[x] T043 [P] [US5] Update `ComplaintStep4RequestsDraft.tsx` output rendering: display `requests[]` as numbered list items in `CustomCard` containers in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep4RequestsDraft.tsx` (depends on T022)

-[x] T044 [P] [US5] Update `ComplaintStep5FinalAssembly.tsx` output rendering: display `documentText` with placeholder highlight via `dangerouslySetInnerHTML` + yellow `<mark>` tags, add sidebar download button in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep5FinalAssembly.tsx` (depends on T023)

### AppealBrief Output Mapping Review

-[x] T045 [P] [US5] Audit all 5 step files in `appeal-brief/steps/` for any `JSON.stringify` or `pre` tag visible to user — replace any fallback raw-object rendering with `CustomCard` + label pattern — document what was found and fixed in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appeal-brief/steps/` (depends on T029, T030)

**Checkpoint**: كل مرحلة في كل مسار تعرض نتائج مهيكلة — لا `JSON.stringify` لا `pre` لا `true/false` كنص

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: التحقق النهائي من الـ routing، حذف الملفات القديمة، التأكد من RTL/Tajawal

-[x] T046 [P] Verify `dir="rtl"` and Tajawal font usage in all new page and step files — add `style={{ fontFamily: 'Tajawal, sans-serif' }}` to any long Arabic text blocks that lack it across all new files in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/`

-[x] T047 [P] Add `resetLegalWarningAi`, `resetRulingAnalysisAi`, `resetAdminComplaintAi`, `resetExecRequestAi` calls in the `useEffect` cleanup (return function) of each Page component to prevent state leakage between cases — update `LegalWarningPage.tsx`, `RulingAnalysisPage.tsx`, `AdminComplaintPage.tsx`, `ExecRequestPage.tsx` (depends on T013, T018, T024, T028)

-[x] T048 Verify TypeScript compiles with zero errors after all changes by running `npx tsc --noEmit` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/` — fix any import path errors or type mismatches found (depends on T031)

-[x] T049 [P] Update `AGENTS.md` with new technology entry for feature 028 noting the AI Jobs queue pattern is now used across all analysis workflows in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/AGENTS.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: No dependencies — can run in parallel with Phase 1
- **Phase 3 (US4 — AI Jobs)**: Depends on Phase 1 completion — T001 and slices must be registered first
- **Phase 4 (US1+US2 — Migration)**: Depends on Phase 3 completion — pages must exist before router update
- **Phase 5 (US5 — Output Mapping)**: Can begin per-workflow as soon as that workflow's steps are complete in Phase 3
- **Phase 6 (Polish)**: Depends on Phases 3, 4, 5

### Parallel Opportunities Per Phase

**Phase 1**: T002, T003, T004, T005, T007 can all run in parallel (different slice files)  
**Phase 3**: T010-T013 (LegalWarning), T014-T018 (RulingAnalysis), T019-T024 (AdminComplaint), T025-T028 (ExecRequest) — 4 workflows can run in parallel  
**Phase 5**: All T036-T045 tasks are independent per workflow — all can run in parallel  
**Phase 6**: T046, T047, T049 can run in parallel

---

## Implementation Strategy

### MVP Scope (US4 Only — AI Jobs Migration)

1. Complete Phase 1 (T001–T007) — Redux foundation
2. Complete Phase 2 (T008–T009) — shared patterns
3. Implement LegalWarning workflow (T010–T013) as first complete example
4. **Validate**: تشغيل الإنذار الرسمي — SmartAnalysisLoader يظهر، ينتقل فورًا، النتائج تظهر بعد Completed
5. Repeat pattern for remaining 3 workflows (T014–T028)

### Incremental Delivery

1. Phase 1+2 → Foundation ready
2. Phase 3, workflow by workflow → Test each independently
3. Phase 4 → All pages migrated, router updated
4. Phase 5, workflow by workflow → Output mapped
5. Phase 6 → Polish complete

---

## Notes

- **Reference Step Files** (copy pattern from — do NOT modify): `LawsuitFacts.tsx`, `FactsReview.tsx`
- **Reference Page Files** (copy shell from — do NOT modify): `DefenseMemoPage.tsx`, `PreparingStatementOfClaims.tsx`
- All `thunkRunXStep`, `thunkSaveEditedXStep`, `thunkStartXWorkflow` thunks from old slices become **unused** after Phase 3 — do NOT delete until Phase 4 confirms everything works
- `SmartAnalysisLoader` import path: `../../../../../../components/skeleton/SmartAnalysisLoader`
- `thunkGetAllAiJobs` import path: `../../../../../../redux/aiJobs/thunk/thunkGetAllAiJobs`
- `thunkSubmitAiJob` import path: `../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob`
