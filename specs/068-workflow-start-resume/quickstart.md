# Quickstart: Reliable Workflow Start and Resume

## Goal

Verify that start, resume current version, start new, refresh recovery, loaders, tab locking, and concurrency conflict recovery behave consistently across workflow pages.

## Prerequisites

- Backend running on `http://localhost:8976`
- Lawyer Dashboard running on `http://localhost:5078`
- A lawyer account with at least one case containing facts/documents
- Browser devtools available for refresh and network inspection

## Verification Commands

```bash
npm run type-check --workspace @mohamy/lawyer-dashboard
npx eslint src/hooks/useWorkflowOrchestrator.ts src/hooks/useAiJobSignalR.ts src/hooks/useWorkflowAutoSave.ts src/redux/shared/createWorkflowSlice.ts src/redux/aiJobs/aiJobsSlice.ts
dotnet test mohamy-smart-backend/Lawyer.Tests/Lawyer.Tests.csproj --filter "AiJobWorker|AiJobService|Workflow"
```

## Manual Flow 1: Start New Cleanly

1. Open a case with previous workflow progress.
2. Enter a workflow such as preparing statement of claims or appeal brief.
3. Choose "start new".
4. Confirm the first stage opens with no old output.
5. Refresh the page immediately.
6. Confirm the same clean run remains active and old outputs do not appear.

Expected result: Old stage outputs and old completed requests do not populate the active run.

## Manual Flow 2: Resume Current Version

1. Complete stage 1 of a workflow.
2. Press the stage transition button to enter stage 2.
3. Leave the workflow page.
4. Return through "resume current version".

Expected result: Stage 2 is current, stage 1 is reviewable, and stages after stage 2 are locked.

## Manual Flow 3: Tab Locking

1. Start a stage request.
2. Wait for it to complete.
3. Stay on the completed stage.
4. Try clicking the next tab before pressing the transition button.

Expected result: The next tab remains locked. It opens only after pressing the stage transition button.

## Manual Flow 4: Refresh During Active Request

1. Start a long-running stage request.
2. Refresh while it is queued or processing.
3. Wait for completion.

Expected result: The same loader appears after refresh, no duplicate request is submitted, and the completed output appears when the request finishes.

## Manual Flow 5: Concurrency Conflict Recovery

1. Open the same workflow run in two tabs.
2. Start or save the same stage from both tabs to create a conflict.
3. Let automatic retries exhaust.

Expected result: The affected stage remains selected, future stages remain locked, and the user sees a recovery action instead of an automatic retry or wrong tab unlock.

## Manual Flow 6: Snapshot Isolation

1. Open a previous snapshot or version.
2. Confirm read-only mode is visible.
3. Return to current version.

Expected result: The snapshot does not alter active run outputs, active request loaders, or tab accessibility.

## Release Checklist

- Start/resume/start-new tested on each supported workflow family.
- Refresh tested during queued, processing, completed, failed, and conflict states.
- Old job completion after start-new tested and ignored.
- Arabic error/recovery copy verified.
- No workflow page derives future tab access from output presence alone.
