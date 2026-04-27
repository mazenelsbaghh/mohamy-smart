# Research: Phase 3 — Appeal Brief Preparation

**Feature**: 022-appeal-brief  
**Date**: 2026-04-10

## Decision 1: Step Output Storage — JSON Columns vs. Separate Tables

**Decision**: Store each step's output as a `NVARCHAR(MAX)` JSON column on the `AppealWorkflows` table (one column per step: `Step1Output`, `Step2Output`, …, `Step6Output`).

**Rationale**: Each step produces a distinct JSON structure. Creating 6 separate relational tables (JudgmentData, ReasoningAnalysis, AppealGrounds, AppealRequests, LegalBasis, FinalBrief) adds join complexity and migration overhead for data that is consumed as a unit. JSON columns in SQL Server 2022 allow structured storage and retrieval without the overhead. The data is written once per step and read together when resuming the workflow. Querying individual JSON fields is not required.

**Alternatives considered**:
- Separate relational tables per step — rejected: 6 new tables × 5 features = 30 tables for this feature set alone. Disproportionate complexity for append-only workflow state.
- Single `AllOutputsJson` mega-column — rejected: makes it impossible to update one step's output without overwriting the others at the application layer.

## Decision 2: AI Call Pattern — Synchronous vs. Hangfire Background Job

**Decision**: Synchronous per-step API call. The lawyer submits input → backend calls Gemini → returns output in the HTTP response. No Hangfire job queuing.

**Rationale**: Each step is a single Gemini call initiated by deliberate lawyer action (clicking "Run Step"). The lawyer waits for the result before reviewing and proceeding. Hangfire was needed in feature 017 for background batch processing; here the interaction is interactive and sequential. Synchronous calls with a 30s timeout are simpler and sufficient. If Gemini latency becomes a problem, SSE/streaming can be added later without changing the data model.

**Alternatives considered**:
- Hangfire background jobs — rejected: adds polling UI complexity (job status, progress updates) for a use case where the user is actively waiting. Overhead not justified.
- SignalR streaming — rejected: premature for this feature; synchronous response is sufficient given Gemini's typical 5–15s response time.

## Decision 3: AiStepType Enum Extension

**Decision**: Add 6 new members to the existing `AiStepType` enum in block 40–45:
```
AppealBriefJudgmentData      = 40
AppealBriefReasoningAnalysis = 41
AppealBriefGrounds           = 42
AppealBriefRequests          = 43
AppealBriefLegalBasis        = 44
AppealBriefAssembly          = 45
```

**Rationale**: Follows the existing numbering convention (Smart Analysis: 1–4, Lawsuit: 10–15, OCR: 20, Chat: 30). Block 40 is the next clean block. The `AiStageModelConfig` table seeds one row per step at migration, with default model `gemini-3-pro-preview`. The admin can then change per-step models from the Admin Dashboard.

**Alternatives considered**:
- String-based step keys — rejected: loses type safety; existing codebase uses the enum pattern.
- Reuse existing step types — rejected: each workflow's steps have distinct prompts and configuration needs.

## Decision 4: Workflow Lifecycle & Resumability

**Decision**: The `AppealWorkflow` entity tracks `CurrentStep` (int 1–6) and `Status` (`InProgress` / `Completed` / `Abandoned`). The lawyer can re-run any completed step (editing their input triggers a re-run). Steps after the edited one are cleared.

**Rationale**: The spec requires "allow the lawyer to review and edit each step's output before proceeding." Storing `CurrentStep` lets the frontend render the correct wizard state on reload. Clearing downstream outputs on edit ensures data consistency (Step 3 Grounds must be re-derived from a re-run Step 2 Reasoning).

**Alternatives considered**:
- Version history per step — rejected: over-engineered for the current need; a single "current output" per step is sufficient.
- Client-side only state — rejected: spec explicitly requires server-side persistence for resumability.

## Decision 5: Admin Dashboard — AiStageModelConfig Extension

**Decision**: The Admin Dashboard's "نماذج الذكاء الاصطناعي" settings tab (added in feature 021) will automatically display the 6 new step types once they are seeded into `AiStageModelConfigs`. No frontend changes needed in the Admin Dashboard for this feature — the existing component reads all entries from the API dynamically.

**Rationale**: The 021 implementation seeds and fetches all `AiStepType` enum values from the DB. The GET endpoint returns all rows. Adding new rows (via migration seed) automatically exposes them in the settings UI.

**Alternatives considered**:
- Hardcoded step list in frontend — rejected: already resolved as dynamic in 021.

## Decision 6: Prohibited Terms Enforcement (Step 2)

**Decision**: Prohibited evaluative terms (e.g., "يقين قضائي", "اطمأنت المحكمة", "أدلة متسقة") are enforced via prompt-level instructions only. No server-side validation layer.

**Rationale**: The spec states "enforced through prompt-level constraints, not separate validation logic." Maintaining a static term list in application code adds brittleness without improving accuracy — a well-crafted system prompt is the right mechanism.

**Alternatives considered**:
- Server-side string matching after AI response — rejected: brittle, language-sensitive, creates false positives for legitimate legal references.
