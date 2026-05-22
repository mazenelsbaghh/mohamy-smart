# Plan: Fix Antiforgery Validation & Point Deductions

We will resolve the Bearer-token Antiforgery validation failure and fix the AI points deduction behavior so that exactly 1 point is charged per workflow/stage run.

## Proposed Changes

### C# Backend - Antiforgery Validation Bypass

#### [MODIFY] [AntiforgeryExceptionFilter.cs](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/mohamy-smart-backend/Lawyer/Filters/AntiforgeryExceptionFilter.cs)
- Update `ShouldValidate` to check if the `Authorization` request header starts with `"Bearer "`. If it does, return `false` to bypass validation. Mobile clients authenticated with JWT Bearer tokens do not need CSRF protection because browsers do not attach custom headers automatically.

### C# Backend - Points Accounting (1 Point per Workflow Run)

#### [MODIFY] [IAiPointAccountingService.cs](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/mohamy-smart-backend/Lawyer.Application/IServices/IAiPointAccountingService.cs)
- Change `ValidateCanStartAsync` signature to accept `string? runId` and `string? workflowType`.

#### [MODIFY] [AiPointAccountingService.cs](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/mohamy-smart-backend/Lawyer.Application/Services/AiPointAccountingService.cs)
- Update `ValidateCanStartAsync` implementation:
  - If `runId` is provided, check if a transaction with `WorkflowRunId == runId` and `TransactionType == AiPointTransactionType.Charge` already exists.
  - If so, treat the cost as `0` points, allowing the user to continue execution even with a zero balance.
- Update `ChargeSuccessfulJobAsync` implementation:
  - If `job.RunId` is provided, check if a transaction with `WorkflowRunId == job.RunId` and `TransactionType == AiPointTransactionType.Charge` already exists.
  - If so, complete the job with `0` charged points, set the charge state to `NoCharge`, log a transaction of type `NoCharge` explaining that the workflow run was already charged, and bypass points deduction.

#### [MODIFY] [AiJobService.cs](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobService.cs)
- Update call to `_points.ValidateCanStartAsync` in `SubmitAsync` to pass `dto.RunId` and `dto.WorkflowType`.

#### [MODIFY] [CaseOcrService.cs](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/mohamy-smart-backend/Lawyer.Application/Services/CaseOcrService.cs)
- Update point checking and deduction to query `_pointAccounting.ResolvePointCost(AiStepType.Ocr)` (which is `0`) instead of using the hardcoded `GenerateCasePointCost = 1` constant.
- Change the log and user-visible message to reflect 0 points when the resolved cost is 0.

## Verification Plan

### Automated Tests
- Run `dotnet build` on the backend solution to ensure it compiles without issues.
- Run backend unit tests using `dotnet test`.

### Manual Verification
- Test workflow runs via both the mobile client and dashboard, ensuring:
  1. Requests bypass the Antiforgery filter successfully when using a Bearer token.
  2. The first step of a workflow run deducts exactly 1 point, and subsequent steps in the same run (same `RunId`) deduct 0 points.
