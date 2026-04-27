# Data Model: Global Auto-save

The backend data model relies heavily on the existing generic workflow structure introduced in Phase 3 Consistency refactoring. No new tables are required, but our conceptual model of the generic `Outputs` JSON field must now treat intermediate states as valid payload.

## Entities

### Workflow / AiJob
*Existing table (e.g. `AiJobs` or `Cases` depending on where generic workflows are anchored)*
- `Id` (GUID)
- `Status` (Enum: Pending, InProgress, Completed, Failed) => We may need a `Draft` status or just use `InProgress` natively.
- `Outputs` (NVARCHAR MAX) - Stores serialized `Dictionary<int, object>` representing the steps.

## State Transitions
1. **Creation**: User clicks "Start Workflow" -> Job created in DB with generic skeleton, UI initializes Editor.
2. **Auto-save (Debounced)**: UI triggers `PATCH /api/.../auto-save` -> Backend parses existing `Outputs` JSON -> overwrites the specific step index with incoming JSON -> saves to SQL Server.
3. **Execution**: User clicks "Approve/Proceed" -> Backend validates the step, marks as completed, optionally triggers AI if next step requires inference.
