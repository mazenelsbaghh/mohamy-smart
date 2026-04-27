# Quickstart: Fix AI Stages Data Flow

**Feature Branch**: `042-fix-data-flow`

## Prerequisites

- Docker running (for SQL Server)
- `make dev` or backend + frontend running locally
- Branch `042-fix-data-flow` checked out

## What This Feature Fixes

1. **Backend**: Removes `[JsonPropertyName("snake_case")]` from all AI step DTOs so that the global CamelCase serializer works correctly, preventing snake_case from leaking into `ResultJson`.
2. **Backend**: Switches `StepOutputSchemas` and `PreparingStatementOfClaimsService` parsers to `SnakeCaseLower` policy for correct AI response deserialization.
3. **Frontend**: Enhances `deepCamelize` in `parseJobResult.ts` to handle both PascalCase and snake_case → camelCase conversion for legacy DB data.
4. **Frontend**: Adds `parseResult` handlers to all workflow step components to unwrap the `{ output: "..." }` wrapper from AI job results.
5. **Frontend**: Adds `stepHydrators` with normalization to `preparingStatementOfClaimsUnifiedSlice.ts`.

## Verification Steps

1. **Backend compilation**:
   ```bash
   cd mohamy-smart-backend && dotnet build
   ```

2. **Frontend compilation**:
   ```bash
   cd mohamy-smart-lawyer-dashboard && npm run build
   ```

3. **Functional testing** (for each pipeline):
   - Start a new AI analysis (SmartAnalysis, PrepStatement, AppealBrief, AdminComplaint, LegalWarning, ExecRequest, RulingAnalysis)
   - Verify step data appears populated in the UI (no empty/undefined fields)
   - Refresh the page — verify data re-hydrates correctly from the getWorkflow path
   - Check browser console for Redux errors or `undefined` property access warnings

## Key Files Changed

### Backend
- `Lawyer.Application/Services/Workflows/StepOutputDtos.cs`
- `Lawyer.Application/Services/Workflows/StepOutputSchemas.cs`
- `Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`
- `Lawyer.Application/Dtos/PreparingStatementOfClaims/*.cs` (6 DTO files)

### Frontend
- `src/utils/parseJobResult.ts`
- `src/redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice.ts`
- `src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep*.tsx` (6 files)
- `src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep*.tsx` (5 files)
- `src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep*.tsx` (3 files)
- `src/pages/cases/subPagesCases/analysis/execRequest/steps/ExecStep*.tsx` (3 files)
- `src/pages/cases/subPagesCases/analysis/rulingAnalysis/steps/RulingStep*.tsx` (4 files)
