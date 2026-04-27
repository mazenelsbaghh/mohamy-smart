# API Contract Changes: Backend Architecture Improvements & Testing Polish

**Branch**: `063-backend-arch-testing` | **Date**: 2026-04-23

## Overview

This feature introduces backward-compatible API changes. No endpoints are removed or renamed. The changes are: new error status codes (403, corrected 500), pagination support for payment history, and rate limiting on the contact endpoint.

## Changed Endpoints

### GET /api/payment/history

**Change**: Added pagination query parameters.

| Parameter | Type | Default | Constraint | Description |
|-----------|------|---------|------------|-------------|
| pageNumber | int | 1 | >= 1 | Page number (1-based) |
| pageSize | int | 20 | 1-100 | Items per page |

**Before**:
```json
{
  "statusCode": 200,
  "succeeded": true,
  "data": [
    { "id": "...", "amount": 100, "currency": "EGP", "status": "success", "createdAt": "..." }
  ],
  "message": null
}
```

**After**:
```json
{
  "statusCode": 200,
  "succeeded": true,
  "data": {
    "items": [
      { "id": "...", "amount": 100, "currency": "EGP", "status": "success", "createdAt": "..." }
    ],
    "totalCount": 150,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPages": 8,
    "hasPreviousPage": false,
    "hasNextPage": true
  },
  "message": null
}
```

**Breaking Change**: YES — response `data` shape changes from `T[]` to `PagedResult<T>`. Frontend consumers must be updated.

### POST /api/contact

**Change**: Rate limit applied — 5 requests per minute per IP.

**Before**: No rate limit.
**After**: Returns HTTP 429 with standard rate limit response when exceeded.

```json
{
  "statusCode": 429,
  "succeeded": false,
  "data": null,
  "message": "طلبات كثيرة جداً. يرجى المحاولة لاحقاً."
}
```

## New Error Responses

### 403 Forbidden

**When**: User is authenticated but lacks permission for the requested resource.

```json
{
  "statusCode": 403,
  "succeeded": false,
  "data": null,
  "message": "ليس لديك صلاحية للوصول إلى هذا المورد."
}
```

**Previously**: Authorization failures returned 200 with `succeeded: false` or threw `UnauthorizedAccessException` resulting in 401.

### 500 Internal Server Error (Corrected)

**When**: Unhandled server exception.

```json
{
  "statusCode": 500,
  "succeeded": false,
  "data": null,
  "message": "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً."
}
```

**Previously**: Body contained `"BadRequest"` message despite 500 status — now consistent.

### 400 Validation Error (SchemaValidationException)

**When**: AI workflow step output fails schema validation.

```json
{
  "statusCode": 400,
  "succeeded": false,
  "data": null,
  "message": "بيانات غير صالحة: [validation details]"
}
```

**Previously**: `SchemaValidationException` was not handled by middleware and resulted in 500.

## Internal Changes (No API Impact)

The following changes are internal refactoring with no API contract changes:

- **Service method signatures**: `userId`/`lawyerId` added as parameters (internal only — controllers resolve and pass the value)
- **BaseApiController**: New base class for controllers (internal inheritance change)
- **ApiExceptionResponse → static**: Internal utility change, no API shape change
- **Repository Guid overload**: Internal method addition
- **SaveChangesAsync removal from repository**: Internal refactoring
- **CancellationToken propagation**: Internal behavioral improvement
- **Query consolidation (ClientService)**: Internal optimization, same response shape
- **Case creation single SaveChanges**: Internal optimization, same response shape

## Frontend Integration Notes

### Payment History Migration

Frontend payment history pages must update their data fetching to:
1. Pass `pageNumber` and `pageSize` query parameters
2. Read `data.items` instead of `data` for the payment list
3. Use `data.totalPages`, `data.hasNextPage`, `data.hasPreviousPage` for pagination controls

### Error Handling Updates

Frontend Axios error interceptor should handle:
- 403 responses → redirect to unauthorized page or show permission denied message
- 429 responses → show rate limit message with retry countdown
- 500 responses → show generic error (already handled, but body message now consistent)
