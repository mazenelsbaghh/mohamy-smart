# Quickstart: Local Database Setup

## Purpose

Validate the local database lifecycle for development: first-run schema setup, seeded access, persistence across routine restarts, destructive reset behavior, and host-side external inspection.

## Prerequisites

- Docker with Compose support is installed and running
- `make` is available in the shell
- `.env.docker` exists and contains a valid `MSSQL_SA_PASSWORD` plus the other required local backend secrets
- An external SQL client is available if you want to validate host-side DB access

## First-Time Local Database Setup

1. Create the local Docker env file if it does not already exist:
   ```bash
   cp .env.docker.example .env.docker
   ```
2. Fill `.env.docker` with real local values, especially `MSSQL_SA_PASSWORD`.
3. Start the local stack (the backend container will exit because the schema is not applied yet):
   ```bash
   make dev
   ```
4. Apply schema changes explicitly:
   ```bash
   make migrate
   ```
5. Restart the backend container to trigger baseline seeding:
   ```bash
   docker compose restart backend
   ```
6. Confirm the backend finishes startup and that the baseline admin and lawyer sign-in accounts are available.

## Persistence Validation

1. Create or verify representative records in the local app.
2. Stop the stack normally:
   ```bash
   make down
   ```
3. Start it again:
   ```bash
   make dev
   ```
4. Confirm the same records still exist.
5. Confirm the baseline roles and users were not duplicated.

## External Connection Validation

1. Ensure the local stack is running.
2. Open your SQL client and connect with:
   - Host: `localhost,1433`
   - Database: `Lawyer`
   - User: `sa`
   - Password: value of `MSSQL_SA_PASSWORD` from `.env.docker`
   - Trust server certificate: enabled
3. Confirm the client reaches the same database the app is using.

## Destructive Reset Validation

1. Confirm you no longer need the current local DB state.
2. Run the destructive cleanup flow:
   ```bash
   make nuke
   ```
3. Start the stack again:
   ```bash
   make dev
   ```
4. Re-apply migrations:
   ```bash
   make migrate
   ```
5. Confirm the previous local records are gone and the environment behaves like a fresh DB instance.

## Expected Outcome

- Routine `make down`, `make clean`, and `make dev` cycles reliably preserve local DB state.
- Schema application happens only through the explicit migration workflow.
- Baseline roles and starter users remain available without duplication.
- Host-side SQL inspection works with the documented localhost connection profile.
- Unintentional data loss is prevented; reset requires the explicit `make nuke` destructive path.
