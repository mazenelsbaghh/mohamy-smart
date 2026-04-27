# Fix: Workflow Status Not Showing on CaseAnalysis Page

## Problem
When navigating to the Case Analysis tab, all workflows show "لم تبدأ" (Not Started) even though they have been completed or are in progress. The workflow data is stored in the backend but `CaseDetails.tsx` never fetches it on mount.

## Root Cause
`CaseDetails.tsx` only dispatches `thunkGetSingleCase` to load case data. It does NOT dispatch any workflow `getWorkflow` thunks, so the Redux state for all 7 workflow slices remains at their initial (empty) state.

## Solution
Add a `useEffect` in `CaseDetails.tsx` that fetches all 7 workflow states in parallel when a case loads. Each `getWorkflow` call is fire-and-forget with error silencing (404 = workflow doesn't exist yet, which is fine).

## Files Changed
- `apps/lawyer-dashboard/src/pages/cases/CaseDetails.tsx` — Add workflow pre-fetch effect

## Status
- [x] Plan created
- [ ] Implementation
- [ ] Verification
