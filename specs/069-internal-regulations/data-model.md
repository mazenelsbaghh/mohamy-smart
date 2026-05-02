# Data Model: Internal Regulations in Legal Library

## Entity: InternalRegulation

Represents a reusable legal library item owned by a lawyer.

**Fields**

- `Id` (Guid): Unique identifier.
- `LawyerId` (Guid): Owner lawyer profile.
- `Title` (string): Required display title, max 240 characters.
- `RegulationNumber` (string, optional): Optional regulation or policy number, max 120 characters.
- `IssuingAuthority` (string, optional): Optional issuer, max 240 characters.
- `Summary` (string, optional): Short searchable summary, max 1000 characters.
- `Content` (string): Required full legal text or notes, max 50000 characters.
- `IsActive` (bool): Active records can be selected for cases; archived records are hidden from active selection.
- `CreatedAtUtc` (DateTime): Creation timestamp.
- `UpdatedAtUtc` (DateTime?): Last update timestamp.

**Relationships**

- Many internal regulations belong to one lawyer.
- One internal regulation may be linked to many cases through `CaseInternalRegulation`.

**Validation Rules**

- Title and content are required.
- A lawyer can only read or mutate regulations they own.
- Archived regulations cannot be newly linked to cases.

## Entity: CaseInternalRegulation

Represents one selected internal regulation on one case.

**Fields**

- `Id` (Guid): Unique identifier.
- `CaseId` (Guid): Linked case.
- `InternalRegulationId` (Guid): Linked internal regulation.
- `CreatedAtUtc` (DateTime): Link creation timestamp.
- `CreatedByUserId` (Guid): User who created the link, when available.

**Relationships**

- Many links belong to one case.
- Many links reference one internal regulation.

**Validation Rules**

- `(CaseId, InternalRegulationId)` must be unique.
- The case and internal regulation must belong to the same lawyer.
- Removing a link does not delete the regulation.

## Entity: Case

Existing case entity, extended for regulation context.

**New Fields**

- `InternalRegulationsContext` (string, optional): Denormalized text block of active linked internal regulations used by existing case-context builders.

**New Relationships**

- One case may have many `CaseInternalRegulation` records.

## DTOs

- `InternalRegulationDto`: Returns regulation metadata and content for list/detail views.
- `CreateInternalRegulationDto`: Title, optional metadata, summary, content.
- `UpdateInternalRegulationDto`: Editable metadata, summary, content, and active status.
- `InternalRegulationSummaryDto`: Minimal case display payload: id, title, regulation number, issuing authority, is active.
- `UpdateCaseInternalRegulationsDto`: List of internal regulation ids to keep linked to a case.

## State Transitions

- `Active -> Archived`: Regulation is hidden from new selection, case links remain for history, and affected case context excludes archived content.
- `Archived -> Active`: Regulation becomes available for selection again; existing links can contribute to case context again.
- `Linked -> Unlinked`: Case link is removed; regulation remains in the legal library.
