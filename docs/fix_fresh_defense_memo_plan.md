# Fix: "بدء واحدة جديدة" Not Starting Fresh Defense Memo

## Problem
When clicking "بدء واحدة جديدة" (Start a new one) on the CaseAnalysis workflows page, the defense memo page loads old data instead of a fresh session.

## Root Cause
The `?fresh=1` parameter correctly triggers `dispatch(resetAnalysis())` in DefenseMemoPage. However:

1. **AI jobs not reset**: `useAiJobSignalR` calls `thunkGetAllAiJobs({ caseId })` on mount, fetching OLD completed jobs. The hydration effect (lines 207-219) then re-hydrates old results back into the freshly reset state.

2. **Auto-resume overrides**: The auto-resume effect (lines 247-258) sees old completed jobs and jumps the user to the last completed step (e.g. step 4), overriding the `setActive(0)` from the fresh run.

## Fix
In `DefenseMemoPage.tsx`:
1. When `isFreshRun` is true, also dispatch `resetAiJobs()` to clear old jobs before `useAiJobSignalR` fetches them.
2. Guard the hydration and auto-resume effects to skip when `isFreshRun` is true until new jobs are submitted.

## Files Modified
- `DefenseMemoPage.tsx` — reset AI jobs on fresh run, guard hydration effects

## Status
- [x] Implemented
