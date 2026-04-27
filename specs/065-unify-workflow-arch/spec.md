# Feature Specification: Unify Workflow Architecture

**Feature Branch**: `065-unify-workflow-arch`
**Created**: 2026-04-27
**Status**: Draft
**Input**: Unify all 7 workflow pages to use the same Gen 3 architecture: shared hooks (useWorkflowSnapshotLoader, useWorkflowFacts), workflowId-based API routing, proper cleanup on unmount, and DB-backed snapshot management for defense-memo. This resolves 7 remaining P1/P2 bugs caused by the architectural split between Gen 1 (defense-memo), Gen 2 (statement-of-claims), and Gen 3 (5 versioned workflows).

## User Scenarios & Testing

### User Story 1 - Unified Resume Experience (Priority: P1)

As a lawyer using any of the 7 workflow types, when I click "استكمال النسخة الحالية" (Resume current version) from the case analysis page, I should land on the exact step I left off at, regardless of which workflow type I'm using. Currently, defense-memo sometimes jumps to the wrong step because it relies on AI job statuses instead of saved outputs.

**Why this priority**: This is the most visible bug. Users lose their place and feel confused every time they resume a defense-memo or statement-of-claims workflow. It affects all 7 workflows inconsistently.

**Independent Test**: Start any workflow, complete steps 1-3, navigate away, return via "استكمال", verify the active step matches the last completed step.

**Acceptance Scenarios**:

1. **Given** a defense-memo workflow with outputs[4] saved (step 4 completed), **When** user clicks "استكمال النسخة الحالية", **Then** the page loads at step 3 (الطلبات) not step 4 (المذكرة النهائية)
2. **Given** a statement-of-claims workflow with outputs[6] saved, **When** user clicks "استكمال", **Then** the page loads with `workflowId` in the URL and the correct step active
3. **Given** any workflow with no outputs yet, **When** user clicks "استكمال", **Then** the page loads at step 0 (facts review)

---

### User Story 2 - Consistent Snapshot Viewing (Priority: P2)

As a lawyer reviewing previous versions of a workflow, when I open a historical snapshot, I should see a clear visual indicator (version label) that I'm viewing a read-only past version, and the page should use the same snapshot loading mechanism for all 7 workflow types.

**Why this priority**: Without version labels on 3 workflows (ruling-analysis, legal-warning, exec-request), users can't tell if they're viewing current or historical data. The defense-memo localStorage snapshots are always empty, making version history unusable for that workflow.

**Independent Test**: Create a snapshot for any workflow, navigate to it via version history, verify the version label appears and data loads correctly.

**Acceptance Scenarios**:

1. **Given** a defense-memo snapshot in the database, **When** user opens it, **Then** the version label shows "نسخة سابقة — مذكرة دفاع" and data loads from DB not localStorage
2. **Given** a ruling-analysis snapshot, **When** user opens it, **Then** the version label shows "نسخة سابقة — تحليل حكم"
3. **Given** any workflow snapshot, **When** user opens it, **Then** all tabs are read-only and no auto-save triggers fire

---

### User Story 3 - Clean State Between Workflows (Priority: P2)

As a lawyer switching between different workflow types or cases, the previous workflow's state should be completely cleared. Currently, defense-memo state leaks into subsequent visits because it lacks cleanup on unmount.

**Why this priority**: State leaks cause confusing UX where stale data from a previous workflow appears when starting a new one. This is particularly problematic for defense-memo which is the most-used workflow.

**Independent Test**: Open a defense-memo workflow with data, navigate to a different case's workflow, return to the first case, verify no stale data appears.

**Acceptance Scenarios**:

1. **Given** a defense-memo workflow with outputs saved, **When** user navigates away from the page, **Then** the Redux state is reset completely
2. **Given** a statement-of-claims workflow with outputs saved, **When** user navigates away, **Then** the Redux state is reset completely
3. **Given** user starts a fresh workflow, **When** the page loads, **Then** no stale outputs from previous sessions are visible

---

### User Story 4 - Unified Fact Selection (Priority: P3)

As a lawyer using any workflow, my fact selections should persist across page refreshes. Currently, admin-complaint loses fact selections on refresh because it doesn't use the shared facts hook.

**Why this priority**: Affects only admin-complaint workflow and only on page refresh. Lower impact but adds to the feeling of inconsistency.

**Independent Test**: Select facts in admin-complaint, refresh the page, verify selections are restored.

**Acceptance Scenarios**:

1. **Given** selected facts in admin-complaint workflow, **When** user refreshes the page, **Then** the same facts remain selected
2. **Given** a new fact added via the facts panel in admin-complaint, **When** user refreshes, **Then** the added fact persists

---

### Edge Cases

- What happens when a user opens a defense-memo snapshot that was created before the architecture migration?
- How does the system handle concurrent access to the same workflow from multiple tabs?
- What happens if `workflowId` URL param doesn't match any existing workflow?
- What happens when SignalR delivers stale jobs during a fresh run of defense-memo?
- What happens when localStorage has old defense-memo snapshot data alongside new DB snapshots?

## Requirements

### Functional Requirements

- **FR-001**: All 7 workflow pages MUST use `useWorkflowSnapshotLoader` hook for loading historical snapshots
- **FR-002**: All 7 workflow pages MUST use `useWorkflowFacts` hook for fact selection and persistence
- **FR-003**: All 7 workflow pages MUST reset their Redux state on component unmount
- **FR-004**: Defense-memo MUST migrate from localStorage snapshots to DB-backed WorkflowSnapshots
- **FR-005**: Defense-memo MUST support `?workflowId=X` URL parameter to load specific workflows
- **FR-006**: Defense-memo and statement-of-claims MUST use the same `startWorkflow` + redirect to `?workflowId=X` fresh-run pattern used by Gen 3 workflows
- **FR-007**: Defense-memo auto-resume MUST check outputs first, then fall back to AI job status (matching Gen 3 pattern)
- **FR-008**: Defense-memo auto-save MUST guard against firing on the facts tab (active=0) like all other workflows
- **FR-009**: The `useWorkflowSnapshotLoader` hook MUST accept an optional step-mapping function for workflows with non-1:1 step-to-tab mappings (defense-memo)
- **FR-010**: All workflow pages MUST display a version label when viewing historical snapshots
- **FR-011**: The `CaseSummary` component MUST read defense-memo snapshots from the database instead of localStorage
- **FR-012**: The `SmartAnalysis` backend controller MUST support `getWorkflowById` endpoint for loading specific workflows by ID

### Key Entities

- **WorkflowSnapshot**: Historical version of a workflow stored in the database (already exists for 5 workflows, needs to be used for defense-memo too)
- **WorkflowState**: Redux state for each workflow type (outputs, currentStep, workflowId, status, etc.)
- **StepMapping**: Optional mapping function that converts database step numbers to UI tab indices (needed for defense-memo which has non-1:1 mapping)

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 7 workflow pages use identical initialization, snapshot loading, facts management, and cleanup patterns
- **SC-002**: Users resuming any workflow land on the correct step 100% of the time (currently ~70% for defense-memo)
- **SC-003**: Zero state leaks between workflow pages — navigating away from any workflow fully resets its state
- **SC-004**: Defense-memo version history shows actual snapshots instead of always showing zero versions
- **SC-005**: Fact selections persist across page refresh for all 7 workflow types

## Assumptions

- The `SmartAnalysis` backend controller will be extended to support `getWorkflowById` and proper versioning, or defense-memo will be migrated to use the same `WorkflowServiceBase` as the other 5 workflows
- The `useWorkflowSnapshotLoader` hook can be extended with an optional `stepMapFn` parameter without breaking existing usage
- Defense-memo's `stepNumber: active + 1` pattern will remain in place but with proper `active > 0` guard to prevent auto-save on the facts tab
- The backend routing difference (`/{controller}/{caseId}` vs `/{controller}/{workflowId}`) will be unified, or the frontend will document and encapsulate the difference
- Existing defense-memo snapshots in localStorage will be gracefully handled (migrated or ignored with no error)
- No database schema changes are needed — the existing `WorkflowSnapshots` table can store defense-memo snapshots
