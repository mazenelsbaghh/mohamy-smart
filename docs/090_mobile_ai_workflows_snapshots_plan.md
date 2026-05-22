# Plan - Mobile AI Workflows & Snapshots History

Implement the full end-to-end user experience for the 7 AI workflows, step-by-step interactive stages, step output rendering, and case analysis snapshot history in the Flutter mobile application (`mohamy_smart_mobile`).

## User Review Required

> [!NOTE]
> All 7 workflows will be integrated inside the mobile app using an in-memory repository extension, allowing the lawyer to run workflows, save drafts, create history snapshots (versions), label/rename snapshots, delete them, and restore previous snapshots to resume work.

> [!IMPORTANT]
> The steps and text outputs will be fully dynamically rendered based on the selected workflow's schema (e.g., Statement of Claims has 7 steps, Ruling Analysis has 4 steps, etc.) rather than being hardcoded to the 4 defense memo steps.

## Proposed Changes

### Component: Flutter Mobile Application (mohamy_smart_mobile)

#### [NEW] [workflow_snapshot_model.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/core/models/workflow_snapshot_model.dart)
- Create `WorkflowSnapshot` model containing:
  - `id` (String)
  - `caseId` (String)
  - `workflowType` (String)
  - `currentStep` (int)
  - `label` (String?)
  - `createdAt` (DateTime)
  - `outputs` (Map<int, Map<String, dynamic>>) - step-by-step outputs representation.
- Create `WorkflowDraft` model to manage the current active draft for a workflow type.

#### [MODIFY] [demo_legal_repository.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/core/data/demo_legal_repository.dart)
- Define standard mock data outputs and step definitions for all 7 workflows to simulate realistic AI generation rather than generic placeholder text.
- Initialize mock snapshots/versions for existing cases to showcase history capability on load.

#### [MODIFY] [app_state.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/app/app_state.dart)
- Keep track of active drafts `Map<String, Map<String, WorkflowDraft>>` mapping `caseId -> workflowType -> WorkflowDraft`.
- Keep track of case snapshots list `List<WorkflowSnapshot>`.
- Add state methods to:
  - Save current draft as a snapshot in history.
  - Create a new fresh workflow run (resets current step to 0/1 and clears outputs, optionally archiving current draft as snapshot if it has progress).
  - Delete a snapshot by ID.
  - Rename/label a snapshot by ID.
  - Restore a snapshot (hydrates the current workflow draft with the snapshot's step and outputs).

#### [MODIFY] [ai_workflow_screens.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/features/ai_workflows/ai_workflow_screens.dart)
- **Refactor `AiWorkflowHubScreen`**:
  - Render status badges dynamically: "مسودة" (Draft) if draft exists with progress, "منجزة" (Completed) if final step is reached, "لم تبدأ" (Not Started).
  - Show the version count badge under the workflow name (e.g. "3 نسخ سابقة") if there are snapshots.
  - Render action buttons: "استكمال النسخة الحالية" (Resume Current Version), "مراجعة النسخة الحالية" (Review Current Version), "ابدأ" (Start), and "بدء واحدة جديدة" (Start a New One) which archives the existing one as a snapshot and resets state.
  - Provide a quick link to the **Snapshots History Screen** if there are previous snapshots.
- **Refactor `AiWorkflowRunnerScreen`**:
  - Dynamically load the steps definition (titles, counts) for the chosen workflow type.
  - For Step 0 (Basic Details/Inputs), display the facts, document attachments, and case meta.
  - For subsequent steps:
    - If AI processing is active, play the premium pulsing/rotating AI loader and cycle through stages (e.g. "جارِ فحص المستندات" -> "جارِ مراجعة السوابق" -> "تم الاستخلاص").
    - Render step-specific layouts with structured Arabic texts matching the selected workflow step (e.g. showing "أطراف الدعوى" for Claim Step 2, "أسباب الحكم" for Ruling Step 2, etc.).
    - Allow inline editing/editing of the generated outputs using text form fields, and autosave modifications.
    - Provide copies/exports (clipboard, PDF download simulation).
- **Add Snapshots History Screen**:
  - List all snapshots created for this case + workflow type with a timeline structure.
  - Display snapshot title/label, creation date/time, and a preview of its final output.
  - Allow renaming (labeling) snapshots via a neat prompt dialog.
  - Allow restoring a snapshot (with confirmation) to rollback or review that exact version in the workflow runner.
  - Allow deleting snapshots.

## Verification Plan

### Automated Tests
- Run `flutter test` within `apps/mohamy_smart_mobile` to verify compilation and basic widget behaviors.

### Manual Verification
- Run the Flutter web server using `make run-chrome` or similar to manually test workflow switching, stepping through all 7 pipelines, creating/restoring snapshots, and reviewing step-specific content.
