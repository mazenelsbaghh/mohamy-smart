# Tasks: 087-fix-parallel-defense-analysis

## Spec Kit Preparation Workflow
- [x] Phase 1: Feature Specification
- [x] Phase 2: Arabic Clarification
- [x] Phase 3: Technical Planning
- [x] Phase 4: Detailed Task Breakdown

---

## Task 1: Fix isLocal detection in thunkSubmitParallelDefenseAnalyses.ts

**File**: `apps/lawyer-dashboard/src/redux/aiJobs/thunk/thunkSubmitParallelDefenseAnalyses.ts`

**What to change**: Line 37 — Change:
```ts
const isLocal = defense.defenseId === defense.clientDefenseId;
```
To:
```ts
const isLocal = defense.defenseId.startsWith('local-');
```

**Why**: The old check always returned `true` because both `defenseId` and `clientDefenseId` were set to the same value (`d.id`). This caused the thunk to always send `LOCAL_DEFENSE_GUID` (`00000000-...`), preventing the backend from saving `AnalysisJson`.

**Verification**: After change, defenses with real DB GUIDs (like `58B8A8B1-3FA6-40DE-...`) will NOT match `startsWith('local-')`, so `isLocal` will be `false`, and the real GUID will be sent.

- [ ] Task 1 complete

---

## Task 2: Fix defenseId mapping in DefensesList.tsx

**File**: `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/DefensesList.tsx`

**What to change**: Line 682 — Change:
```ts
defenseId: d.isLocal ? d.id : d.id,
```
To:
```ts
defenseId: d.id,
```

**Why**: Both branches of the ternary return the same value. Simplify for clarity.

**Verification**: Code behaves identically but is clearer.

- [ ] Task 2 complete

---

## Task 3: Fix defenseId mapping in DefenseMemoPage.tsx

**File**: `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx`

**What to change**: Line 262 — Change:
```ts
defenseId: d.isLocal ? d.id : d.id,
```
To:
```ts
defenseId: d.id,
```

**Why**: Same issue as Task 2.

**Verification**: Code behaves identically but is clearer.

- [ ] Task 3 complete

---

## Task 4: Add setParallelDefenseCounts reducer to smartAnalysisSlice.ts

**File**: `apps/lawyer-dashboard/src/redux/analysis/smartAnalysisSlice.ts`

**What to add**: A new reducer `setParallelDefenseCounts` that sets `completedCount` and `failedCount` directly instead of incrementing:

```ts
setParallelDefenseCounts: (state, action: PayloadAction<{ completedCount: number; failedCount: number }>) => {
  const ext = state as unknown as SmartAnalysisExtraState;
  if (!ext.parallelDefenseTracking) return;
  ext.parallelDefenseTracking.completedCount = action.payload.completedCount;
  ext.parallelDefenseTracking.failedCount = action.payload.failedCount;
  if (action.payload.completedCount + action.payload.failedCount >= ext.parallelDefenseTracking.totalDefenses) {
    ext.parallelDefenseTracking.isRunning = false;
  }
},
```

**Also**: Export `setParallelDefenseCounts` in the exports section.

**Why**: This replaces the increment-based approach that causes the 18/4 counter bug.

**Verification**: The reducer sets exact values, so multiple dispatches with the same counts are idempotent.

- [ ] Task 4 complete

---

## Task 5: Fix parallel tracking useEffect in DefenseMemoPage.tsx to use computed counts

**File**: `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx`

**What to change**: Lines 307-337 — Replace the `useEffect` that iterates over `defenseAnalysisJobs` to:
1. Keep the hydration logic (hydrateStep when a job completes).
2. Replace `dispatch(incrementParallelDefenseCompleted(undefined))` and `dispatch(incrementParallelDefenseFailed(undefined))` with a single `dispatch(setParallelDefenseCounts({ completedCount, failedCount }))` computed from all job statuses.

**New logic**:
```ts
useEffect(() => {
  if (!parallelTracking?.defenseJobMap) return;

  let completedCount = 0;
  let failedCount = 0;

  for (const [defenseId, jobId] of Object.entries(parallelTracking.defenseJobMap)) {
    const job = aiJobs.defenseAnalysisJobs[jobId];
    if (!job) continue;

    if (job.status === 'Completed') {
      completedCount++;
      // Hydrate step 3 if not already done
      if (!hydratedParallelJobIdsRef.current.has(jobId)) {
        const completedAnalysis = getCompletedDefenseAnalysis(job.resultJson);
        if (completedAnalysis) {
          hydratedParallelJobIdsRef.current.add(jobId);
          const cache = (orchestratorState.outputs[3] || {}) as Record<string, unknown>;
          if (!cache[completedAnalysis.defenseId]) {
            dispatch(hydrateStep({
              stepNumber: 3,
              result: {
                defenseId: completedAnalysis.defenseId,
                explanation: completedAnalysis.memorandum,
              },
            }));
          }
        }
      }
    } else if (job.status === 'Failed') {
      failedCount++;
      if (!hydratedParallelJobIdsRef.current.has(jobId)) {
        hydratedParallelJobIdsRef.current.add(jobId);
      }
    }
  }

  dispatch(setParallelDefenseCounts({ completedCount, failedCount }));
}, [aiJobs.defenseAnalysisJobs, dispatch, orchestratorState.outputs, parallelTracking]);
```

**Also**: Update imports to use `setParallelDefenseCounts` instead of `incrementParallelDefenseCompleted` / `incrementParallelDefenseFailed`.

**Why**: Computing counts from actual job statuses is idempotent — no matter how many times the effect runs, the counts are always correct.

**Verification**: Counter should show correct values (e.g., 3/7 not 18/4), even after component remount.

- [ ] Task 5 complete

---

## Task 6: Pre-load defense analyses on page load in DefensesList.tsx

**File**: `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/DefensesList.tsx`

**What to add**: A new `useEffect` that runs when `allDefenses` changes:

```ts
// Pre-load analyses for all non-local defenses on page load
useEffect(() => {
  if (!allDefenses.length) return;
  const toFetch = allDefenses.filter(
    (d) => !d.isLocal && !d.id.startsWith('local-') && !explanationsCache[d.id] && !fetchingIdsRef.current.has(d.id)
  );
  for (const d of toFetch) {
    fetchingIdsRef.current.add(d.id);
    dispatch(thunkGetDefenseAnalysis({ defenseId: d.id }))
      .unwrap()
      .then((response: { memorandum?: TDefenseMemorandum }) => {
        if (response?.memorandum) {
          dispatch(hydrateStep({
            stepNumber: 3,
            result: { defenseId: d.id, explanation: response.memorandum },
          }));
        }
      })
      .catch(() => { /* defense has no analysis yet, that's OK */ })
      .finally(() => { fetchingIdsRef.current.delete(d.id); });
  }
}, [allDefenses, explanationsCache, dispatch]);
```

**Why**: Currently analyses are only fetched when a defense card is clicked. This pre-loads all analyses so cards show correct status immediately.

**Verification**: After page refresh, all analyzed defenses should show "محلل" without needing to click each one.

- [ ] Task 6 complete

---

## Task 7: Build verification

**Command**: `cd apps/lawyer-dashboard && npm run build`

**Verification**: Build completes with 0 errors.

- [ ] Task 7 complete

---

## Task 8: Deploy and manual test

1. Deploy to production server
2. Open a case → Click "تحليل جميع الدفوع"
3. Verify counter shows correct progress (e.g., 0/4, 1/4, ..., 4/4)
4. Verify each card updates to "محلل" as its analysis completes
5. Check DB: all defenses should have `AnalysisJson` populated
6. Refresh the page → all analyzed defenses should still show "محلل"

- [ ] Task 8 complete

---

## Quality Gates
- [ ] Deep critique and fixes
- [ ] clean-code-guard
- [ ] test-guard
- [ ] Feature tests
- [ ] Final build verification
