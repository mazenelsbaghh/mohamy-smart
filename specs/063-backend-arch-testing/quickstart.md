# Quickstart: Backend Architecture Improvements & Testing Polish

**Branch**: `063-backend-arch-testing` | **Date**: 2026-04-23

## Prerequisites

- All previous phases (P0-P5) completed and merged
- .NET 9 SDK installed
- Node 22 installed
- Local environment running (`make dev`)
- SQL Server Docker container running on port 1433

## Architecture Changes Quick Reference

### Service Layer — Explicit User ID

**Before**:
```csharp
public class CaseService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public async Task<Result<CaseDto>> CreateCaseAsync(CreateCaseDto dto, CancellationToken ct)
    {
        var lawyerId = await _lawyerIdResolver.ResolveAsync(null, ct);
        // ...
    }
}
```

**After**:
```csharp
public class CaseService
{
    public async Task<Result<CaseDto>> CreateCaseAsync(CreateCaseDto dto, Guid lawyerId, CancellationToken ct)
    {
        // lawyerId received as parameter — no HTTP dependency
    }
}
```

### Controller — BaseApiController

**Before**:
```csharp
public class CaseController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCaseDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var result = await _caseService.CreateCaseAsync(dto, Guid.Parse(userId), ct);
        // ...
    }
}
```

**After**:
```csharp
public class CaseController : BaseApiController
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCaseDto dto)
    {
        var result = await _caseService.CreateCaseAsync(dto, GetUserId(), ct);
        // ...
    }
}
```

### Repository — Guid Support

```csharp
// Now available:
var entity = await _repository.GetByIdAsync(someGuid);
```

### Exception Handling — ForbiddenException

```csharp
// In service layer:
if (!hasAccess)
    throw new ForbiddenException("ليس لديك صلاحية للوصول إلى هذه القضية.");
```

### Payment History — Pagination

```csharp
// API call: GET /api/payment/history?pageNumber=2&pageSize=20
// Returns PagedResult<PaymentHistoryDto>
```

## Running Tests

### Backend Tests

```bash
cd mohamy-smart-backend
dotnet test Lawyer.Tests/
```

**Coverage report**:
```bash
dotnet test Lawyer.Tests/ --collect:"XPlat Code Coverage"
```

### Frontend Tests

```bash
# Admin dashboard
cd apps/admin-dashboard
npm test

# Lawyer dashboard
cd apps/lawyer-dashboard
npm test

# Shared packages (after adding vitest to each)
cd packages/shared-utils && npm test
cd packages/shared-validations && npm test
```

## Verification Checklist

After implementation, verify:

- [ ] `IHttpContextAccessor` removed from all `Lawyer.Application/Services/` files
- [ ] All controllers inherit from `BaseApiController`
- [ ] `GenericRepository` has `GetByIdAsync(Guid)` overload
- [ ] `SaveChangesAsync` removed from `GenericRepository` — only on `UnitOfWork`
- [ ] `ForbiddenException` handled in `ExceptionMiddleware` → 403
- [ ] Payment history returns paginated results
- [ ] All `SaveChangesAsync` calls pass `CancellationToken`
- [ ] Contact endpoint has rate limiting (5/min/IP)
- [ ] Admin ErrorBoundary sends to Sentry
- [ ] Admin theme toggles `dark` class on `document.documentElement`
- [ ] Both `index.html` files have `lang="ar" dir="rtl"`
- [ ] Backend test coverage > 50%
- [ ] Frontend critical path coverage > 30%

## Files Changed (Expected)

### Backend (Architecture)
- `Lawyer.Core/IRepositories/IGenericRepository.cs` — Add Guid overload, remove SaveChanges
- `Lawyer.Core/Exceptions/ForbiddenException.cs` — New file
- `Lawyer.Infrastracture/Persistence/Repositories/GenericRepository.cs` — Add Guid overload, remove SaveChanges
- `Lawyer/Controllers/BaseApiController.cs` — New file
- `Lawyer/Controllers/*.cs` — ~17 controllers: inherit BaseApiController, pass GetUserId()
- `Lawyer/Middlewares/ExceptionMiddleware.cs` — Add 403, fix 500, add 400 for validation
- `Lawyer/Application/Services/*.cs` — ~15 services: remove IHttpContextAccessor, add userId params
- `Lawyer/Application/IServices/*.cs` — ~15 interfaces: update method signatures
- `Lawyer/Core/Common/PagedResult.cs` — New file
- `Lawyer/Application/Services/PaymobService.cs` — Add pagination
- `Lawyer/Application/Services/ClientService.cs` — Query consolidation
- `Lawyer/Application/Services/CaseService.cs` — Single SaveChanges
- `Lawyer/Program.cs` — Add contact rate limit policy

### Backend (Tests)
- `Lawyer.Tests/Services/AuthServiceTests.cs` — New
- `Lawyer.Tests/Services/CaseServiceTests.cs` — New
- `Lawyer.Tests/Services/ClientServiceTests.cs` — New
- `Lawyer.Tests/Services/PaymentServiceTests.cs` — New
- `Lawyer.Tests/Middlewares/ExceptionMiddlewareTests.cs` — New

### Frontend (Tests)
- `apps/admin-dashboard/src/redux/thunks/*.test.ts` — New
- `apps/lawyer-dashboard/src/redux/thunks/*.test.ts` — New
- `packages/shared-utils/src/__tests__/*.test.ts` — New
- `packages/shared-validations/src/__tests__/*.test.ts` — New

### Frontend (Polish)
- `apps/admin-dashboard/src/components/ErrorBoundary.tsx` — Add Sentry
- `apps/admin-dashboard/src/layout/Layout.tsx` — Theme fix
- `apps/admin-dashboard/index.html` — lang="ar" dir="rtl"
- `apps/lawyer-dashboard/index.html` — lang="ar" dir="rtl"
