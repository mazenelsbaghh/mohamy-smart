# Research: Phase 1 — Backend Critical Fixes

**Branch**: `061-p1-backend-fixes` | **Date**: 2026-04-23

## 1. Transaction Support for Case Creation

**Decision**: Use existing `IUnitOfWork.BeginTransactionAsync()` with explicit commit/rollback.

**Rationale**: The `IUnitOfWork` interface at `Lawyer.Core/IRepositories/IUnitOfWork.cs` already exposes `BeginTransactionAsync()` returning `IDbContextTransaction`. The implementation at `Lawyer.Infrastracture/Persistence/Repositories/UnitOfWork.cs` wraps EF Core's `Database.BeginTransactionAsync()`. Case creation in `CaseService.cs:46-139` performs up to 4 separate `SaveChangesAsync` calls — wrapping them in a transaction ensures atomicity.

**Implementation approach**:
```csharp
await using var transaction = await _unitOfWork.BeginTransactionAsync();
try
{
    // ... existing case creation logic with multiple SaveChangesAsync ...
    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
```

**Alternatives considered**:
- EF Core `ExecuteTransactionAsync()` (ambient transaction) — rejected because the service uses `IUnitOfWork` abstraction, not raw `DbContext`.
- MediatR behavior pipeline — rejected as over-engineering for a single service method.

---

## 2. Audit Fields (CreatedBy/UpdatedBy) Auto-Population

**Decision**: Create an EF Core `SaveChangesInterceptor` (`AuditInterceptor`) that resolves the current user ID from `IHttpContextAccessor` and populates `CreatedBy`/`UpdatedBy` on `BaseEntity` instances.

**Rationale**: `BaseEntity<TKey>` at `Lawyer.Core/Models/BaseEntity.cs` already has `CreatedBy` (Guid) and `UpdatedBy` (Guid?) fields. Currently these fields are never populated. An interceptor is the idiomatic EF Core approach — it runs automatically on every `SaveChangesAsync` without modifying service code.

**Key consideration**: The interceptor needs `IHttpContextAccessor` to get the current user's claim. Since interceptors are registered in DI, this is straightforward. Must handle the case where no HTTP context is available (e.g., Hangfire background jobs).

**Alternatives considered**:
- Manual population in each service — rejected as error-prone and duplicative.
- Middleware-based approach — rejected because `SaveChanges` may happen outside request scope.

---

## 3. Refresh Token Invalidation on Password Reset

**Decision**: In `AuthService.ResetPasswordAsync()` (line 900) and `ChangePasswordAsync()`, after successfully changing the password, clear `user.RefreshToken` and `user.RefreshTokenExpiresAt`.

**Rationale**: The `ApplicationUser` already has `RefreshToken` (SHA-256 hash) and `RefreshTokenExpiresAt` fields. `RevokeRefreshTokenAsync()` (line 993) already nulls these fields. We just need to call the same logic (or inline it) after password change succeeds. This ensures all active sessions are terminated.

**Implementation approach**: After `UserManager.ResetPasswordAsync()` succeeds, set `user.RefreshToken = null` and `user.RefreshTokenExpiresAt = null`, then `UpdateAsync(user)`.

---

## 4. FluentValidation for DTOs

**Decision**: Create dedicated validator classes for each DTO, using FluentValidation's `AbstractValidator<T>`. Register them via ASP.NET Core's FluentValidation integration middleware.

**Rationale**: The project already has FluentValidation installed and 3 existing validators (`LoginValidator`, `RegisterValidator`, `UpdateSubscriptionDtoValidator`). `CustomValidator.cs` provides reusable helpers (`BeAValidEgyptianPhoneNumber`, `BeAValidSaudiNationalId`). We follow the same pattern.

**Validation rules discovered from DTO analysis**:

| DTO | Required Fields | Format Rules |
|-----|----------------|--------------|
| `CreateCaseDto` | Title, Number, Court, ClientName | Title max 200 chars |
| `UpdateCaseDto` | Title, Number, Court, ClientName | Title max 200 chars |
| `CreateClientDto` | ClientName, PhoneNumber | Phone: Egyptian format, Email: valid format, NationalId: valid format |
| `UpdateClientDto` | ClientName, PhoneNumber | Same as Create |
| `ChangePasswordDto` | CurrentPassword, NewPassword, ConfirmPassword, OtpCode | Password complexity, NewPassword == ConfirmPassword |
| `SubmitContactRequestDto` | Name, Phone, Message | Phone format, Message max 1000 chars |

**Payment method validation**: `PaymentController.cs:39` receives `paymentMethod` as a raw query string parameter. Validation should be added in `PaymobService.InitiatePaymentAsync()` to whitelist `"card"` and `"wallet"` — matching the comment in `Payment.cs:14`.

---

## 5. LoginValidator Fix

**Decision**: Remove password complexity rules from `LoginValidator`. Login should only check that phone/email and password are non-empty. Password complexity is a registration/change-password concern.

**Rationale**: The current `LoginValidator` applies the same complexity regex used for registration. This is unnecessary friction at login — users with valid passwords would be blocked from logging in if the complexity rules changed after they registered.

**Namespace fix**: Change from `MyProject.Core.Validators.Auth` to `Lawyer.Application.Validators`.

---

## 6. Correlated Subquery Fix

**Decision**: Replace the correlated subquery in `AccountService.cs:140` with a pre-computed `Dictionary<Guid, int>` via a single GROUP BY query.

**Current code** (line 139-141):
```csharp
// Inside Select projection — causes N+1:
NumberOfCases = casesQuery.Count(c => c.LawyerId == u.Lawyer.Id)
```

**Fixed approach**:
```csharp
var caseCounts = await _unitOfWork.Repository<Case>()
    .AsQueryable()
    .GroupBy(c => c.LawyerId)
    .Select(g => new { LawyerId = g.Key, Count = g.Count() })
    .ToDictionaryAsync(x => x.LawyerId, x => x.Count, cancellationToken);
```

Then use `caseCounts.GetValueOrDefault(u.Lawyer.Id)` in the projection.

**Rationale**: This reduces the query from O(N) subqueries to 2 queries total (1 main + 1 group-by), regardless of user count.

---

## 7. Max Page Size Capping

**Decision**: Add a shared helper method or constant. Apply `if (pageSize > 100) pageSize = 100;` at the start of every paginated service method.

**Rationale**: Multiple services accept `pageNumber` and `pageSize` parameters. The simplest approach is a static helper:
```csharp
public static class PaginationDefaults
{
    public const int DefaultPageSize = 10;
    public const int MaxPageSize = 100;
    
    public static int ClampPageSize(int pageSize) =>
        pageSize <= 0 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);
}
```

---

## 8. Prompt Template Caching

**Decision**: Create a `PromptTemplateCache` service using `ConcurrentDictionary<string, string>` with lazy file reads.

**Rationale**: 60+ `File.ReadAllTextAsync` calls were found across `SmartAnalysisService`, `PreparingStatementOfClaimsService`, `LegalContractService`, `CaseOcrService`, `ClarifyFactsService`, and `WorkflowServiceBase`. Prompt files are static — read-once and cache forever is the correct strategy.

**Implementation approach**: A singleton service registered in DI:
```csharp
public class PromptTemplateCache
{
    private readonly ConcurrentDictionary<string, string> _cache = new();
    private readonly string _contentRootPath;
    
    public async Task<string> GetAsync(string relativePath, CancellationToken ct)
    {
        return await _cache.GetOrAdd(relativePath, async _ =>
        {
            var fullPath = Path.Combine(_contentRootPath, "wwwroot", "prompts", relativePath);
            return await File.ReadAllTextAsync(fullPath, ct);
        });
    }
}
```

**Alternatives considered**:
- `IMemoryCache` — rejected as over-engineering for static content.
- Static `Dictionary` — rejected because initialization needs `IContentRootPath`.

---

## 9. Code Consolidation — OtpHelper

**Decision**: Extract `GenerateOtpCode()`, `GenerateSalt()`, `HashOtpCode()`, `MatchesOtp()` into `Lawyer.Application/Common/OtpHelper.cs` as a static class.

**Rationale**: Identical implementations exist in `AuthService.cs` (lines 155-171) and `AccountService.cs` (lines 47-71). Both use `RandomNumberGenerator` for OTP, `SHA256` for hashing, and `HMACSHA256` for matching.

---

## 10. Code Consolidation — EmailTemplateBuilder

**Decision**: Extract `BuildEmailTemplate()` into `Lawyer.Application/Common/EmailTemplateBuilder.cs` as a static class.

**Rationale**: Identical HTML template builder exists in `AuthService.cs` (line 51) and `SubscriptionService.cs` (line 371). Both generate Arabic RTL HTML with Tajawal font.

---

## 11. Code Consolidation — LawyerIdResolver

**Decision**: Extract `ResolveLawyerIdAsync()` into `Lawyer.Application/Common/LawyerIdResolver.cs` as a static helper or instance service.

**Rationale**: The method is duplicated in `CaseService.cs` (line 337), `ClientService.cs` (line 225), `LawyerTaskService.cs` (line 250), and `ProcessServerPaperService.cs` (line 33). All follow the same pattern: resolve current user → find their Lawyer entity → return the Lawyer ID.

**Key consideration**: The method depends on `IHttpContextAccessor` and `IUnitOfWork`. Making it a service registered in DI (rather than static) allows proper dependency injection.

---

## 12. Namespace Fixes

**Decision**: Fix two namespace issues:
1. `AccountService.cs` uses `Lawyer.Infrastracture.Services.Identity` → change to `Lawyer.Application.Services`
2. `LoginValidator.cs` uses `MyProject.Core.Validators.Auth` → change to `Lawyer.Application.Validators`

**Rationale**: Files should be in the namespace matching their project location per Clean Architecture conventions.

---

## 13. DI Registration for Validators

**Decision**: Add validators to ASP.NET Core DI. The project currently has FluentValidation registered but needs to verify the registration includes all assemblies.

**Current state**: `SubscriptionController.cs:4` has `using Lawyer.Application.Validators.MyProject.Core.Validators.Auth;` — this broken import confirms the namespace issue and suggests validators may need proper assembly scanning.

**Implementation**: Ensure `Program.cs` has:
```csharp
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssembly(Assembly.GetAssembly(typeof(LoginValidator)));
```

---

## Summary of All Decisions

| # | Decision | Risk | Effort |
|---|----------|------|--------|
| 1 | Transaction wrapper via IUnitOfWork | Low | Small |
| 2 | AuditInterceptor for CreatedBy/UpdatedBy | Low | Medium |
| 3 | Clear refresh tokens on password change | Low | Small |
| 4 | FluentValidation for 6 DTO groups | Low | Medium |
| 5 | Remove password complexity from LoginValidator | Low | Small |
| 6 | Replace correlated subquery with GROUP BY | Low | Small |
| 7 | PaginationDefaults helper with maxPageSize=100 | Low | Small |
| 8 | PromptTemplateCache singleton with ConcurrentDictionary | Low | Small |
| 9 | OtpHelper static class extraction | Low | Small |
| 10 | EmailTemplateBuilder static class extraction | Low | Small |
| 11 | LawyerIdResolver service extraction | Low | Medium |
| 12 | Namespace fixes (2 files) | Low | Small |
| 13 | DI assembly scanning for validators | Low | Small |
