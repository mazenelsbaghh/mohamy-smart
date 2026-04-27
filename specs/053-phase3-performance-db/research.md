# Research: Phase 3 Performance and Database Optimization

## Database Optimization (N+1, Pagination, Indexes)
- **Decision**: Use `IQueryable.GroupBy` and SQL aggregation for `AiUsageReportService`. Add `.AsNoTracking()` to all read-only report queries. Use standard offset pagination (`Skip` and `Take`) with a unified pagination response wrapper (`PaginatedList<T>`). Add EF Core `[Index]` attributes to frequently queried columns.
- **Rationale**: SQL Server is highly optimized for aggregating data natively compared to pulling raw rows into the application. `AsNoTracking` disables the EF Core change tracker, freeing memory. `Skip/Take` is the standard EF Core approach to pagination.
- **Alternatives considered**: In-memory caching for reports (rejected due to memory constraints and the need for fresh data).

## Payment Data Precision (float to decimal)
- **Decision**: Update EF Core entities dealing with financial data to use `decimal(18,2)` (or similar appropriate precision). Existing data will be kept exact as per the spec, which EF Migration can handle implicitly.
- **Rationale**: `decimal` is the standard type for financial data in .NET and prevents floating-point precision errors during calculation.
- **Alternatives considered**: Multiplying by 100 and storing as integers (rejected because `decimal` is natively supported in EF Core and cleaner for API consumption).

## Concurrency Control for Workflow Steps
- **Decision**: Add a `[Timestamp] byte[] RowVersion` column to `WorkflowBase` and configure optimistic concurrency in EF Core. Catch `DbUpdateConcurrencyException` in the application layer and return an HTTP 409 Conflict.
- **Rationale**: Optimistic locking handles concurrency without holding heavy database locks. It scales exceptionally well for web apps where collisions are rare but dangerous. Returning HTTP 409 follows REST standards and allows the frontend to prompt the user to refresh.
- **Alternatives considered**: Pessimistic locking (rejected as it degrades database performance and concurrency).

## Frontend Pagination Adaptation
- **Decision**: Update Axios services in both dashboards to append `?page=X&pageSize=Y`. Update Redux thunks to handle the `items` array and `totalCount` from the API wrapper. Update React lists/tables to include pagination controls (e.g., using HeroUI Pagination components).
- **Rationale**: The backend endpoints will now return a paginated wrapper instead of a flat array. The frontend must adapt to correctly parse the items and render pagination controls.
- **Alternatives considered**: Infinite scrolling (rejected as traditional pagination is more suitable for admin dashboards and reports).
