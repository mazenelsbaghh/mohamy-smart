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

## Lifecycle Verification Checkpoints

- [ ] Start-new creates a fresh run with `currentAccessibleStep=0` and no prior outputs
- [ ] Resume returns the latest active run with correct `currentAccessibleStep`
- [ ] Advance-stage only succeeds when source step has completed output
- [ ] Output completion sets `lastCompletedStep` but not `currentAccessibleStep`
- [ ] Active job lookup returns queued/processing jobs scoped to run
- [ ] SignalR events include `runId` and `stepNumber` for client filtering
- [ ] Conflict state keeps future stages locked
- [ ] Conflict recovery requires explicit user retry or reload
- [ ] Refresh recovers loader for active queued/processing requests
- [ ] Old run job completions are ignored for newer active runs

## Backend Test Results

Executed: `dotnet test mohamy-smart-backend/Lawyer.Tests/Lawyer.Tests.csproj --filter "WorkflowLifecycle|AiJobService|AiJobWorker"`

**Result: 48 passed, 1 failed, 0 skipped (49 total)**

Failed test:
- `ExecRequestAiJobWorkerTests.ProcessAsync_ShouldMarkJobFailedWithoutThrowing_WhenWorkflowConflictOccurs`
  - Expected: `AiJobStatus.Failed` (value: 3)
  - Actual: `AiJobStatus.Conflict` (value: 4)
  - Location: `Lawyer.Tests/Services/AiJobWorker/ExecRequestAiJobWorkerTests.cs:108`
  - Root cause: Test expects `Failed` but the worker now correctly preserves `Conflict` status — test assertion is stale.

## Frontend Test Results

Executed: `npx vitest run` for lifecycle test files

**Result (lifecycle files only): 8 passed, 5 failed (13 total) across 3 test files**

- `createWorkflowSlice.lifecycle.test.ts` — 5/5 passed
- `aiJobsSlice.lifecycle.test.ts` — 3/3 passed
- `useWorkflowOrchestrator.lifecycle.test.tsx` — 0/5 passed (all fail with `ReferenceError: document is not defined` when run via direct file path — needs jsdom environment)

Note: When run via `npm test` with proper vitest config (jsdom enabled), 4 of 5 orchestrator tests pass. Only `fresh=1 query param should start at step 1 after refresh` fails: `expected 0 to be greater than or equal to 1`.

## Lint Results

Executed: `npm run lint` (turbo run lint across all packages)

**Result: @mohamy/lawyer-dashboard lint passed, @mohamy/landing lint failed**

- `@mohamy/admin-dashboard` — passed (cached)
- `@mohamy/lawyer-dashboard` — passed
- `@mohamy/landing` — **failed**: `Cannot find module 'next/dist/compiled/babel/eslint-parser'` (missing Next.js ESLint dependency)

## Full Test Suite Results

Executed: `npm test --workspace=@mohamy/lawyer-dashboard` (via vitest)

**Result: 38 passed, 2 failed (40 total) across 11 test files**

Failed tests:
1. `src/APIs/api.test.ts > keeps route constants relative to the configured API base URL` — Expected `/legal-contracts`, got `/LegalContracts` (casing mismatch in API_ROUTES constant)
2. `src/hooks/__tests__/useWorkflowOrchestrator.lifecycle.test.tsx > fresh=1 query param should start at step 1 after refresh` — `expected 0 to be greater than or equal to 1` (start action not triggered on fresh=1 query param)

## Workflow Lifecycle Mapping Table

| Workflow Type | Controller | Steps | CaseIdBased | Notes |
|---|---|---|---|---|
| Smart Analysis / Defense Memo | smart-analysis | 5 | Yes | Uses AiJob directly, no WorkflowBase entity |
| Preparing Statement of Claims | PreparingStatementOfClaims | 8 (facts + 6 lawsuit + draft) | Yes | Legacy service, individual step tables |
| Appeal Brief | appeal-briefs | 6 | No | WorkflowBase entity |
| Admin Complaint | admin-complaints | 5 | No | WorkflowBase entity |
| Ruling Analysis | ruling-analysis | 4 | No | WorkflowBase entity |
| Legal Warning | legal-warnings | 3 | No | WorkflowBase entity |
| Execution Request | exec-requests | 3 | No | WorkflowBase entity |

### Lifecycle Endpoints

| Action | Method | Path | Notes |
|---|---|---|---|
| Start New Run | POST | `/{controller}/{caseId}/start-new` | Creates fresh run, archives previous |
| Resume Current | GET | `/{controller}/case/{caseId}/resume` | Returns latest active run state |
| Advance Stage | POST | `/{controller}/{id}/advance-stage` | `{ fromStep, toStep }` - unlocks next tab |
| Recover Conflict | POST | `/{controller}/{id}/recover-conflict` | Clears conflict, returns safe state |
| Active Job Lookup | GET | `/cases/{caseId}/ai-jobs/active` | Query params: runId, workflowType, stepNumber |

## Manual Verification (T109)

**Status**: Pending manual verification on `http://localhost:5078`

The following scenarios require manual browser testing:

1. **Start New Cleanly**: Navigate to a case with previous workflow progress, choose "بدء إصدار جديد", verify first stage opens with no old output. Refresh immediately and confirm clean run persists.

2. **Resume Current Version**: Complete stage 1, press transition button, leave workflow, return via "استكمال الإصدار الحالي". Confirm stage 2 is current, stage 1 is reviewable, later stages locked.

3. **Tab Locking**: Complete a stage, confirm next tab is disabled until transition button is pressed. Press transition and confirm next tab opens.

4. **Refresh During Active Work**: Start a long-running stage request, refresh while queued/processing. Confirm loader returns without duplicate submission.

5. **Conflict Recovery**: Force a concurrency conflict (two tabs same workflow). Confirm affected stage shows conflict with Arabic recovery message and retry/reload buttons.

6. **Snapshot Isolation**: Open a historical snapshot, confirm read-only mode, return to current version without state corruption.

**Note**: Run these manually before production release.
