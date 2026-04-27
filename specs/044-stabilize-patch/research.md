# Research: Phase 0 — Stabilize & Patch

**Branch**: `044-stabilize-patch`
**Date**: 2026-04-14
**Purpose**: Resolve all technical unknowns before task generation.

---

## Research Item 1: AppealBriefService Security Status (CRIT-02)

### Decision
**CRIT-02 is already resolved.** No backend code changes are needed.

### Evidence
- `AppealBriefService.cs` (line 20) already extends `WorkflowServiceBase<AppealWorkflow, AppealWorkflowDto>`.
- Constructor (line 28) already receives `ICaseAccessValidator caseAccessValidator` and passes it to the base class.
- `WorkflowServiceBase.StartWorkflowBaseAsync()` (line 63) calls `_caseAccessValidator.ValidateAsync(caseId, lawyerId, ct)` before creating any workflow.
- `WorkflowServiceBase.RunStepBaseAsync()` (line 146) checks `workflow.LawyerId != lawyerId` before executing any step.
- `WorkflowServiceBase.SaveDraftAsync()` (line 232) checks `workflow.LawyerId != lawyerId` before saving.
- `CaseAccessValidator.ValidateAsync()` (line 26-66) performs full ownership validation: checks case existence, admin bypass, lawyer entity lookup, and `caseEntity.LawyerId != lawyer.Id`.

### Rationale
The `problem-v3.md` document was written before recent migrations that moved `AppealBriefService` to `WorkflowServiceBase`. The security fix is already in production-ready state.

### Alternatives Considered
- Re-implementing the fix: Unnecessary, would be duplicate work.

---

## Research Item 2: Legacy RulingAnalysis Redux Slice — Not Truly Dead Code

### Decision
The `rulingAnalysisAiSlice.ts` is **actively used** by 5 page components. It is **not dead code** and cannot be simply deleted without a migration strategy.

### Evidence
Files that import from `rulingAnalysisAiSlice`:
1. `RulingAnalysisPage.tsx` (line 15): imports `resetRulingAnalysisAi`
2. `RulingStep1VerdictAnalysis.tsx` (line 5): imports `hydrateVerdictAnalysis`, reads `s.rulingAnalysisAi.verdictAnalysis`
3. `RulingStep2ReasonsAnalysis.tsx` (line 5): imports `hydrateReasonsAnalysis`, reads `s.rulingAnalysisAi.*`
4. `RulingStep3DefectsEvaluation.tsx` (line 5): imports `hydrateDefectsEvaluation`, reads `s.rulingAnalysisAi.*`
5. `RulingStep4AppealViability.tsx` (line 5): imports `hydrateAppealViability`, reads `s.rulingAnalysisAi.*`
6. `store.ts` (line 20, 46): imports and registers the reducer

This is a **dual-slice** pattern (mentioned in problem-v3.md as "Dual slice (dead code)"). The RulingAnalysis pages use BOTH the workflow slice (via `createWorkflowSlice`) for workflow state AND this legacy slice for typed step output hydration. Removing it would break the RulingAnalysis workflow UI.

### Rationale
The spec's FR-011 assumed this was dead code based on the problem report. In reality, it's actively wired. The correct approach is:
- **Option A (Phase 0 scope)**: Leave the slice in place; update FR-011 to acknowledge it's not deletable without migrating step components.
- **Option B (Future)**: Migrate step components to read from the unified workflow slice's `outputs` dictionary, then delete the legacy slice.

**Decision for Phase 0**: Skip deletion. Update the spec to note this as a deferred item. The slice is not harmful — it's a parallel read-only cache that hydrates from AI job results.

---

## Research Item 3: `useWorkflowAutoSave` Current State

### Decision
The hook needs **two specific fixes**: add `isSaving` guard and fix the unmount cleanup.

### Evidence (from `useWorkflowAutoSave.ts`, 61 lines):
- **No `isSaving` guard**: The `flush()` function (line 12-23) does not prevent re-entry. If `flush()` is called while a previous `onSave()` is still in-flight, both will execute concurrently.
- **Unmount cleanup is flawed**: The `useEffect` cleanup (line 49-57) calls `flush()` which is async, but React cleanup functions cannot be async. The `flush()` call fires-and-forgets, meaning:
  - If `onSave` takes time, the component will be unmounted before it completes.
  - In React StrictMode, double-invocation may cause issues.
- **Missing error handling**: No try/catch around `onSave(payload)` in `flush()` (line 21). A network error will throw and prevent future saves.
- **Debounce cancellation works correctly**: `debouncedSave` (line 33-46) properly clears previous timeouts before setting new ones.

### Required Changes
1. Add `isSavingRef = useRef(false)` — check at start of `flush()`, set to true while saving, reset in finally block.
2. Change unmount effect to call `cancel()` instead of `flush()` — per spec clarification Q1, failed saves retry silently on next debounce, so unmount should cancel, not flush.
3. Wrap `onSave()` in try/catch — on failure, restore `pendingPayloadRef.current` with the failed payload so next debounce retries it.
4. Expose `isSaving` state for manual save buttons to check before triggering.

---

## Research Item 4: `console.log` Locations

### Decision
Exactly 3 `console.log` statements to remove in 2 files.

### Evidence
| File | Line | Content |
|------|------|---------|
| `TasksPage.tsx` | 37 | `console.log('tasks ::', tasks);` |
| `TasksPage.tsx` | 66 | `console.log(task)` |
| `AddNewContractsForm.tsx` | 20 | `const onSubmit: SubmitHandler<addNewContractsType> = (data) => console.log(data);` |

### Required Changes
- `TasksPage.tsx`: Delete both lines (37, 66).
- `AddNewContractsForm.tsx`: Replace `console.log(data)` with a proper no-op or actual submission logic. Since the form's real handler likely doesn't exist yet, replace with `void data;` (matching the pattern already used in `ForgotPassword.tsx`).

---

## Research Item 5: ForgotPassword Page Current State

### Decision
Replace the functional form with an unavailability notice. No backend endpoint exists.

### Evidence
- `ForgotPassword.tsx` (62 lines): Contains a full form with phone input, validation schema, and submit handler.
- Line 20: `// TODO: dispatch thunk for forgot-password when API is ready`
- Line 22: `setTimeout(() => setIsSubmitting(false), 1500);` — fakes submission.
- Backend search for `ForgotPassword` and `forgot-password`: **zero results** — no endpoint exists.

### Required Changes
Replace the form body with:
- An Arabic message: "هذه الخاصية غير متاحة حالياً. يرجى التواصل مع المسؤول لإعادة تعيين كلمة المرور."
- Keep the back-link to login page.
- Remove the form, validation schema import, and submit handler.

---

## Research Item 6: Branch 043 Untracked Files & Migrations

### Decision
Branch is currently on `044-stabilize-patch` (branched from 043). Git status shows ~30+ modified files but no untracked files visible from current branch state. The migration files from 043 appear to have been committed already.

### Evidence
- `git status --short` shows ~30+ modified (M) files but **no untracked (??) files** in the current working tree.
- The problem-v3.md report may have been written before a partial commit resolved some of the untracked files.

### Required Changes
- Verify migration files are applied by running `make db-migrate`.
- Verify both frontend and backend compile cleanly.
- Any remaining untracked files should be resolved during task execution.

---

## Summary of Spec Adjustments Needed

Based on research findings, the spec needs one important correction:

| FR | Original Assumption | Research Finding | Action |
|----|---------------------|-----------------|--------|
| FR-001/002 | AppealBrief has no ownership check | Already fixed via WorkflowServiceBase | Verify only — no code change needed |
| FR-011 | Legacy Redux slice is dead code | Actively used by 5 components | Defer deletion to frontend unification phase; remove from Phase 0 scope |
| FR-003/004/005/013 | Auto-save hook needs fixes | Confirmed — 4 specific changes identified | Proceed as planned |
| FR-010 | Remove console.log | 3 instances confirmed | Proceed as planned |
| FR-012 | ForgotPassword needs fix | Confirmed — form exists with TODO | Proceed as planned |
