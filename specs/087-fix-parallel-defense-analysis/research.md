# Research: 087-fix-parallel-defense-analysis

## Decision 1: Root Cause of isLocal Detection Bug

**Decision**: Fix `isLocal` check in `thunkSubmitParallelDefenseAnalyses.ts` to use `defense.defenseId.startsWith('local-')` instead of `defense.defenseId === defense.clientDefenseId`.

**Rationale**: Investigation confirmed that:
1. `GenerateCaseDefensesAsync` in `DefenseService.cs` (lines 189-210) saves defenses to DB with real GUIDs via `_unitOfWork.Repository<Defense>().AddAsync()`.
2. `MapToDefenseDetailDto` (line 81-91) returns the real DB GUID as `Id`.
3. The frontend's `makeLocalDefenseId` (line 75-86 in `DefensesList.tsx`) returns the real ID if `item.id?.trim()` is non-empty.
4. **However**, in both `DefensesList.tsx` (line 682) and `DefenseMemoPage.tsx` (line 262), the defense mapping sets `defenseId: d.isLocal ? d.id : d.id` — both branches return the same value.
5. In the thunk (line 37), `isLocal = defense.defenseId === defense.clientDefenseId` — since both are set to `d.id`, this is **always true**.
6. When `isLocal` is true, the thunk sends `LOCAL_DEFENSE_GUID` (`00000000-...`), causing the backend's `hasTitleOverride` check to create a transient defense and skip saving `AnalysisJson`.

**Database verification**: Query on production DB confirmed 7 defenses exist with real GUIDs; 3 have `AnalysisJson = HAS DATA` (analyzed individually before parallel fix), 4 have `AnalysisJson = NULL` (analyzed via parallel with `Guid.Empty`).

**Alternatives considered**:
- Checking `!isValidGuid(defense.defenseId)` — rejected, more complex than needed.
- Keeping `defense.defenseId === defense.clientDefenseId` and fixing the mapping — rejected, the `local-` prefix check is the canonical way to identify local defenses.

## Decision 2: Counter Bug Fix Strategy

**Decision**: Derive completed/failed counts from actual `defenseAnalysisJobs` statuses in Redux rather than incrementing a counter.

**Rationale**: The current `incrementParallelDefenseCompleted` reducer increments `completedCount` every time the `useEffect` in `DefenseMemoPage.tsx` (lines 307-337) detects a completed job. The `hydratedParallelJobIds` ref prevents double-counting within a single mount, but:
1. If the component unmounts and remounts (navigation), the ref resets.
2. The Redux `parallelDefenseTracking.completedCount` persists.
3. On remount, the effect re-processes completed jobs, incrementing the counter again.
4. This causes the counter to show values like 18/4.

**Fix approach**: Instead of incrementing, compute counts from the actual job statuses:
```ts
const completedCount = Object.values(defenseJobMap)
  .filter(jobId => defenseAnalysisJobs[jobId]?.status === 'Completed').length;
```

This is idempotent — no matter how many times the component renders, the count is always correct.

**Alternatives considered**:
- Storing hydrated job IDs in Redux instead of a ref — rejected, adds Redux complexity for a derived value.
- Resetting the counter on component mount — rejected, loses progress information during navigation.

## Decision 3: Defense Analysis Loading on Page Refresh

**Decision**: The existing `useEffect` in `DefensesList.tsx` (lines 200-213) already handles fetching defense analysis on page load via `thunkGetDefenseAnalysis`. No additional backend changes needed.

**Rationale**: When a defense with a real GUID is clicked (not starting with `local-`), the effect calls `GET /SmartAnalysis/defense-analysis/{defenseId}` which reads from `defense.AnalysisJson`. Once the isLocal fix ensures `AnalysisJson` is saved, this fetch will work.

The only gap is that it fetches **one defense at a time** (on click). For the parallel analysis use case, we should also pre-fetch all defense analyses when the page loads, not just the active one.

**Fix approach**: Add a batch-loading effect that iterates all non-local defenses on page load and hydrates their analyses into step 3 output.

## Decision 4: UI Status Display

**Decision**: No changes needed to the card status rendering logic.

**Rationale**: The card already checks `explanationsCache[item.id]` (line 969 in `DefensesList.tsx`):
- If truthy → shows "محلل" green badge
- If falsy → shows "تحليل" button

Once the analysis data is properly hydrated into `explanationsCache` (via `hydrateStep({ stepNumber: 3 })`), the cards will display correctly. The fix to isLocal detection + pre-loading analyses on page load will make this work.
