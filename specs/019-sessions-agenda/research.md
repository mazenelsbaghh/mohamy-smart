# Research: Sessions and Actions Agenda

## Technical Context Unknowns Resolution
Since the MOHAMY SMART project has a strict constitution defining the stack, there are no structural technical unknowns. The focus is on the modeling approach for replacing unstructured "Tasks" with strongly-typed "Sessions and Actions" within .NET 9 and SQL Server.

## Decision: Backend Entity Restructuring (TPH vs JSON)
- **Decision**: Use Entity Framework Core Table-Per-Hierarchy (TPH) to model `AgendaItem` as a base class with `SessionAgendaItem` and `ActionAgendaItem` inheriting from it.
- **Rationale**: TPH allows querying all agenda items for a case efficiently while providing strongly-typed entities in `Lawyer.Core`. It cleanly supports distinct requirement fields (e.g., `PreviousSessionId` for Sessions). 
- **Alternatives considered**: 
  - Using a single `Task` table with nullable fields: leads to sparse tables and loose domain logic.
  - Using JSON columns: makes querying/filtering more complex. TPH is native, efficient, and well-supported in EF Core.

## Decision: Frontend Form Validation
- **Decision**: Use Zod Discriminated Unions combined with React Hook Form to handle the dynamic entry fields.
- **Rationale**: Zod's `z.discriminatedUnion("type", [z.object(...), z.object(...)])` perfectly mirrors the backend TPH concept, allowing strict validation of fields like `postponementReason` only when `type === 'Session'`.

## Best Practices (Arabic-First & Component UI)
- All new dropdowns/select components (e.g., for Court Names and Postponement Reasons) will use the `@heroui/react` `Select` component.
- Lists will be seeded or fetched via API to ensure data entry standardization, avoiding free text as requested.
