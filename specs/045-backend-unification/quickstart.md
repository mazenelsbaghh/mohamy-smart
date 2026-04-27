# Quickstart: Backend Unification (045)

## Prerequisites

- Phase 0 (044-stabilize-patch) merged and branch compiles cleanly
- Docker running with SQL Server container (`make dev`)
- .NET 9 SDK installed
- DB migrations applied (`make db-migrate`)

## Development Workflow

### 1. Start from the feature branch

```bash
git checkout 045-backend-unification
```

### 2. Build and verify baseline

```bash
cd mohamy-smart-backend
dotnet build
```

### 3. Migration order (per R-001)

Follow this exact order. After each migration, rebuild and run existing tests:

1. **Foundation changes** (shared utilities, JsonOptions, ValidationFailureRecord, EF migration)
2. **LegalWarningService** → extend WorkflowServiceBase
3. **ExecRequestService** → extend WorkflowServiceBase
4. **AdminComplaintService** → audit existing base class usage, enforce standards
5. **AppealBriefService** → audit existing base class usage, enforce standards
6. **RulingAnalysisService** → extend WorkflowServiceBase
7. **SmartAnalysisService** → compatibility layer (inject ICaseAccessValidator, use shared utilities)
8. **PreparingStatementOfClaimsService** → compatibility layer (inject ICaseAccessValidator, use shared utilities)
9. **Cleanup** — remove Newtonsoft.Json from non-workflow code (GeminiProvider, CaseOcrService)

### 4. After each service migration

```bash
dotnet build                    # Must compile
# Test the specific workflow end-to-end via Postman or the dashboard
```

### 5. Final validation

```bash
# Search for any remaining Newtonsoft references in workflow services
grep -r "Newtonsoft" Lawyer.Application/Services/ --include="*.cs"

# Search for any remaining duplicate CleanJsonResponse
grep -rn "CleanJsonResponse" Lawyer.Application/Services/ --include="*.cs"

# Verify all workflows compile
dotnet build
```

## Key Files to Monitor

| File | Role |
|------|------|
| `Lawyer.Application/Common/JsonOptions.cs` | New — canonical JSON presets |
| `Lawyer.Application/Common/AnalysisHelpers.cs` | Existing — shared utilities |
| `Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` | Existing — base class |
| `Lawyer.Application/Services/Workflows/StepOutputSchemas.cs` | Existing — schema validation |
| `Lawyer.Application/Services/Workflows/StepOutputDtos.cs` | Existing — typed DTOs |
| `Lawyer.Application/Services/CaseAccessValidator.cs` | Existing — shared security |
| `Lawyer.Core/Models/ValidationFailureRecord.cs` | New — failure logging entity |
