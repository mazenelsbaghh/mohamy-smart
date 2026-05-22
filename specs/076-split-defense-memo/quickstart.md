# Quickstart: Split Defense Memo Generation

## Scenario 1: Generate a memo with multiple defenses

1. Open a case in the lawyer dashboard.
2. Start the defense memo workflow.
3. Complete fact analysis, defense generation, individual defense analysis, and final requests.
4. Open the final memo stage.
5. Select at least two defenses and at least one request.
6. Generate the final memo.
7. Verify the final memo has this order: opening, facts, defenses, requests, closing.
8. Verify every selected defense appears exactly once under the defense section.

## Scenario 2: Verify one-point billing

1. Record the lawyer AI point balance before final memo generation.
2. Generate a final memo with multiple selected defenses.
3. Wait for successful completion.
4. Confirm the balance decreased by exactly one point.
5. Repeat after confirming regeneration and verify the regeneration also maps to one visible final memo charge.

## Scenario 3: Verify admin cost visibility

1. Generate a final memo with multiple selected defenses.
2. Open the admin usage/cost report for the lawyer or case.
3. Confirm usage appears under the defense memo workflow.
4. Confirm the final memo drafting stage includes the provider cost from the internal frame and defense drafting operations.

## Scenario 4: Verify failure behavior

1. Simulate an internal drafting failure.
2. Confirm the parent final memo job fails.
3. Confirm no completed final memo HTML is saved for the failed job.
4. Confirm no successful-generation point is charged.

## Implementation Validation Notes

- Backend validation command completed successfully: `dotnet build Lawyer.sln`.
- Lawyer dashboard validation commands completed successfully: `npm run lint` and `npm run build`.
- The frontend production build emitted an existing chunk-size warning only; it did not fail the build.
- Additional backend test command `dotnet test Lawyer.Tests/Lawyer.Tests.csproj --no-build` ran 121 tests: 120 passed and `CookieAuthIntegrationTests.FullAuthFlow_ShouldWorkProperly` failed with 401 Unauthorized instead of 200 OK.
- Runtime scenarios still require a configured AI provider and case data with completed defense explanations and final requests.
