# Process Server Paper Backend Implementation Plan

## Objective
Implement the backend components for the "Process Server Paper" (أوراق المحضرين) feature to resolve the 404 error on the frontend and complete the module.

## Frontend Requirements Mapping
Based on the Redux slice `TProcessServerPaper`, the entity requires:
- `Id` (Guid)
- `ClientId` (Guid) - relation to Client
- `CaseId` (Guid, optional) - relation to Case
- `PaperType` (int: 1, 2, 3, 4, 99)
- `OtherPaperType` (string, optional)
- `CustomPaperTypeTitle` (string, optional)
- `TargetName` (string)
- `Status` (int: 1, 2, 3, 4)
- `Notes` (string, optional)
- `AttachmentUrl` (string, optional)
- `ServedDate` (DateTime, optional)
- `CreatedAt`, `UpdatedAt` (DateTime)

## Phases
1. **Core Domain Setup**:
   - Create `ProcessServerPaper` entity in `Lawyer.Core/Models`.
   - Add enums for `ProcessServerPaperType` and `ProcessServerPaperStatus` in `Lawyer.Core/Enum`.
   - Register `DbSet` in `AppDbContext` and `IApplicationDbContext`.

2. **Application Layer (DTOs & Services)**:
   - Create `ProcessServerPaperDto`, `CreateProcessServerPaperDto`, `UpdateProcessServerPaperDto` in `Lawyer.Application/Dtos/ProcessServerPaper`.
   - Create `IProcessServerPaperService` interface.
   - Implement `ProcessServerPaperService` handling CRUD operations, file attachments, and mark-served action.

3. **API Layer (Controller)**:
   - Create `ProcessServerPaperController` in `Lawyer/Controllers`.
   - Expose endpoints: GET `/`, GET `/{id}`, POST `/`, PUT `/{id}`, DELETE `/{id}`, POST `/{id}/attachment`, POST `/{id}/mark-served`.

4. **Database Migration**:
   - Run EF Core tools to generate the migration.
