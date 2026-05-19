# Tasks: Add Gemini 3.5 Flash

**Input**: Design documents from `/specs/075-add-gemini-35-flash/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include focused backend tests because pricing and reporting behavior are accounting-sensitive.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file path(s) in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify current project targets and files before implementation.

- [x] T001 Verify backend and admin-dashboard model config files are present in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Enum/AiModelType.cs`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiCostCalculator.cs`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/settings/AiModelSettings.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No separate foundational code is required; existing string persistence and admin endpoints support the new model once validation and options are updated.

- [x] T002 Confirm no EF migration is needed because `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/AiStageModelConfig.cs` stores `ModelIdentifier` as a string

**Checkpoint**: Foundation ready - user story implementation can start.

---

## Phase 3: User Story 1 - Configure Gemini 3.5 Flash (Priority: P1) MVP

**Goal**: Admins can select and save Gemini 3.5 Flash for any visible AI model configuration.

**Independent Test**: Backend available models include the identifier and validation accepts it; admin settings dropdown shows Gemini 3.5 Flash.

### Tests for User Story 1

- [x] T003 [P] [US1] Add backend unit tests for Gemini 3.5 Flash model identifier, display name, and valid identifiers in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiModelConfigServiceTests.cs`

### Implementation for User Story 1

- [x] T004 [US1] Add `Gemini35Flash` enum option, identifier `gemini-3.5-flash`, display name, description, valid identifier entry, and display-name mapping in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Enum/AiModelType.cs`
- [x] T005 [US1] Extend model option metadata with documentation URL and pricing notes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/AiModelConfig/AiModelOptionDto.cs` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiModelConfigService.cs`
- [x] T006 [US1] Add Gemini 3.5 Flash to every admin AI settings dropdown option in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/settings/AiModelSettings.tsx`
- [x] T007 [US1] Update frontend AI model option type metadata fields in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/types/index.ts`

**Checkpoint**: User Story 1 is selectable and valid independently.

---

## Phase 4: User Story 2 - Calculate Gemini 3.5 Flash Cost (Priority: P2)

**Goal**: Token usage and model reports use the provided Gemini 3.5 Flash paid-tier pricing.

**Independent Test**: Cost calculation for 1M input and 1M output tokens returns $10.50 and reports include Gemini 3.5 Flash.

### Tests for User Story 2

- [x] T008 [P] [US2] Add backend unit tests for Gemini 3.5 Flash cost calculation and zero-usage model report inclusion in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiUsageReportServiceTests.cs`

### Implementation for User Story 2

- [x] T009 [US2] Add Gemini 3.5 Flash input/output paid-tier token pricing to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiCostCalculator.cs`
- [x] T010 [US2] Include `gemini-3.5-flash` in the all-model usage report identifier list in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiUsageReportService.cs`

**Checkpoint**: User Story 2 pricing and reporting work independently.

---

## Phase 5: User Story 3 - Document Pricing Metadata (Priority: P3)

**Goal**: Maintainers can verify Gemini 3.5 Flash official documentation and pricing notes from model metadata.

**Independent Test**: Available model option metadata contains the official URL and pricing notes.

### Implementation for User Story 3

- [x] T011 [US3] Add the official Gemini 3.5 Flash URL and provided pricing notes to returned model option metadata in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiModelConfigService.cs` (depends on T005)

**Checkpoint**: User Story 3 metadata is traceable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate and mark completion.

- [x] T012 Run focused backend tests with `dotnet test mohamy-smart-backend/Lawyer.Tests/Lawyer.Tests.csproj --filter "AiModelConfigServiceTests|AiUsageReportServiceTests"` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart`
- [x] T013 Run admin dashboard lint or type validation from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard`
- [x] T014 Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/075-add-gemini-35-flash/tasks.md` checkboxes to mark completed tasks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on setup confirmation.
- **User Story 1 (Phase 3)**: Depends on foundational confirmation.
- **User Story 2 (Phase 4)**: Depends on foundational confirmation; can run after backend model identifier exists.
- **User Story 3 (Phase 5)**: Depends on model metadata DTO changes.
- **Polish (Phase 6)**: Depends on implemented user stories.

### Parallel Opportunities

- T003 and T008 are in different test files and can be written independently.
- T006 and T007 are frontend-only and can run after the new model option shape is known.
- T009 and T010 are backend reporting/cost changes in separate files.

## Implementation Strategy

1. Complete setup and no-migration confirmation.
2. Implement MVP support for selecting and validating Gemini 3.5 Flash.
3. Add pricing and report inclusion.
4. Add metadata and run focused validation.
