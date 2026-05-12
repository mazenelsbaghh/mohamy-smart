# Quickstart: AI Points Deduction

**Branch**: `074-ai-points-deduction`  
**Date**: 2026-05-12

## Goal

Verify that every chargeable AI action deducts points only after a successful usable result, never deducts on errors, and requires confirmation before retry, regenerate, re-run, or start-over actions.

## Prerequisites

1. Run the local stack on canonical ports.
2. Apply backend migrations.
3. Use a lawyer account with an active subscription and known AI point balance.
4. Have at least one case with enough data to run AI workflow steps.

Useful commands:

```bash
make dev
make db-migrate
```

Frontend checks can use the app test command from the relevant dashboard package:

```bash
cd apps/lawyer-dashboard
npm test
npm run lint
```

Backend checks can use the backend test project:

```bash
cd mohamy-smart-backend
dotnet test Lawyer.Tests
```

## Scenario 1: Successful Initial AI Request Charges Once

1. Record the lawyer's current AI point balance.
2. Open a case workflow, such as ruling analysis or legal warning.
3. Submit a first-time AI step.
4. Wait until the result is completed and visible.
5. Confirm the balance decreases by the step cost exactly once.
6. Refresh the page.
7. Confirm the completed result remains visible and the balance does not decrease again.

Expected result:

- Job is completed.
- Charge state is `Charged`.
- Point history contains one charge for the job.

## Scenario 2: Failed AI Request Does Not Charge

1. Use a test path or mock provider behavior that forces an AI failure.
2. Submit the AI action.
3. Wait until the failure state appears.
4. Confirm the visible balance matches the pre-request balance.
5. Confirm the message says no points were deducted.

Expected result:

- Job is failed/conflicted/cancelled/invalid.
- Charge state is `NoCharge` or restored.
- Point history records no successful charge.

## Scenario 3: Retry Requires Confirmation

1. Start from a failed AI request.
2. Click retry.
3. Confirm a modal appears before any new request is submitted.
4. Click cancel.
5. Confirm no new job starts and no points are deducted.
6. Click retry again.
7. Accept the confirmation.
8. Let the retry succeed.
9. Confirm points are deducted once for the successful retry.

Expected result:

- Declining confirmation creates no request.
- Accepted retry includes repeat intent.
- Successful retry is charged once.

## Scenario 4: Regenerate Or Re-run Requires Confirmation

1. Start from a successful AI result.
2. Click regenerate, re-run, or start-over.
3. Confirm a modal states the action will consume points if successful.
4. Cancel and verify the old result remains.
5. Repeat and accept.
6. Confirm a new request starts.
7. Confirm points are deducted only if the new result succeeds.

Expected result:

- Existing successful output is not overwritten by a declined confirmation.
- New successful repeated output creates a separate charge.

## Scenario 5: Insufficient Points Blocks Before Queueing

1. Use a lawyer account with zero available AI points.
2. Attempt a chargeable AI action.
3. Confirm the request is blocked before a queued job is created.
4. Confirm the balance stays unchanged.
5. Confirm the UI shows an Arabic insufficient-points message.

Expected result:

- No AI job is queued.
- No point transaction of type `Charge` is created.

## Scenario 6: Duplicate Prevention

1. With enough points, rapidly double-click an AI submit button.
2. Refresh while the job is queued or processing.
3. Wait for completion.
4. Confirm only one backend job is active for the same run/stage.
5. Confirm only one charge exists for the completed job.

Expected result:

- Duplicate frontend dispatches are ignored.
- Backend idempotency prevents duplicate charges.

## Scenario 7: Historical Output Viewing Is Free

1. Open a completed workflow or historical snapshot.
2. Navigate across previously completed AI stages.
3. Confirm no confirmation appears and no point transaction is created.
4. Confirm balance stays unchanged.

Expected result:

- Viewing existing outputs never consumes points.

## Regression Areas

- AI job SignalR status updates still hydrate workflow output.
- Workflow refresh/resume still opens the correct stage.
- Case ownership checks still block unauthorized AI actions.
- Admin AI usage reports still load after ledger changes.
- Existing subscription page displays used/limit values consistently.

## Validation Notes

Recorded on 2026-05-12:

- `dotnet build Lawyer.sln`: passed with existing warnings.
- `dotnet test Lawyer.Tests --filter FullyQualifiedName~AiJobServiceTests`: passed, 9/9.
- `dotnet test Lawyer.Tests`: failed 1 unrelated auth integration test, `CookieAuthIntegrationTests.FullAuthFlow_ShouldWorkProperly`, because `/api/v1/auth/me` returned 401 after a successful login; point-accounting tests passed.
- `apps/lawyer-dashboard npm run type-check`: passed.
- `apps/admin-dashboard npm run type-check`: passed.
- `apps/lawyer-dashboard npm test -- --run`: passed, 74/74.
- `apps/lawyer-dashboard npm run lint`: failed on pre-existing unrelated files `AddNewContractsForm.tsx`, `thunkChangePhoneRequest.ts`, and `thunkChangePhoneVerify.ts`.
- `apps/admin-dashboard npm run lint`: passed.
- Manual scenarios 1-7 were not executed against a running local stack in this turn.
