# Feature Specification: Phase 0 — Stabilize & Patch

**Feature Branch**: `044-stabilize-patch`  
**Created**: 2026-04-14  
**Status**: Complete  
**Input**: User description: "Phase 0 — Stabilize & Patch: Fix branch 043 instability, security vulnerabilities, race conditions, dead code cleanup, and critical P0 issues before any merge"

## Clarifications

### Session 2026-04-14

- Q: ما السلوك المتوقع عند فشل عملية الحفظ التلقائي (مثل انقطاع الشبكة)؟ → A: إخفاء الخطأ بصمت وإعادة المحاولة في دورة الـ debounce التالية.
- Q: لو تابين مفتوحين على نفس الخطوة وكلهم بيحفظوا — إيه السلوك المتوقع؟ → A: آخر حفظ يكسب (last-write-wins) بدون حماية إضافية.
- Q: صفحة نسيت كلمة المرور — هل نبني backend endpoint ولا فرونت إند فقط؟ → A: فرونت إند فقط — رسالة "الخاصية غير متاحة حالياً".

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Lawyer Cannot Access Another Lawyer's Case Data (Priority: P1)

A lawyer using the Appeal Brief workflow must only be able to view and run analysis on cases they own. If a lawyer attempts to access a case belonging to a different lawyer — whether by manipulating a URL, replaying a request, or through any other means — the system must reject the request and display an authorization error.

> **Research finding (2026-04-14)**: `AppealBriefService` already extends `WorkflowServiceBase` with `ICaseAccessValidator`. This story is **verification-only** — no code changes needed. The security fix is already in place.

**Why this priority**: This is a security vulnerability. Without this fix, any authenticated lawyer can run AI analysis on any case in the system, exposing confidential client data.

**Independent Test**: Send a request to the Appeal Brief workflow endpoint using a valid session for Lawyer A but referencing a case owned by Lawyer B. The system must reject the request.

**Acceptance Scenarios**:

1. **Given** a lawyer is authenticated, **When** they request an Appeal Brief analysis for a case they own, **Then** the analysis proceeds normally.
2. **Given** a lawyer is authenticated, **When** they request an Appeal Brief analysis for a case owned by a different lawyer, **Then** the system rejects the request with an authorization error and does not reveal any case data.
3. **Given** a lawyer is authenticated, **When** they request an Appeal Brief analysis for a case that does not exist, **Then** the system returns a "case not found" error.

---

### User Story 2 — Auto-save and Manual Save Do Not Conflict (Priority: P1)

A lawyer editing a workflow step should be able to rely on automatic saving without worrying about data loss. If the lawyer clicks the manual "Save" button at the same moment auto-save triggers, the system must prevent both operations from running in parallel. Only one save operation should execute at a time, and the user's latest edits must always be preserved.

**Why this priority**: Concurrent saves can cause a race condition where the last write wins, potentially overwriting the lawyer's most recent edits with stale data.

**Independent Test**: In any workflow step that supports auto-save, trigger a manual save immediately after a debounce timer begins. Confirm that only one save operation reaches the server and the final persisted data reflects the lawyer's latest input.

**Acceptance Scenarios**:

1. **Given** a lawyer is editing a workflow step, **When** auto-save triggers and the lawyer simultaneously clicks "Save," **Then** only one save request is sent to the server.
2. **Given** a save operation is in progress, **When** another save is requested (manual or automatic), **Then** the second save waits until the first completes or supersedes it.
3. **Given** a lawyer navigates away from a step while auto-save is pending, **Then** the pending debounce is cancelled and no orphan request is sent.

---

### User Story 3 — Branch 043 Compiles and Is Merge-Ready (Priority: P1)

A developer working on the codebase needs branch 043 to compile cleanly on both backend and frontend. All new files must be tracked in version control, all pending database migrations must be applied, and the application must start without errors.

**Why this priority**: The branch is currently unstable with untracked files and unapplied migrations. No further feature work or code review can happen until it compiles cleanly.

**Independent Test**: Pull branch 043, run the backend build and the frontend build. Both must complete with zero errors. Start the application and confirm it launches without runtime exceptions.

**Acceptance Scenarios**:

1. **Given** branch 043 is checked out, **When** a developer runs the backend build, **Then** the build succeeds with zero compilation errors.
2. **Given** branch 043 is checked out, **When** a developer runs the frontend build, **Then** the build succeeds with zero compilation errors.
3. **Given** the backend is started after applying all migrations, **When** the database snapshot is checked, **Then** it is consistent with the applied migrations.
4. **Given** all previously untracked files, **When** git status is checked, **Then** every file is either tracked/committed or intentionally removed.

---

### User Story 4 — Production Code Contains No Debug Logging (Priority: P2)

A team lead reviewing the codebase for production readiness expects that no `console.log` statements remain in production source files. Debug output in production can leak sensitive information and clutter browser consoles for end users.

**Why this priority**: Lower severity than security or data integrity, but required before any production deployment.

**Independent Test**: Search the production source tree for `console.log` statements. The search must return zero results.

**Acceptance Scenarios**:

1. **Given** the frontend production codebase, **When** a search for `console.log` is performed, **Then** zero matches are found in production source files (test files excluded).

---

### User Story 5 — Dead Redux Code Is Removed (Priority: P2)

A developer navigating the Redux store structure should not encounter unused slices or thunks.

> **Research finding (2026-04-14)**: The legacy `rulingAnalysisAiSlice.ts` is **actively used** by `RulingAnalysisPage.tsx` and all 4 step components (`RulingStep1-4`). It is NOT dead code. Deletion is deferred to the frontend unification phase. This story is **descoped from Phase 0**.

---

### User Story 6 — Forgot Password Flow Works End-to-End (Priority: P3)

A lawyer who has forgotten their password visits the Forgot Password page. Since the backend password-reset endpoint does not exist yet, the page must display a clear message indicating the feature is not currently available, rather than showing a broken form or failing silently.

**Why this priority**: Important for user self-service, but workaround exists (admin-assisted reset). Building the backend endpoint is deferred to a future phase.

**Independent Test**: Navigate to the Forgot Password page. Confirm the page displays a clear "Feature not yet available" notice instead of a functional form.

**Acceptance Scenarios**:

1. **Given** a lawyer navigates to the Forgot Password page, **When** the page loads, **Then** the system displays a clear "Feature not yet available" message with guidance to contact an administrator.
2. **Given** the Forgot Password page is displayed, **When** the user views it, **Then** no form submission is possible (the submit action is disabled or the form is replaced by the notice).

---

### Edge Cases

- What happens when auto-save fires but the network connection is lost mid-request? → The save fails silently; the pending payload is retained and retried on the next debounce cycle.
- What happens if two browser tabs are open on the same workflow step and both trigger saves? → Last-write-wins; no cross-tab locking or warnings are implemented in this phase.
- What happens if a migration file is malformed and fails to apply?
- What happens if the legacy Redux files are imported by a dynamic import path not caught by static analysis?
- What happens if the ForgotPassword endpoint returns an unexpected error format?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Appeal Brief workflow service MUST verify that the requesting lawyer owns the case before proceeding with any analysis. **[VERIFIED: Already implemented via `WorkflowServiceBase` + `ICaseAccessValidator`]**
- **FR-002**: The system MUST reject requests to the Appeal Brief workflow for cases not owned by the requesting lawyer, returning an authorization error without exposing case data. **[VERIFIED: Already implemented]**
- **FR-003**: The auto-save mechanism MUST implement a mutual-exclusion guard that prevents concurrent manual and automatic save operations from executing simultaneously.
- **FR-004**: When a save operation is already in progress, subsequent save triggers (manual or automatic) MUST either queue or cancel the pending operation, ensuring only one write reaches the server at a time.
- **FR-005**: The auto-save hook MUST cancel any pending debounced save when the component unmounts, preventing orphan API calls.
- **FR-006**: All new files introduced in branch 043 MUST be either tracked in version control (committed) or intentionally deleted before the branch is considered merge-ready.
- **FR-007**: All pending database migrations in branch 043 MUST be applied, and the database model snapshot MUST be updated to match.
- **FR-008**: The backend project MUST compile with zero errors after all branch 043 changes are stabilized.
- **FR-009**: The frontend project MUST compile with zero errors after all branch 043 changes are stabilized.
- **FR-010**: All `console.log` statements MUST be removed from production frontend source files (excluding test and configuration files).
- **FR-011**: ~~The legacy RulingAnalysis Redux slice and its associated thunk files MUST be removed from the codebase.~~ **[DESCOPED: Research found the slice is actively used by 5 components. Deferred to frontend unification phase.]**
- **FR-012**: The Forgot Password page MUST display an explicit "Feature not yet available" notice and MUST NOT present a functional form or allow submission. No backend endpoint is required in this phase.
- **FR-013**: When an auto-save request fails (network error, server error, or timeout), the system MUST silently retain the unsaved payload and re-attempt the save on the next debounce cycle without displaying an error to the user.

### Key Entities

- **Case**: A legal case record with an ownership relationship to a specific Lawyer. The LawyerId on the case determines who may access or run analysis on it.
- **Workflow Step Output**: The JSON result of an AI analysis step, persisted to the database. Subject to concurrent writes during auto-save and manual save.
- **AI Job**: A background processing record tracking the state of an AI analysis task, including its associated CaseId and LawyerId.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero unauthorized case access is possible through any workflow endpoint — verified by testing cross-lawyer access attempts across all workflows.
- **SC-002**: When auto-save and manual save are triggered within 100ms of each other, only one save request reaches the server — verified by network request inspection.
- **SC-003**: Branch 043 builds successfully (backend and frontend) in a clean checkout with zero compilation errors.
- **SC-004**: Zero `console.log` statements exist in the production frontend source after cleanup — verified by automated search.
- **SC-005**: ~~The frontend bundle size decreases after dead Redux code removal.~~ **[DESCOPED: Legacy slice is actively used — see FR-011]**
- **SC-006**: All 6 previously untracked files are resolved (committed or deleted) — verified by `git status` returning a clean working tree.
- **SC-007**: The Forgot Password page displays a clear unavailability notice and does not allow form submission — verified by manual testing.

## Assumptions

- The existing `ICaseAccessValidator` interface and implementation are available and can be reused for the Appeal Brief service without modification.
- The backend password-reset endpoint does not exist. Building it is out of scope for Phase 0. The frontend will display an unavailability message only.
- Branch 043 is the active development branch and all stabilization work will be done on top of it (or on a dedicated stabilization branch that merges into it).
- The 3 unapplied migration files are structurally valid and will apply cleanly to the current database schema.
- The legacy RulingAnalysis Redux files (slice + 4 thunks) are truly dead code with no runtime references; this will be confirmed via static analysis before deletion.
- Auto-save debounce timing (currently 2000ms) is not being changed in this phase — only the concurrency guard and cleanup behavior are in scope.
- Multi-tab conflict resolution (optimistic locking, BroadcastChannel warnings) is explicitly out of scope for this phase. Last-write-wins is the accepted behavior.
