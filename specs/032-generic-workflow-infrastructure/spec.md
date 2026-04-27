# Feature Specification: Generic Workflow Infrastructure

**Feature Branch**: `032-generic-workflow-infrastructure`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "Phase 2: Generic Workflow Infrastructure"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add New AI Analysis Pipeline (Priority: P1)

As a developer, I want to add a new AI analysis pipeline by defining only configuration and specific prompts, so that I rely on shared workflow logic without writing boilerplate infrastructure code.

**Why this priority**: Greatly reduces the time and complexity to scale the system for new legal cases and features (such as Statement of Claims, Defense Memos, etc.), which is the core goal of this refactor phase.

**Independent Test**: Can be fully tested by creating a dummy pipeline service extending the generic base, verifying that it correctly initializes, runs steps, and completes without duplicating the infrastructure logic.

**Acceptance Scenarios**:

1. **Given** a new legal analysis requirement, **When** a developer implements the generic workflow base class and provides step counts and prompt locations, **Then** all underlying lifecycle behaviors automatically apply.
2. **Given** the need to change the global process of saving a step output, **When** the developer changes the logic in the single generic workflow base, **Then** all derived pipelines reflect the update immediately.

---

### User Story 2 - Process AI Jobs Reliably (Priority: P2)

As a user, I want my legal case AI analysis requests to be processed consistently and reliably regardless of which specific type of analysis I am requesting (e.g. Ruling Analysis vs Legal Warning).

**Why this priority**: Critical to ensure existing workflows remain robust and that background service logic doesn't fracture over duplicated copies, reducing technical debt and bug origins.

**Independent Test**: Can be fully tested by triggering various jobs across different pipelines and assuring they all successfully start, report progress, and finish via the background worker.

**Acceptance Scenarios**:

1. **Given** submitted tasks in different pipelines, **When** the background worker polls and processes them, **Then** it delegates to the identical unified resolution logic to get the latest workflow state.
2. **Given** an error resolving a workflow case context, **When** it occurs, **Then** a unified mechanism safely logs and handles the state without pipeline-specific erratic behavior.

### Edge Cases

- What happens when a specific pipeline requires a deeply custom step payload builder?
- How does the system handle fetching workflow states when multiple types of queries are running simultaneously for different pipelines?
- Does resolving a specific workflow fail gracefully if the generic worker attempts to map to an unregistered workflow type?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a unified base capability to manage AI workflow lifecycles (Start Workflow, Resume Workflow, Run Specific Step, Save User Edits).
- **FR-002**: System MUST allow specific workflow pipelines to define their unique configurations (total steps, prompt folder name, step file paths, and AI task types).
- **FR-003**: System MUST process AI background jobs using a single unified resolution logic that works seamlessly across all supported legacy and new pipelines.
- **FR-004**: System MUST ensure that any existing workflows seamlessly migrate to the new backend behavior without data loss or changes to existing schema representations.

### Key Entities

- **Workflow Base Entity**: Represents the generalized structure of any multi-step AI analysis session (including Case ID, Lawyer ID, Current Step, Status).
- **Workflow Pipeline Service**: Represents the application mechanism responsible for managing the logic boundary of a distinct pipeline instance.
- **Workflow Context Resolver**: Represents the generic mechanism for identifying and retrieving an active workflow session given an AI job.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The system complexity required for a specific pipeline is reduced by approximately 80% (measured by logic footprint).
- **SC-002**: All 5 existing pipelines rely purely on the single generic infrastructure for base workflow resolution.
- **SC-003**: The time needed to create a completely new AI analysis pipeline is reduced by at least 60% compared to previous baselines.
- **SC-004**: Zero regressions: Testing existing features displays no functional downgrade or missing historical states.

## Assumptions

- The underlying data schemas for specific pipelines will remain separate; they share logic via architecture-level inheritance rather than requiring a database migration.
- Current prompts and behaviors remain unchanged; only the system infrastructure mapping to them is unified.
