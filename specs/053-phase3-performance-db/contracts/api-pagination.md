# API Contracts: Pagination and Concurrency

## Paginated Response Format
All paginated endpoints MUST return data in the following wrapper format:
```json
{
  "items": [
    { /* entity fields */ }
  ],
  "totalCount": 100,
  "page": 1,
  "pageSize": 10,
  "totalPages": 10
}
```

## Concurrency Conflict Response
When a client attempts to update a workflow step but the `RowVersion` does not match the database (i.e., another update happened in the meantime), the server MUST return:
- **HTTP Status**: `409 Conflict`
- **Response Body**:
```json
{
  "message": "The record was modified by another user. Please reload and try again.",
  "code": "CONCURRENCY_CONFLICT"
}
```
