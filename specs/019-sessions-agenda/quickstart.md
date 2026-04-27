# Quickstart: Sessions and Actions Agenda

## Backend Setup (Data Model Change)
1. In `Lawyer.Core`, replace or refactor the `Task` entity to an `AgendaItem` base class with `SessionAgendaItem` and `ActionAgendaItem` inheriting from it using TPH mapping.
2. Generate EF Core migration by running `dotnet ef migrations add UpdateToAgendaItems -p mohamy-smart-backend/Lawyer.Infrastructure` (or using `make db-migrate` after committing your snapshot).
3. Update `Lawyer.Application` to parse the new structure and process creates/reads.
4. The `AgendaItem` creation needs reference data (Enums or lookup strings) for types and postponement reasons. Ensure the code accepts them correctly based on the `contracts/api.md`.

## Frontend Setup (UI Change)
1. On the frontend, create the new component `AgendaForm.tsx` (replacing `TaskForm.tsx`).
2. Implement Zod discriminated unions in the hooks to make sure `postponementReason` is only required when `type === 'Session'`.
3. Use `@heroui/react` `Select` for fields like court name, postponement reason, and action type so no free text enters the database for these fields.
4. Replace existing task lists across dashboards with `AgendaList` using the new `caseId` targeted endpoints.
