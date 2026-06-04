# Contract: Admin Filter Toolbar

## Backend: GET `/api/v1/Account/users`

Existing admin-only endpoint remains backward-compatible.

### Optional Query Parameters

- `userType`: existing enum value.
- `pageNumber`: positive integer, defaults to 1.
- `pageSize`: positive integer, clamped to 100.
- `search`: optional string; trimmed server-side. Empty means no search filter.
- `isActive`: optional boolean.
- `subscriptionIsActive`: optional boolean.

### Response

Same paged response shape as before:

- `items` or `data`: user records.
- `totalPages`
- `pageNumber`
- `pageSize`
- `totalCount` or `totalRecords`

## Frontend: `AdminFilterToolbar`

### Required Behavior

- Search field emits each value change.
- Select filters emit string values.
- Reset action clears search and filters.
- Count label shows filtered count when active, otherwise total count.
- Layout wraps at narrow widths without content overlap.
