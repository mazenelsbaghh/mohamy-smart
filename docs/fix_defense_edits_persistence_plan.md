# Fix: Defense Edits Lost on Refresh

## Problem
When the user edits, deletes, or adds defenses in the DefensesList step, and then refreshes the page, all changes revert to the original AI-generated list.

## Root Cause
The auto-save hook only saves `outputs[active + 1]`:
- When on DefensesList step, `active = 2`, so it saves `outputs[3]` (explanations cache)
- But defense list edits go to `outputs[2]` — which never gets auto-saved
- On refresh, `getWorkflow` hydrates `step2Output` from the backend (still the original GenerateDefenses result)
- Individual CRUD endpoints (`thunkCreateDefense`, etc.) persist defense records on the server, but the workflow's `step2Output` column is stale

## Fix
After each defense mutation (add, delete, rename), also save `outputs[2]` to the backend via `saveDraftStep` for step 2. This ensures the workflow record stays in sync with defense CRUD operations.

## Files Modified
- `DefenseMemoPage.tsx` — expose a `saveDefenses` callback to DefensesList
- `DefensesList.tsx` — call `saveDefenses()` after successful CRUD operations

## Status
- [x] Implemented
