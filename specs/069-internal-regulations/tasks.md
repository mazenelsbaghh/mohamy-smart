# Tasks: Internal Regulations in Legal Library

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/069-internal-regulations/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No dedicated TDD task block was requested. Validation tasks are included in the final phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Each task names exact target file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm project infrastructure and shared API constants needed by the feature.

- [X] T001 Verify git ignore coverage for Node, .NET, and environment outputs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.gitignore`
- [X] T002 Add internal regulation API route constants in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/APIs/routes.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add persistence primitives that all user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Add `InternalRegulation` domain model in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/InternalRegulation.cs`
- [X] T004 [P] Add `CaseInternalRegulation` link domain model in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/CaseInternalRegulation.cs`
- [X] T005 Extend `Case` with internal regulation navigation and context field in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/Case.cs` (depends on T004)
- [X] T006 Add `InternalRegulations` and `CaseInternalRegulations` DbSets in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastructure/Persistence/AppDbContext.cs` (depends on T003, T004)
- [X] T007 [P] Configure `InternalRegulation` EF mapping and indexes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastructure/Persistence/Configuration/InternalRegulationConfiguration.cs`
- [X] T008 [P] Configure `CaseInternalRegulation` EF mapping with unique `(CaseId, InternalRegulationId)` index in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastructure/Persistence/Configuration/CaseInternalRegulationConfiguration.cs`
- [X] T009 Update `CaseConfiguration` to map `InternalRegulationsContext` length in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastructure/Persistence/Configuration/CaseConfiguration.cs` (depends on T005)

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Add Internal Regulations to the Legal Library (Priority: P1) MVP

**Goal**: A lawyer can manage internal regulations as legal library records and see them in the legal library.

**Independent Test**: Create an internal regulation from the lawyer dashboard, refresh the page, and confirm it appears as an active library item.

### Implementation for User Story 1

- [X] T010 [P] [US1] Add internal regulation DTOs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/InternalRegulations/InternalRegulationDtos.cs`
- [X] T011 [P] [US1] Add `IInternalRegulationService` contract in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IInternalRegulationService.cs`
- [X] T012 [US1] Implement list/create/update/archive/restore service methods in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/InternalRegulationService.cs` (depends on T010, T011)
- [X] T013 [P] [US1] Add FluentValidation rules for create/update internal regulation DTOs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Validators/InternalRegulationValidator.cs` (depends on T010)
- [X] T014 [US1] Register `IInternalRegulationService` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs` (depends on T012)
- [X] T015 [US1] Add lawyer-protected `InternalRegulationsController` endpoints in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/InternalRegulationsController.cs` (depends on T011, T012)
- [X] T016 [P] [US1] Add internal regulation TypeScript types in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/types/types.ts`
- [X] T017 [US1] Add Redux thunks and slice for internal regulation list/create/update/archive/restore in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/internalRegulations/internalRegulationsSlice.ts` (depends on T002, T016)
- [X] T018 [US1] Register the internal regulations slice in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/store.ts` (depends on T017)
- [X] T019 [US1] Add the internal regulations management page in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/legalLibrary/InternalRegulationsPage.tsx` (depends on T017)
- [X] T020 [US1] Wire legal library card and route for `/legal-library/internal-regulations` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/legalLibrary/LegalLibrary.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/router/AppRouter.tsx` (depends on T019)

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Attach Internal Regulations to a Case Beside Laws (Priority: P1)

**Goal**: A lawyer can link one or more active internal regulations to a case and see them when reopening the case.

**Independent Test**: Link a regulation to a case that already has case/law types selected, refresh the case details page, and confirm both the existing type and regulation are visible.

### Implementation for User Story 2

- [X] T021 [P] [US2] Add `InternalRegulationSummaryDto` and `UpdateCaseInternalRegulationsDto` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/InternalRegulations/InternalRegulationDtos.cs`
- [X] T022 [US2] Extend create/update/read case DTOs with internal regulation IDs and summaries in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Case/CaseDto.cs` (depends on T021)
- [X] T023 [US2] Add case regulation linking helpers and context rebuild behavior in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/CaseService.cs` (depends on T022)
- [X] T024 [US2] Add `UpdateCaseInternalRegulationsAsync` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/ICaseService.cs` (depends on T023)
- [X] T025 [US2] Add `PUT /Case/{id}/internal-regulations` endpoint in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/CaseController.cs` (depends on T024)
- [X] T026 [US2] Extend frontend case type and create-case thunk to send `internalRegulationIds` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/cases/casesSlice.ts` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/cases/thunk/thunkAddNewCase.ts` (depends on T017)
- [X] T027 [US2] Extend new-case validation schema with optional internal regulation IDs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/validations/AddNewCaseFromOCRSchema.ts` (depends on T026)
- [X] T028 [US2] Add active internal regulation multi-select to the new-case form in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/forms/AddNewCaseFromOCRForm.tsx` (depends on T017, T027)
- [X] T029 [US2] Add case detail legal references UI with update action in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/CaseDetailsComponent.tsx` (depends on T017, T025, T026)

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Use Combined References in Legal Analysis (Priority: P2)

**Goal**: Existing legal analysis workflows include linked active internal regulations in the case context.

**Independent Test**: Start any supported analysis workflow for a case with a linked internal regulation and confirm the built case context includes the regulation title/content; a case without regulations remains law-only.

### Implementation for User Story 3

- [X] T030 [US3] Append `Case.InternalRegulationsContext` to workflow case context in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Common/AnalysisHelpers.cs` (depends on T005, T023)
- [X] T031 [US3] Rebuild linked case contexts after internal regulation update/archive/restore in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/InternalRegulationService.cs` (depends on T012, T023, T030)

**Checkpoint**: Legal analysis can use combined law and internal regulation references.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Migration, verification, and task closure.

- [X] T032 Generate EF Core migration for internal regulation schema in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastructure/Migrations/`
- [X] T033 [P] Add service coverage for internal regulation ownership and duplicate case links in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/InternalRegulationServiceTests.cs`
- [X] T034 [P] Add case context unit coverage for internal regulations in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/CaseInternalRegulationContextTests.cs`
- [ ] T035 Run backend tests with `dotnet test /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.sln`
- [X] T036 Run lawyer dashboard type-check with `npm --workspace @mohamy/lawyer-dashboard run type-check`

**Validation Note**: T035 was executed, but the full suite is blocked by existing `CookieAuthIntegrationTests.FullAuthFlow_ShouldWorkProperly` returning 401 on `/api/v1/auth/me`. Feature-specific backend tests and `CaseServiceTests` pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **User Story 2 (Phase 4)**: Depends on Foundational and reuses US1 regulation list state.
- **User Story 3 (Phase 5)**: Depends on US2 case-link context behavior.
- **Polish**: Depends on all selected user stories.

### User Story Dependencies

- **US1**: Can start after Foundational and delivers legal library management.
- **US2**: Can start after Foundational but uses US1 APIs/state for active regulation selection.
- **US3**: Requires US2 context rebuild behavior so workflows can consume linked regulations.

### Parallel Opportunities

- T003/T004/T007/T008 can run in parallel after Setup.
- T010/T011/T013/T016 can run in parallel during US1.
- T033/T034 can run in parallel after implementation.

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational tasks.
2. Complete US1 so internal regulations can be managed in the legal library.
3. Complete US2 so regulations can be linked to cases.
4. Complete US3 so existing analysis context includes linked regulations.
5. Run migration and validation commands.

### Format Validation

All tasks follow the required checklist format with sequential IDs, story labels where applicable, and exact file paths.
