# Research: AI-Powered Final Defense Memorandum Generation

**Feature**: 064-ai-final-memo-generation  
**Date**: 2026-04-24

## 1. How DefenseMemoDraft Step Currently Works

### Decision
`DefenseMemoDraft` (enum value 5) exists in `AiStepType` but is **NOT handled** in `AiJobWorker.ExecuteStepAsync()` — it falls through to `default: throw NotImplementedException`. Currently, the frontend never submits an AI job for this step. Instead:
- `SmartAnalysisService.SaveDraftAsync()` stores the HTML content of the client-side assembled memo as an `AiJob` record with `StepType = DefenseMemoDraft` and `Status = Completed`.
- The frontend's `FinalNote.tsx` builds the memo HTML entirely client-side via `buildMemoHTML()` and saves it as a draft.

### Rationale
The existing draft-save mechanism will be **preserved** for auto-saving lawyer edits on the AI-generated output. The new AI generation will create an actual AI job that goes through Hangfire, and the result is then rendered in the editor.

### Alternatives Considered
- **Add a new endpoint**: Rejected — the existing `POST /cases/{caseId}/ai-jobs` pattern is sufficient; we just need to handle `DefenseMemoDraft` in `AiJobWorker`.
- **Direct API call without Hangfire**: Rejected — generating a long memo may take 30-60+ seconds; Hangfire + SignalR is the established async pattern.

## 2. PipelineRegistry Registration

### Decision
`DefenseMemoDraft` is **NOT registered** in `PipelineRegistry._pipelines`. The "smart-analysis" pipeline only has 4 steps (FactAnalysis, GenerateDefenses, AnalysisDefense, FinalRequirements). This means:
- The step does NOT appear in Admin AI Model Settings page
- `GetModelForStepAsync` falls back to the default model

### Rationale
Add `DefenseMemoDraft` to the "smart-analysis" pipeline in PipelineRegistry. This automatically makes it visible in the admin model settings page via `GetAllIncludedStages()`.

### Alternatives Considered
- **Create a separate pipeline**: Rejected — this is conceptually step 5 of the "smart-analysis" pipeline (defense memo workflow).
- **Hardcode the model in the service**: Rejected — violates the admin configurability requirement and Principle VIII.

## 3. AiJobWorker Integration Pattern

### Decision
Add a `case AiStepType.DefenseMemoDraft:` branch to `ExecuteStepAsync()` in `AiJobWorker`. This branch will:
1. Deserialize the input JSON containing approved defenses data, explanations, requests, and case metadata
2. Call `SmartAnalysisService.GenerateDefenseMemoDraftAsync()` (new method)
3. Return the serialized result

### Rationale
Follows the exact same pattern as all other SmartAnalysis steps (FactAnalysis, GenerateDefenses, etc.) — minimal architectural change.

## 4. AI Prompt Design

### Decision
The prompt will be stored as a prompt template file in the prompts directory (consistent with `WorkflowServiceBase` pattern). However, since SmartAnalysis doesn't extend `WorkflowServiceBase`, we'll embed the prompt in the service method (consistent with existing SmartAnalysis patterns like `GenerateFinalRequirementsAsync`).

The prompt instructs the AI to generate a **complete, narrative-style Egyptian legal defense memorandum** in Arabic. Input data is structured as JSON with:
- Case metadata (number, type, court, parties)
- Fact analysis summary
- Approved defenses with full explanations (legal texts, precedents, legal application)
- Approved requests categorized by level

### Rationale
The SmartAnalysis service already uses inline prompts (not the file-based system of WorkflowServiceBase). Staying consistent with existing patterns.

## 5. Frontend Integration Pattern

### Decision
Modify `FinalNote.tsx` to:
1. On mount, check if an AI-generated memo already exists (via `smartOutputs[5]` or a completed `DefenseMemoDraft` job)
2. If no AI memo exists, provide a "Generate AI Memo" button that submits an AI job
3. During generation, show a loading spinner with progress status
4. When complete, render the AI-generated HTML in the content-editable editor
5. Preserve existing edit + auto-save + DOCX export functionality

### Rationale
This gives the lawyer control over when to trigger AI generation (not automatic), allows re-generation if unsatisfied, and preserves all existing editing capabilities.

### Alternatives Considered
- **Auto-trigger on step entry**: Rejected — could waste AI credits if the lawyer just wants to review what's there.
- **Replace the entire component**: Rejected — the existing editor, DOCX export, and auto-save are solid and should be preserved.

## 6. Frontend AiStepType Addition

### Decision
Add `'DefenseMemoDraft'` to the `AiStepType` union type in `aiJobsSlice.ts`.

### Rationale
Required for the frontend to submit and track `DefenseMemoDraft` AI jobs through the existing infrastructure.

## 7. DTO Design for AI Input

### Decision
Create `DefenseMemoDraftRequestDto` containing:
- Case metadata (number, type, court, client name, opponent name, defending party)
- Fact analysis data (from step 1 output)
- Approved defenses with explanations (filtered from steps 2+3)
- Final requests (from step 4 output)

The frontend serializes this as `inputJson` when submitting the AI job.

### Rationale
All data needed for memo generation is already available in the frontend Redux state. Sending it as structured JSON input to the AI job keeps the backend stateless for this step.

## 8. DOCX Export from AI-Generated Content

### Decision
Keep the existing `buildDocxFromSummary()` function for structured DOCX export. Additionally, add a new `buildDocxFromHtml()` utility that converts the AI-generated (and potentially edited) HTML content to DOCX paragraphs. This serves as the primary export path after AI generation.

### Rationale
The AI generates narrative text (not structured data), so the DOCX builder needs to parse HTML rather than structured DTOs.

### Alternatives Considered
- **Have the AI output DOCX-compatible XML**: Too complex and unreliable.
- **Use an HTML-to-DOCX library**: `html-docx-js` is unmaintained; better to parse the HTML and build `docx` Paragraphs manually.
