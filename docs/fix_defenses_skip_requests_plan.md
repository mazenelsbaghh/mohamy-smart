# Fix: Defenses tab skipping Requests tab

## Problem
When user clicks "الطلبات الختامية" button on the Defenses tab (tab 2), the app jumps directly to the Memo tab (tab 4), skipping the Requests tab (tab 3).

## Root Cause
**Race condition between `sendData()` and auto-jump effect.**

In `DefensesList.tsx`, `sendData()`:
1. Submits `FinalRequirements` AI job → job becomes `Queued` in Redux
2. Calls `nextStep()` after the dispatch resolves

In `DefenseMemoPage.tsx`, a `useEffect` (line 226-240) detects the running job:
- `getRunningDefenseTargetStep` returns `3` for FinalRequirements
- Since `active (2) < runningTarget (3)`, it calls `setActive(3)` → jumps to tab 3

Then `sendData`'s `nextStep()` fires. But `active` is now `3`, so `nextStep()` increments to `4` → jumps to tab 4!

**Result:** Double navigation: 2→3 (by effect) then 3→4 (by nextStep), net effect is 2→4.

## Fix
In `sendData()` in `DefensesList.tsx`, remove the `nextStep()` call since the auto-jump effect in `DefenseMemoPage.tsx` already handles navigation to the correct tab when a running job is detected.

Replace with an explicit NO-OP comment explaining why navigation is handled by the orchestrator's auto-jump effect.

## Files Changed
- `DefensesList.tsx` — remove `nextStep()` from `sendData()`
