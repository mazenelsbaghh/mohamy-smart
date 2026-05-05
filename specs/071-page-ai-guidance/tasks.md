# Tasks: Page AI Guidance

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/071-page-ai-guidance/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/guidance-ui-contract.md`

**Tests**: No new automated test suite was requested in the feature specification. Validation is via `npm run lint`, optional `npm run build`, and quickstart manual checks.

**Organization**: Tasks are grouped by user story so the page guidance popup foundation, AI usage explanation, and repeated-use dismissal behavior can be validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the lawyer-dashboard feature area for a shared guidance system.

- [X] T001 Create the shared guidance component directory at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/`.
- [X] T002 Verify existing ignore files cover generated/build outputs for the lawyer dashboard without requiring new ignore entries.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the reusable content and UI primitives that all stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Add the typed Arabic guidance content catalog in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/guidanceContent.ts`.
- [X] T004 [P] Add the responsive guidance styles in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.css`.
- [X] T005 Implement the reusable `PageGuidance` component in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.
- [X] T006 Implement route-to-guidance lookup in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidanceRoute.tsx`.

**Checkpoint**: Foundation ready. User stories can now be implemented.

---

## Phase 3: User Story 1 - Understand Each Page Immediately (Priority: P1) MVP

**Goal**: Every main protected lawyer-dashboard page shows an Arabic guidance popup describing the page purpose, ordered work steps, and recommended next step.

**Independent Test**: Open main protected routes and confirm the popup title, summary, step list, and next step match the current page.

- [X] T007 [US1] Wire `PageGuidanceRoute` into `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/layout/Layout.tsx` above the page outlet.
- [X] T008 [US1] Cover dashboard, cases, clients, documents, contracts, legal library, process-server papers, agenda, settings, subscription, and not-found routes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/guidanceContent.ts`.
- [X] T009 [US1] Verify guidance stays page-specific across dynamic routes such as `/cases/:id`, `/clients/:id`, `/legal-contracts/:id`, and `/agenda/:id`.

**Checkpoint**: User Story 1 is independently usable.

---

## Phase 4: User Story 2 - Know When And How To Use AI (Priority: P2)

**Goal**: AI-capable pages explain when to use AI, what inputs are required, what output to expect, and that the lawyer remains responsible for review.

**Independent Test**: Open case details, document selection, legal workflow pages, contract creation/detail pages, documents, and chat. Confirm AI guidance appears only on AI-capable pages.

- [X] T010 [US2] Add AI guidance blocks for case analysis, document selection, legal workflow generation, contract AI workflows, documents, and chat in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/guidanceContent.ts`.
- [X] T011 [US2] Render AI guidance only when content includes an `ai` block in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.
- [X] T012 [US2] Confirm non-AI pages such as settings, subscription, legal calculators, and client management do not display AI usage instructions.

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Keep Guidance Useful Without Blocking Work (Priority: P3)

**Goal**: Guidance opens as a popup by default, can be closed for now, can be permanently hidden per page, and remains responsive on narrow screens.

**Independent Test**: Open at least two pages, click "عدم الإظهار مرة أخرى" on one page, refresh, and confirm only that page popup stays hidden while the other page still shows its guidance.

- [X] T013 [US3] Persist page-specific "عدم الإظهار مرة أخرى" dismissed state in local browser storage from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.
- [X] T014 [US3] Add accessible close and permanent-dismiss controls and labels in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.tsx`.
- [X] T015 [US3] Validate mobile-safe wrapping and spacing in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/guidance/PageGuidance.css`.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate quality and keep Spec Kit artifacts aligned with implementation.

- [X] T016 Run `npm run lint` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard`.
- [X] T017 Run `npm run build` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard` or record unrelated existing build blockers.
- [X] T018 Review quickstart scenarios in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/071-page-ai-guidance/quickstart.md` against the implemented routes.

## Validation Notes

- `npm run lint` passed from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard`.
- `npm run build` was run and failed on pre-existing type errors outside this feature: `src/pages/agenda/AgendaPage.tsx` has `TCase.id` string/number incompatibilities, and `src/pages/legalLibrary/PowerOfAttorneysPage.tsx` has `CustomButton` calls missing the required `size` prop.
- A Vite dev server is available at `http://localhost:5179/` for manual review.
- Product feedback changed the guidance surface from an inline expandable guide to a page popup with ordered steps and page-specific "عدم الإظهار مرة أخرى" persistence.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and shares the same component with US1.
- **User Story 3 (Phase 5)**: Depends on the shared component from Foundational.
- **Polish (Phase 6)**: Depends on all implemented user stories.

### User Story Dependencies

- **US1**: First release MVP; can be verified once route-level guidance renders.
- **US2**: Adds AI-specific content and rendering rules to the same guidance system.
- **US3**: Adds repeated-use behavior and responsive hardening to the shared guidance system.

### Parallel Opportunities

- T003 and T004 can run in parallel because they edit different files.
- Content coverage tasks can be reviewed independently from component styling.
- Validation tasks T016, T017, and T018 run after implementation.

## Implementation Strategy

1. Build the shared guidance catalog and component.
2. Wire it once into the protected dashboard layout.
3. Add page-specific guidance for every main route and AI-specific blocks only where AI is actually available.
4. Validate lint/build and quickstart scenarios.
