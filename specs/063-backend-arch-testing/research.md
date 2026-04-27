# Research: Backend Architecture Improvements & Testing Polish

**Branch**: `063-backend-arch-testing` | **Date**: 2026-04-23

## Architecture Findings

### 1. IHttpContextAccessor in Service Layer

**Current State**: 15 services + 2 infrastructure files inject `IHttpContextAccessor`, primarily to resolve the current lawyer/user ID via `LawyerIdResolver` and `UserContextHelper`.

**Decision**: Remove `IHttpContextAccessor` from all Application layer services. Pass `userId` (Guid) or `lawyerId` (Guid) as explicit parameters to service methods.

**Rationale**:
- Enables service reuse from background jobs (Hangfire), scheduled tasks, and tests
- Eliminates HTTP coupling from the Application layer per Clean Architecture (Principle IV)
- Makes unit tests straightforward — no need to mock HTTP context

**Alternatives Considered**:
- **Scoped "user context" service**: Inject a `ICurrentUserService` scoped service that reads from HTTP context. Rejected because it still creates implicit HTTP dependency and hides the dependency from the method signature.
- **Ambient context via AsyncLocal**: Rejected because it hides control flow and makes debugging harder.

**Migration Strategy**:
1. Add `Guid userId` parameter to service methods that currently resolve it internally
2. Controllers resolve `userId` once from `User.FindFirst(ClaimTypes.NameIdentifier)` and pass it down
3. Remove `IHttpContextAccessor` constructor parameter from each service
4. Keep `LawyerIdResolver` for backward compatibility during migration but mark as deprecated

### 2. GenericRepository Guid Support

**Current State**: `GetByIdAsync(int id)` only accepts int. Most entities use Guid PKs. Workaround exists (`GetByIdIgnoreQueryFiltersAsync` with predicate) but is inefficient.

**Decision**: Add `GetByIdAsync<T>(Guid id)` overload to `IGenericRepository<T>` and `GenericRepository<T>`. For entities with int PKs, keep the existing int overload.

**Rationale**:
- Guid PKs are used by the majority of entities (Case, Client, Payment, etc.)
- The workaround using `FirstOrDefaultAsync` doesn't benefit from EF Core's identity map
- `FindAsync` with Guid parameter is a one-line addition

**Alternatives Considered**:
- **Generic key type `IGenericRepository<T, TKey>`**: Rejected because it would require changing all DI registrations and existing usages. Simpler to add overloads.
- **Convention-based approach**: Rejected as too implicit.

### 3. Remove SaveChangesAsync from Repository

**Current State**: `GenericRepository` has `SaveChangesAsync(CancellationToken)` method (line 64-67), violating the Unit of Work pattern where only UoW should commit.

**Decision**: Remove `SaveChangesAsync` from `IGenericRepository` and `GenericRepository`. All persistence goes through `IUnitOfWork.SaveChangesAsync()`.

**Rationale**:
- Single responsibility: Repository = query, UnitOfWork = commit
- Prevents accidental partial saves that break transactional consistency
- Aligns with the pattern described in constitution Principle IV

**Migration Strategy**: Search all usages of `_repository.SaveChangesAsync()` and replace with `_unitOfWork.SaveChangesAsync()`. Audit shows most services already use UnitOfWork, so impact is minimal.

### 4. Controller GetUserId Extraction

**Current State**: Three inconsistent patterns across 30+ controller actions:
- Pattern A: Direct `User.FindFirst(ClaimTypes.NameIdentifier)?.Value` (most common)
- Pattern B: Private helper method `GetUserId()` in some controllers
- Pattern C: Service-layer resolution via `UserContextHelper.GetUserId(_httpContextAccessor)`

**Decision**: Create a `BaseApiController` abstract class with a protected `GetUserId()` method that returns `Guid`. All API controllers inherit from it.

**Rationale**:
- DRY — eliminates 30+ duplicate claim extraction expressions
- Centralizes error handling for missing/invalid claims
- Provides a consistent pattern for future controllers

**Alternatives Considered**:
- **Extension method on `ClaimsPrincipal`**: Rejected because it doesn't provide a natural place for validation/logging.
- **Middleware that sets `HttpContext.Items["UserId"]`**: Rejected as it adds complexity and an indirect coupling.

### 5. ApiExceptionResponse as Static Utility

**Current State**: Registered as `Transient` in DI but manually instantiated in `ExceptionMiddleware`. Services inject it via constructor. It's a stateless wrapper around `Result<T>` factory methods.

**Decision**: Convert `ApiExceptionResponse` methods to static methods or extension methods on `Result<T>`. Remove DI registration.

**Rationale**:
- No state — DI adds unnecessary complexity
- Middleware already bypasses DI (manual `new`)
- Static methods are more discoverable and testable

**Alternatives Considered**:
- **Keep DI but fix middleware**: Rejected because the class has no dependencies and no state — DI is wasteful.
- **Make it a singleton**: Rejected for same reason — no state to manage.

### 6. PaymobService Pagination

**Current State**: `GetPaymentHistoryAsync(Guid lawyerId, CancellationToken ct)` returns `List<PaymentHistoryDto>` — all records loaded at once.

**Decision**: Add `int pageNumber` and `int pageSize` parameters (with defaults of 1 and 20). Return a paginated result object containing `Items`, `TotalCount`, `PageNumber`, `PageSize`.

**Rationale**:
- Lawyers with hundreds of payments experience slow loads
- Standard pagination pattern used elsewhere in the codebase
- PageSize capped at 100 per existing project convention (Phase 1 remediation)

**Alternatives Considered**:
- **Cursor-based pagination**: Rejected as over-engineering for this use case; offset pagination is sufficient for payment history.

### 7. ClientService Query Consolidation

**Current State**: `GetByIdAsync` makes 2 separate queries (client + files, then cases). Each query is a separate DB round-trip.

**Decision**: Consolidate into a single query using EF Core `.Include()` chaining: `.Include(x => x.Files).Include(x => x.Cases)`.

**Rationale**:
- Reduces 2 DB round-trips to 1
- EF Core can efficiently compose the join query
- Same data, fewer round-trips

### 8. Case Creation Single SaveChanges

**Current State**: `CreateCaseAsync` calls `SaveChangesAsync` 3 times (existing client path) or 3 times (new client path) within a transaction.

**Decision**: Remove intermediate `SaveChangesAsync` calls. Call `_unitOfWork.SaveChangesAsync()` once before `CommitAsync`. EF Core tracks all changes — the intermediate saves are unnecessary within a transaction.

**Rationale**:
- 3 DB round-trips reduced to 1
- EF Core assigns IDs after SaveChanges — for the new client path, we need the clientId before referencing it in the Case entity. Use `Guid.NewGuid()` explicitly (not DB-generated) or restructure to set the relationship before saving.

**Migration Note**: For the "new client" path where Case needs ClientId, ensure the Client entity's Guid is assigned in code (not auto-generated) so the relationship can be set before SaveChanges.

### 9. ExceptionMiddleware 403 Handler

**Current State**: No `ForbiddenException` type exists. The middleware handles `UnauthorizedAccessException` → 401, `KeyNotFoundException` → 404, but has no 403 path.

**Decision**: Add a `ForbiddenException` class in `Lawyer.Core/Exceptions/`. Add a handler in `ExceptionMiddleware` that catches it and returns 403 with a user-friendly Arabic message.

**Rationale**:
- Authorization failures (user authenticated but not authorized) should return 403, not 401
- Current pattern forces services to return `Result<T>.Error()` with a message, but the HTTP status is always 200 or the middleware default

**Alternatives Considered**:
- **Use `AuthorizationException` name**: Rejected — `ForbiddenException` maps more clearly to HTTP 403 Forbidden.

### 10. ExceptionMiddleware Status Code Fix

**Current State**: Default catch block sets HTTP status 500 but calls `_responseHandler.BadRequest<string>()` — inconsistent body claiming "BadRequest" with 500 status.

**Decision**: Create distinct error responses for each status code. Default case returns 500 with a generic "Internal Server Error" message. Validation exceptions return 400.

**Rationale**:
- Clients (frontends) rely on status codes for error handling logic
- Misleading response body causes confusion in debugging and client-side error handling

### 11. Contact Endpoint Rate Limiting

**Current State**: 4 named rate limiting policies exist (`auth`, `otp`, `AiEndpoints`, `OcrEndpoints`). Contact endpoint has no rate limit.

**Decision**: Add a `contact` policy: 5 requests per minute per IP address. Apply to `ContactController`.

**Rationale**:
- Contact forms are a common abuse vector (spam, bots)
- 5/min is generous for legitimate users but blocks automated abuse
- Follows existing rate limiting pattern already in `Program.cs`

### 12. Fire-and-Forget Error Handling

**Current State**: Background tasks using `Task.Run()` or `_.Forget()` patterns may silently swallow exceptions.

**Decision**: Wrap all fire-and-forget tasks with try-catch that logs via `ILogger`. Consider adding a `SafeFireAndForget` extension method on `Task`.

**Rationale**:
- Silent failures make debugging impossible
- Structured logging with context (operation name, relevant IDs) is critical for production monitoring

### 13. CancellationToken in All SaveChangesAsync

**Current State**: Mixed — some services pass tokens, some use `default`, some pass `CancellationToken.None`, some pass nothing.

**Files needing fix**:
- `ProcessServerPaperService.cs`: 5 calls with `default`
- `PreparingStatementOfClaimsService.cs`: 8 calls with no token
- `SmartAnalysisService.cs`: 4 calls with no token + 1 with `CancellationToken.None`
- `WorkflowServiceBase.cs`: 6 calls with no token

**Decision**: All `SaveChangesAsync` calls must pass the `CancellationToken` parameter from the calling method.

**Rationale**: Cancellation tokens allow the database to abort long-running operations when the HTTP request is cancelled, freeing resources.

## Testing Strategy Findings

### 14. Backend Test Coverage

**Current State**: 28 xUnit tests across 11 files. Coverage is minimal — no tests for CaseService, ClientService, AuthService business logic, AccountService, or ExceptionMiddleware.

**Decision**: Prioritize tests by business impact:
1. Auth flow (login, register, OTP, password reset) — highest user impact
2. Case CRUD — core business entity
3. Client CRUD — core business entity
4. Payment/HMAC verification — financial impact
5. ExceptionMiddleware — cross-cutting concern

**Test Infrastructure**: xUnit + Moq + FluentAssertions + InMemory EF Core already available. Add `WebApplicationFactory` tests for integration testing of middleware.

**Target**: >50% coverage of service and middleware code.

### 15. Frontend Test Coverage

**Current State**: 4 test files (5 admin + 7 lawyer tests), covering only auth slices and route guards.

**Decision**: Add tests for:
1. Auth flows (login/logout) — most critical user path
2. Key thunks (fetchLawyers, fetchReports for admin; workflow operations for lawyer)
3. Shared package utilities — pure functions, easiest to test

**Test Infrastructure**: Vitest 3.2.1 + React Testing Library + jsdom already configured in both dashboards.

**Target**: >30% coverage for critical paths (auth + data operations).

### 16. Shared Packages Tests

**Current State**: Zero tests across all 5 shared packages. No test infrastructure configured.

**Decision**: Add Vitest to each shared package. Test validators, formatters, guards, and sanitizers first — they're pure functions with high ROI.

**Target**: Core utility functions covered.

## Polish Findings

### 17. Admin ErrorBoundary → Sentry

**Current State**: Admin `ErrorBoundary` only calls `console.error`. Lawyer dashboard already sends to Sentry.

**Decision**: Add Sentry integration to admin ErrorBoundary matching the lawyer dashboard pattern (dynamic import of `@sentry/browser`, call `captureException`).

### 18. Theme Application on documentElement

**Current State**: Admin dashboard applies theme class only to `<main>`, not `document.documentElement`. This breaks HeroUI dark mode and Tailwind `dark:` variants outside `<main>`.

**Decision**: Admin Layout must toggle `dark` class on `document.documentElement` like the lawyer dashboard does.

### 19. RTL Root Attributes

**Current State**: Both dashboards have `<html lang="en">` with no `dir` attribute. RTL is applied per-component.

**Decision**: Set `<html lang="ar" dir="rtl">` in both `index.html` files. Remove per-component `dir="rtl"` where redundant.

### 20. Accessibility Gaps

**Current State**: Admin has 7 aria attributes; lawyer has 38. Both lack skip-navigation, aria-live regions, and descriptive aria-labels on many interactive elements.

**Decision**: Add high-impact accessibility improvements:
1. Skip-navigation link in both dashboards
2. `aria-live` regions for dynamic content (toasts, loading states)
3. Descriptive `aria-label` on key interactive elements (buttons, form fields)
4. `aria-describedby` linking form fields to error messages
