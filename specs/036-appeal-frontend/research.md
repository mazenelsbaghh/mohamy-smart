# Phase 0: Outline & Research

## Decision 1: Frontend Architecture for Analysis Steps
- **Decision:** Utilize the Phase 4 and Phase 5 shared components (`useAnalysisStep` and `AnalysisStageLayout` or `AnalysisWorkflowShell`).
- **Rationale:** Reduces boilerplate from ~130 lines per step down to ~40-60 lines per step component, standardizing the UI behavior (loading, hydrating, monitoring AI job status via `useAnalysisStep`).
- **Alternatives considered:** Retaining the old duplicated boilerplate component structure, rejected due to technical debt and high maintenance costs.

## Decision 2: Redux Workflow Mapping
- **Decision:** Use the auto-generated thunks and unified slice (`appealBriefSlice` or similar name initialized using `createWorkflowSlice`).
- **Rationale:** Eliminates the dual slice architecture (legacy vs AI background jobs slice). `useAnalysisStep` takes care of invoking the generalized runStep functions seamlessly.
- **Alternatives considered:** Manual thunk orchestration for every step, rejected as it violates Phase 5 unification architecture constraints.

## Decision 3: Presentation and UX Styling
- **Decision:** All Arabic text and LTR constraints apply natively; must use `Tajawal` and components built with HeroUI / Tailwind v4.
- **Rationale:** Ensures compliance with Constitution Principle VI (Arabic-First UX).

**Status:** All technical specifications are resolved and no `NEEDS CLARIFICATION` items remain. Proceeding to Phase 1.
