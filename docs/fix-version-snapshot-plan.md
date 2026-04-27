# Fix: Version Snapshot Before Abandon

## Problem
When user clicks "بدء واحدة جديدة" (Start New), the current `abandon` logic **deletes** all data
for `defense-memo` and `preparing-statement-of-claims` from the database. This means:
1. The old version is permanently lost
2. Going back to the "old version" shows empty/new data
3. The version count never increments (always shows 1 version)

## Root Cause
- `defense-memo` and `preparing-statement-of-claims` don't use `WorkflowBase` (versioned table rows).
- They store data in dedicated tables keyed by `caseId` (FactAnalysis, Defense, LawSuitParty, etc.)
- `AbandonAnalysisAsync` / `AbandonWorkflowAsync` deletes all those rows + AiJobs.

## Solution
**Before** calling abandon, snapshot the current Redux state outputs to `localStorage`.
This mirrors the existing `defense-memo:snapshots:{caseId}` pattern already in place.

### Steps:
1. **CaseAnalysis.tsx → `handleStartNewVersion`**: Before calling `api.post(.../abandon)`,
   read the current Redux state outputs and save them as a versioned snapshot in localStorage.
2. **Generalize the snapshot pattern**: Use a shared key format `{workflowKey}:snapshots:{caseId}`
   for both defense-memo and preparing-statement-of-claims.
3. **Version display**: The `getDefenseMemoVersions` function already handles defense-memo snapshots;
   extend/generalize it to handle statement-of-claims snapshots too.
4. **Revert AiJob deletion in backend**: The backend abandon should NOT delete AiJobs anymore —
   AiJobs are naturally overwritten when a new job of the same StepType is submitted. Deleting them
   causes the frontend to lose hydration data for the active session.

### Files to modify:
- `CaseAnalysis.tsx` — snapshot before abandon, generalize version display
- `SmartAnalysisService.cs` — revert AiJob deletion (keep domain data deletion only)
- `PreparingStatementOfClaimsService.cs` — revert AiJob deletion
