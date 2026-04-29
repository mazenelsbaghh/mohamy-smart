# Research: Workflow Architecture Audit & Unification

**Feature**: 067-workflow-audit-unify
**Date**: 2026-04-28

## Decision 1: Unified Shell Wrapper Architecture

**Decision**: Use `AnalysisStepShell` as outer state gate + `AnalysisStageLayout` as inner content layout in a composed component.

**Rationale**: The two shells serve orthogonal concerns:
- `AnalysisStepShell` handles **state triage**: loading → error → content (3-way conditional render)
- `AnalysisStageLayout` handles **spatial layout**: 2/3 main + 1/3 sidebar grid with reusable cards

They compose naturally as:
```tsx
<AnalysisStepShell isLoading={...} hasFailed={...} onRetry={...}>
  <AnalysisStageLayout title={...} sidebar={...}>
    {/* content */}
  </AnalysisStageLayout>
</AnalysisStepShell>
```

**Alternatives considered**:
- Migrate all to `AnalysisStepShell` only → Loses sidebar layout, section cards, action buttons, banners, tone theming used by AdminComplaint and LegalWarning. Would degrade UX for those 2 workflows.
- Migrate all to `AnalysisStageLayout` only → Loses loading/error state gate. Step components would need to implement their own loading/error checks.
- New monolithic component → Too much coupling; composition is cleaner.

## Decision 2: DefenseMemoPage Extensibility Callbacks

**Decision**: Add 4 optional callbacks to `useWorkflowOrchestrator` config.

**Rationale**: DefenseMemoPage has 7 categories of unique logic. Rather than adding 7 specific callbacks, we generalize to 4 that cover all cases:

| Callback | Covers |
|----------|--------|
| `onJobCompleted?: (jobKey, job, outputs, dispatch) => void` | Per-item AI job caching (defenseExplanationCache), output clearing on re-activation |
| `onStepSave?: (stepNumber, payload, dispatch) => Promise<void>` | Imperative per-step save (saveDefensesStep) |
| `onError?: (error, context) => void` | Error toast display for abandon/fetch failures |
| `computeAutoResumeTarget?: (outputs, jobs) => number` | Custom auto-resume logic separate from maxStepAllowed |

**What about the other 3?**:
- `stepNumberMapFn` already exists in orchestrator config (covers the dual step numbering)
- `isCaseIdBased` already exists (covers caseId-based endpoints)
- `snapshotFilter` is not needed in the orchestrator — snapshot counting can stay in the page component since only DefenseMemoPage uses it

**Alternatives considered**:
- Generalize all 7 patterns into the orchestrator → Over-engineering for 1 of 7 workflows
- Keep all logic outside orchestrator in DefenseMemoPage → Defeats the purpose of unification
- Create a `useDefenseMemoExtensions` sub-hook → Extra abstraction layer; callbacks are simpler

## Decision 3: StatementOfClaims Normalization

**Decision**: Replace `computeMaxStepAllowed` with `jobStepMap` constant, matching the other 5 workflows.

**Rationale**: The `jobStepMap` approach is a simple mapping from AI job type → step index. StatementOfClaims uses a custom function because it was implemented before `jobStepMap` was added to the orchestrator. The function can be converted to a `jobStepMap` since:
- The `computeMaxStepAllowed` function (lines 47-66 of PreparingStatementOfClaims.tsx) just maps job keys to step indices with max() logic
- This is exactly what `jobStepMap` does generically in the orchestrator (lines 144-165)

**Alternatives considered**:
- Keep `computeMaxStepAllowed` and remove `jobStepMap` → Would require migrating 5 pages to the function approach
- Support both in orchestrator forever → Two code paths for the same purpose

## Decision 4: Error Handling Standardization

**Decision**: All abandon/snapshot failures show a user-visible error toast via `react-hot-toast` (already used throughout the app).

**Rationale**: The orchestrator currently silently catches abandon errors (`catch(() => {})`). DefenseMemoPage shows `sileo.error()`. Standardizing to always show toast ensures users know when their data wasn't archived.

**Alternatives considered**:
- Silent error handling → User doesn't know their snapshot failed
- Retry mechanism → Over-engineering for this phase; backend retries via Hangfire

## Decision 5: Shared Utilities Extraction

**Decision**: Create `redux/shared/workflowUtils.ts` with all shared logic.

**Rationale**: The following are duplicated in 2-3 files each:
- `DraftWorkflowState` type → Move to `workflowTypes.ts` (alongside existing `BaseWorkflowState`)
- `isWorkflowCompleted()` → New file `workflowUtils.ts`
- `FINAL_STEPS` → Derive from `WORKFLOW_CATALOG.totalSteps` in `workflowUtils.ts`
- `workflowThunks` mapping → New file `workflowUtils.ts`
- Draft detection logic → New file `workflowUtils.ts`

**Alternatives considered**:
- Put everything in `workflowCatalog.ts` → Mixes data (catalog) with logic (utilities)
- Put everything in `workflowConstants.ts` → Constants file shouldn't contain functions
- Put types in a separate `workflowTypes2.ts` → Unnecessary; extend existing `workflowTypes.ts`

## Decision 6: workflowConstants.ts Step Definitions with Icons

**Decision**: Expand `workflowConstants.ts` to include full step definitions (id, label, icon) for all 7 workflows.

**Rationale**: Currently only 3 of 7 workflows have step label constants in `workflowConstants.ts` (`ADMIN_COMPLAINT_STEPS`, `LEGAL_WARNING_STEPS`, `DEFENSE_MEMO_STEPS`), and they contain only string labels. The other 4 have no entries. All 7 pages define their own step arrays with icons inline. The expanded constants will include icons so pages can import the complete step definition.

**Alternatives considered**:
- Keep icons separate from labels → Still requires coordination between icon array and label array
- Put step definitions in `workflowCatalog.ts` → Catalog is about workflow-level metadata, not step-level
