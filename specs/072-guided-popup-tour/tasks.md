# Tasks: Guided Popup Tour

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/072-guided-popup-tour/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/guided-popup-ui-contract.md`

**Tests**: No new automated test suite was requested. Validation is via `npm run lint`, optional `npm run build`, and browser review.

**Organization**: Tasks are grouped by user story so button-step navigation, AI readiness guidance, and dismissal behavior can be verified independently.

## Phase 1: Setup

**Purpose**: Verify existing frontend guidance files are the implementation target.

- [X] T001 Verify existing guidance source files in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/`.
- [X] T002 Verify ignore files already cover frontend build outputs and no new ignore entries are needed.

---

## Phase 2: Foundational

**Purpose**: Add data contracts and utility behavior required by all guided tour stories.

- [X] T003 Add `GuidedTourStep` type and `tourSteps` field to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/guidanceContent.ts`.
- [X] T004 Add shared tour step builders for manual pages and AI pages in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/guidanceContent.ts`.
- [X] T005 Add target lookup helpers that can match by selector, visible text, aria-label, title, or placeholder in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.
- [X] T006 Add spotlight CSS primitives and reduced-motion handling in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.css`.

**Checkpoint**: Guided tour data and spotlight foundation are ready.

---

## Phase 3: User Story 1 - Follow Page Buttons Step By Step (Priority: P1)

**Goal**: The popup has previous/next controls and a moving spotlight for relevant visible controls.

**Independent Test**: Open a guided workflow page, click next and previous, and confirm the active step and target spotlight change.

- [X] T007 [US1] Add active-step state, step counter, previous button, and next button to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.
- [X] T008 [US1] Render active step title/body separately from the full notes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.
- [X] T009 [US1] Scroll active targets into view and render a fixed-position spotlight when a matching target is found in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.
- [X] T010 [US1] Add tour steps for case details, document selection, and legal workflow routes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/guidanceContent.ts`.
- [X] T011 [US1] Style navigation controls, step counter, active-step body, and target-missing fallback in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.css`.

**Checkpoint**: User Story 1 is independently usable.

---

## Phase 4: User Story 2 - Understand AI Readiness And Legal Responsibility (Priority: P2)

**Goal**: AI-capable pages include guided AI steps with inputs, expected output, and review responsibility.

**Independent Test**: Navigate the popup on an AI page and confirm the AI step includes readiness and lawyer responsibility guidance.

- [X] T012 [US2] Add AI-specific guided steps for documents, contracts, chat, case analysis, and workflow pages in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/guidanceContent.ts`.
- [X] T013 [US2] Render AI step tone and readiness details without showing AI content on non-AI pages in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.
- [X] T014 [US2] Style AI-tone step badges and review notice within the guided popup in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.css`.

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Control Repetition Without Losing Help Elsewhere (Priority: P3)

**Goal**: Closing is temporary, permanent dismissal is page-specific, and reduced-motion users are respected.

**Independent Test**: Permanently dismiss one page popup, refresh, and confirm another page still shows its own popup.

- [X] T015 [US3] Reset the active step when route content changes and preserve page-specific dismissal in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.
- [X] T016 [US3] Keep close, outside click, Escape, and `عدم الإظهار مرة أخرى` behaviors accessible in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.
- [X] T017 [US3] Confirm reduced-motion CSS removes spotlight and popup transition effects in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.css`.

**Checkpoint**: All user stories are complete.

---

## Phase 6: Polish & Validation

**Purpose**: Validate implementation quality and document known build status.

- [X] T018 Fix truncated 072 technology text in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/AGENTS.md`.
- [X] T019 Run `npm run lint` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard`.
- [X] T020 Run `npm run build` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard` or record unrelated existing blockers. Result: new guided popup TypeScript issues are resolved; build remains blocked by existing unrelated `AgendaPage.tsx` case id typing and `PowerOfAttorneysPage.tsx` missing `CustomButton.size` errors.
- [X] T021 Verify the Vite Docker dashboard serves the updated guided popup on `http://localhost:5078/`. Result: Docker Vite serves `PageGuidance.tsx` and `PageGuidance.css`; served module includes `page-guidance-spotlight` and `page-guidance-dialog__nav`.

---

## Dependencies & Execution Order

- Setup tasks T001-T002 must complete first.
- Foundational tasks T003-T006 block all user stories.
- US1 should be implemented first because US2 and US3 reuse the active-step navigation.
- US2 depends on the guided step renderer from US1.
- US3 depends on the final popup behavior from US1 and US2.
- Polish tasks run last.

## Parallel Opportunities

- T003 and T006 can be reviewed independently because they touch different files.
- Content additions in T010 and T012 can be edited separately from component behavior after T003.
- Validation tasks T019-T021 run after implementation.

## Implementation Strategy

1. Extend guidance content with explicit tour step metadata.
2. Upgrade `PageGuidance` from static popup content to step navigation with spotlight target matching.
3. Add AI-specific guided steps only where AI exists.
4. Preserve page-specific permanent dismissal and reduced-motion support.
5. Validate lint, build status, and Docker Vite serving.
