# Feature Specification: Workflow Architecture Audit & Unification

**Feature Branch**: `067-workflow-audit-unify`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: User description: "عايزك تراجع كل حاجه ف ابدء، ابدأ و استكمال النسخة الحالية، بدء واحدة جديدة — تراجعهم كلهم وتشوف اي مشاكل فيهم و في تاب و انتقال بين الخطوات جوه المراحله، وان كلو يتسخدم نفس المكونات و مثلا كلو يتسخدم workflowConstants وتشوف علشان يبقي سهل الصيانه و علشان يبقي صح لكلو، وان التابات تبقي مظبوطه لكل حاجه والمراحل، وتتاكد ان النسخ السابقه شغاله كويس و كل حاجه مظبوطه"

## Known Issues & Audit Findings

The following issues were identified through a full codebase audit of all 7 workflow types, CaseDetails, CaseAnalysis, CaseSummary, DocumentSelection, SnapshotsHistory, and all shared components/hooks.

### Bug Tracker

| ID | Priority | Issue | Location | Impact |
|---|---|---|---|---|
| BUG-001 | **P0** | Tab navigation from CaseAnalysis to "النسخ السابقة" (history) is broken — clicking "نسخة سابقة" button does not switch tabs | `CaseDetails.tsx:44-60` (`navigationProcessedRef` blocks re-read of `location.state.activeTab`) + `CaseAnalysis.tsx:415` | User must manually click the history tab; button appears to do nothing |
| BUG-002 | **P0** | `isReadOnly` not reset to `false` on `startWorkflow.fulfilled` — starting a new version while viewing a snapshot leaves page in read-only mode | `createWorkflowSlice.ts:166-175` (startWorkflow handler) + `createWorkflowSlice.ts:126-159` (`applyWorkflowPayload`) | User cannot edit the new workflow after starting it from a snapshot view |
| BUG-003 | **P1** | DefenseMemoPage does NOT use `useWorkflowOrchestrator` — ~300 lines of duplicated logic (manual useState, maxStepAllowed, auto-save, fresh/snapshot/workflowId handling, SignalR, facts) | `DefenseMemoPage.tsx:39-333` (entire component body) | Inconsistent behavior, every fix requires duplicate changes, highest maintenance cost |
| BUG-004 | **P1** | All 7 workflow pages hardcode step definitions locally instead of importing from `workflowConstants.ts` | All 7 page files (e.g., `DefenseMemoPage.tsx:31-37`, `AppealBriefPage.tsx:17-25`, etc.) | Step label changes require 7+ file edits; labels can drift apart |
| BUG-005 | **P1** | `FINAL_STEPS` map duplicated in `CaseAnalysis.tsx:108-109` and `CaseSummary.tsx:28-29` instead of deriving from `WORKFLOW_CATALOG.totalSteps` | `CaseAnalysis.tsx:108-109`, `CaseSummary.tsx:28-29` | Adding a new workflow requires updating 3 places (catalog + 2 FINAL_STEPS copies) |
| BUG-006 | **P1** | `DraftWorkflowState` type, `drafts` array, and `isWorkflowCompleted` function copy-pasted across files | `CaseAnalysis.tsx:23-30,96-119`, `CaseSummary.tsx:19-39` | Type drift risk, duplicate maintenance |
| BUG-007 | **P1** | `workflowThunks` mapping (route → thunk) duplicated in `CaseAnalysis.tsx:85-92` and `DocumentSelection.tsx:46-53`, and is missing `defense-memo` entry | `CaseAnalysis.tsx:85-92`, `DocumentSelection.tsx:46-53` | Missing defense-memo is fragile; duplication means drift |
| BUG-008 | **P2** | AdminComplaint + LegalWarning step components use `AnalysisStageLayout` instead of `AnalysisStepShell` (different loading/error/layout pattern) | All step files in `adminComplaint/steps/` and `legalWarning/steps/` | Visual inconsistency in loading/error states across workflows |
| BUG-009 | **P2** | `DocumentSelection.tsx` duplicates entire `WORKFLOW_CATALOG` as a hardcoded `legalAnalysisOptions` array with different icons | `DocumentSelection.tsx:79-129` vs `workflowCatalog.ts` | Adding a workflow requires edits in 2 places; icon mismatch for exec-request |
| BUG-010 | **P2** | Snapshot count badge on CaseDetails fetched once on mount, never refreshed after version operations | `CaseDetails.tsx:101-109` | Stale badge after creating/abandoning workflow versions |
| BUG-011 | **P2** | SnapshotsHistory "استكمال" button for current version does not pass `workflowId` — navigates without specifying which instance | `SnapshotsHistory.tsx:200` | May load wrong version for versioned workflows with multiple instances |
| BUG-012 | **P3** | `controllerMap` in `CaseAnalysis.tsx:207-213` is a hardcoded duplicate of controller names already embedded in `createWorkflowThunks` | `CaseAnalysis.tsx:207-213` | Fragile mapping that must be kept in sync with thunk factory |
| BUG-013 | **P3** | Only `StatementOfClaims` passes `isCaseIdBased: true` and `abandonThunk` to orchestrator; other 6 pages don't pass these params | `PreparingStatementOfClaims.tsx:99-100` | Inconsistent workflow creation flow between caseId-based and version-based workflows |
| BUG-014 | **P3** | `StatementOfClaims` uses `computeMaxStepAllowed` function while other 5 new-style pages use `jobStepMap` constant | `PreparingStatementOfClaims.tsx:47-66,101` | Two different mechanisms for the same purpose |
| BUG-015 | **P3** | DefenseMemoPage has extra `"defense-memo"` CSS class on section + its own CSS import, other pages don't | `DefenseMemoPage.tsx:2,364` | Minor styling inconsistency |
| BUG-016 | **P3** | DefenseMemoPage manually shows error toast on abandon failure; `useWorkflowOrchestrator` silently catches abandon errors | `DefenseMemoPage.tsx:207-216` vs `useWorkflowOrchestrator.ts:233-239` | Inconsistent error handling UX |
| BUG-017 | **P3** | Icon mismatch: `workflowCatalog.ts` uses `FaFileAlt` for exec-request, `DocumentSelection.tsx` uses `IoDocumentTextOutline` | `workflowCatalog.ts:69` vs `DocumentSelection.tsx:127` | Different icons shown in different contexts |

### Decision: "مسارات العمل" Section

The "مسارات العمل" (Workflow Paths) section in `CaseAnalysis.tsx:305-443` is **kept as-is** — it is the core workflow status dashboard and entry point for all 7 workflow types. It is NOT the source of any bugs; it is complementary to the "ابدأ التحليل الذكي" header button. The duplicated code inside it (`FINAL_STEPS`, `workflowThunks`, `drafts`) is addressed by the centralization requirements (FR-002, FR-006, FR-007, FR-008).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Tab Navigation Across Workflow Pages (Priority: P1)

As a lawyer using the smart analysis system, when I navigate between steps (tabs) within any of the 7 workflow types (defense memo, statement of claims, appeal brief, admin complaint, ruling analysis, legal warning, exec request), the tab behavior must be identical — same click-guarding logic, same visual style, same step labels sourced from shared constants. Currently, DefenseMemoPage manually reimplements all tab logic (~300 lines of duplicated code) while the other 6 pages use `useWorkflowOrchestrator`. This creates a maintenance burden and behavioral inconsistency.

**Why this priority**: Tab navigation is the core interaction for every workflow. Inconsistency here affects every user action and makes fixing bugs in one place require duplicate fixes.

**Independent Test**: Open all 7 workflow types and verify tab click-guarding, visual appearance, step labels, and navigation forward/backward behave identically.

**Acceptance Scenarios**:

1. **Given** a defense-memo workflow in progress at step 2, **When** the user clicks on step 4 (not yet reached), **Then** the click is blocked (same behavior as other 6 workflows)
2. **Given** any of the 7 workflow pages, **When** the user views the tab bar, **Then** all tabs use the same styling from `WORKFLOW_TAB_CLASSNAMES` and `WORKFLOW_TAB_PROPS`
3. **Given** the defense-memo workflow page, **When** a step completes via AI, **Then** the auto-advance logic behaves identically to the other 6 workflows (no edge cases in manual implementation)

---

### User Story 2 - Correct Version/Start/Continue Navigation (Priority: P1)

As a lawyer, when I click "ابدأ" (start), "استكمال النسخة الحالية" (continue current), or "بدء واحدة جديدة" (start new version) for any workflow type, the navigation must correctly handle both versioned and non-versioned workflows, pass the right query parameters, and never leave the page in a read-only state after starting a new workflow. Currently there are bugs where: (1) the `isReadOnly` flag is not reset when starting a new version, (2) tab navigation to history from CaseAnalysis is broken, and (3) query parameters are inconsistent for defense-memo.

**Why this priority**: These are the primary entry points to all workflows. Bugs here prevent users from starting or continuing their work.

**Independent Test**: For each of the 7 workflows, test: start new, continue existing, start new version (while viewing a snapshot), and verify correct page state and editability.

**Acceptance Scenarios**:

1. **Given** a user viewing a read-only snapshot, **When** they click "بدء واحدة جديدة", **Then** the new workflow page opens in edit mode (not read-only)
2. **Given** a user on the CaseAnalysis tab, **When** they click "نسخة سابقة" button, **Then** CaseDetails switches to the "النسخ السابقة" (history) tab
3. **Given** a user continuing a defense-memo workflow, **When** they click "استكمال النسخة الحالية", **Then** the workflow loads with correct state (no stale `?workflowId` param confusion)
4. **Given** a user starting a new version of any versioned workflow, **When** the new workflow is created, **Then** the old workflow is properly archived/snapshotted and accessible from history

---

### User Story 3 - Centralized Step Definitions and Workflow Constants (Priority: P2)

As a developer maintaining the system, all workflow step labels, step counts, icons, and catalog information must be defined once in shared constants (`workflowConstants.ts` and `workflowCatalog.ts`) and consumed everywhere. Currently, step definitions are hardcoded in all 7 page files, `FINAL_STEPS` is duplicated in `CaseAnalysis.tsx` and `CaseSummary.tsx`, `DocumentSelection.tsx` duplicates the entire catalog, and type definitions (`DraftWorkflowState`) are copied between files.

**Why this priority**: Without centralization, every new workflow or step change requires edits in 5+ files. This is the root cause of inconsistencies and makes the codebase fragile.

**Independent Test**: Verify that changing a step label in `workflowConstants.ts` is reflected in all 7 workflow pages, DocumentSelection, CaseAnalysis, CaseSummary, and SnapshotsHistory without any other changes.

**Acceptance Scenarios**:

1. **Given** a step label is updated in `workflowConstants.ts`, **When** any workflow page renders, **Then** the updated label appears in both the tab bar and the step progress bar
2. **Given** a new workflow type is added to the system, **When** it is registered in `workflowCatalog.ts`, **Then** it automatically appears in DocumentSelection, CaseAnalysis, CaseSummary, and SnapshotsHistory without manual additions to those files
3. **Given** the `isWorkflowCompleted` utility function, **When** it is imported from a shared module, **Then** it works identically for all 7 workflows using `WORKFLOW_CATALOG.totalSteps` instead of a hardcoded `FINAL_STEPS` map

---

### User Story 4 - Consistent Step Shell Components (Priority: P2)

As a user, the loading, error, and success states for all workflow steps should look and behave the same across all 7 workflow types. Currently, AdminComplaint and LegalWarning steps use `AnalysisStageLayout` with its sub-components (`AnalysisStageSectionCard`, `AnalysisStageSidebarCard`), while the other 5 workflows use `AnalysisStepShell`. This creates a visual and behavioral split.

**Why this priority**: Visual consistency across all workflows builds user trust. Using two different shell patterns is confusing and doubles maintenance.

**Independent Test**: Load each step of each workflow and verify the loading spinner, error state, and content layout are consistent.

**Acceptance Scenarios**:

1. **Given** an AI step is processing in any workflow, **When** the loading state is shown, **Then** it uses the same loading component and animation across all 7 workflows
2. **Given** an AI step fails in any workflow, **When** the error state is shown, **Then** the error card looks identical regardless of workflow type
3. **Given** a completed step in any workflow, **When** the user views the step content, **Then** the layout pattern (main content + sidebar) is consistent

---

### User Story 5 - Working Snapshot/Version History (Priority: P2)

As a lawyer, I need to view my previous workflow versions/snapshots, rename them, delete them, and open them for review. The history tab and snapshot count badges must be accurate and up-to-date. Currently, the snapshot count badge on CaseDetails does not refresh after new versions are created, and the "استكمال" button in SnapshotsHistory does not pass the correct `workflowId` for versioned workflows.

**Why this priority**: Version history is critical for lawyers who iterate on legal documents. Stale or incorrect history undermines trust.

**Independent Test**: Create multiple versions of a workflow, navigate to history tab, verify counts and navigation are correct.

**Acceptance Scenarios**:

1. **Given** a user creates a new version of a workflow, **When** they return to CaseDetails, **Then** the snapshot count badge on the relevant tabs is updated
2. **Given** a user viewing SnapshotsHistory, **When** they click "استكمال" on a current version, **Then** the correct workflow instance loads (with `workflowId` for versioned workflows)
3. **Given** a user viewing a read-only snapshot, **When** they navigate back, **Then** the history tab is still active and showing correct data

---

### Edge Cases

- What happens when a user starts a new version while a snapshot is still loading?
- What happens when two browser tabs have the same workflow open and one starts a new version?
- What happens when the backend snapshot creation fails silently (no error toast)?
- What happens when navigating back from a workflow page to CaseDetails while AI is still processing?
- What happens when `defense-memo` receives both `?fresh=1` and `?workflowId=X` simultaneously?
- What happens when the user clicks "بدء واحدة جديدة" for a workflow that has never been started?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All 7 workflow pages MUST use `useWorkflowOrchestrator` for tab navigation, step state management, auto-save, and query parameter handling (including DefenseMemoPage which currently reimplements all of this manually)
- **FR-002**: All workflow step definitions (labels, icons, step counts) MUST be defined once in shared constants and consumed by all consumers (page components, CaseAnalysis, CaseSummary, DocumentSelection, SnapshotsHistory)
- **FR-003**: The system MUST reset `isReadOnly` to `false` when a new workflow version is started, so users are never stuck in read-only mode on a new workflow
- **FR-004**: Clicking "نسخة سابقة" in CaseAnalysis MUST switch CaseDetails to the history tab (currently broken due to `navigationProcessedRef` blocking)
- **FR-005**: All workflow step components MUST use a unified shell wrapper that combines the best features of both `AnalysisStepShell` and `AnalysisStageLayout` (loading, error, success states, sidebar layout, section cards)
- **FR-006**: `isWorkflowCompleted`, `DraftWorkflowState`, `FINAL_STEPS`, and draft-detection logic MUST be extracted to shared utilities imported by all consumers
- **FR-007**: DocumentSelection MUST derive its workflow list from `WORKFLOW_CATALOG` instead of maintaining a hardcoded duplicate; visual layout remains unchanged, catalog icons become the canonical icon source
- **FR-008**: The `workflowThunks` mapping (workflow route → thunk) MUST be defined in one place and imported everywhere needed
- **FR-009**: SnapshotsHistory "استكمال" button MUST pass the correct `workflowId` query parameter for versioned workflows
- **FR-010**: The snapshot count badge on CaseDetails MUST refresh after workflow versions are created or abandoned
- **FR-011**: DefenseMemoPage MUST handle its unique domain logic (per-defense analysis cache, defense mutation callbacks) through optional extensibility callbacks/options in `useWorkflowOrchestrator` (e.g., `onStepHydrate`, `onStepSave`) — these callbacks are only used by DefenseMemoPage and ignored by other workflows
- **FR-011b**: The system MUST display a user-visible error toast whenever a workflow abandon/snapshot operation fails, so users are informed that their previous workflow data may not have been archived
- **FR-012**: Query parameters for navigation MUST be consistent: non-versioned workflows (`defense-memo`, `preparing-statement-of-claims`) use `?fresh=1` only; versioned workflows use `?workflowId=X` for specific instances

### Key Entities

- **WorkflowPage**: One of 7 workflow-specific pages, each rendering a step-based tabbed interface. Must consume shared orchestrator hook and constants.
- **WorkflowOrchestrator**: The shared hook that manages step state, navigation, auto-save, AI job tracking, and snapshot loading. Must support extensibility for DefenseMemoPage's unique needs.
- **WorkflowConstants**: Central source of truth for step labels, tab styling, and shared configuration. Must be the single source consumed by all pages and utilities.
- **WorkflowCatalog**: Master registry of all workflow types with metadata (ID, route, label, description, total steps, icon). Must be consumed by DocumentSelection, CaseAnalysis, CaseSummary, and SnapshotsHistory.
- **WorkflowVersion**: A saved snapshot of a completed or abandoned workflow instance. Can be loaded in read-only mode.
- **SharedWorkflowUtilities**: Extracted helper functions (`isWorkflowCompleted`, draft detection, thunk mapping) used by multiple components.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 7 workflow pages use the same hook for step management, reducing DefenseMemoPage by at least 250 lines of duplicated code
- **SC-002**: A step label change in `workflowConstants.ts` propagates to all UI surfaces without any other file edits
- **SC-003**: Users can navigate from any workflow page to the history tab and back without broken tab state, achieving 100% successful tab transitions
- **SC-004**: Starting a new workflow version always results in an editable (non-read-only) page, verified across all 7 workflow types
- **SC-005**: Adding a new workflow type requires changes to exactly 2 files (constants + slice), with all UI surfaces auto-discovering it from the catalog
- **SC-006**: Snapshot count badges update within 2 seconds of a version-related operation completing
- **SC-007**: All existing functionality (start, continue, new version, view snapshot, edit step outputs, auto-save) continues to work identically after refactoring

## Clarifications

### Session 2026-04-28

- Q: اتجاه توحيد مكونات الـ Shell (AnalysisStepShell vs AnalysisStageLayout)؟ → A: إنشاء wrapper موحد يجمع الأفضل من الاتنين (Option C)
- Q: منطق DefenseMemoPage الفريد (step 3 - defense analysis cache) إيه نعملو لما ننقل لـ orchestrator؟ → A: نضيفه كـ callback/option خاص في الـ orchestrator (مثل `onStepHydrate`) — optional وبس DefenseMemo يستخدمه (Option B)
- Q: توحيد StatementOfClaims مع باقي المسارات (isCaseIdBased + abandonThunk + computeMaxStepAllowed)؟ → A: وحّد الكل: StatementOfClaims تستخدم `jobStepMap` زي الباقي، و `isCaseIdBased`/`abandonThunk` يبقوا optional params موحدة (Option A)
- Q: التعامل مع أخطاء abandon (error toast vs silent)؟ → A: أظهر error toast دايماً لو abandon فشل — المستخدم لازم يعرف (Option A)
- Q: هل تغيير شكل DocumentSelection ضمن الـ scope؟ → A: وحّد البيانات (اقرأ من WORKFLOW_CATALOG) بس خلّي الشكل visuals زي ما هو — أيقونات الكتالوج هي الـ canonical (Option A)

## Assumptions

- The existing `useWorkflowOrchestrator` hook is the canonical implementation and DefenseMemoPage should be migrated to use it, not the other way around
- DefenseMemoPage's unique domain logic (per-defense analysis cache step, defense mutation callbacks) can be supported through optional extensibility callbacks/options in the orchestrator hook (e.g., `onStepHydrate`, `onStepSave`)
- StatementOfClaims MUST be normalized to use the same orchestrator pattern as the other 6 workflows (`jobStepMap` instead of `computeMaxStepAllowed`); `isCaseIdBased` and `abandonThunk` remain as optional orchestrator params
- The backend's atomic snapshot-on-abandon behavior for versioned workflows is working correctly and does not need frontend-side changes
- A unified shell wrapper will be created combining the best of `AnalysisStepShell` and `AnalysisStageLayout`; all 7 workflows will migrate to it
- The existing Redux slice architecture (one slice per workflow type using `createWorkflowSlice` factory) remains unchanged
- All 7 existing workflow types and their step counts remain the same (no new workflows or step changes in this feature)
- The visual design and UX of all pages should remain the same after refactoring — this is an internal architecture improvement, not a redesign
