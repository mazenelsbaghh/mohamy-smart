# Tasks: Split Defense Memo Generation

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/076-split-defense-memo/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No dedicated test tasks were requested in the feature specification. Validation is covered in the final phase with targeted build/check commands.

**Organization**: Tasks are grouped by user story to enable independently reviewable increments.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing project structure and add prompt assets needed by later stories.

- [X] T001 Create single-defense final memo prompt in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/wwwroot/prompts/المرحلة الأولى إعداد مذكرة الدفاع/defense-step5-single-defense.txt`
- [X] T002 Create final memo frame prompt in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/wwwroot/prompts/المرحلة الأولى إعداد مذكرة الدفاع/defense-step5-frame.txt`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add internal DTOs/helpers that all stories use without changing public API contracts.

- [X] T003 Add internal final memo section DTOs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/SmartAnalysis/DefenseMemoDraftRequestDto.cs`
- [X] T004 Add deterministic final memo assembly helpers in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/DefenseService.cs`

**Checkpoint**: Foundation ready - user story implementation can begin.

---

## Phase 3: User Story 1 - Fuller Final Defense Memo (Priority: P1) 🎯 MVP

**Goal**: Generate one substantial HTML argument per selected defense and assemble the final memo in the required order.

**Independent Test**: Generate a final memo with multiple selected defenses and verify every selected defense appears exactly once under the defense section in the selected order.

- [X] T005 [US1] Implement frame generation call using `defense-step5-frame.txt` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/DefenseService.cs` (depends on T002, T003)
- [X] T006 [US1] Implement per-defense generation loop using `defense-step5-single-defense.txt` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/DefenseService.cs` (depends on T001, T003)
- [X] T007 [US1] Replace monolithic final memo provider call with frame-plus-defense assembly in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/DefenseService.cs` (depends on T004, T005, T006)
- [X] T008 [US1] Add validation that rejects empty approved defenses, empty frame sections, or empty drafted defense HTML in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/DefenseService.cs` (depends on T007)

**Checkpoint**: User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Single Point Charge (Priority: P1)

**Goal**: Preserve exactly one lawyer point charge for the visible final memo job no matter how many internal provider calls occur.

**Independent Test**: Generate final memos with one defense and multiple defenses, then verify each successful final memo action maps to one point charge.

- [X] T009 [US2] Keep all internal final memo generation inside the existing `DefenseMemoDraft` job path in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/DefenseService.cs` (depends on T007)
- [X] T010 [US2] Ensure internal provider failures return one failed parent final memo job result without successful point charge in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/DefenseService.cs` (depends on T008)

**Checkpoint**: User Story 2 should be fully functional and testable independently.

---

## Phase 5: User Story 3 - Accurate Admin Usage Cost (Priority: P2)

**Goal**: Record real provider usage for frame and per-defense calls while keeping reporting grouped under final memo drafting.

**Independent Test**: Generate a final memo with multiple defenses and verify admin usage reports sum all internal provider calls under defense memo final drafting.

- [X] T011 [US3] Record usage for the frame generation provider call as `DefenseMemoDraft` with workflow type `defense-memo` and current run id in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/DefenseService.cs` (depends on T005)
- [X] T012 [US3] Record usage for every per-defense provider call as `DefenseMemoDraft` with workflow type `defense-memo` and current run id in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/DefenseService.cs` (depends on T006)
- [X] T013 [US3] Update final memo progress label to mention drafting defenses and assembling the memo in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/aiJobs/workflowJobMetadata.ts`

**Checkpoint**: User Story 3 should be fully functional and testable independently.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validate the implementation and mark feature documentation complete.

- [X] T014 Run backend build validation from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend`
- [X] T015 Run lawyer dashboard lint/build validation from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard`
- [X] T016 Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/076-split-defense-memo/quickstart.md` with validation notes from implemented behavior

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on setup prompt assets.
- **User Story 1 (Phase 3)**: Depends on foundational helpers and prompt assets.
- **User Story 2 (Phase 4)**: Depends on User Story 1 because billing behavior is preserved through the parent job path used by final assembly.
- **User Story 3 (Phase 5)**: Depends on frame and per-defense provider calls from User Story 1.
- **Polish**: Depends on all selected user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 and provides the MVP.
- **User Story 2 (P1)**: Requires the parent job path from User Story 1 to remain intact.
- **User Story 3 (P2)**: Requires the internal provider calls from User Story 1 to record usage.

### Parallel Opportunities

- T001 and T002 can be authored together because they are separate prompt files.
- T013 can be completed while backend service work is in review because it only changes user-facing progress copy.
- T014 and T015 can run independently after implementation tasks complete.

## Implementation Strategy

### MVP First

1. Complete T001-T004.
2. Complete T005-T008 for the split final memo generation and deterministic assembly.
3. Validate a multi-defense memo manually or with focused service-level checks.

### Billing and Reporting Completion

1. Complete T009-T010 to preserve one parent job charge.
2. Complete T011-T013 to ensure admin usage/cost visibility and user progress copy.
3. Run T014-T016 before final status.
