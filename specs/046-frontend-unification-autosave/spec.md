# Feature Specification: Frontend Unification + Auto-save Complete

**Feature Branch**: `046-frontend-unification-autosave`  
**Created**: 2026-04-14  
**Status**: Draft  
**Input**: User description: "Phase 2 — Frontend Unification + Auto-save Complete"

## Clarifications

### Session 2026-04-14

- Q: ما نوع مؤشر الحفظ التلقائي (toast منبثق أم نص سطري)؟ → A: نص سطري (inline) داخل زر الحفظ نفسه — الزر يتغير نصه/حالته ليعرض "تم الحفظ تلقائياً" ثم يعود لحالته الأصلية. لا يُستخدم toast ولا نص منفصل بجانب الزر.
- Q: هل الحفظ التلقائي يعمل على كل الخطوات أم فقط الخطوات التي فيها تعديل يدوي؟ → A: يعمل على كل الخطوات بدون استثناء (حتى خطوات مخرجات AI للقراءة فقط) — يُرسل الحالة الكاملة للخطوة.
- Q: عند ترحيل step components القديمة، هل نحافظ على الشكل الحالي أم نوحّد التصميم؟ → A: توحيد الشكل بالكامل ليتطابق مع تصميم خطوات الطعن/الإنذار/الشكاوى الإدارية. لا يُحافظ على التصميم القديم.

## User Scenarios & Testing

### User Story 1 - Lawyer Edits a Defense Memo Step and It Auto-saves (Priority: P1)

A lawyer opens a case and navigates to the Defense Memo workflow. They begin editing in any of the 5 steps (Fact Analysis, Defenses List, Legal Analysis, Final Requirements, Final Note). As they type, their changes are automatically saved after a brief pause, preventing data loss. A subtle indicator shows "Saved automatically" confirming persistence. If the lawyer clicks the manual "Save" button, it coordinates with auto-save so only one save request runs at a time.

**Why this priority**: The defense memo is one of the two legacy workflows that currently lack auto-save. Losing unsaved edits in a legal document is unacceptable for a professional tool.

**Independent Test**: Open a defense memo workflow, edit text in any step, wait 1.5 seconds without further typing, confirm the "Saved automatically" indicator appears and the data persists after a page reload.

**Acceptance Scenarios**:

1. **Given** a lawyer has an active defense memo workflow at step 1, **When** they edit the facts text and pause typing for 1.5 seconds, **Then** the system auto-saves the edit and shows a "Saved automatically" indicator.
2. **Given** auto-save is in progress, **When** the lawyer clicks the manual "Save" button, **Then** the manual save waits for the in-flight auto-save to complete (or vice versa) — no concurrent save operations occur.
3. **Given** a lawyer edits step 2 and the network is temporarily unavailable, **When** auto-save fails, **Then** a "Save failed" indicator appears and the system retries on the next edit cycle.

---

### User Story 2 - Lawyer Edits a Preparing Statement of Claims Step and It Auto-saves (Priority: P1)

A lawyer opens the Preparing Statement of Claims workflow (7 steps). As with the defense memo, editing any step triggers automatic periodic saves after a brief pause. The same save coordination, indicators, and error recovery apply.

**Why this priority**: This is the second legacy workflow without auto-save. Identical in priority to the defense memo because both represent core document preparation flows used daily.

**Independent Test**: Open a statement of claims workflow, edit the Lawsuit Subjects step, wait 1.5 seconds, confirm the "Saved automatically" indicator appears and the data persists after a page reload.

**Acceptance Scenarios**:

1. **Given** a lawyer is on step 3 (Lawsuit Subjects) of the preparing statement of claims workflow, **When** they modify the subject text and pause for 1.5 seconds, **Then** auto-save fires and persists the change.
2. **Given** a lawyer navigates away from the step mid-edit, **When** the component unmounts, **Then** any pending auto-save debounce timer is cancelled (no orphaned network calls).

---

### User Story 3 - Auto-save Works Consistently Across All 7 Workflows (Priority: P2)

A lawyer can rely on auto-save behaving identically in every workflow — defense memo, statement of claims, appeal brief, admin complaint, ruling analysis, legal warning, and execution requests. The debounce timing, save indicator, error display, and manual-save coordination are the same everywhere.

**Why this priority**: Consistency reduces cognitive load. Lawyers should not need to remember which workflows save automatically and which do not.

**Independent Test**: Open each of the 7 workflow types, edit a step, and verify the same auto-save behavior (timing, indicator, error handling) in all of them.

**Acceptance Scenarios**:

1. **Given** any of the 7 workflow types, **When** the lawyer edits a step and pauses for 1.5 seconds, **Then** auto-save fires with the same indicator behavior.
2. **Given** multiple workflows are open in separate browser tabs, **When** auto-save triggers in each, **Then** each workflow saves independently without cross-tab interference.

---

### User Story 4 - Defense Memo Step Components Use Unified UI Shell (Priority: P2)

The 5 step components in the defense memo workflow (FactsReview, DefensesList, LegalAnalysis, FinalRequirements, FinalNote) use the same analysis step shell and hooks as the newer workflows. This means consistent loading states, error displays, re-analysis buttons, and step navigation across all workflows.

**Why this priority**: Ensures UI consistency and maintainability. Currently these components use ad-hoc patterns that diverge from the unified step shell used in appeal brief, exec request, etc.

**Independent Test**: Compare the defense memo step 1 UI against the appeal brief step 1 UI — loading spinners, error banners, re-analyze buttons, and step-locked states should look and behave identically.

**Acceptance Scenarios**:

1. **Given** a defense memo workflow at step 1 with AI analysis in progress, **When** the analysis is running, **Then** the same loading animation used in appeal brief / admin complaint steps is shown.
2. **Given** a defense memo workflow with step 3 completed but step 4 not yet started, **When** the lawyer tries to access step 5, **Then** step 5 is locked (same lock behavior as other workflows).
3. **Given** a defense memo workflow, **When** the lawyer views any step, **Then** the visual design (card layouts, section headers, spacing, colors) is identical to the equivalent step in the appeal brief or admin complaint workflows — no legacy-specific CSS or layout remains.

---

### User Story 5 - Statement of Claims Step Components Use Unified UI Shell (Priority: P2)

The 7 step components in the preparing statement of claims workflow (LawsuitCaseType, LawsuitParties, LawsuitSubjects, LawsuitFacts, LawsuitLegalBasis, LawsuitRequests, FinalStatementOfClaims) use the same unified analysis step shell and hooks as the newer workflows.

**Why this priority**: Same rationale as User Story 4 — consistency and maintainability for the second legacy workflow.

**Independent Test**: Navigate through all 7 steps of a statement of claims workflow and verify each step uses the unified step shell with consistent loading/error/lock behavior.

**Acceptance Scenarios**:

1. **Given** a preparing statement of claims workflow at step 5, **When** the legal basis AI analysis completes, **Then** the result is displayed using the same card and section layout as equivalent steps in other workflows.

---

### User Story 6 - Type-Safe Workflow Step Outputs (Priority: P3)

All workflow step outputs are accessed through typed interfaces rather than `any`. Developers working on any step component get autocomplete and compile-time checking for the output shape, making future changes safer and reducing runtime surprises.

**Why this priority**: Developer experience and maintainability — important but does not directly affect end-user functionality.

**Independent Test**: Run the TypeScript compiler with strict mode on the workflow slice files and step components; confirm zero `any`-typed workflow output references.

**Acceptance Scenarios**:

1. **Given** the codebase is compiled, **When** a developer inspects the type of `state.outputs[1]` in any workflow slice, **Then** they see a specific interface (e.g., `TFactAnalysis`) rather than `any`.
2. **Given** a workflow slice, **When** the developer attempts to access a non-existent property on a step output, **Then** the TypeScript compiler reports an error at build time.

---

### User Story 7 - Legacy Dead Code Removal (Priority: P3)

After migration is complete, all legacy Redux slices, thunks, and step-specific CSS files that are no longer referenced are removed from the codebase. The bundle size is reduced and there is a single, clear code path per workflow.

**Why this priority**: Cleanup improves maintainability but is not user-facing. Should only happen after migration is verified.

**Independent Test**: Search the codebase for the legacy file names and import paths; confirm zero references. Run the build and verify it succeeds with reduced bundle size.

**Acceptance Scenarios**:

1. **Given** the migration is complete, **When** a developer searches for imports of old legacy thunk files, **Then** zero references are found.
2. **Given** the migrated codebase, **When** a production build is created, **Then** it compiles without errors and the JS bundle size does not increase compared to pre-migration.

---

### Edge Cases

- What happens when the debounce timer fires but the user has already navigated away from the page?
  - The unmount cleanup cancels the timer; no orphaned API calls are fired.
- What happens when auto-save fires immediately after a manual save that is still in-flight?
  - The `isSaving` guard prevents concurrent saves; the auto-save queues and fires after the manual save completes.
- What happens when the browser loses connectivity during auto-save?
  - The save fails gracefully, the failed payload is retained, and the next edit cycle retriggers the save. A "Save failed" indicator is shown.
- What happens when a lawyer rapidly switches between steps while auto-save is pending?
  - Each step's auto-save is scoped to that step; switching steps cancels the previous step's debounce timer.
- What happens when legacy step components still reference old snake_case keys after backend unification (Phase 1)?
  - The step hydrators in the unified slice already normalize both camelCase and snake_case keys, providing backward compatibility during transition.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide automatic periodic saving in every step of all 7 workflow types (defense memo, statement of claims, appeal brief, admin complaint, ruling analysis, legal warning, execution request) — including both user-editable steps and read-only AI output steps. The full step state is persisted on each auto-save cycle.
- **FR-002**: System MUST use a consistent debounce interval (1.5 seconds of inactivity) before triggering auto-save across all workflows.
- **FR-003**: System MUST prevent concurrent manual and automatic save operations on the same workflow step using a shared guard mechanism.
- **FR-004**: System MUST display auto-save status by changing the save button's own text/state — showing "تم الحفظ تلقائياً" on success and "فشل الحفظ" on failure — then reverting to its default state after a few seconds. No external toasts or adjacent labels are used.
- **FR-005**: System MUST cancel pending auto-save timers when the user navigates away from a step or the component unmounts.
- **FR-006**: System MUST retain the failed save payload and reattempt save on the next user edit cycle if auto-save fails due to a network error.
- **FR-007**: All workflow step components MUST use the unified step shell and analysis step hook for consistent loading, error display, step locking, re-analysis behavior, **and identical visual design** (card layouts, section headers, spacing, colors).
- **FR-008**: System MUST define explicit typed interfaces for every workflow step output, eliminating generic/untyped references in workflow Redux state management.
- **FR-009**: The defense memo workflow (5 steps) step components MUST be migrated to use the unified analysis step hook, shell components, **and unified visual design** — legacy-specific CSS and layout patterns MUST be replaced, not preserved.
- **FR-010**: The preparing statement of claims workflow (7 steps) step components MUST be migrated to use the unified analysis step hook and shell components.
- **FR-011**: After migration is verified, all legacy Redux code, thunks, and unused CSS files related to the defense memo and statement of claims workflows MUST be removed.
- **FR-012**: The auto-save indicator (save button state change) MUST revert to the button's default state automatically within a few seconds, ensuring it is non-intrusive.
- **FR-013**: System MUST support the auto-save indicator in both light and dark modes with appropriate styling.

### Key Entities

- **Workflow Step Output**: The structured data produced by an AI analysis step — each step across all 7 workflow types has a defined output shape (e.g., `TFactAnalysis`, `TDefenses`, `TCaseDetails`, `TLawsuitParties`).
- **Auto-save State**: Tracks whether an auto-save is pending, in progress, or failed for a given workflow step, including the debounce timer reference and the pending payload.
- **Workflow Step Shell**: The common UI wrapper around each step component that provides loading animation, error banners, step lock/unlock behavior, re-analyze buttons, and auto-save integration.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 7 workflow types auto-save user edits within 2 seconds of the user stopping input, with no data loss on page reload.
- **SC-002**: Zero concurrent save operations occur across all workflows — the guard mechanism prevents 100% of race conditions between manual and automatic saves.
- **SC-003**: All workflow step components across all 7 workflows exhibit identical loading, error, and navigation behavior as verified by manual inspection of each step.
- **SC-004**: The TypeScript compiler reports zero `any`-typed references in workflow slice definitions and step output types after migration.
- **SC-005**: Net reduction in frontend codebase size (lines of code) after removing legacy Redux slices, thunks, and unused CSS files — target at least 500 lines removed.
- **SC-006**: The production build compiles successfully with no type errors, and bundle size does not increase compared to pre-migration baseline.
- **SC-007**: Auto-save feedback (success/failure indicator) is visible to the user within 500 milliseconds of a save attempt completing.

## Assumptions

- Phase 1 (Backend Unification) is completed before this phase begins — all backend workflow services use `System.Text.Json` with camelCase output and `WorkflowServiceBase` patterns.
- The `createWorkflowSlice` factory and `createWorkflowThunks` factory already exist and are production-proven (used by appeal brief, admin complaint, legal warning, exec request, ruling analysis).
- The `useWorkflowAutoSave` hook already exists with basic debounce and `isSaving` guard functionality (implemented and stabilized in Phase 0).
- The `useAnalysisStep` hook and `AnalysisStepShell` component already exist and are used by the newer workflows — they will be reused, not recreated.
- Both defense memo and statement of claims slices already use `createWorkflowSlice` (migrated in earlier phases) — the remaining work is migrating their step components to use the unified hooks and shell.
- The step hydrators in both slices already handle dual snake_case/camelCase normalization for backward compatibility with legacy database records.
- Browser localStorage-based token persistence is unchanged from existing authentication patterns.
- No backend API changes are required for this phase — all needed endpoints (start, get, run step, save draft, save edited step) already exist for all 7 workflows.
