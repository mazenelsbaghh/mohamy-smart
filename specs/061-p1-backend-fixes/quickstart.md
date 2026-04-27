# Quickstart: Phase 1 — Backend Critical Fixes

**Branch**: `061-p1-backend-fixes` | **Date**: 2026-04-23

## Prerequisites

- .NET 9 SDK installed
- SQL Server running (Docker: `make dev` or manual)
- Backend can compile: `dotnet build mohamy-smart-backend/Lawyer.sln`

## Implementation Order

Tasks are ordered by dependency and risk. Complete each group before moving to the next.

### Group 1: Shared Utilities (no dependencies — do first)

These are new files that other tasks will reference:

1. **OtpHelper** — `Lawyer.Application/Common/OtpHelper.cs`
   - Extract from `AuthService.cs` lines 155-171
   - Static class with `GenerateOtpCode()`, `GenerateSalt()`, `HashOtpCode()`, `MatchesOtp()`
   - Update `AuthService.cs` and `AccountService.cs` to use `OtpHelper` instead of private methods

2. **EmailTemplateBuilder** — `Lawyer.Application/Common/EmailTemplateBuilder.cs`
   - Extract from `AuthService.cs` line 51
   - Static class with `BuildEmailTemplate(string title, string body)`
   - Update `AuthService.cs` and `SubscriptionService.cs` to use it

3. **LawyerIdResolver** — `Lawyer.Application/Common/LawyerIdResolver.cs`
   - Extract from `CaseService.cs` line 337 (most complete version)
   - Injectable service with `ResolveAsync(Guid? overrideId, CancellationToken ct)`
   - Update `CaseService`, `ClientService`, `LawyerTaskService`, `ProcessServerPaperService`

4. **PaginationDefaults** — `Lawyer.Application/Common/PaginationDefaults.cs`
   - Static class with `ClampPageSize(int)` method
   - Apply in all service methods that accept `pageSize`

5. **PromptTemplateCache** — `Lawyer.Application/Common/PromptTemplateCache.cs`
   - Singleton service with `ConcurrentDictionary<string, string>` cache
   - Update `WorkflowServiceBase` and individual services to use cache

6. **Fix namespaces**
   - `AccountService.cs`: `Lawyer.Infrastracture.Services.Identity` → `Lawyer.Application.Services`
   - `LoginValidator.cs`: `MyProject.Core.Validators.Auth` → `Lawyer.Application.Validators`
   - `SubscriptionController.cs`: Fix broken import `Lawyer.Application.Validators.MyProject.Core.Validators.Auth`

### Group 2: Data Integrity (depends on Group 1)

7. **AuditInterceptor** — `Lawyer.Infrastracture/Persistence/AuditInterceptor.cs`
   - New `SaveChangesInterceptor` that populates `CreatedBy`/`UpdatedBy`
   - Register in `Program.cs` DI: `builder.Services.AddSingleton<AuditInterceptor>()` and `options.AddInterceptors()`

8. **Transaction for Case Creation** — modify `CaseService.cs`
   - Wrap lines 46-139 in `await using var tx = await _unitOfWork.BeginTransactionAsync();`
   - Add try/catch with rollback

9. **Refresh Token Invalidation** — modify `AuthService.cs`
   - In `ResetPasswordAsync()` (~line 900): after successful password reset, clear `RefreshToken` and `RefreshTokenExpiresAt`
   - In `ChangePasswordAsync()` (if exists): same pattern

### Group 3: Validation (depends on Group 1 for CustomValidator reuse)

10. **CaseValidator** — `Lawyer.Application/Validators/CaseValidator.cs`
    - `CreateCaseValidator : AbstractValidator<CreateCaseDto>`
    - `UpdateCaseValidator : AbstractValidator<UpdateCaseDto>`

11. **ClientValidator** — `Lawyer.Application/Validators/ClientValidator.cs`
    - `CreateClientValidator : AbstractValidator<CreateClientDto>`
    - `UpdateClientValidator : AbstractValidator<UpdateClientDto>`

12. **ChangePasswordValidator** — `Lawyer.Application/Validators/ChangePasswordValidator.cs`

13. **ContactRequestValidator** — `Lawyer.Application/Validators/ContactRequestValidator.cs`

14. **Fix LoginValidator** — modify `Lawyer.Application/Validators/LoginValidator.cs`
    - Remove password complexity rules (keep only NotEmpty)
    - Fix namespace

15. **Payment method validation** — modify `PaymobService.cs`
    - Add whitelist check at start of `InitiatePaymentAsync()`

16. **DI Registration** — modify `Lawyer/Program.cs`
    - Ensure `AddValidatorsFromAssembly` scans `Lawyer.Application` assembly
    - Ensure `AddFluentValidationAutoValidation()` is called

## Verification

After all changes:

```bash
# Build
dotnet build mohamy-smart-backend/Lawyer.sln

# Run tests (if any exist)
dotnet test mohamy-smart-backend/Lawyer.Tests

# Manual smoke test
cd mohamy-smart-backend/Lawyer
dotnet run
# Then test: POST /api/case with empty title → expect 400 with Arabic error messages
# Test: POST /api/case with valid data, force failure → expect full rollback
# Test: POST /api/account/change-password → old refresh token rejected
# Test: GET /api/account/lawyers with pageSize=500 → expect max 100 results
```

## Key Files to Modify

| File | Change Type |
|------|-------------|
| `Lawyer.Application/Services/CaseService.cs` | Transaction wrapper |
| `Lawyer.Application/Services/AccountService.cs` | Namespace fix, use OtpHelper, fix subquery |
| `Lawyer.Application/Services/AuthService.cs` | Token invalidation, use OtpHelper/EmailTemplateBuilder |
| `Lawyer.Application/Services/SubscriptionService.cs` | Use EmailTemplateBuilder |
| `Lawyer.Application/Services/ClientService.cs` | Use LawyerIdResolver, PaginationDefaults |
| `Lawyer.Application/Services/LawyerTaskService.cs` | Use LawyerIdResolver |
| `Lawyer.Application/Services/ProcessServerPaperService.cs` | Use LawyerIdResolver |
| `Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` | Use PromptTemplateCache |
| `Lawyer.Application/Services/PaymobService.cs` | Payment method whitelist |
| `Lawyer.Application/Validators/LoginValidator.cs` | Remove complexity, fix namespace |
| `Lawyer/Controllers/SubscriptionController.cs` | Fix broken import |
| `Lawyer/Program.cs` | Register AuditInterceptor, validators |
| `Lawyer.Infrastracture/Persistence/Repositories/UnitOfWork.cs` | No change (already has BeginTransactionAsync) |
