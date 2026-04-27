# Data Model: Docker Setup

## Overview

This feature does not introduce business-domain entities. Its design revolves around runtime configuration artifacts and service relationships that must remain consistent across local and production-oriented environments.

## Entities

### 1. Runtime Profile

- **Purpose**: Represents one coordinated environment definition for starting the product stack.
- **Variants**:
  - `local-development`
  - `production-oriented`
- **Fields**:
  - `name`: Human-readable environment name
  - `serviceSet`: List of services expected to run in that profile
  - `publicAddresses`: Canonical externally reachable addresses for users and developers
  - `internalAddresses`: Service-to-service addresses used inside the network
  - `requiredEnvFiles`: Env files that must exist before startup
  - `restartPolicy`: Recovery expectation for each long-running service
  - `persistencePolicy`: Which data or logs survive restarts
- **Validation Rules**:
  - Must define all required services for the selected profile
  - Must not assign duplicate public ports within the same profile
  - Must not reference git-tracked files for real secrets

### 2. Service Package

- **Purpose**: Represents the runnable package for a single application component.
- **Applies To**:
  - Backend API
  - Lawyer Dashboard
  - Admin Dashboard
  - Landing App
- **Fields**:
  - `serviceName`
  - `buildContext`
  - `runtimeMode` (`development` or `production`)
  - `exposedPort`
  - `dependsOn`
  - `requiredAssets`
  - `configurationInputs`
- **Validation Rules**:
  - Must expose the canonical port for that service
  - Must declare all required configuration inputs
  - Production packages must exclude development-only runtime behavior
  - Backend package must include required runtime assets

### 3. Persistent Storage Allocation

- **Purpose**: Describes state that survives routine stop-start cycles.
- **Fields**:
  - `storageName`
  - `ownerService`
  - `retentionScope` (`local-only`, `production`, `both`)
  - `contentsType` (`database-data`, `runtime-logs`)
  - `deletionCondition`
- **Validation Rules**:
  - Database storage must survive normal shutdowns and restarts
  - Log persistence must match the troubleshooting scope defined by the profile
  - Data removal must require explicit operator action

### 4. Service Health Contract

- **Purpose**: Defines readiness expectations between dependent services.
- **Fields**:
  - `providerService`
  - `consumerServices`
  - `readinessSignal`
  - `timeoutExpectation`
  - `failureBehavior`
- **Validation Rules**:
  - A dependent service cannot be considered ready before the provider emits a valid readiness signal
  - Failure behavior must produce an actionable error
  - Health requirements must be stricter in production-oriented mode than in local ad hoc runs

## Relationships

- A **Runtime Profile** contains multiple **Service Packages**.
- A **Runtime Profile** references one or more **Persistent Storage Allocations**.
- A **Service Package** may depend on one or more **Service Health Contracts**.
- A **Persistent Storage Allocation** belongs to exactly one primary service owner but may support multiple restarts or rebuild cycles within a profile.

## State Transitions

### Runtime Profile

`defined -> configured -> started -> healthy -> stopped`

- `defined -> configured`: Required env files and addresses are supplied.
- `configured -> started`: The orchestration command begins launching services.
- `started -> healthy`: Each service satisfies its readiness conditions.
- `healthy -> stopped`: Services are intentionally shut down or stopped by failure.

### Service Package

`designed -> built -> started -> ready -> restarted`

- `designed -> built`: Image creation succeeds with required assets and configuration hooks.
- `built -> started`: The package is launched in the selected profile.
- `started -> ready`: Readiness conditions and address exposure are satisfied.
- `ready -> restarted`: Automatic or manual restart preserves intended state and configuration.
