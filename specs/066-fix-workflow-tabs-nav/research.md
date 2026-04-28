# Research: Workflow Tabs & Step Navigation Fix

**Branch**: `066-fix-workflow-tabs-nav` | **Date**: 2026-04-28

## Decision 1: Shared Hook Architecture

**Decision**: Create `useWorkflowOrchestrator` as a configuration-driven hook that encapsulates the 180-390 lines of duplicated orchestration logic per workflow page.

**Rationale**:
- All 7 workflow pages share identical patterns: URL param extraction, Redux state selection, snapshot loading, AI job SignalR, auto-save triggering, workflow lifecycle (get-or-create-fresh-run), reset on unmount, active step management, maxStepAllowed computation, tab classNames, and tab change guards.
- The only meaningful differences are: (a) which Redux slice/thunks to use, (b) maxSteps count, (c) workflowPrefix for facts, (d) caseId-based vs workflowId-based identity mode, and (e) step-specific rendering JSX.
- A configuration-driven hook reduces each page from 248-488 lines to ~60-100 lines while preserving the existing component structure.

**Alternatives considered**:
1. **Full shared component** (WorkflowPage component wrapping all 7): Rejected because step rendering JSX varies significantly per workflow (different props, different components), making a single component overly abstract.
2. **Bug fixes only, no refactoring**: Rejected per user's clarification (Q1) - they explicitly chose option B (shared hook + bug fixes).
3. **Higher-order component (HOC)**: Rejected because hooks are the idiomatic React pattern for shared stateful logic and compose better with existing hooks.

## Decision 2: Identity Mode Abstraction

**Decision**: Support both `caseId-based` and `workflowId-based` identity modes in the shared hook via an `isCaseIdBased` config flag.

**Rationale**:
- DefenseMemo and StatementOfClaims use `caseId` as the `routeId` for saveDraftStep and call `abandonWorkflow` on fresh runs instead of `startWorkflow`.
- The other 5 workflows use numeric `workflowId` and redirect to `?workflowId=X` after creating a new workflow.
- Unifying these two patterns under one hook requires abstracting the identity mode, not the backend endpoints themselves (the backend stays unchanged).

**Alternatives considered**:
1. **Unify backend architecture first**: Rejected - out of scope. This is a frontend-only change.
2. **Two separate hooks (one per group)**: Rejected - defeats the purpose of deduplication since 90% of the logic is still shared.

## Decision 3: DefenseMemo Step Numbering

**Decision**: Keep the current step numbering mapping inside the DefenseMemo page but expose a `stepNumberMapFn` config option in the hook for this purpose.

**Rationale**:
- DefenseMemo's output key 3 is a per-defense analysis cache (not a visible step), creating the 1|2|4|5 mapping.
- This is fundamentally a DefenseMemo-specific concern that shouldn't pollute the shared hook's interface.
- By exposing `stepNumberMapFn?: (activeStep: number) => number | null`, the DefenseMemo page can customize the mapping without the hook needing to know about hidden steps.

**Alternatives considered**:
1. **Restructure DefenseMemo outputs array**: Rejected - would require backend changes and migration of existing data.
2. **Force all workflows to use sequential numbering**: Rejected - DefenseMemo's hidden cache is architecturally valid.

## Decision 4: SmartAnalysisLoader Integration

**Decision**: Add the loading state rendering (SmartAnalysisLoader) to the hook's return as a `isLoading` flag, letting each page conditionally render the loader.

**Rationale**:
- 5 of 7 pages already use `SmartAnalysisLoader` for the loading state (AppealBrief is missing the import, which is one of the bugs to fix).
- DefenseMemo and StatementOfClaims don't currently show a loader but should (FR-004).
- The condition is consistent: `loadingState.isFetchingWorkflow || !workflowId`.
- The hook returns the flag, each page renders the loader with its specific title/steps.

## Decision 5: Auto-Resume Behavior Unification

**Decision**: Standardize all 7 workflows to auto-resume to `maxStepAllowed` (furthest step with data or active AI job).

**Rationale**:
- Per user's clarification (Q2): "ينتقل لأقصى خطوة وصلها" - always go to the furthest reached step.
- DefenseMemo currently has a separate `autoResumeTarget` that differs from `maxStepAllowed`. This will be unified.
- The `maxStepAllowed` computation follows a standard cascading pattern that checks outputs first, then active AI jobs.

## Decision 6: Tab ClassNames Extraction

**Decision**: Extract the identical `classNames` object into a shared constant in the hook or a separate `workflowConstants.ts` file.

**Rationale**:
- All 7 pages use byte-for-byte identical `classNames` for the HeroUI `<Tabs>` component.
- The dark mode inconsistency in DefenseMemo's `tabContent` (`dark:text-white/70` vs `dark:app-text-subtle`) will be resolved by using the standardized constant.

## Decision 7: CaseDetails location.state Re-render Fix

**Decision**: Remove `location.state` from the useEffect dependency array in CaseDetails.tsx and instead use a ref to track whether navigation state has been processed.

**Rationale**:
- `location.state` is an object that creates a new reference on every navigation, causing the effect to re-run unnecessarily.
- The effect should only process navigation state once on mount, then fetch case data based on `id` alone.
- Using a ref avoids the re-trigger while still processing initial navigation state correctly.

**Alternatives considered**:
1. **JSON.stringify comparison**: Rejected - unnecessarily complex for a simple "process once" pattern.
2. **Move state processing to a separate effect**: Rejected - the current fix is simpler.

## Decision 8: hideDocsButton Standardization

**Decision**: Set `hideDocsButton={true}` on all 7 workflow pages' `<CaseHeaderBanner>` components.

**Rationale**:
- Per user's clarification (Q3): the button should be hidden because the user is already inside the workflow.
- Currently inconsistent: 4 pages use `false`, 3 use `true`.

## Decision 9: Testing Strategy

**Decision**: Add unit tests for `useWorkflowOrchestrator` hook using React Testing Library's `renderHook`, and verify the 3 critical bugs (missing import, Arabic typo, location.state) with targeted integration tests.

**Rationale**:
- Current test coverage is minimal (4 tests total, none for workflows).
- The shared hook is the highest-risk change and needs the most testing.
- Bug fixes are verifiable with simple render tests.

**Alternatives considered**:
1. **No tests**: Rejected - the shared hook refactor is too risky without tests.
2. **E2E tests only**: Rejected - too slow and brittle for hook logic testing.
