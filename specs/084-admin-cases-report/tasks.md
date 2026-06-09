# Tasks: Admin Cases Report and Excel Export

**Input**: Design documents from `/specs/084-admin-cases-report/`

## Spec Kit Preparation Workflow

- [x] Phase 1: Feature Specification (`speckit-specify`)
- [x] Phase 2: Technical Planning (`speckit-plan`)
- [x] Phase 3: Detailed Task Breakdown (`speckit-tasks`)

---

## Phase 1: Setup

**Purpose**: Basic DTO and interface setup

- [ ] T001 [P] Create DTO `LawyerCasesStatsDto` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/AdminReport/LawyerCasesStatsDto.cs`
- [ ] T002 [P] Add GetLawyersCasesStatsAsync signature in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IAdminReportService.cs`

---

## Phase 2: Foundational

**Purpose**: Core backend query and endpoint implementation

- [ ] T003 Implement case statistics query logic and paging in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminReportService.cs`
- [ ] T004 Expose HTTP GET endpoint for case stats in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminReportController.cs` (depends on T003)

---

## Phase 3: User Story 1 - View Case and Workflow Stats in Admin Panel (Priority: P1)

**Goal**: Display lawyer case stats in the Admin Dashboard with search and pagination

**Independent Test**: Switch to the Case Statistics view on the lawyers page and verify the lawyer names, phone numbers, case counts, completed steps, and workflow versions are displayed.

- [ ] T005 [P] [US1] Create fetch thunk `fetchLawyerCasesStats` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/reports/thunk/fetchLawyerCasesStats.ts`
- [ ] T006 [US1] Wire thunk state in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/reports/reportsSlice.ts` (depends on T005)
- [ ] T007 [US1] Update UI to switch between account management and case statistics in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/lawyers/Lawyers.tsx` (depends on T006)

---

## Phase 4: User Story 2 - Export Case Stats to Excel Sheet (Priority: P1)

**Goal**: Support downloading the entire list of statistics to an Excel spreadsheet

**Independent Test**: Click "تحميل التقرير" on the statistics view and verify that `lawyers-cases-report.xlsx` is downloaded with complete and correct statistics.

- [ ] T008 [P] [US2] Install `xlsx` dependency in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/package.json`
- [ ] T009 [US2] Add Excel download button and handler in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/lawyers/Lawyers.tsx` (depends on T007, T008)

---

## Phase 5: Polish & Quality Gates

**Purpose**: Validation, quality control, and reporting

- [ ] T010 [P] Run backend build verification in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend`
- [ ] T011 [P] Run frontend build/type-check verification in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard`
- [ ] T012 Run `clean-code-guard` against changed production files
- [ ] T013 Run `test-guard` against changed test files (if any)
- [ ] T014 Write walk-through verification report

---

## Dependencies & Execution Order

- **Setup & Foundational (T001-T004)**: Must run sequentially.
- **US1 (T005-T007)**: Depends on T004.
- **US2 (T008-T009)**: Depends on T007.
- **Quality Gates (T010-T014)**: Depends on all implementation tasks.
