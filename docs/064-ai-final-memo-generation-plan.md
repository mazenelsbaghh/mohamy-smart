# AI-Powered Final Defense Memorandum Generation — Implementation Plan

**Feature**: 064-ai-final-memo-generation  
**Created**: 2026-04-24  
**Status**: Implemented

## Overview

Transform Step 5 (المذكرة النهائية) of the defense memo workflow from a static template-based HTML concatenation into an AI-powered generation stage that:
1. Collects only approved defenses (with full explanations) + approved requests
2. Sends them to an AI model (admin-configurable: Pro/Flash/Flash Lite)
3. Generates a long, detailed, professional defense memorandum
4. Displays it in the existing editable editor with DOCX export

## Full Design Artifacts

All detailed design documents are in `/specs/064-ai-final-memo-generation/`:
- [plan.md](../specs/064-ai-final-memo-generation/plan.md) — Technical context, constitution check
- [research.md](../specs/064-ai-final-memo-generation/research.md) — All research findings & decisions
- [data-model.md](../specs/064-ai-final-memo-generation/data-model.md) — DTOs, data flow, entity usage
- [contracts/api-contracts.md](../specs/064-ai-final-memo-generation/contracts/api-contracts.md) — API contracts
- [quickstart.md](../specs/064-ai-final-memo-generation/quickstart.md) — Implementation quickstart

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| No new DB tables | ✅ | Reuses existing `AiJob` entity with `StepType = DefenseMemoDraft` |
| No new API endpoints | ✅ | Extends existing `POST /cases/{id}/ai-jobs` |
| Hangfire for async | ✅ | Consistent with all other AI steps; handles 30-60s generation time |
| SignalR for completion | ✅ | Real-time notification to frontend |
| PipelineRegistry registration | ✅ | Makes step visible in admin model settings automatically |
| Inline prompt (not file-based) | ✅ | Consistent with SmartAnalysis legacy patterns |

## Files to Modify (7 total)

### Backend (5 files)
1. `PipelineRegistry.cs` — Add DefenseMemoDraft to smart-analysis pipeline
2. `DefenseMemoDraftRequestDto.cs` — **NEW** input DTO
3. `SmartAnalysisService.cs` — Add `GenerateDefenseMemoDraftAsync()`
4. `ISmartAnalysisService.cs` — Add interface method
5. `AiJobWorker.cs` — Add DefenseMemoDraft case handler

### Frontend (2 files)
6. `aiJobsSlice.ts` — Add `'DefenseMemoDraft'` to AiStepType union
7. `FinalNote.tsx` — AI generation trigger, loading state, result hydration

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI output quality varies by model | High | Default to Flash; admin can switch to Pro for higher quality |
| Token limit exceeded for large cases | Medium | Monitor output; add truncation handling |
| Increased AI costs | Medium | Admin controls model selection; usage tracking exists |
| Memorandum not legally accurate | High | Lawyer always reviews/edits before approval |

## Next Steps

Run `/speckit.tasks` to generate the implementation task list, then `/speckit.implement` to start coding.
