# Quickstart: Chat Free Quota

## Prerequisites

- Backend builds locally from `mohamy-smart-backend/`.
- Test database setup is not required for the targeted unit tests.

## Validation Commands

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend"
dotnet test Lawyer.Tests/Lawyer.Tests.csproj --filter SmartChatServiceTests
dotnet build Lawyer.sln --no-restore
```

## Manual Verification Scenario

1. Authenticate as a lawyer.
2. Ensure the lawyer has fewer than five previous successful smart chat replies.
3. Call `POST /api/v1/SmartAnalysis/chat` with a normal Arabic message.
4. Confirm the response succeeds and no AI point is deducted.
5. Repeat until five successful replies exist.
6. Call the chat endpoint again with at least one available point.
7. Confirm exactly one AI point is deducted.
8. Set available points to zero after the free quota is exhausted.
9. Call the chat endpoint again.
10. Confirm the endpoint returns `402 Payment Required` and does not generate a provider response.

## UX Review Notes

- No new visual UI is introduced.
- Existing Arabic error display should surface the insufficient-points message without English fallback.
- Do not add modal confirmation for chat; it would interrupt a conversational workflow.
