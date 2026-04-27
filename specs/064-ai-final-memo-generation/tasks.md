# Tasks: AI-Powered Final Defense Memorandum Generation

**Input**: Design documents from `/specs/064-ai-final-memo-generation/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested in the specification — test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file path(s) in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Register the DefenseMemoDraft step in the pipeline and add the frontend type — these are prerequisites for all user stories.

- [X] T001 [P] Add `DefenseMemoDraft` step definition to the "smart-analysis" pipeline (change TotalSteps from 4 to 5, add `new PipelineStepDefinition { StepType = AiStepType.DefenseMemoDraft, DisplayName = "تجميع مذكرة الدفاع" }`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/PipelineRegistry.cs`

- [X] T002 [P] Add `'DefenseMemoDraft'` to the `AiStepType` union type (after the `'FinalRequirements'` entry) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/aiJobs/aiJobsSlice.ts`

**Checkpoint**: Pipeline registry and frontend types now include DefenseMemoDraft. Admin AI Model Settings page will automatically show the new step.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend DTO and service method that all frontend tasks depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Create `DefenseMemoDraftRequestDto.cs` with properties: `CaseId` (Guid), `CaseNumber` (string), `CaseType` (string), `CourtName` (string), `ClientName` (string), `ApponentName` (string), `DefendingParty` (string), `LegalFactsSummary` (List\<string\>), `DefendantsPositions` (List of nested DTO with DefendantName/RelationshipToClient/PositionSummary), `ApprovedDefenses` (List of nested DTO with DefenseTitle/BasisFromCase/Type/Explanation), `FinalRequests` (List of nested DTO with RequestLevel/RequestText). Include nested DTOs: `ApprovedDefenseInput`, `DefenseExplanationInput` (with Introduction/FactualBasis/LegalTexts/LinkingTextsToFacts/CassationPrecedents/LegalApplication/CounterArguments/LegalEffectOfAcceptance), `LegalTextInput`, `CassationPrecedentInput`, `DefendantPositionInput`, `FinalRequestInput` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/SmartAnalysis/DefenseMemoDraftRequestDto.cs`

- [X] T004 Add `GenerateDefenseMemoDraftAsync` method signature (`Task<Result<DefenseMemoDraftResponseDto>> GenerateDefenseMemoDraftAsync(DefenseMemoDraftRequestDto request, string systemUserId, CancellationToken ct)`) and create `DefenseMemoDraftResponseDto` (single property: `MemoHtml` string) to the interface in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/ISmartAnalysisService.cs` (depends on T003)

- [X] T005 Implement `GenerateDefenseMemoDraftAsync` in SmartAnalysisService: (1) build a comprehensive Arabic system prompt instructing the AI to generate a full-length Egyptian legal defense memorandum in HTML format, structured with sections for بسم الله الرحمن الرحيم, header with court/case info, الوقائع narrative, الدفوع with full legal reasoning per defense, الطلبات categorized by level, and closing; (2) serialize the request DTO fields into a structured user prompt; (3) call `_aiProviderFactory.GetModelForStepAsync(AiStepType.DefenseMemoDraft)` for admin-configured model; (4) call `_aiProviderFactory.GetProvider().SendChatCompletionAsync()` with `AIRequestOptions.ForAnalysis`; (5) record usage via `_trackingService.RecordGeminiUsageAsync`; (6) return `DefenseMemoDraftResponseDto { MemoHtml = aiResult.Data.Content }`. Handle errors with `Result<T>.Error()` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs` (depends on T003, T004)

- [X] T006 Add `case AiStepType.DefenseMemoDraft:` handler to `ExecuteStepAsync` switch in AiJobWorker: deserialize `inputJson` as `DefenseMemoDraftRequestDto` using `_jsonOptions`, set `CaseId = caseId`, call `_smartAnalysis.GenerateDefenseMemoDraftAsync(input, systemUserId, ct)`, throw on failure, serialize `result.Data` and return in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs` (depends on T004, T005)

**Checkpoint**: Backend is fully capable of processing DefenseMemoDraft AI jobs via Hangfire. Can be tested via direct API call: `POST /api/cases/{id}/ai-jobs { "stepType": "DefenseMemoDraft", "inputJson": "..." }`.

---

## Phase 3: User Story 1 — AI-Powered Memorandum Assembly (Priority: P1) 🎯 MVP

**Goal**: Lawyer triggers AI-powered memo generation from Step 5, sees a loading state, and receives a comprehensive AI-generated defense memorandum in the editor.

**Independent Test**: Complete a defense workflow through Steps 1-4, navigate to Step 5, click "Generate AI Memo", wait for completion, verify the generated document appears in the editor with proper legal structure.

### Implementation for User Story 1

- [X] T007 [US1] Refactor `FinalNote.tsx` to add AI generation state management: add state variables `isGenerating` (boolean), `aiGenerated` (boolean), and `generationError` (string | null). Import `thunkSubmitAiJob` from `../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob`, `useAppSelector` for `state.aiJobs.jobs['DefenseMemoDraft']`, and `upsertJob` from aiJobsSlice. Track the DefenseMemoDraft job status from Redux in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx` (depends on T002)

- [X] T008 [US1] Add `buildAiInputJson` helper function in `FinalNote.tsx` that collects approved data from Redux state: (1) filter defenses from `smartOutputs[2]` to only those with entries in `explanationsCache` (smartOutputs[3]); (2) for each approved defense, build an object with `defenseTitle`, `basisFromCase`, `type`, and full `explanation` from explanationsCache; (3) include `finalRequests` from `smartOutputs[4].finalPrayers`; (4) include `legalFactsSummary` and `defendantsPositions` from `smartOutputs[1]`; (5) include case metadata from `singleCase` (caseNumber, caseType, courtName, clientName, apponentName, defendingParty); (6) return the serialized JSON string in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx` (depends on T007)

- [X] T009 [US1] Add "إنشاء المذكرة بالذكاء الاصطناعي" button to the sidebar of `FinalNote.tsx`: render an `AnalysisStageActionButton` with icon `IoSparklesOutline` (import from react-icons/io5), variant="primary", that dispatches `thunkSubmitAiJob({ caseId, stepType: 'DefenseMemoDraft', inputJson: buildAiInputJson() })`. Disable the button when `isGenerating` is true or when no approved defenses exist. Show the button only when no AI memo has been generated yet (no completed DefenseMemoDraft job and no existing `smartOutputs[5]` from AI) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx` (depends on T008)

- [X] T010 [US1] Add loading state handling in `FinalNote.tsx`: when the DefenseMemoDraft job status is 'Queued' or 'Processing', show the `AnalysisStepShell` loading state with `isLoading={true}`, `loadingTitle="جاري إنشاء المذكرة بالذكاء الاصطناعي..."`, `loadingSubtitle="يقوم النظام بتحليل الدفوع والطلبات وصياغة مذكرة دفاع شاملة ومفصلة. قد تستغرق هذه العملية دقيقة أو أكثر."`. When the job fails, show an error message with a retry button in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx` (depends on T009)

- [X] T011 [US1] Add AI result hydration in `FinalNote.tsx`: add a `useEffect` that watches the DefenseMemoDraft job from Redux (`state.aiJobs.jobs['DefenseMemoDraft']`). When the job status transitions to 'Completed' and `resultJson` is not null, parse `resultJson` as JSON, extract `memoHtml`, set it as the editor content via `editorRef.current.innerHTML = memoHtml`, mark `initialized = true` and `aiGenerated = true`, and auto-save the content via `handleSaveBackend(memoHtml)`. Update the initialization `useEffect` to prioritize: (1) existing draft from `smartOutputs[5]`, (2) completed AI job result, (3) fallback to `buildMemoHTML(summary)` as legacy template in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx` (depends on T010)

- [X] T012 [US1] Add "إعادة إنشاء المذكرة" (regenerate) button to the sidebar in `FinalNote.tsx`: after the AI memo has been generated, show a secondary action button that allows the lawyer to regenerate the memo. This button dispatches the same `thunkSubmitAiJob` and resets `initialized` to false to trigger the loading state again. Add a confirmation dialog (window.confirm) warning that regeneration will overwrite the current content in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx` (depends on T011)

**Checkpoint**: At this point, the full AI-powered memo generation flow works end-to-end: lawyer clicks generate → backend processes via Hangfire → SignalR notifies → frontend hydrates result into editor. Lawyer can edit and auto-save.

---

## Phase 4: User Story 2 — Admin Model Selection (Priority: P1)

**Goal**: Admin can configure which AI model (Pro/Flash/Flash Lite) is used for the memorandum generation step.

**Independent Test**: Navigate to Admin Dashboard → AI Model Settings, verify "تجميع مذكرة الدفاع" appears under "التحليل الذكي" category, change the model, save, then trigger a memo generation and verify the backend uses the updated model.

### Implementation for User Story 2

- [X] T013 [US2] Verify admin AI Model Settings integration is automatic by confirming that PipelineRegistry change from T001 causes `GetAllIncludedStages()` to return DefenseMemoDraft with `DisplayName = "تجميع مذكرة الدفاع"` and `Category = "التحليل الذكي"`. No code change needed — this is a verification task. If the label does not appear correctly in the admin UI, debug the `GetAllIncludedStages()` output in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/PipelineRegistry.cs` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/settings/AiModelSettings.tsx` (depends on T001)

**Checkpoint**: Admin can see and change the DefenseMemoDraft model in the settings page. The selected model is respected by GenerateDefenseMemoDraftAsync.

---

## Phase 5: User Story 3 — Memorandum Quality & Content Completeness (Priority: P1)

**Goal**: The AI-generated memorandum is a comprehensive, professionally structured Egyptian legal defense document with flowing narrative, proper legal language, and all approved defenses/requests included.

**Independent Test**: Generate a memo for a case with multiple defense types and verify: (1) all approved defenses are included with full legal reasoning, (2) document has proper sections and transitions, (3) legal Arabic terminology is correct, (4) requests are categorized correctly.

### Implementation for User Story 3

- [X] T014 [US3] Refine the AI system prompt in `GenerateDefenseMemoDraftAsync` to enforce: (1) document must start with بسم الله الرحمن الرحيم; (2) include court header with case number, type, parties; (3) write "مذكرة بدفاع" title; (4) الوقائع section must be a connected narrative (not bullet points) synthesizing all facts; (5) الدفوع section must present each defense with flowing legal argumentation including: التأصيل القانوني, النصوص القانونية with full article text, السوابق القضائية with full ruling text, التطبيق على وقائع الدعوى, الرد على الحجج المضادة; (6) categorize defenses under الدفوع الشكلية / الدفوع الموضوعية / الدفوع الإثباتية with smooth transitions; (7) الطلبات section categorized as أصلياً / احتياطياً / احتياطياً كلياً; (8) closing with "وكيل المدعى عليه / المحامي"; (9) output must be clean HTML (no markdown) with proper RTL styling; (10) document must be long, detailed, and read as a complete legal brief — not a summary in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs` (depends on T005)

- [X] T015 [US3] Add identity sanitization to the AI output in `GenerateDefenseMemoDraftAsync`: apply the existing `SanitizeChatAssistantResponse` pattern to strip any AI model identity references (Gemini, ChatGPT, etc.) from the generated memorandum before returning it. Also strip markdown formatting artifacts (**,##,\`) that may leak into the HTML in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs` (depends on T014)

**Checkpoint**: AI-generated memos now follow proper Egyptian legal memorandum structure with professional Arabic legal language and complete coverage of all approved defenses.

---

## Phase 6: User Story 4 — DOCX Export of AI Memorandum (Priority: P2)

**Goal**: Lawyer can download the AI-generated (and optionally edited) memorandum as a properly formatted Word document.

**Independent Test**: Generate an AI memo, optionally edit it, click download, open the .docx file, verify it has Traditional Arabic font, justified alignment, proper headings, and reflects any edits.

### Implementation for User Story 4

- [X] T016 [US4] Add `buildDocxFromHtml` utility function in `FinalNote.tsx` that parses the contentEditable div's HTML content and converts it to `docx` Paragraphs: (1) split HTML by block-level tags (\<p\>, \<h2\>, \<h3\>, \<h4\>, \<hr\>); (2) for each block, detect if it's a heading (create centered bold paragraph with `HEADING_SIZE`) or body text (create justified paragraph with `BODY_SIZE`); (3) handle \<strong\> tags as bold TextRuns; (4) handle \<hr\> as divider paragraphs; (5) use Traditional Arabic font and LINE_SPACING constants from existing code; (6) return a `Document` object with proper page margins in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx` (depends on T011)

- [X] T017 [US4] Update `downloadDocx` function in `FinalNote.tsx` to use `buildDocxFromHtml` when `aiGenerated` is true (or when `editorRef.current` has content from AI): instead of calling `buildDocxFromSummary(summary)`, call `buildDocxFromHtml(editorRef.current.innerHTML)` to preserve the AI-generated (and potentially edited) content. Keep `buildDocxFromSummary` as fallback for legacy template-based memos in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx` (depends on T016)

**Checkpoint**: DOCX export works correctly with AI-generated content, preserving any lawyer edits.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, and documentation cleanup.

- [X] T018 Update the `AnalysisStageSidebarCard` status in `FinalNote.tsx` to reflect AI generation state: show "قيد الإنشاء بالذكاء الاصطناعي" (tone="warning") during generation, "تم الإنشاء بالذكاء الاصطناعي — جاهزة للمراجعة" (tone="success") after AI completion, and "قيد الانتظار" when no data exists in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx`

- [X] T019 Add error handling for edge cases in `FinalNote.tsx`: (1) when no defenses have explanations (no entries in explanationsCache), disable the generate button and show a tooltip "يجب تحليل دفع واحد على الأقل قبل إنشاء المذكرة"; (2) when AI generation fails, display the error message from `job.errorMessage` and provide a "إعادة المحاولة" retry button; (3) when the lawyer navigates away during generation and returns, check for an in-progress or completed DefenseMemoDraft job and resume accordingly in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx`

- [X] T020 Update the `docs/064-ai-final-memo-generation-plan.md` status from "Ready for Implementation" to "Implemented" and add a summary of actual changes made in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/064-ai-final-memo-generation-plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 and T002 can start immediately and in parallel
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) — this is the MVP
- **US2 (Phase 4)**: Depends on Phase 1 only (T001) — can run in parallel with Phase 2 and US1 as a verification task
- **US3 (Phase 5)**: Depends on T005 from Foundational — refines the AI prompt
- **US4 (Phase 6)**: Depends on US1 completion (T011) — needs AI content in editor
- **Polish (Phase 7)**: Depends on US1 + US4

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational phase — no other story dependencies. **This is the MVP.**
- **US2 (P1)**: Independent — only needs PipelineRegistry change (T001). Can verify in parallel.
- **US3 (P1)**: Depends on T005 (service method exists) — refines the prompt quality.
- **US4 (P2)**: Depends on US1 (needs AI-generated content in the editor to export).

### Within Each User Story

- Models/DTOs before services
- Services before AiJobWorker handler
- Backend before frontend
- Core implementation before polish

### Parallel Opportunities

- T001 and T002 can run in parallel (different repos: backend vs frontend)
- T003 and T004 are sequential (DTO → interface)
- T007, T008, T009, T010, T011, T012 are sequential within US1
- T013 (US2) can verify independently at any time after T001
- T014, T015 (US3) can run after T005
- T016, T017 (US4) can run after T011

---

## Parallel Example: Phase 1 Setup

```bash
# Launch both setup tasks in parallel (different codebases):
Task: "Add DefenseMemoDraft to PipelineRegistry in PipelineRegistry.cs"
Task: "Add DefenseMemoDraft to AiStepType union in aiJobsSlice.ts"
```

## Parallel Example: After Foundational Phase

```bash
# US2 verification can happen in parallel with US1 implementation:
Task: "T013 [US2] Verify admin model settings shows new step"
# While simultaneously:
Task: "T007 [US1] Refactor FinalNote.tsx to add AI generation state"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002) — ~10 min
2. Complete Phase 2: Foundational (T003–T006) — ~45 min
3. Complete Phase 3: User Story 1 (T007–T012) — ~60 min
4. **STOP and VALIDATE**: Test end-to-end AI memo generation
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Backend ready for AI memo generation
2. Add US1 → Full AI generation flow works → **MVP Demo!**
3. Add US2 → Admin can control AI model → Deploy
4. Add US3 → Premium quality AI output → Deploy
5. Add US4 → DOCX export works with AI content → Deploy
6. Polish → Edge cases handled → Final release

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- The AI prompt in T005/T014 is the most critical task — it determines memo quality
- The SmartAnalysis workflow is a legacy pattern (not WorkflowServiceBase) — new code follows existing SmartAnalysis conventions
- No database migrations needed — uses existing AiJob and AiStageModelConfig tables
- No new API endpoints — extends existing `POST /cases/{id}/ai-jobs`
