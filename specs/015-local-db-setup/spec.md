# Feature Specification: Local Database Setup

**Feature Branch**: `015-local-db-setup`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "#6-الجزء-e--قاعدة-البيانات-المحلية /Users/mazenelsbagh/mazen mac/apps/mohamy smart/plan v2.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preserve Local Data Between Sessions (Priority: P1)

As a developer working locally, I need the local database to keep its records between normal shutdowns and restarts so I do not lose seeded accounts, test data, or investigation context every time I stop the workspace.

**Why this priority**: Local data persistence is the foundation for all other database-related development work. Without it, every restart forces costly re-setup and blocks reliable testing.

**Independent Test**: Can be fully tested by starting the local workspace, creating or confirming representative records, stopping the workspace normally, starting it again, and verifying that the same records are still available.

**Acceptance Scenarios**:

1. **Given** the local database already contains application records, **When** the workspace is stopped and started through normal development commands, **Then** the previously stored records remain available after restart.
2. **Given** the local database service has been running and recording operational events, **When** the service is restarted normally, **Then** the operational history needed for troubleshooting remains available.
3. **Given** a developer intentionally performs the destructive reset flow, **When** the local workspace is started again, **Then** the previous database state is no longer present and the environment is treated as a fresh database instance.

---

### User Story 2 - Initialize the Local Database Predictably (Priority: P2)

As a developer setting up the project on a new machine, I need a clear first-run database initialization flow so I can prepare schema and bootstrap accounts without hidden startup side effects.

**Why this priority**: A predictable initialization flow reduces onboarding friction and prevents confusion about when schema changes and initial accounts appear.

**Independent Test**: Can be fully tested by starting from a fresh local database, following the documented first-run steps, and confirming that the schema is prepared and the default administrative and lawyer accounts become usable.

**Acceptance Scenarios**:

1. **Given** a fresh local database with no schema applied, **When** the developer runs the documented initialization sequence, **Then** the database schema is applied through an explicit step rather than an automatic startup side effect.
2. **Given** the schema has been applied for the first time, **When** the backend starts successfully, **Then** the default roles and starter accounts are available for local sign-in and testing.
3. **Given** the workspace restarts after the initial setup, **When** the backend starts again, **Then** the initialization flow does not recreate duplicate baseline roles or starter users.

---

### User Story 3 - Access the Local Database from Outside the Workspace (Priority: P3)

As a developer or tester, I need a documented local connection path to the database from tools outside the application workspace so I can inspect records, troubleshoot issues, and validate setup independently from the app UI.

**Why this priority**: External access is less critical than persistence and bootstrap, but it materially improves debugging speed and confidence during development.

**Independent Test**: Can be fully tested by using an external database client with the documented local connection details and confirming that the expected local database can be reached.

**Acceptance Scenarios**:

1. **Given** the local database workspace is running, **When** a developer uses the documented connection details in an external database client, **Then** the client connects to the correct local database instance.
2. **Given** the local database credentials are supplied from the local environment configuration, **When** a developer reviews the connection instructions, **Then** the instructions identify which value must be taken from local configuration rather than hard-coded in documentation.
3. **Given** the local database service is not running or the credentials are wrong, **When** the developer attempts an external connection, **Then** the failure is attributable to an actionable local setup issue rather than ambiguous behavior.

### Edge Cases

- What happens when a developer restarts the workspace before completing the first-time schema setup? The system should leave the database uninitialized rather than silently applying schema changes during startup.
- What happens when the default starter accounts already exist from an earlier setup? The initialization flow should preserve a usable baseline state without creating duplicate accounts or roles.
- What happens when a developer uses normal shutdown commands expecting persistence but later performs the destructive reset flow? The resulting data loss should occur only in the explicit destructive-reset case.
- What happens when an external database client uses outdated credentials or the wrong local port? The connection attempt should fail in a way that points back to the documented local configuration values.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST preserve the local database's application records across routine local shutdown and restart cycles.
- **FR-002**: The system MUST preserve the local database's operational history needed for troubleshooting across routine local shutdown and restart cycles.
- **FR-003**: The system MUST provide an explicit destructive-reset path that removes previously persisted local database state only when the developer intentionally chooses that action.
- **FR-004**: The system MUST require schema changes for a fresh local database to be applied through an explicit initialization step rather than automatically during routine service startup.
- **FR-005**: The system MUST provide a documented first-run sequence that prepares a fresh local database before normal application use.
- **FR-006**: The system MUST make baseline authorization roles available after first-time local database initialization.
- **FR-007**: The system MUST make one baseline administrative account and one baseline lawyer account available after first-time local database initialization so local testing can begin immediately.
- **FR-008**: The system MUST avoid creating duplicate baseline roles or baseline accounts during repeated local startups after the initial setup has completed.
- **FR-009**: The system MUST document how to reach the local database from outside the application workspace using a local database client.
- **FR-010**: The system MUST document which local credential value is sourced from the developer's local environment configuration when connecting from outside the workspace.
- **FR-011**: The system MUST keep the documented external connection target aligned with the local database instance used by the workspace.
- **FR-012**: The system MUST keep persistence behavior for normal shutdowns clearly distinct from the destructive-reset behavior.

### Key Entities *(include if feature involves data)*

- **Local Database State**: The persisted application and operational data that should survive normal local stop and start cycles until an explicit destructive reset is requested.
- **Initialization Flow**: The first-run sequence that prepares a fresh local database, including schema application and baseline data availability, before routine development use.
- **Baseline Role**: A default authorization role required for local testing and administration in a fresh environment.
- **Baseline User**: A default local sign-in account provided to let developers and testers enter the system immediately after first-time setup.
- **External Connection Profile**: The documented set of local connection details a developer uses to inspect the same database instance from tools outside the workspace.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of validation runs confirm that records created before a routine local shutdown remain available after the next startup when the destructive reset flow has not been used.
- **SC-002**: 90% of developers following the documented first-run setup can prepare a fresh local database and sign in with a baseline account in under 15 minutes.
- **SC-003**: 100% of repeated-startup validation runs confirm that the baseline roles and baseline users are not duplicated after initial setup.
- **SC-004**: 95% of developers using the documented external connection profile can connect to the correct local database instance from an external client on their first attempt.
- **SC-005**: 100% of destructive-reset validation runs confirm that old local database state is removed only after the explicit reset action is performed.

## Assumptions

- This feature applies to local development and testing environments only; production credential rotation and production database administration remain outside this scope.
- A single shared local database instance is sufficient for routine team development unless a developer intentionally resets it.
- Baseline local accounts are acceptable for bootstrapping non-production work, and their passwords are expected to be changed manually in production environments.
- The project already contains the baseline data-seeding behavior referenced by the plan, and this feature defines how that behavior is relied on in local setup rather than redesigning it.
- Developers have access to the local environment configuration file that holds the database password needed for external connections.
