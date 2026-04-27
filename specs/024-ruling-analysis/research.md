# Research: Phase 5 — Judicial Ruling Analysis

**Feature**: 024-ruling-analysis  
**Date**: 2026-04-10

## Decision 1: Step Output Storage

**Decision**: Store each step's output as a `NVARCHAR(MAX)` JSON column on the `RulingAnalysisWorkflows` table (columns: `Step1Output` through `Step4Output`).

**Rationale**: Same pattern as 022/023. Four distinct step outputs, written once per step, read together. JSON columns avoid 4 separate tables.

**Alternatives considered**: Separate tables — rejected (same reasons as 022).

## Decision 2: AI Call Pattern

**Decision**: Synchronous per-step HTTP call. No Hangfire.

**Rationale**: Same pattern as 022/023. Lawyer-driven interactive workflow.

## Decision 3: AiStepType Enum Extension

**Decision**: Add 4 members in block 60–63:
```
RulingAnalysisOperative        = 60
RulingAnalysisReasoning        = 61
RulingAnalysisDefectEvaluation = 62
RulingAnalysisFeasibilityReport = 63
```

**Rationale**: Block 60 follows 023's block 50–54. Consistent convention.

## Decision 4: Prohibited Content Enforcement (Steps 2 & 4)

**Decision**: Two separate sets of prohibited content are enforced at prompt level:
- **Step 2**: No evaluative terms (يقين قضائي، اطمأنت المحكمة، أدلة متسقة). Only descriptive language (استند إلى، أوضح الحكم، اعتمد على).
- **Step 4**: No deadline date calculations, no Article 406 citation, no "appeal suspends execution" as absolute statement, no predictions of outcome.

Both are enforced via system prompt instructions only. No server-side validation.

**Rationale**: Consistent with 022. Prompt-level enforcement for language constraints is the established pattern in this codebase.

**Alternatives considered**: Server-side regex validation — rejected (same as 022 rationale).

## Decision 5: Criminal vs. Civil Aspect Separation

**Decision**: Step 1 and Step 2 outputs include separate `criminalAspect` and `civilAspect` JSON objects. If the judgment has only one aspect, the other object is `null`. The UI renders tabs or collapsible sections for each present aspect.

**Rationale**: The spec requires explicit separation. Mixing both aspects in a single narrative risks confusing the lawyer. Separate JSON objects allow each aspect to be rendered and reviewed independently.

**Alternatives considered**:
- Single merged narrative with inline labels — rejected: harder for the lawyer to parse; spec says "explicitly separate."

## Decision 6: Feasibility Report — No Deadline Calculations

**Decision**: Step 4 output includes `legalBasisForAppealability` but explicitly uses a generic statement ("يكفل القانون حق الطعن خلال المدة المقررة قانوناً") without citing Article 406 or calculating specific days. The prompt instructs the AI never to produce a date calculation.

**Rationale**: The spec explicitly prohibits deadline calculations and Article 406 citations in the feasibility report. This is a legal safety constraint — incorrect deadline information could cause the lawyer to miss filing windows or falsely reassure the client.

**Alternatives considered**:
- Parameterize deadline based on judgment date — rejected: the spec prohibits it; deadline tracking is outside this workflow's scope.
