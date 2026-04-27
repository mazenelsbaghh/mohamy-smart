# Data Model Updates: Phase 3 Performance and Database Optimization

## Modified Entities

### WorkflowBase (or relevant base entity for Workflow Steps)
- **New Field**: `public byte[] RowVersion { get; set; }`
- **Configuration**: Annotated with `[Timestamp]` or configured via Fluent API `IsRowVersion()` to enable EF Core optimistic concurrency checking.

### Payment / Financial Entities
- **Updated Fields**: Any field previously storing currency amounts as `float` or `double` (e.g., `Amount`, `Total`) must be changed to `decimal`.
- **Configuration**: Configure precision using Data Annotations `[Column(TypeName = "decimal(18,2)")]` or via Fluent API.

### AiUsageRecord & Client
- **Configuration**: Add `[Index(nameof(Property))]` on frequently filtered or sorted columns (e.g., `CreatedAt`, `UserId`, `ClientId`) to improve reporting and pagination query performance.
