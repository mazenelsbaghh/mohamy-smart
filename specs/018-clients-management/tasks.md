# Tasks: Clients Management (018)

**Feature**: `018-clients-management`

## Phase 1: Setup
*(No feature-specific project-level initialization required)*

## Phase 2: Foundational
**Goal**: Prepare the database schema, DTOs, and global Redux/TypeScript definitions to support the new features across all user stories. Must be completed before any UI work.

- [x] T001 Update `Lawyer.Core/Models/Client.cs` to add `PhoneNumber`, `Email`, and `Notes` fields.
- [x] T002 Update `Lawyer.Application/Dtos/Client/ClientDto.cs` (and create/update DTOs) to include new fields, and define `ClientCaseSummaryDto`.
- [x] T003 Generate EF Core migration for the new Client fields by running `dotnet ef migrations add AddClientContactFields --project Lawyer.Infrastracture --startup-project Lawyer`.
- [x] T004 Apply the EF Core migration to the local SQL Server database using `make db-migrate`.
- [x] T005 Update the `TClient` and `TClientDetails` types in `mohamy-smart-lawyer-dashboard/src/types/types.ts` to include `phoneNumber`, `email`, `notes`, and `cases`.
- [x] T006 Update `TInitialState` in `mohamy-smart-lawyer-dashboard/src/redux/clients/clientsSlice.ts` to include `updateLoading` state.

## Phase 3: عرض قائمة الموكلين بكروت وجدول [US1]
**Goal**: Allow the lawyer to view their clients using either cards or a data table, filter them instantly by search, and handle empty states.
**Priority**: P1
**Independent Test**: Can open the `/clients` page, see existing clients, type in the search bar to filter, and click the toggle icons to alternate between Cards and Table view. 

- [x] T007 [US1] Update `mohamy-smart-lawyer-dashboard/src/pages/clients/Clients.tsx` to include local state `viewMode` ('card' | 'table') and `searchQuery`.
- [x] T008 [US1] Implement filtering logic in `Clients.tsx` based on `searchQuery` matching `clientName` or `phoneNumber`.
- [x] T009 [US1] Implement table UI layout conditionally in `Clients.tsx` featuring columns: Avatar initials, الاسم (Name), الهاتف (Phone), البريد (Email), تاريخ الانضمام (Join Date), Number of cases, and Profile link button.
- [x] T010 [US1] Update the SubTitle component rendering inside `Clients.tsx` to include an action area with card/table toggle buttons and a Search input.
- [x] T011 [P] [US1] Extend `mohamy-smart-lawyer-dashboard/src/pages/clients/Clients.css` with layout styles for the table view and avatar circle generation (hashing name to color logic).

## Phase 4: بروفيل مخصص لكل موكل [US2]
**Goal**: Provide a dedicated profile page (`/clients/:id`) displaying rich client information, all linked cases, and an inline edit mode.
**Priority**: P2
**Independent Test**: Navigate to `/clients/:id`, verify all fields (including the new phone/email/notes) are displayed, linked cases appear as clickable items, and pressing "Edit" allows saving changes via a PUT request.

- [x] T012 [US2] Update `GetByIdAsync` inside `Lawyer.Application/Services/ClientService.cs` to include related Cases mapped to `List<ClientCaseSummaryDto>`.
- [x] T013 [US2] Create new thunk file `mohamy-smart-lawyer-dashboard/src/redux/clients/thunk/thunkUpdateClient.ts` mapping to `PUT /Client/{id}`.
- [x] T014 [US2] Add extra reducers to `mohamy-smart-lawyer-dashboard/src/redux/clients/clientsSlice.ts` to handle `thunkUpdateClient` states (pending, fulfilled, rejected).
- [x] T015 [US2] Redesign the header and info grid section in `mohamy-smart-lawyer-dashboard/src/pages/clients/ClientDetails.tsx` to display avatar, phone (clickable `tel:`), email, join date, and notes.
- [x] T016 [US2] Add the "Cases" section to `ClientDetails.tsx` to iterate over `clientDetails.cases` returning statuses and links.
- [x] T017 [US2] Integrate edit mode functionality in `ClientDetails.tsx` allowing switching to a React Hook Form filled with standard `clientDetails`, dispatching `thunkUpdateClient` on submit.
- [x] T018 [P] [US2] Add profile layout, inline form, and case card styling to `mohamy-smart-lawyer-dashboard/src/pages/clients/Clients.css`.

## Phase 5: إضافة موكل جديد [US3]
**Goal**: Allow adding a new client including phone (required), email (optional), and notes (optional) from the `/clients` dashboard.
**Priority**: P3
**Independent Test**: Click "إضافة موكل جديد" on `/clients`, fill out the modal form with valid Name and Phone, hit Save. Verify a success toast appears and the list updates.

- [x] T019 [US3] Update `mohamy-smart-lawyer-dashboard/src/redux/clients/thunk/thunkAddNewClient.ts` params to accept `phoneNumber`, `email`, and `notes`.
- [x] T020 [US3] Modify `mohamy-smart-lawyer-dashboard/src/components/forms/AddNewClientForm.tsx` to inject inputs/textareas for Phone, Email, and Notes mapping newly added properties.
- [x] T021 [US3] Adjust Zod validation (inside `AddNewClientForm.tsx` or its separate `.ts` validation schema) to require `phoneNumber` and optionally validate `email` format natively.

## Phase 6: Polish & Cross-Cutting Concerns
**Goal**: Final styling tweaks, UX validations, and edge case clean up.
- [x] T022 Standardize and verify error and success toast notifications natively within update/create actions using `react-hot-toast`.
- [x] T023 Ensure avatar color randomization uses a stable hashing function on the client's name so their color doesn't change on re-renders.

---

## Story Dependencies
- **Foundational (T001-T006)** MUST be complete before starting any UI tasks.
- **US1** and **US3** share the `/clients` page, but are independent logically. US1 forms the skeleton that US3's output is visible on.
- **US2** requires the `ClientDetails.tsx` modifications, which depend heavily on Foundational backend API updates.

## Parallel Execution Examples
- After Phase 2 (Foundational) is done, **US1 (List & Filter)**, **US2 (Profile)**, and **US3 (Add form)** can be worked on entirely in parallel by different resources.
- `Clients.css` (T011, T018) can be parallelized independently with their respective TypeScript UI tasks (T010, T017).

## Execution Strategy
Implement **Phase 2** first (schema/types definition), followed directly by **Phase 3** (Display existing mock or DB data across Card/Table layouts), giving you a stable list to iterate from. Then implement **Phase 4** to support drill-down view. Finally, wire in **Phase 5** for adding new data.
