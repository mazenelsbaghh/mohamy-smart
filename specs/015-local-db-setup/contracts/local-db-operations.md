# Contract: Local Database Operations

## Purpose

Define the stable developer-facing contract for local database persistence, initialization, seeded access, destructive reset, and host-side external inspection.

## General Rules

- The local SQL Server instance is the one started by the repository's local Docker workflow.
- Routine shutdown must preserve local DB state.
- Schema changes must be applied only through the explicit migration workflow.
- Baseline roles and starter users must be safe to rely on after first-time setup.
- Real credentials must come from `.env.docker`, never from committed documentation.

## Workflow Contract

### 1. Routine Local Lifecycle

| Workflow | Trigger | Preconditions | Observable Outcome |
|----------|---------|---------------|--------------------|
| Start local DB workspace | `make dev` | `.env.docker` exists with valid local values | SQL Server starts as part of the local workspace and remains available on `localhost:1433` |
| Stop local DB workspace | `make down` or `make clean` | Local stack has been started previously | Containers and images stop/remove but DB state remains available for the next session |
| Destructive reset | `make nuke` | User explicitly confirms destructive cleanup | Persisted local DB state is permanently removed and the next startup requires fresh setup |

### 2. Schema Initialization

| Workflow | Trigger | Preconditions | Observable Outcome |
|----------|---------|---------------|--------------------|
| Apply schema to fresh local DB | `make migrate` | Local DB is reachable and backend tooling is available | Pending schema changes are applied explicitly |
| Routine backend startup | Backend starts after local DB is reachable | Schema is already present | Startup does not attempt implicit migration execution |

### 3. Seeded Access

| Workflow | Trigger | Preconditions | Observable Outcome |
|----------|---------|---------------|--------------------|
| Baseline role creation | Backend startup | Required roles are missing | Admin and Lawyer roles become available |
| Baseline user creation | Backend startup | Starter users are missing | One starter admin user and one starter lawyer user become available |
| Repeat startup | Subsequent backend startup | Roles and starter users already exist | No duplicate baseline roles or starter users are created |

### 4. Host-Side External Inspection

| Workflow | Trigger | Preconditions | Observable Outcome |
|----------|---------|---------------|--------------------|
| SQL client connection | Developer uses an external DB client | Local stack is running and `MSSQL_SA_PASSWORD` from `.env.docker` is used | Client connects to database `Lawyer` at `localhost,1433` using `sa` with trust-server-certificate enabled |

## Invariants

- `localhost:1433` remains the host-side access point for the local DB.
- The password source for host-side inspection is `MSSQL_SA_PASSWORD` in `.env.docker`.
- Routine local stop-start cycles preserve state.
- Only the destructive reset path removes the local DB volume contents.
- Starter roles and users must be idempotent across repeat startups.

## Error Contract

- Missing `.env.docker` must fail with a corrective message that points back to `.env.docker.example`.
- A failed external DB connection must be diagnosable through one of: local DB not running, wrong port, wrong password source, or incorrect client trust setting.
- If schema has not been applied to a fresh DB, the workflow must direct the operator to run the explicit migration step rather than hide the failure behind silent startup behavior.
