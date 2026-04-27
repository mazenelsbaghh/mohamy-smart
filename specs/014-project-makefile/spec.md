# Feature Specification: Project Operations Command Surface

**Feature Branch**: `014-project-makefile`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "#5-الجزء-d--makefile"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start and stop the development stack consistently (Priority: P1)

A developer needs one top-level command set to start, inspect, and stop the local product stack so they can work on the backend, dashboards, and supporting services without memorizing long orchestration commands.

**Why this priority**: Daily development depends on reliable startup and shutdown workflows. If the common development flow is inconsistent or hard to discover, every other task becomes slower.

**Independent Test**: Can be fully tested by asking a developer to use only the repository's top-level command surface to start the development stack, confirm the expected services are available, inspect running services, and shut the stack down again.

**Acceptance Scenarios**:

1. **Given** the repository is prepared for local development, **When** the developer runs the main development start command, **Then** the required local services start and the developer receives clear endpoint guidance for the running applications.
2. **Given** the development stack is already running, **When** the developer runs the stack inspection or log commands, **Then** they can see the active services and follow runtime output without needing to construct orchestration commands manually.
3. **Given** the developer has finished working, **When** they run the standard stop command, **Then** the local containers stop without implying that persistent data will be deleted.

---

### User Story 2 - Operate specific services and database workflows (Priority: P2)

A maintainer needs dedicated commands for individual services and database operations so they can work on a focused area of the product, inspect the local database, and apply schema changes from the same entry point.

**Why this priority**: Focused workflows reduce unnecessary startup time and lower the risk of mistakes during database operations.

**Independent Test**: Can be fully tested by starting only a subset of services, opening a database shell, and executing the migration commands through the shared command surface without using direct orchestration or database tool commands.

**Acceptance Scenarios**:

1. **Given** a maintainer only needs one application area, **When** they run a service-specific command, **Then** only the relevant local service set starts for that workflow.
2. **Given** the local database service is available, **When** the maintainer runs the database shell command, **Then** they can access the local database with the expected local credentials source.
3. **Given** a schema change is ready, **When** the maintainer runs the migration execution or migration creation command, **Then** the database workflow proceeds through the shared command entry point with clear success or validation feedback.

---

### User Story 3 - Run quality checks and recover local environments safely (Priority: P3)

A team member needs consistent commands to run automated tests, rebuild local artifacts, clean up containers, and intentionally remove all local runtime data when necessary so environment recovery is predictable and explicit.

**Why this priority**: Testing and cleanup are essential support workflows, but they are less critical than basic startup and focused service access.

**Independent Test**: Can be fully tested by running the aggregated test workflow, targeted test workflows, standard cleanup, and destructive cleanup confirmation flow through the shared command surface.

**Acceptance Scenarios**:

1. **Given** automated tests exist across the product areas, **When** the team member runs the main test command, **Then** the backend and both dashboards are executed from one consistent entry point.
2. **Given** local containers or images need recovery, **When** the team member runs the rebuild or cleanup commands, **Then** the command surface distinguishes between safe cleanup and destructive cleanup.
3. **Given** the team member invokes the destructive cleanup command, **When** the command warns about data deletion, **Then** local runtime data is not removed silently and requires explicit confirmation.

### Edge Cases

- What happens when a production start command is used before a required production environment file exists?
- What happens when a migration creation command is invoked without a required migration name?
- How does the destructive cleanup flow prevent accidental data loss during local recovery?
- What happens when a developer wants only one product surface instead of the full stack?
- How does a team member discover available commands if they are new to the repository?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a root-level command interface that exposes the common local development workflows for the product.
- **FR-002**: The system MUST allow team members to start the full local development stack from a single command.
- **FR-003**: The system MUST allow team members to stop the local development stack without deleting persisted local data by default.
- **FR-004**: The system MUST provide commands to inspect active local services and stream service logs.
- **FR-005**: The system MUST provide a command to rebuild local runtime artifacts for the development stack.
- **FR-006**: The system MUST provide a separate command flow for starting and stopping the production-oriented stack.
- **FR-007**: The system MUST block production startup when the required production environment file is missing and explain how to resolve the issue.
- **FR-008**: The system MUST provide service-specific commands for backend-only, lawyer-dashboard-only, admin-dashboard-only, and landing-page-only startup workflows.
- **FR-009**: The system MUST provide a command to open an interactive shell session against the local database.
- **FR-010**: The system MUST provide a command to apply existing database schema changes to the local database.
- **FR-011**: The system MUST provide a command to create a new database schema change and require the caller to supply a migration name.
- **FR-012**: The system MUST provide a unified command to run automated tests across the backend and dashboard applications.
- **FR-013**: The system MUST provide targeted commands to run automated tests for the backend, the lawyer dashboard, and the admin dashboard independently.
- **FR-014**: The system MUST provide a non-destructive cleanup command that removes local runtime resources without deleting persisted data.
- **FR-015**: The system MUST provide a destructive cleanup command that explicitly warns the user before deleting persisted local data.
- **FR-016**: The system MUST provide a discoverable help command that lists available commands and their purpose.
- **FR-017**: The system MUST present key local access information after starting the development stack so team members know where to reach the main product surfaces and documentation.
- **FR-018**: The system MUST keep command names and behaviors consistent enough that the same root command surface can serve as the primary operational entry point for development and local environment recovery.

### Key Entities *(include if feature involves data)*

- **Command Target**: A named operation exposed through the root command surface that performs a specific local workflow such as startup, shutdown, testing, migration, or cleanup.
- **Runtime Stack**: A defined group of local services that can be started together for development or production-oriented operation.
- **Service Scope**: A narrower execution mode that starts or manages only the subset of services relevant to a focused workflow.
- **Environment File**: A runtime configuration source that determines whether a stack can be started safely in a given context.
- **Database Workflow**: The set of actions used to access the local database, apply schema updates, or create new schema changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new team member can discover the available local workflow commands within 2 minutes using the repository help output alone.
- **SC-002**: A developer can start the full local development stack and identify all primary local endpoints within 10 minutes from a clean repository setup.
- **SC-003**: 100% of the planned local operational workflows in this feature scope are accessible through named top-level commands rather than requiring manual orchestration commands.
- **SC-004**: Production-oriented startup attempts without the required production environment file fail immediately with a corrective message in 100% of attempts.
- **SC-005**: Destructive local cleanup requires an explicit confirmation step in 100% of cases before persisted local data is removed.
- **SC-006**: A maintainer can run backend-only, lawyer-dashboard-only, admin-dashboard-only, and landing-page-only startup flows without invoking unrelated services.

## Assumptions

- The feature covers repository-level operational convenience for local and production-oriented runtime workflows, not new business features within the product itself.
- The existing local service topology, database setup, and automated test suites remain the source workflows that the command surface will expose through a simpler entry point.
- The command surface is intended for team members working from the repository root in an environment where the required local tooling is already installed.
- The production-oriented commands are meant for controlled local or server-side operations and do not replace broader deployment governance or secret management processes.
