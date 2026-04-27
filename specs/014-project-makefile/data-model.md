# Data Model: Project Operations Command Surface

## Overview

This feature does not add product-domain persistence. Its design revolves around operational entities that define how the root command surface behaves and how callers interact with it consistently.

## Entities

### Command Target

- **Description**: A named developer-facing operation exposed from the repository root.
- **Core Fields**:
  - `name`: Stable target name used by callers
  - `category`: Operational grouping such as lifecycle, service, database, testing, cleanup, or help
  - `description`: Human-readable purpose shown in help output
  - `requires_env_file`: Whether execution depends on a specific env file being present
  - `destructive`: Whether the command can delete persisted data or otherwise perform irreversible actions
  - `requires_argument`: Optional caller-supplied value such as a migration name
  - `success_signal`: The observable confirmation expected after completion
- **Validation Rules**:
  - `name` must be unique across the command surface
  - destructive targets must include an explicit confirmation step
  - targets that require arguments must fail fast with a corrective message if the argument is missing
  - help-visible targets must include a non-empty description

### Runtime Stack

- **Description**: A predefined group of services intended to run together for a specific operational mode.
- **Core Fields**:
  - `name`: Stack identifier such as development or production-oriented
  - `services`: Included service set
  - `env_source`: Env file used to configure the stack
  - `startup_mode`: Whether the stack starts all services or a focused subset
  - `port_map`: Canonical externally reachable ports exposed to developers or operators
- **Relationships**:
  - one Runtime Stack contains many Service Scopes
  - one Runtime Stack may be started by multiple Command Targets
- **Validation Rules**:
  - each stack must map to exactly one environment source
  - each stack must preserve canonical port expectations from the constitution

### Service Scope

- **Description**: A targeted subset of services used for focused development or troubleshooting.
- **Core Fields**:
  - `name`: Focused workflow label
  - `included_services`: One or more services started by the scope
  - `depends_on`: Supporting services that must be available for the scope to work
  - `developer_goal`: The workflow enabled by the scope
- **Relationships**:
  - many Service Scopes belong to one Runtime Stack
  - one or more Command Targets can activate a Service Scope
- **Validation Rules**:
  - each scope must clearly declare whether it includes only the app surface or also supporting services
  - scope names must remain distinct from full-stack lifecycle targets

### Environment File

- **Description**: A configuration source required by specific operational commands.
- **Core Fields**:
  - `name`: File identifier
  - `purpose`: Local or production-oriented usage
  - `tracked_template`: Example file used for onboarding
  - `tracked`: Whether the file is committed
  - `contains_secrets`: Whether the file is expected to hold real sensitive values
- **Relationships**:
  - one Environment File can be required by many Command Targets
  - one Runtime Stack depends on one Environment File
- **Validation Rules**:
  - secret-bearing runtime env files must not be tracked
  - tracked templates must exist for each required runtime env file

### Database Workflow

- **Description**: A command-driven operation related to database access or schema changes.
- **Core Fields**:
  - `operation`: Shell access, apply schema changes, or create schema change
  - `preconditions`: Required running services or inputs
  - `credential_source`: Where credentials are read from
  - `outcome`: Expected developer-visible result
- **Relationships**:
  - one Database Workflow is invoked by one or more Command Targets
  - one Database Workflow may depend on a Runtime Stack or Service Scope
- **Validation Rules**:
  - schema-change creation requires a non-empty migration name
  - workflows must not assume direct credential hardcoding

## State Transitions

### Runtime Stack State

`stopped` → `starting` → `running` → `stopped`

- `starting` is entered when a lifecycle or scoped startup target is invoked.
- `running` is reached when services are available and user guidance can be shown.
- `stopped` is restored through normal shutdown or cleanup.

### Cleanup State

`active` → `cleanup-requested` → `cleaned`

- Non-destructive cleanup transitions directly after command invocation.
- Destructive cleanup inserts a confirmation checkpoint before data removal:
  `active` → `destructive-cleanup-requested` → `confirmed` → `cleaned`

### Migration Command State

`ready` → `validating-input` → `executing` → `completed`

- Missing migration names or missing prerequisites transition to an immediate failure outcome instead of execution.
