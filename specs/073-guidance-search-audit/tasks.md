# Tasks: Guidance Coverage Audit And Case Search Expansion

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/073-guidance-search-audit/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/guidance-search-ui-contract.md`, `quickstart.md`

## Phase 1: Setup

- [X] T001 Verify current git branch is `073-guidance-search-audit` and preserve existing dirty worktree changes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart`.
- [X] T002 Verify ignored generated folders remain covered by existing ignore configuration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.gitignore`.

## Phase 2: Foundational

- [X] T003 [P] Export the guidance route registry for coverage validation in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/guidanceRoutes.ts` and consume it from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidanceRoute.tsx`.
- [X] T004 [P] Add guidance content coverage validator in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/guidanceCoverage.ts`.
- [X] T005 [P] Add reusable case search normalization and matching helpers in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/caseSearch.ts`.

## Phase 3: User Story 1 - Complete Guided Help Focus For Every Page (Priority: P1)

**Goal**: Every guidance step scrolls to the correct target, applies focus, and avoids covering the target when possible.

**Independent Test**: Open registered guidance routes, step through the popup, and confirm each existing target is scrolled into clear view and receives a temporary focus state.

- [X] T006 [US1] Improve scroll parent detection to include window/document scrolling and nested panels in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.
- [X] T007 [US1] Re-run target scroll after layout settles before spotlight and focus are applied in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx` (depends on T006).
- [X] T008 [US1] Add dynamic popup placement classes so the popup moves above or below the focused target in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.css`.
- [X] T009 [US1] Ensure temporary focus cleanup runs on step change and popup close in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.

## Phase 4: User Story 2 - Page-Specific Explanations Are Complete (Priority: P1)

**Goal**: Guidance content is complete for all registered pages and avoids generic or placeholder wording.

**Independent Test**: Run the guidance coverage validator and manually inspect representative page guidance flows.

- [X] T010 [US2] Update registered page guidance copy and target text where needed in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/guidanceContent.ts`.
- [X] T011 [US2] Add guidance coverage tests for registered routes, non-empty tour steps, AI blocks, and fallback-safe target references in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/guidanceCoverage.test.ts` (depends on T003, T004, T010).

## Phase 5: User Story 3 - Search Cases By Client And Related Case Data (Priority: P2)

**Goal**: The cases list search finds cases by client, opponent, number, court, title, type, status, archive state, date, and description.

**Independent Test**: Enter separate partial queries for client name, opponent name, court name, case number, title, and Arabic-Indic digits in the cases search input.

- [X] T012 [US3] Add `searchQuery` support to case listing service and controller in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/ICaseService.cs`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/CaseService.cs`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/CaseController.cs`.
- [X] T013 [US3] Wire `searchQuery` request param in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/cases/thunk/thunkGetAllCases.ts`.
- [X] T014 [US3] Wire case search helpers and debounced query fetching into filtering in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/Cases.tsx` (depends on T005, T013).
- [X] T015 [US3] Update the cases search placeholder and accessible intent copy in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/Cases.tsx`.
- [X] T016 [US3] Add case search helper tests for client name, opponent name, court, status, and Arabic digit normalization in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/caseSearch.test.ts` (depends on T005).

## Final Phase: Polish & Cross-Cutting Concerns

- [X] T017 Run `npm run lint` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard`.
- [X] T018 Run targeted tests for guidance coverage and case search from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard`.
- [X] T019 Run `npm run build` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard` or record unrelated existing blockers. Result: still blocked by unrelated existing `AgendaPage.tsx` and `PowerOfAttorneysPage.tsx` TypeScript errors.
- [X] T020 Verify Docker Vite serves updated `PageGuidance.tsx`, `guidanceCoverage.ts`, `caseSearch.ts`, and `Cases.tsx` on `http://localhost:5078/`.
- [X] T021 Record final validation notes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/073-guidance-search-audit/quickstart.md`.

## Dependencies

- T003, T004, and T005 can run in parallel after setup.
- US1 depends on existing guidance component and can run after T003.
- US2 depends on T003 and T004.
- US3 depends on T005.
- Final validation depends on US1, US2, and US3.

## Parallel Execution Examples

- T003, T004, and T005 touch separate files and can be done together.
- T011 and T014 can run in parallel after their helper files exist.

## Implementation Strategy

1. Complete setup and helpers.
2. Fix guidance scroll/focus behavior first because it is the highest priority.
3. Validate guidance content coverage.
4. Expand case search through a reusable helper and test it.
5. Run lint, targeted tests, build, and Docker Vite verification.
