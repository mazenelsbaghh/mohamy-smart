# Data Model: Local Database Setup

## Overview

This feature does not add new product-domain persistence. Its design revolves around operational entities that define how the local SQL Server environment is initialized, persisted, reset, and inspected.

## Entities

### 1. Local Database State

- **Description**: The persisted local SQL Server state used by the application during development.
- **Core Fields**:
  - `storage_name`: The named storage allocation used by the local database
  - `database_identity`: The logical database developers expect to inspect and reuse
  - `contains_application_records`: Whether seeded and manually created rows exist
  - `contains_operational_history`: Whether SQL Server troubleshooting history remains available
  - `reset_condition`: The explicit action required to remove persisted state
- **Validation Rules**:
  - Must survive routine stop-start cycles
  - Must be removed only by the explicit destructive-reset workflow
  - Must continue representing the same local DB instance after restart

### 2. Migration Workflow

- **Description**: The manual schema-application path required before first normal use of a fresh local database.
- **Core Fields**:
  - `entry_command`: The operator-facing command used to apply schema changes
  - `execution_scope`: Fresh local DB setup or later schema updates
  - `preconditions`: Running local database and available backend tooling
  - `observable_result`: Schema is available for application startup
- **Validation Rules**:
  - Must require explicit invocation
  - Must not be triggered implicitly by routine backend startup
  - Must leave the DB ready for seeding-dependent sign-in flows

### 3. Seeded Access Profile

- **Description**: The baseline local roles and users available after first-time setup.
- **Core Fields**:
  - `roles`: Required authorization roles for local testing
  - `starter_accounts`: Default sign-in identities used during local validation
  - `creation_rule`: Whether missing records are created on startup
  - `duplication_rule`: How repeated startups avoid duplicate seed data
- **Validation Rules**:
  - Required roles must exist after initial setup
  - Required starter users must exist after initial setup
  - Repeated startups must not create duplicate baseline users or roles

### 4. External Connection Profile

- **Description**: The host-side connection details used by developers and testers to inspect the local DB from outside Docker.
- **Core Fields**:
  - `host_address`: The published host endpoint for the DB
  - `database_name`: The logical target DB
  - `principal`: The expected DB user for local inspection
  - `credential_source`: Where the password is retrieved from
  - `trust_requirement`: Any local client setting required for successful connection
- **Validation Rules**:
  - Must point to the same DB instance the app stack uses
  - Must identify the correct env-backed credential source
  - Must remain valid for standard external SQL clients on the host machine

## Relationships

- One **Local Database State** is prepared by one **Migration Workflow** before routine use.
- One **Local Database State** exposes one **Seeded Access Profile** after successful startup.
- One **External Connection Profile** points to one **Local Database State**.
- One **Seeded Access Profile** depends on one initialized **Local Database State**.

## State Transitions

### Local Database State

`fresh` → `schema-ready` → `seeded` → `reused` → `reset`

- `fresh → schema-ready`: Manual migration workflow completes.
- `schema-ready → seeded`: Backend startup creates any missing baseline roles or users.
- `seeded → reused`: Routine stop-start cycles preserve the same DB state.
- `reused → reset`: Explicit destructive reset removes persisted state.

### External Connection Profile

`documented` → `attempted` → `connected` or `failed`

- `documented → attempted`: Developer enters the published host-side connection settings into a DB client.
- `attempted → connected`: Local DB is running and credentials are correct.
- `attempted → failed`: Local DB is down, the port is wrong, or the password source is incorrect.
