# Task Plan: Frontend Shared Components & Hooks

**Feature**: 034-frontend-shared-hooks
**Plan Document**: [plan.md](./plan.md)

## Story Dependencies
- **US1 (Hook)**: Independent (Foundation of the refactor)
- **US2 (Shell UI)**: Independent (Can be built with mocked data, but functionally pairs with US1)
- **Polish**: Depends on US1 and US2

---

## Phase 1: Setup

*No pure project setup/infrastructure tasks required for this frontend feature. Existing Vite + Tailwind environment is sufficient.*

## Phase 2: Foundational

*No blocking backend/database configurations required.*

## Phase 3: User Story 1 - Developer Uses Unified Analysis Hook

**Goal**: Provide a generic custom hook `useAnalysisStep` capable of managing API submissions, SignalR listening, Redux hydration, and localized error messages.
**Independent Test**: The hook can be mounted in an isolated dummy component and will successfully establish a SignalR context, return `isLoading: true`, and invoke `submit` correctly.

- [x] T001 [US1] Implement `UseAnalysisStepOptions` and `UseAnalysisStepReturn` types in `mohamy-smart-lawyer-dashboard/src/hooks/useAnalysisStep.ts`
- [x] T002 [US1] Implement `useAnalysisStep` hook logic with internal SignalR polling and state management in `mohamy-smart-lawyer-dashboard/src/hooks/useAnalysisStep.ts` (depends on T001)

## Phase 4: User Story 2 - Developer Uses Shell Component for Consistent UI

**Goal**: Provide a generic UI wrapper component `AnalysisStepShell` that standardizes loading spinners and retry-capable error boundaries.
**Independent Test**: The component can be visually validated in Storybook or by rendering it with hardcoded props (`isLoading=true`, `hasFailed=true`).

- [x] T003 [US2] Implement `AnalysisStepShellProps` and `AnalysisStepShell` component using Tailwind and HeroUI in `mohamy-smart-lawyer-dashboard/src/components/analysisWorkflow/AnalysisStepShell.tsx`

## Phase 5: Polish & Cross-Cutting Concerns

**Goal**: Apply the unified hook and shell component to existing execution workflow steps to remove duplicate code.

- [x] T004 [P] Refactor `ExecStep1Classification.tsx` to replace local job logic with `useAnalysisStep` and wrap UI in `AnalysisStepShell` at `mohamy-smart-lawyer-dashboard/src/pages/execRequest/steps/ExecStep1Classification.tsx` (depends on T002, T003)
- [x] T005 [P] Refactor `ExecStep2Drafting.tsx` to replace local job logic with `useAnalysisStep` and wrap UI in `AnalysisStepShell` at `mohamy-smart-lawyer-dashboard/src/pages/execRequest/steps/ExecStep2Drafting.tsx` (depends on T002, T003)
- [x] T006 [P] Update `RulingAnalysisPage.tsx` and nested steps to adopt the `useAnalysisStep` hook and `AnalysisStepShell` wrapper at `mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage.tsx` (depends on T002, T003)



## Implementation Strategy

1. **MVP**: Build both the hook (T001-T002) and the shell (T003) independently first. Their contracts are well-defined.
2. **Incremental Rollout**: Refactor the Executive Request steps (T004, T005) to instantly prove the integration works and observe the boilerplate reduction.
3. **Completion**: Refactor Ruling Analysis (T006). If additional steps exist from other workflows, duplicate the pattern established in T004 across the codebase sequentially.
