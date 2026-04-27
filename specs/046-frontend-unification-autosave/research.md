# Research: Frontend Unification + Auto-save Complete

**Branch**: `046-frontend-unification-autosave`
**Date**: 2026-04-14

## Research Summary

All technical context items are resolved. No NEEDS CLARIFICATION markers remain. This phase is a frontend-only migration using established, production-proven patterns already in the codebase.

---

## R1: Existing Unified Step Pattern (AnalysisStepShell + useAnalysisStep)

**Decision**: Reuse the existing `AnalysisStepShell` + `useAnalysisStep` pattern without modification.

**Rationale**: Already proven across 5 workflows (Appeal Brief — 6 steps, Admin Complaint — 5 steps, Ruling Analysis — 4 steps, Legal Warning — 3 steps, Exec Request — 3 steps = 21 step components total). The pattern handles:
- AI job submission via `thunkSubmitAiJob`
- SignalR-based real-time progress tracking
- Loading/error/retry states
- Result parsing via `parseJobResult()`
- Auto-hydration into Redux state via `onHydrate` callback

**Alternatives considered**:
- Building a new hook specific to legacy workflows → Rejected: increases maintenance burden, diverges from unified architecture (Principle VIII).

**Key files**:
- `src/hooks/useAnalysisStep.ts` (110 lines — stable)
- `src/components/analysisWorkflow/AnalysisStepShell.tsx` (2.3 KB — stable)
- `src/components/analysisWorkflow/AnalysisStageLayout.tsx` (8.9 KB — provides page-level layout)

---

## R2: Auto-save Hook (useWorkflowAutoSave)

**Decision**: Use the existing `useWorkflowAutoSave` hook as-is. It already contains the `isSaving` guard and cleanup logic from Phase 0 stabilization.

**Rationale**: The hook (69 lines) provides:
- Debounced save with configurable delay (default 2000ms, will pass 1500ms)
- `isSavingRef` mutual-exclusion guard preventing concurrent saves
- `flush()` for manual save coordination
- `cancel()` for unmount cleanup
- `pendingPayloadRef` for retry on failure

**Alternatives considered**:
- Using a global auto-save manager service → Rejected: over-engineering for 7 independent workflow pages. Each page instantiates its own hook.

**Integration pattern** (per workflow page):
```typescript
const { debouncedSave, flush, cancel } = useWorkflowAutoSave({
  delay: 1500,
  onSave: async (payload) => {
    await dispatch(workflowThunks.saveDraftStep({
      workflowId,
      stepNumber: currentStep,
      payload,
    })).unwrap();
  },
});
```

---

## R3: Save Button Inline Indicator Pattern

**Decision**: The save button itself transitions between 3 visual states: Default → "تم الحفظ تلقائياً" (success) → Default, or Default → "فشل الحفظ" (error) → Default.

**Rationale**: Per spec clarification — no external toasts, no adjacent text. The button is the single indicator.

**Implementation approach**:
- Track auto-save status via `loadingState.isAutoSaving` (already in `createWorkflowSlice`) and `errorState.autoSaveError`
- Button text/color transitions based on state:
  - `isAutoSaving = true` → spinner/disabled state
  - `autoSaveError = null` after save → "تم الحفظ تلقائياً" (green tint) for 2 seconds → revert
  - `autoSaveError != null` → "فشل الحفظ" (red tint) for 3 seconds → revert

**Alternatives considered**:
- Toast notifications → Rejected by user during clarification.
- Text label adjacent to button → Rejected by user during clarification.

---

## R4: Type Safety — Eliminating `any` in Workflow Redux

**Decision**: Define all step output types centrally in `workflowTypes.ts` and import them into each workflow slice.

**Rationale**: Currently 57+ `any` usages in Redux workflow code. Most `any` in `createWorkflowSlice.ts` are structural (hydrator signatures, thunk payloads). Per Constitution Principle VIII, "No `any` type in Redux slice definitions or thunk return types."

**Approach**:
1. Existing types already in slice files (e.g., `TFactAnalysis`, `TDefenses` in `smartAnalysisSlice.ts`, `TCaseDetails` etc. in `preparingStatementOfClaimsUnifiedSlice.ts`) → move to `workflowTypes.ts`
2. Define missing types for appeal brief, admin complaint, legal warning, exec request, ruling analysis step outputs
3. Update `IWorkflowThunks` interface to use generics instead of `any`
4. Type `stepHydrators` callbacks with specific step output types
5. Type `action.payload` in `extraReducers` — use typed thunk return types

**Alternatives considered**:
- Leave `any` in the factory internals and only type the consumer side → Rejected: half-measure that still allows runtime surprises inside the factory.

---

## R5: Legacy Step Component Migration Strategy

**Decision**: Rewrite each legacy step component to use `AnalysisStepShell` + `useAnalysisStep`, adopting identical visual design to the newer workflows.

**Rationale**: Per spec clarification — full visual unification, not just internal code swap. Legacy step-specific CSS (FinalNote.css, FinalRequirements.css) will be deleted.

**Migration order** (from simplest to most complex):
1. Defense Memo steps (5 components, ~138 KB total):
   - FactsReview.tsx (14.5 KB) — read-only AI output display
   - FinalRequirements.tsx (15.3 KB) — list display + edit
   - LegalAnalysis.tsx (24.7 KB) — complex nested display
   - DefensesList.tsx (52 KB) — complex defense cards + individual analysis
   - FinalNote.tsx (31.2 KB) — draft editor + assembly
2. Statement of Claims steps (7 components, ~89.6 KB total):
   - LawsuitCaseType.tsx (14.7 KB) — classification result display
   - LawsuitParties.tsx (12.2 KB) — party list display + edit
   - LawsuitSubjects.tsx (9.5 KB) — subject text display + edit
   - LawsuitFacts.tsx (8.5 KB) — narrative display + edit
   - LawsuitLegalBasis.tsx (15.4 KB) — laws + rulings display
   - LawsuitRequests.tsx (12.4 KB) — requests listing + edit
   - FinalStatementOfClaims.tsx (16.8 KB) — draft editor + assembly

**Reference implementation**: `AppealStep1JudgmentData.tsx` — the simplest example of the unified pattern. Each migrated component will follow this as template.

---

## R6: Dead Code Identification

**Decision**: After migration, delete all files no longer imported by any component.

**Files to delete after migration verification**:
- `src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.css` (3.4 KB)
- `src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalRequirements.css` (13.6 KB)
- Any legacy thunk files that become unreferenced after slice type updates
- `src/redux/rulingAnalysis/rulingAnalysisAiSlice.ts` — verify if still used or dead

**Verification method**: `grep -r` for import paths; build succeeds with no errors.
