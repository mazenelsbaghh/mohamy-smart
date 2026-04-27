# Research: Global Auto-save and Drafts

## Decision 1: Frontend Debouncing vs Immediate Save
**Decision**: We will implement a debounced Auto-save (e.g., 2000ms delay) on input field changes, integrated into the existing `useAnalysisStep` shared hook / or specific Redux thunks.
**Rationale**: Firing an API request per keystroke overwhelms the database and network, risking race conditions out-of-order execution on slow networks. Debouncing groups rapid typing into discrete sync events.
**Alternatives considered**: Optimistic UI with bulk-save on `blur` or navigation. Rejected because React Single-Page App navigation bypasses `blur` events easily without heavily engineered router blockers. Debouncing is safer.

## Decision 2: Backend Auto-save Endpoint Structure
**Decision**: Instead of running the AI analysis pipeline, we will expose an asynchronous `SaveDraftAsync` or `UpdateStepDraftAsync` endpoint traversing through `IWorkflowServiceBase<TDto>` to update the raw `Outputs` JSON column inside the SQL database via EF Core.
**Rationale**: We already consolidated workflows to store structured `System.Text.Json` outputs payload in the DB (feature 033-unified-parsing). An auto-save is mechanically just updating this JSON representation without invoking the external AI APIs.
**Alternatives considered**: Introduce a separate `Drafts` table. Rejected because it violates the unified generic workflow architecture. We already have the workflow job record; we just update its intermediate state.

## Decision 3: Resolving DB Persistence
**Decision**: The Auto-save triggers continuous DB persistence.
**Rationale**: As specified by FR-004, having robust DB backing minimizes browser strict requirements. It achieves the user's objective to see changes safely on any device or after closing tabs.
