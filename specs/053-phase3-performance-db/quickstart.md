# Quickstart: Phase 3 Performance and Database Optimization

This phase introduces breaking changes to the database schema and API contracts.

## Database Migration
1. After pulling these changes, you MUST generate and apply a new EF Core migration for the database schema changes (`RowVersion` and `decimal`).
   ```bash
   make dev
   make db-migrate
   ```

## Frontend Updates
1. Any frontend component that previously fetched a flat list of clients or admin reports MUST be updated to pass `page` and `pageSize` query parameters.
2. The components must map the response from `data.items` instead of just `data`, and utilize `totalCount` and `totalPages` for rendering pagination controls (e.g., HeroUI Pagination).
3. Update Redux slices/thunks to handle HTTP 409 Conflict errors when updating Workflow steps, and prompt the user to reload the page to resolve the conflict.
