# Feature Specification: Reliable Workflow Start and Resume

**Feature Branch**: `068-workflow-start-resume`  
**Created**: 2026-04-29  
**Status**: Draft  
**Input**: User description: "Review all behavior for start, resume current version, start new, refresh recovery, loading states, tab locking, and movement between workflow stages. Only the current active or completed stage should be available; the next stage must remain locked until the user presses the stage transition button. Refreshing during a new run, normal run, or active request must preserve progress and continue showing the appropriate loader until completion."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start New Cleanly (Priority: P1)

As a lawyer preparing a legal document or analysis, I want "start new" to begin a clean run for the selected workflow so that old stage results, old active requests, and previous tab access do not affect the new work.

**Why this priority**: Starting new is the highest-risk flow because stale results can produce incorrect legal drafts or make the user believe a stage has been completed when it belongs to an older run.

**Independent Test**: Can be fully tested by completing several stages in a workflow, selecting start new for the same case, and confirming the workflow begins at the first stage with only newly generated results appearing.

**Acceptance Scenarios**:

1. **Given** a case has an existing completed or partially completed workflow, **When** the user chooses "start new", **Then** the workflow opens at the first stage with previous stage results excluded from the active run.
2. **Given** old background requests exist for the same case and workflow, **When** a new run starts, **Then** old completed results do not unlock tabs or populate stage content in the new run.
3. **Given** the user starts new and immediately refreshes the page, **When** the page reloads, **Then** the same new run remains active and does not fall back to the previous run.

---

### User Story 2 - Resume Current Version Reliably (Priority: P1)

As a lawyer returning to a case, I want "resume current version" to continue the latest active workflow state so that I can pick up exactly where I left off without restarting or accidentally opening later stages.

**Why this priority**: Resuming active work is a primary daily flow and must preserve user trust in saved progress.

**Independent Test**: Can be tested by advancing through multiple stages, leaving the workflow, returning through resume current version, and confirming the active stage, completed stage content, and locked future stages match the saved state.

**Acceptance Scenarios**:

1. **Given** a workflow has completed stage 1 and stage 2 is the current intended stage, **When** the user resumes the current version, **Then** stage 2 is shown and stages after stage 2 remain locked unless explicitly reached by the workflow's own transition controls.
2. **Given** a request is queued or processing for a stage, **When** the user resumes the current version, **Then** the user sees the loading state for that stage until it completes or fails.
3. **Given** a workflow has no active saved progress, **When** the user chooses resume current version, **Then** the workflow starts from the first applicable stage rather than opening stale or unrelated output.

---

### User Story 3 - Stage Tabs Stay Locked Until User Action (Priority: P1)

As a lawyer moving through workflow stages, I want each next tab to remain locked until I press the visible transition button so that the interface follows the intended review order and does not jump ahead.

**Why this priority**: The user explicitly reported confusion when "parties", "subject", or "facts" became open before they intentionally entered them.

**Independent Test**: Can be tested in any multi-stage workflow by completing a stage and verifying the next stage is not clickable until the stage's transition button is pressed.

**Acceptance Scenarios**:

1. **Given** a stage result has just completed, **When** the user remains on that stage, **Then** the completed stage is accessible but the next stage remains locked.
2. **Given** the user presses the stage transition button, **When** the transition succeeds, **Then** the next stage opens and becomes the current accessible stage.
3. **Given** stages after the current stage have no current-run completion or active request, **When** the user attempts to click their tabs, **Then** those tabs remain disabled and no stage jump occurs.

---

### User Story 4 - Refresh During Active Work (Priority: P2)

As a lawyer waiting for analysis or drafting to finish, I want page refresh to recover the active request and show the same loader so that I do not lose confidence or submit duplicate requests.

**Why this priority**: Refresh recovery prevents duplicated AI work, stuck states, and user confusion during long-running legal analysis.

**Independent Test**: Can be tested by starting a long-running stage, refreshing the browser before completion, and confirming the same stage shows a loader until the request finishes.

**Acceptance Scenarios**:

1. **Given** a stage request is queued or processing, **When** the user refreshes, **Then** the workflow reloads into that stage and displays the active loader.
2. **Given** the active request completes while the user is on the refreshed page, **When** completion is received or detected, **Then** the stage output appears without requiring a second submission.
3. **Given** the active request fails, **When** the page is refreshed, **Then** the workflow shows the failed state and a clear retry option for that stage.

---

### User Story 5 - Start and Resume Choices Are Clear (Priority: P2)

As a lawyer selecting how to continue, I want "start", "resume current version", and "start new" to have distinct outcomes so that I can choose safely between continuing existing work and discarding old active outputs.

**Why this priority**: The same case can have old outputs, active requests, and new-run intent; ambiguous actions cause data trust problems.

**Independent Test**: Can be tested by presenting all available actions for a case with previous workflow data and verifying each action leads to its defined state.

**Acceptance Scenarios**:

1. **Given** no prior workflow exists, **When** the user chooses start, **Then** a first run begins at the first stage.
2. **Given** prior current workflow progress exists, **When** the user chooses resume current version, **Then** that progress is loaded without resetting current-run outputs.
3. **Given** prior workflow progress exists, **When** the user chooses start new, **Then** a new clean run begins and the prior run is not shown as the active state.

---

### User Story 6 - Recover From Step Conflicts (Priority: P2)

As a lawyer whose workflow step runs in the background, I want concurrency conflicts after automatic retries to be handled as a recoverable stage state so that I can reload or retry without losing the active run or opening the wrong stage.

**Why this priority**: Any workflow step can collide with another save, refresh, or background completion. The user needs clear recovery instead of a silent failure, duplicate request, or incorrect tab unlock.

**Independent Test**: Can be tested by causing the same workflow stage to be updated from two places while a background stage request is completing, then confirming the user sees a clear conflict state and can recover without stale output being applied.

**Acceptance Scenarios**:

1. **Given** a stage request encounters a concurrency conflict after automatic retry attempts, **When** the workflow page receives the failure, **Then** the current stage remains active, future stages remain locked, and the user is shown a reload or retry path.
2. **Given** a concurrency conflict happens after refresh, **When** the user returns to the workflow, **Then** the workflow does not submit a duplicate request automatically and shows the latest safe state for that stage.
3. **Given** an old stage completion arrives after a concurrency conflict has been marked for the active run, **When** the result is processed, **Then** it does not overwrite newer stage state or unlock later stages incorrectly.

### Edge Cases

- The user refreshes immediately after choosing "start new" but before the first stage request begins.
- The user refreshes while a stage request is queued, processing, completed, or failed.
- An older request completes after the user started a new run for the same case and workflow.
- The user opens the same workflow in two tabs and starts or resumes different runs.
- The same workflow stage is submitted or saved from two browser tabs and the later completion conflicts with the saved version.
- The user navigates back from a later stage to a completed earlier stage, then returns via the intended transition button.
- The user selects a previous snapshot or historical version; it must remain read-only and not affect current-run tab locking.
- Network interruption happens after submitting a stage request but before the browser receives the response.
- The workflow has partial saved outputs but missing intermediate stage outputs.
- The user presses a transition button repeatedly while a request or navigation is already in progress.
- A workflow stage has output content but the stage belongs to an older run, not the active run.
- Automatic retries are exhausted for a stage request and the final failure is a recoverable conflict rather than a permanent generation failure.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide distinct outcomes for starting a workflow with no existing progress, resuming the current version, and starting a new run.
- **FR-002**: Starting a new run MUST exclude outputs, active request results, and tab access from previous runs of the same workflow and case.
- **FR-003**: Resuming the current version MUST restore the latest active-run stage outputs, active request status, and intended current stage.
- **FR-004**: The system MUST persist enough active-run state for a browser refresh to recover the correct run and current stage.
- **FR-005**: If a stage request is queued or processing during refresh, the workflow MUST reopen on the relevant stage and show the normal loading experience until the request completes or fails.
- **FR-006**: If a stage request completed before or during refresh, the workflow MUST show the completed output once and MUST NOT submit a duplicate request automatically.
- **FR-007**: If a stage request failed before or during refresh, the workflow MUST show a failed state with a retry action scoped to that stage.
- **FR-008**: The current stage and all previously completed stages in the active run MUST be accessible for review.
- **FR-009**: The next stage MUST remain locked after the current stage output is generated until the user presses that stage's transition button.
- **FR-010**: Future stages beyond the current intended stage MUST remain locked unless they have valid active-run completion or are the stage currently processing.
- **FR-011**: Stage transition buttons MUST be the only normal way to advance from one stage to the next.
- **FR-012**: A completed earlier stage MUST remain viewable without automatically advancing the user to later stages.
- **FR-013**: The system MUST ignore or quarantine old request completions that belong to a previous run when a newer run is active.
- **FR-014**: The system MUST prevent repeated button presses from creating duplicate stage requests or duplicate transitions.
- **FR-015**: Historical snapshots and previous versions MUST open in read-only mode and MUST NOT change the active current-run state.
- **FR-016**: The workflow header, progress indicator, tabs, and sidebar actions MUST consistently show the same current stage after start, resume, navigation, and refresh.
- **FR-017**: The system MUST preserve user-selected facts or stage inputs across refresh when they are needed to continue the active run.
- **FR-018**: If saved active-run data is incomplete or inconsistent, the system MUST place the user at the earliest stage that can be safely reviewed or retried and explain the needed action.
- **FR-019**: All supported legal analysis and document preparation workflows MUST follow the same start, resume, start-new, refresh, loader, and tab-locking rules unless a workflow explicitly has fewer stages.
- **FR-020**: The system MUST provide user-friendly feedback when a workflow cannot be loaded, reset, resumed, or advanced.
- **FR-021**: If a stage request exhausts automatic retry attempts because another update changed the workflow, the system MUST keep the user on the affected stage, keep future stages locked, and show a recovery action.
- **FR-022**: Concurrency conflict recovery MUST NOT automatically submit a new request unless the user explicitly chooses retry.
- **FR-023**: After a concurrency conflict, the system MUST reload or reconcile the latest safe stage state before allowing the user to advance.
- **FR-024**: A conflicted stage request MUST NOT overwrite newer user-visible output or unlock later stages after the conflict has been detected.

### Key Entities

- **Workflow Run**: The active or historical sequence of stages for a case and workflow type. Key attributes include case, workflow type, status, current intended stage, creation time, update time, and whether it is current or historical.
- **Workflow Stage**: A single ordered part of a workflow. Key attributes include stage number, label, status, output, and whether it is accessible in the current run.
- **Stage Request**: A background task that generates or updates a stage output. Key attributes include case, workflow type, stage, run association, status, creation time, completion time, result, and error message.
- **Stage Conflict**: A recoverable state where a stage request cannot safely save its result because the workflow changed while the request was running. It is tied to a stage and requires user-visible recovery.
- **Stage Output**: The user-visible result for a stage. It must be tied to the active run before it can unlock or populate a stage.
- **Workflow Snapshot**: A read-only historical view of a workflow run that can be reviewed without changing the current active run.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of tested start-new scenarios, no output from a previous run appears in the newly started active run.
- **SC-002**: In 100% of tested resume scenarios, the workflow opens on the correct current intended stage with future stages locked.
- **SC-003**: In 100% of tested stage completion scenarios, the next stage remains locked until the user presses the visible transition button.
- **SC-004**: In 95% of refresh tests during queued or processing requests, the correct loader appears within 3 seconds of page reload.
- **SC-005**: In 100% of refresh tests during active requests, the system does not create a duplicate request for the same stage.
- **SC-006**: In 100% of tests where old requests complete after a new run starts, old results do not populate or unlock the new run.
- **SC-007**: Users can complete the primary workflow path without unexpected tab jumps in at least 95% of usability checks.
- **SC-008**: Support reports related to "old data appearing", "wrong tab open", or "refresh lost my analysis" decrease by at least 80% after release.
- **SC-009**: In 100% of tested concurrency conflict scenarios after retries are exhausted, the user remains on a safe stage with a visible recovery action and no future stage unlock.

## Assumptions

- The same rules apply to legal warning, defense memo, preparing statement of claims, appeal brief, ruling analysis, execution request, and administrative complaint workflows where applicable.
- Historical snapshots are for review only and are not part of active editing or active background processing.
- A workflow may have workflow-specific labels and stage counts, but the accessibility rule is shared: current and completed stages are reviewable; future stages stay locked until explicit transition.
- Refresh recovery should prioritize preserving the active run over returning to document selection.
- Background stage requests can be retried automatically, but exhausting those retries should be treated as a recoverable workflow conflict when the active run state changed during processing.
- Existing user authentication and case access rules remain unchanged.
- Existing visual loaders and error state patterns should be reused for consistency.
