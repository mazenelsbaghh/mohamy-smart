---
description: "Task list for Phase 6 Appeal Brief Frontend Implementation"
---

# Tasks: Phase 6 Appeal Brief Frontend Implementation

**Input**: Design documents from `/specs/036-appeal-frontend/`
**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create structural directories for steps in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Implement unified Redux state via `createWorkflowSlice` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/slices/workflow/appealBriefSlice.ts`
- [x] T003 Add `appealBriefSlice` to the main Redux store configuration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/store.ts`
- [x] T004 Define `AiStepType` enum mapping for the 6 newly required Appeal Brief steps in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/types/enums.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - End-to-End Appeal Brief Generation (Priority: P1) 🎯 MVP

**Goal**: Users navigate through a unified, 6-step wizard using shared UI components and hooks to generate a complete Appeal Brief.

**Independent Test**: Launch the Appeal Brief workflow inside a case, step through all 6 phases, verify the Redux hydration loads successfully using `useAnalysisStep`, and the Final Assembly displays correctly.

### Implementation for User Story 1

- [x] T005 [P] [US1] Create Judgment Data extraction step UI in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep1JudgmentData.tsx`
- [x] T006 [P] [US1] Create Reasoning Analysis step UI in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep2Analysis.tsx`
- [x] T007 [P] [US1] Create Appeal Grounds step UI in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep3Grounds.tsx`
- [x] T008 [P] [US1] Create Appeal Requests step UI in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep4Requests.tsx`
- [x] T009 [P] [US1] Create Legal Basis step UI in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep5LegalBasis.tsx`
- [x] T010 [P] [US1] Create Final Assembly summary step UI in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep6Assembly.tsx`
- [x] T011 [US1] Implement main orchestration and routing shell `AppealBriefPage` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx` (depends on T005-T010)
- [x] T012 [US1] Register `AppealBriefPage` in the central case router under `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/routes/caseRoutes.tsx` (depends on T011)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T013 Finalize CSS alignment resolving RTL text hierarchy constraints inside the newly added steps across `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/*.tsx`
- [x] T014 Export all newly created components accurately in the central index files across the `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/` directory.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Step 1 through Step 6 (T005-T010) UI files marked [P] can be created completely in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch generic boilerplate setup together:
Task: "Create Judgment Data extraction step UI in [...]/AppealStep1JudgmentData.tsx"
Task: "Create Reasoning Analysis step UI in [...]/AppealStep2Analysis.tsx"
# etc...
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready
