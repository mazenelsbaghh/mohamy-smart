# Quickstart: AI-Powered Final Defense Memorandum Generation

**Feature**: 064-ai-final-memo-generation  
**Date**: 2026-04-24

## Prerequisites

- Docker environment running (`make dev`)
- Backend and Lawyer Dashboard accessible on canonical ports (8976, 5078)
- A case with completed Steps 1-4 of the Defense Memo workflow (FactAnalysis → GenerateDefenses → AnalysisDefense → FinalRequirements)

## Files to Modify (In Order)

### Backend (5 files)

| # | File | Change |
|---|------|--------|
| 1 | `Lawyer.Application/Services/Workflows/PipelineRegistry.cs` | Add `DefenseMemoDraft` to "smart-analysis" pipeline steps |
| 2 | `Lawyer.Application/Dtos/SmartAnalysis/DefenseMemoDraftRequestDto.cs` | **NEW** — Input DTO for AI memo generation |
| 3 | `Lawyer.Application/Services/SmartAnalysisService.cs` | **ADD** `GenerateDefenseMemoDraftAsync()` method with AI prompt |
| 4 | `Lawyer.Application/IServices/ISmartAnalysisService.cs` | **ADD** interface method for new service method |
| 5 | `Lawyer.Application/Services/AiJobWorker.cs` | **ADD** `case AiStepType.DefenseMemoDraft:` handler |

### Frontend (2 files)

| # | File | Change |
|---|------|--------|
| 6 | `apps/lawyer-dashboard/src/redux/aiJobs/aiJobsSlice.ts` | **ADD** `'DefenseMemoDraft'` to `AiStepType` union |
| 7 | `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx` | **MODIFY** — Add AI generation trigger, loading state, result hydration |

## Testing Flow

1. Navigate to a case with completed Steps 1-4
2. Go to Step 5 (المذكرة النهائية)
3. Click "إنشاء المذكرة بالذكاء الاصطناعي" button
4. Wait for AI generation (loading spinner visible)
5. Verify the generated memo appears in the editor
6. Edit the memo content
7. Download as .docx
8. Verify admin can change the model in AI Model Settings

## Key Architecture Decisions

- **No new DB tables** — reuses existing `AiJob` entity
- **No new API endpoints** — extends existing `POST /cases/{id}/ai-jobs`
- **Uses Hangfire** for async processing (consistent with all other AI steps)
- **SignalR** for real-time completion notification
- **Admin model selection** via existing `PipelineRegistry` + `AiModelConfigService`
