# Implementation Tasks: Lawyer Agenda Roll and Protection Features

## Overview
- **Feature**: Lawyer Agenda Roll and Protection Features
- **Total Tasks**: 35
- **Strategy**: Incremental delivery. Since a cheaper LLM will be used, tasks strictly separate Backend from Frontend, specifying exact file paths and operations. 
- **MVP Scope**: Completing Phase 2 and Phase 3 (Agenda Roll) yields immediate high value.

## Phase 1: Setup

*Project initialization and dependency tasks.*

- [X] T001 Install `xlsx` package in `mohamy-smart-lawyer-dashboard/package.json` by running `npm install xlsx` and `npm install @types/xlsx -D` in the `mohamy-smart-lawyer-dashboard` directory.

## Phase 2: Foundational

*Blocking prerequisites (Database entities and migrations) required before feature implementation.*

- [X] T002 [P] Create `DocumentHandoff` entity in `mohamy-smart-backend/Lawyer.Core/Entities/DocumentHandoff.cs` with fields: `Id`, `ClientId`, `DocumentName`, `DeliveryDate`, `ReceiptFilePath`, `CreatedAt`.
- [X] T003 [P] Create `ClientTransaction` entity in `mohamy-smart-backend/Lawyer.Core/Entities/ClientTransaction.cs` and `TransactionType` Enum (Income/Expense). Include fields: `Id`, `ClientId`, `Type`, `Amount`, `Description`, `TransactionDate`, `CreatedAt`.
- [X] T004 [P] Update `PowerOfAttorney` entity in `mohamy-smart-backend/Lawyer.Core/Entities/PowerOfAttorney.cs` to add `IsCanceled` (bool, default false) and `CancellationDate` (DateTime?, nullable) configurations.
- [X] T005 [P] Update `Session` entity in `mohamy-smart-backend/Lawyer.Core/Entities/Session.cs` (if required) to ensure `PreviousDecision` and `AssignedLawyerId` relations exist and are correctly configured.
- [X] T006 Update `ApplicationDbContext` in `mohamy-smart-backend/Lawyer.Infrastructure/Data/ApplicationDbContext.cs` to add `DbSet<DocumentHandoff>` and `DbSet<ClientTransaction>`.
- [X] T007 Generate EF Core Migration: execute `dotnet ef migrations add LawyerProtectionFeatures -p Lawyer.Infrastructure -s Lawyer` from the `mohamy-smart-backend` directory.

## Phase 3: User Story 1 - Lawyer Agenda Roll (P1)

**Story Goal**: Lawyers can view their sessions in a tabular roll view.
**Independent Test Criteria**: A query to `/api/Sessions/agenda-roll` returns data, and the dashboard renders a table.

- [X] T008 [US1] Create DTO `SessionRollDto` in `mohamy-smart-backend/Lawyer.Application/DTOs/Session/SessionRollDto.cs` containing string fields for SessionDate, CaseNumber, CourtName, PlaintiffName, DefendantName, PreviousDecision, and AssignedLawyerName.
- [X] T009 [US1] Update `ISessionService` in `mohamy-smart-backend/Lawyer.Application/Services/Interfaces/ISessionService.cs` to add `Task<IEnumerable<SessionRollDto>> GetAgendaRollAsync(DateTime? date, string? lawyerId);`.
- [X] T010 [US1] Implement `GetAgendaRollAsync` in `mohamy-smart-backend/Lawyer.Application/Services/SessionService.cs` joining `Session`, `Case`, `Client`, `Opponent`, and `Lawyer` data.
- [X] T011 [US1] Add endpoint `[HttpGet("agenda-roll")]` to `mohamy-smart-backend/Lawyer/Controllers/SessionsController.cs` bound to the service method.
- [X] T012 [P] [US1] Create Redux thunk and slice for agenda roll data in `mohamy-smart-lawyer-dashboard/src/store/slices/agendaRollSlice.ts`.
- [X] T013 [P] [US1] Create table component `AgendaRollTable.tsx` using HeroUI in `mohamy-smart-lawyer-dashboard/src/components/agenda/AgendaRollTable.tsx` handling the map over fetched data.
- [X] T014 [US1] Integrate `AgendaRollTable` into the main `AgendaPage.tsx` at `mohamy-smart-lawyer-dashboard/src/pages/agenda/AgendaPage.tsx` alongside existing views.

## Phase 4: User Story 2 - Canceled POA Management (P2)

**Story Goal**: Lawyers can mark POAs as canceled and the system blocks them.
**Independent Test Criteria**: Changing status via UI prevents selecting that POA when adding a new case.

- [X] T015 [US2] Update `IPowerOfAttorneyService` in `mohamy-smart-backend/Lawyer.Application/Services/Interfaces/IPowerOfAttorneyService.cs` with `Task<bool> CancelPowerOfAttorneyAsync(Guid id);`.
- [X] T016 [US2] Implement `CancelPowerOfAttorneyAsync` in `mohamy-smart-backend/Lawyer.Application/Services/PowerOfAttorneyService.cs` to set `IsCanceled = true`.
- [X] T017 [US2] Add `[HttpPut("{id}/cancel")]` endpoint to `mohamy-smart-backend/Lawyer/Controllers/PowerOfAttorneyController.cs`.
- [X] T018 [US2] Update Case Creation logic in `mohamy-smart-backend/Lawyer.Application/Services/CaseService.cs` to reject `Case` creation if the provided POA ID has `IsCanceled == true`.
- [X] T019 [P] [US2] Create Redux action/thunk to call the cancel API in the Lawyer Dashboard's Redux state (e.g. `clientSlice.ts` or `poaSlice.ts`).
- [X] T020 [P] [US2] Modify the POA list UI in the client details profile (e.g., `ClientDetails.tsx` or related) to include a "Cancel" button and display a Red warning badge for Canceled POAs.
- [X] T021 [US2] Update `AddNewCaseFromOCRForm` in `mohamy-smart-lawyer-dashboard/src/components/forms/AddNewCaseFromOCRForm.tsx` to filter out or disable Canceled POAs in the dropdown.

## Phase 5: User Story 3 - Original Documents Clearance (P3)

**Story Goal**: Lawyers can safely record the handover of original documents to clients with a scanned receipt.
**Independent Test Criteria**: A document entry and image can be uploaded and appears in the client's Document tab.

- [X] T022 [US3] Create `DocumentHandoffDto` and `CreateDocumentHandoffDto` (includes `IFormFile ReceiptFile`) in `mohamy-smart-backend/Lawyer.Application/DTOs/Client/`.
- [X] T023 [US3] Add `IDocumentHandoffService` and `DocumentHandoffService` in backend to handle insertion and file saving to `wwwroot/uploads/receipts/`.
- [X] T024 [US3] Add `ClientDocumentsController.cs` with GET and POST `[Consumes("multipart/form-data")]` endpoints in `mohamy-smart-backend/Lawyer/Controllers/`.
- [X] T025 [P] [US3] Create Redux slice `documentHandoffSlice.ts` in `mohamy-smart-lawyer-dashboard/src/store/slices/documentHandoffSlice.ts` using `FormData` for uploads.
- [X] T026 [P] [US3] Create presentation component `DocumentHandoffTab.tsx` in `mohamy-smart-lawyer-dashboard/src/pages/Clients/tabs/DocumentHandoffTab.tsx`.
- [X] T027 [US3] Integrate `DocumentHandoffTab` into the client layout module, wiring the form submission to Redux.

## Phase 6: User Story 4 - Client Financial Statement (P4)

**Story Goal**: Lawyers can track transactions and export an Excel ledger.
**Independent Test Criteria**: Financial data is saved and "Export to Excel" triggers a `.xlsx` download.

- [X] T028 [US4] Create `ClientTransactionDto` and `CreateClientTransactionDto` in `mohamy-smart-backend/Lawyer.Application/DTOs/Financial/`.
- [X] T029 [US4] Add `IClientTransactionService` and `ClientTransactionService` in the Backend Application layer.
- [X] T030 [US4] Add `ClientTransactionsController.cs` for GET and POST endpoints in `mohamy-smart-backend/Lawyer/Controllers/`.
- [X] T031 [P] [US4] Create Redux slice `clientTransactionSlice.ts` in `mohamy-smart-lawyer-dashboard/src/store/slices/clientTransactionSlice.ts`.
- [X] T032 [P] [US4] Create `FinancialsTab.tsx` in `mohamy-smart-lawyer-dashboard/src/pages/Clients/tabs/FinancialsTab.tsx` containing the transaction data table and an "Add Transaction" form.
- [X] T033 [US4] Implement `exportToExcel` function within `FinancialsTab.tsx` utilizing the imported `xlsx` library to download the ledger locally.

## Polish 

*Final integration, cross-cutting concerns, and cleanup.*

- [X] T034 Normalize UI elements across the new Tabs (`DocumentHandoffTab`, `FinancialsTab`), applying HeroUI styling and unified RTL Tailwind CSS layout utility classes.
- [X] T035 Ensure all asynchronous data operations trigger `react-hot-toast` success notifications or error alerts.

## Dependencies & Execution
- Phase 1 & 2 must be executed synchronously before Phase 3-6.
- Phase 3, 4, 5, and 6 can be developed independently of each other.
- Within P-marketed tasks, Frontend components (e.g. `[P]`) can be stubbed out simultaneously with Backend endpoints prior to strict integration.
