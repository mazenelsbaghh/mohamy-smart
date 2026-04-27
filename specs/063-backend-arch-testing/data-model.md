# Data Model: Backend Architecture Improvements & Testing Polish

**Branch**: `063-backend-arch-testing` | **Date**: 2026-04-23

## Overview

No database schema changes in this feature. All changes are architectural (code-level patterns), behavioral (error handling, pagination), or testing infrastructure. This document describes the logical entities and their modified relationships at the code level.

## Repository Pattern Changes

### IGenericRepository<T> (Interface Change)

```
Current:
  Task<T?> GetByIdAsync(int id)
  Task<int> SaveChangesAsync(CancellationToken ct = default)

Modified:
  Task<T?> GetByIdAsync(int id)           // Keep for int-keyed entities
  Task<T?> GetByIdAsync(Guid id)          // NEW — for Guid-keyed entities
  // SaveChangesAsync REMOVED — use IUnitOfWork only
```

### GenericRepository<T> (Implementation Change)

```
Current:
  GetByIdAsync(int id) → _dbSet.FindAsync(id)
  SaveChangesAsync(ct) → _context.SaveChangesAsync(ct)

Modified:
  GetByIdAsync(int id) → _dbSet.FindAsync(id)
  GetByIdAsync(Guid id) → _dbSet.FindAsync(id)    // NEW
  // SaveChangesAsync REMOVED
```

## New Exception Types

### ForbiddenException (New)

```
Location: Lawyer.Core/Exceptions/ForbiddenException.cs
Extends: Exception

Properties:
  - Message: string (user-friendly Arabic error message)

Usage: Thrown by services when a user is authenticated but lacks permission
       for the requested action. Maps to HTTP 403 in ExceptionMiddleware.
```

### SchemaValidationException (Already Exists — Wire Up)

```
Location: Lawyer.Core/Exceptions/SchemaValidationException.cs
Current: NOT handled by ExceptionMiddleware
Modified: Add handler in ExceptionMiddleware → HTTP 400
```

## Service Interface Changes

### Method Signature Changes (userId/lawyerId as Parameters)

Services that currently resolve user identity from `IHttpContextAccessor` will have their method signatures updated:

```
Pattern:
  Before: Task<Result<CaseDto>> CreateCaseAsync(CreateCaseDto dto, CancellationToken ct)
  After:  Task<Result<CaseDto>> CreateCaseAsync(CreateCaseDto dto, Guid lawyerId, CancellationToken ct)

Affected Interfaces:
  - ICaseService
  - IClientService
  - IAccountService
  - IAuthService (login/register methods excluded — no user context needed)
  - ICaseOcrService
  - IClarifyFactsService
  - IPreparingStatementOfClaimsService
  - ISmartAnalysisService
  - IAiJobService
  - ILawyerTaskService
  - IProcessServerPaperService
  - IDocumentHandoffService
  - ICaseAccessValidator
```

### Removed Dependencies

```
Removed from constructors:
  - IHttpContextAccessor (all Application layer services)
  - ApiExceptionResponse (all services — converted to static utility)
```

## Paginated Response Model

### PagedResult<T> (New)

```
Location: Lawyer.Core/Common/PagedResult.cs

Properties:
  - Items: List<T>           // Current page items
  - TotalCount: int          // Total records matching query
  - PageNumber: int          // Current page (1-based)
  - PageSize: int            // Items per page
  - TotalPages: int          // Computed: ceil(TotalCount / PageSize)
  - HasPreviousPage: bool    // Computed: PageNumber > 1
  - HasNextPage: bool        // Computed: PageNumber < TotalPages
```

### PaymobService Method Change

```
Before: Task<Result<List<PaymentHistoryDto>>> GetPaymentHistoryAsync(Guid lawyerId, CancellationToken ct)
After:  Task<Result<PagedResult<PaymentHistoryDto>>> GetPaymentHistoryAsync(Guid lawyerId, int pageNumber, int pageSize, CancellationToken ct)
```

## Controller Layer

### BaseApiController (New)

```
Location: Lawyer/Controllers/BaseApiController.cs
Extends: ControllerBase

Protected Methods:
  - Guid GetUserId() → Extracts from User.FindFirst(ClaimTypes.NameIdentifier)
                        Throws UnauthorizedException if claim missing/invalid
```

```
Controllers migrating to BaseApiController:
  - AccountController
  - AgendaController
  - AppealBriefController
  - AdminComplaintController
  - CaseController
  - ClientController
  - ContactController
  - DocumentsController
  - ExecRequestController
  - LegalContractsController
  - LegalWarningController
  - NotificationController
  - PaymentController
  - PreparingStatementOfClaimsController
  - RulingAnalysisController
  - SmartAnalysisController
  - SubscriptionController
```

## Static Utility Changes

### ApiExceptionResponse → Static Methods

```
Current: Instance methods on injected class
  var result = _responseHandler.BadRequest<string>("message");

Modified: Static methods
  var result = ApiExceptionResponse.BadRequest<string>("message");
  // Or better: extension methods on Result<T>
```

## ExceptionMiddleware Response Mapping

```
Exception Type           → HTTP Status → Response Body
─────────────────────────────────────────────────────────
KeyNotFoundException     → 404         Result<T>.Error("العنصر غير موجود")
ForbiddenException       → 403         Result<T>.Error("ليس لديك صلاحية")
UnauthorizedAccessEx     → 401         Result<T>.Error("يرجى تسجيل الدخول")
SchemaValidationEx       → 400         Result<T>.Error(validationMessage)
DbUpdateException        → 500         Result<T>.Error("خطأ في قاعدة البيانات")
ValidationException      → 400         Result<T>.Error(validationErrors)
Default (unhandled)      → 500         Result<T>.Error("حدث خطأ غير متوقع")
```
