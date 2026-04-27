# Feature Specification: Docker Setup

**Feature Branch**: `012-docker-setup`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "3. الجزء B — Docker Setup from /Users/mazenelsbagh/mazen mac/apps/mohamy smart/plan v2.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start the Full Local Workspace Quickly (Priority: P1)

As a developer joining or returning to the project, I need a containerized local workspace that starts the full product stack together so I can begin development and QA without hand-configuring each service separately.

**Why this priority**: A reliable local workspace is the foundation for all later coding, debugging, and testing. Without it, every team member pays repeated setup cost and encounters inconsistent behavior.

**Independent Test**: Can be fully tested by starting the local workspace from a clean machine setup and verifying that the database, backend, and all user-facing applications become reachable on their agreed local addresses with no manual per-service setup.

**Acceptance Scenarios**:

1. **Given** a developer has the repository and the required local secrets file, **When** they start the local workspace, **Then** the database, backend, lawyer dashboard, admin dashboard, and landing experience all start as part of one coordinated environment.
2. **Given** the local workspace starts successfully, **When** the developer opens each agreed local address, **Then** each product surface is reachable and connected to the local backend environment rather than an external environment.
3. **Given** one service is not yet ready during startup, **When** dependent services initialize, **Then** the startup flow waits or retries in a controlled way instead of failing unpredictably.

---

### User Story 2 - Rebuild and Ship a Production Package Predictably (Priority: P2)

As an operator preparing a release, I need a production-ready container package for every product component so I can deploy a consistent build without carrying local-development behavior into production.

**Why this priority**: Release packaging is less urgent than local developer enablement, but it is essential for predictable deployments and environment parity across releases.

**Independent Test**: Can be fully tested by building the production package, starting it in a production-like environment, and confirming that all public product surfaces load and use the configured production endpoints and runtime settings.

**Acceptance Scenarios**:

1. **Given** a release candidate is ready, **When** the production package is built, **Then** each product component has a production runtime package that excludes local hot-reload behavior.
2. **Given** the production package starts with valid production configuration, **When** users access the lawyer dashboard, admin dashboard, landing experience, and backend entrypoint, **Then** each surface is served correctly from its production package.
3. **Given** a production deployment uses an external database host instead of the bundled one, **When** the runtime starts, **Then** the application stack can target that external database configuration without requiring code changes.

---

### User Story 3 - Preserve Data and Service Reliability Across Restarts (Priority: P3)

As a developer or operator, I need database data and essential runtime logs to survive routine container restarts so I can troubleshoot issues and continue work without losing critical state.

**Why this priority**: Persistence and recoverability protect developer productivity and reduce deployment risk, but they depend on the base workspace and production packaging being defined first.

**Independent Test**: Can be fully tested by creating representative application data, restarting the relevant services, and confirming that the data remains available and the runtime returns to a healthy state without manual recovery work.

**Acceptance Scenarios**:

1. **Given** the local or production-like stack already contains application data, **When** the stack is stopped and started again, **Then** the database data remains available after restart.
2. **Given** the backend produces runtime logs, **When** the backend service restarts, **Then** the expected log output remains accessible for troubleshooting according to the defined persistence scope.
3. **Given** a service exits unexpectedly, **When** the environment applies its restart policy, **Then** the service returns automatically in the environments where automatic recovery is expected.

### Edge Cases

- What happens when a required local secrets file or environment value is missing? The startup process should fail clearly and identify the missing configuration instead of starting a partially broken stack.
- What happens when one of the agreed local ports is already occupied? The conflicting service should stop with a clear error so the team does not accidentally use a different address than documented.
- How does the system behave when the database takes longer than usual to become ready? Dependent services should not proceed as though the stack is healthy before the database is actually available.
- What happens when a frontend build succeeds but points to the wrong backend address for the target environment? The release should expose that mismatch as a configuration error before acceptance testing proceeds.
- How does the system behave after a full stack restart following test-data creation? Previously stored database records should still be available unless the user intentionally removes persisted data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a single coordinated local container workspace for the database, backend, lawyer dashboard, admin dashboard, and landing experience.
- **FR-002**: The local container workspace MUST expose each product component on its agreed local address so developers and testers can reach every surface consistently.
- **FR-003**: The local container workspace MUST support source-change feedback suitable for routine development work on the backend and all dashboard or landing surfaces.
- **FR-004**: The system MUST provide a separate production-oriented container packaging flow for the database option, backend, lawyer dashboard, admin dashboard, and landing experience.
- **FR-005**: The production-oriented package MUST run without local-development behaviors such as source watching or interactive development servers.
- **FR-006**: The production-oriented package MUST allow runtime configuration values to determine service-to-service addresses and public application URLs without requiring image rebuilds for every deployment-specific secret.
- **FR-007**: The system MUST persist database data across routine environment shutdown and restart cycles unless an operator explicitly removes persisted storage.
- **FR-008**: The system MUST define a shared internal service network so application components can communicate reliably using environment-specific configuration.
- **FR-009**: The system MUST delay or guard dependent service startup until required dependencies are healthy enough to accept connections.
- **FR-010**: The system MUST surface startup failures caused by missing configuration, unavailable ports, or unreachable dependencies in a clear, actionable way.
- **FR-011**: The backend runtime package MUST include the non-code application assets required for successful startup and request handling.
- **FR-012**: The system MUST provide production-ready static serving behavior for user-facing web applications so direct navigation and refresh actions resolve to the expected user experience.
- **FR-013**: The local workspace MUST preserve backend runtime logs for troubleshooting during normal development sessions.
- **FR-014**: The production-oriented environment MUST support automatic restart behavior for long-running services where service continuity is expected.

### Key Entities *(include if feature involves data)*

- **Local Workspace Profile**: The development runtime definition that describes which product components run together locally, which addresses they use, and how code or assets are made available during development.
- **Production Runtime Profile**: The release-oriented runtime definition that describes how the packaged services start in a deployment environment and which values are supplied at runtime.
- **Persistent Data Store**: The database storage allocated to survive normal stack shutdowns and restarts so application records remain available.
- **Service Package**: A runnable package for one product component, including the component code, required static assets, and the runtime contract it expects.
- **Service Health Contract**: The readiness expectations that determine when one service is safe for another service to depend on during startup and recovery.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of developers with the required local secrets available can start the full local workspace and reach all five product components within 15 minutes on a fresh machine setup.
- **SC-002**: 100% of acceptance test runs for the local workspace confirm that each product component is reachable on its documented local address with no undocumented port substitutions.
- **SC-003**: 95% of production-package validation runs complete without requiring manual changes inside container images after the initial configuration values are supplied.
- **SC-004**: 100% of tested database records created before a routine stop-and-start cycle remain available after the environment is restarted without storage removal.
- **SC-005**: 95% of startup failures caused by missing configuration or unavailable dependencies present an actionable error within 2 minutes of launch.

## Assumptions

- This feature covers only the containerization layer described in Part B and does not redefine the broader environment-variable strategy that is planned separately.
- The agreed local addresses for the backend, lawyer dashboard, admin dashboard, landing experience, and local database remain unchanged from prior decisions.
- Developers already have access to the real local secrets and environment values needed to run the stack; this feature defines how those values are consumed, not how secret distribution is managed.
- The landing experience remains deployable as a static site in the production package rather than requiring a long-running server-side rendering process.
- A bundled database is acceptable for local development, while production may use either the bundled database option or an external database service.
