# Feature Specification: Persistent AI Job State

**Feature Branch**: `017-persist-ai-job-state`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "طيب انا دلوقتي مقلا لو رفع وعملت ocr عايز لو عملت ريفيرش برضو البيانات تفضل موجوده ولو عملت اي طلب بقي ب ai لاي خطوه كانت يفضل موجوده لو طلعت دخلت يقولي التحكيل بتاعوا مش لو عملت ريفريش خلاص الحوار باظ و ممكن نستخدم bull لمل حاجه لل ai"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - AI Results Persist After Page Refresh (Priority: P1)

A lawyer uploads a document, triggers OCR processing, and the extracted text appears on screen. When the lawyer refreshes the page, the OCR result is still shown — the lawyer does not need to re-upload or re-process the document.

**Why this priority**: Page refresh is the most common accidental disruption. Losing OCR output on refresh forces the user to repeat a slow, expensive operation. Fixing this is the highest-impact reliability improvement.

**Independent Test**: Upload a document, trigger OCR, wait for result, refresh the page — the extracted text must still be visible and usable without re-triggering OCR.

**Acceptance Scenarios**:

1. **Given** a lawyer has successfully completed OCR on an uploaded document, **When** they refresh the browser, **Then** the OCR result is displayed automatically without re-uploading or re-triggering.
2. **Given** a lawyer is on an AI analysis step (e.g., fact analysis) and the result has been received, **When** they refresh the page, **Then** the step result is restored and the stepper shows the correct completed position.
3. **Given** a lawyer closes the tab and reopens the case, **When** they navigate back to the analysis section, **Then** all previously completed AI step results are shown as they were.

---

### User Story 2 - Multi-Step AI Workflow State Restoration (Priority: P2)

A lawyer works through a multi-step AI analysis (e.g., Fact Analysis → Generate Defenses → Final Requirements). They complete some steps and navigate away. When they return — whether after a refresh, closing the tab, or reopening the case — the completed steps are restored and they can continue from where they left off.

**Why this priority**: The analysis workflow has 4–5 steps. Losing progress mid-flow forces full repetition and makes the feature unusable in practice for long-running tasks.

**Independent Test**: Complete 2 of 4 AI steps, navigate away, return to the case — completed step results must be restored and the stepper must reflect the correct progress state.

**Acceptance Scenarios**:

1. **Given** a lawyer has completed steps 1 and 2 of the analysis workflow, **When** they navigate away and return, **Then** steps 1 and 2 results are shown and step 3 is ready to start.
2. **Given** a lawyer has completed all steps, **When** they return to the case, **Then** the final result (defense memo or statement of claims) is immediately displayed without any re-processing.
3. **Given** an AI step is currently in progress (job running) when the lawyer refreshes, **When** the page loads, **Then** the step shows a "processing" indicator and the result appears when the job completes.

---

### User Story 3 - In-Progress AI Job Visibility (Priority: P3)

When a lawyer submits an AI request that is queued or still processing, and then refreshes or navigates away and back, they see the job's current status (queued / processing / completed / failed) rather than a blank or stale state.

**Why this priority**: Long AI operations (OCR, analysis) can take seconds to minutes. If the user refreshes during processing, they should know the job is still running — not assume it failed or needs to be re-triggered.

**Independent Test**: Trigger an AI step, immediately refresh before it completes — the page must show a "processing" status that updates when the job finishes.

**Acceptance Scenarios**:

1. **Given** an AI job is in progress, **When** the lawyer refreshes the page, **Then** the UI shows the job as "processing" and updates automatically when it finishes.
2. **Given** a queued job completes while the user is on a different page, **When** they navigate back to the case, **Then** the result is shown immediately (no re-trigger needed).
3. **Given** an AI job fails, **When** the user returns to the case, **Then** the failed state is shown with a clear option to retry.

---

### Edge Cases

- What happens when a case has AI results from a previous session and the case facts have since been edited?
- How does the system handle a job that was queued but never completed (e.g., server restart mid-job)?
- What if the user triggers the same AI step twice before the first one finishes?
- What happens when the job queue server is temporarily unavailable — does the submission fail silently or show an error?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST save the result of every AI operation (OCR, each analysis step) to durable storage immediately upon completion.
- **FR-002**: System MUST restore all previously completed AI results when a user navigates to a case or refreshes a page — without requiring the user to re-trigger any AI step.
- **FR-003**: System MUST track the status of every AI job (queued, processing, completed, failed) and expose that status to the user interface.
- **FR-004**: System MUST display a real-time progress indicator when an AI job is in progress, even if the user refreshed or navigated away and back during processing.
- **FR-005**: System MUST process all AI tasks through a managed job queue so that tasks run reliably in the background, independent of the user's browser session.
- **FR-006**: System MUST allow the user to retry a failed AI job from the point of failure without restarting the entire workflow from step one.
- **FR-007**: System MUST prevent duplicate job submission — if a job for a given case and step is already queued or in progress, submitting again must not create a second job.
- **FR-008**: System MUST associate each saved AI result with the specific case and step so results can be retrieved per-case on page load.
- **FR-009**: System MUST notify the user (without a full page reload) when a background AI job completes while they are viewing the case page.

### Key Entities *(include if feature involves data)*

- **AI Job**: Represents one AI processing task for a specific case step. Attributes: job ID, case ID, step type, status (queued / processing / completed / failed), submitted timestamp, completed timestamp, result payload, error message.
- **AI Job Result**: The saved output of a completed AI job, associated with a case and step; used to restore state on page load.
- **Case Analysis State**: The aggregate of all AI job results for a given case — determines which steps are completed and what data to display when the user opens the case.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After a page refresh, 100% of previously completed AI step results are restored and displayed without any user action.
- **SC-002**: A user returning to a case after closing and reopening their browser sees all completed AI step results immediately — no re-processing required.
- **SC-003**: An in-progress AI job that the user refreshes away from shows as "processing" within 2 seconds of page load and updates to "completed" automatically when done.
- **SC-004**: Zero duplicate AI job submissions occur when the user triggers the same step multiple times before the first completes.
- **SC-005**: Failed AI jobs are clearly indicated with a retry option; retrying succeeds without requiring the user to redo any prior steps.
- **SC-006**: AI job queue processes tasks reliably — a queued job must complete (or fail with an error message) even if the user closes the browser entirely.

---

## Assumptions

- The backend has a persistent data store (database) available to save AI job results; results are not stored in memory or in-process only.
- A job queue infrastructure (Redis-compatible message broker) is available or will be provisioned alongside this feature.
- AI steps are identifiable by a stable key (case ID + step name) that allows idempotent job creation and result retrieval.
- Real-time job status updates to the browser will use polling or server-sent events — the specific mechanism is a backend implementation decision.
- This feature covers all AI steps in both workflows: Smart Analysis (fact analysis, defenses, defense memo, final requirements) and Preparing Statement of Claims (case type, parties, subjects, facts, legal basis, requests), and OCR.
- Persisted results are scoped to the case, not to the user's browser session or device — any lawyer with access to the case sees the same results.
- Handling stale results when case facts are edited after AI results were saved is out of scope for this iteration; a "last updated" timestamp will be shown instead.
