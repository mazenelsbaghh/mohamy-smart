# Quickstart: Project Operations Command Surface

## Purpose

Use the repository root command surface to onboard a developer quickly and keep routine local workflows consistent.

## Prerequisites

- Docker with Compose support is installed and running
- `make` is available in the shell
- Backend and frontend toolchains required by the repository are installed when running non-containerized test or migration commands

## First-Time Setup

1. Copy the tracked Docker environment template:
   ```bash
   cp .env.docker.example .env.docker
   ```
2. Fill `.env.docker` with real secret values required for backend startup.
3. Review `docs/environment-reference.md` if any key is unclear.

## Daily Development Flow

1. Start the full development stack:
   ```bash
   make dev
   ```
2. Confirm the backend, both dashboards, and landing page are reachable on their canonical local ports (shown in the startup output).
3. Use `make ps` or `make logs` when verifying service readiness or troubleshooting startup issues.
4. Stop the stack when finished:
   ```bash
   make down
   ```

## Focused Service Work

1. Start only the backend-focused workflow:
   ```bash
   make backend
   ```
2. Start only the lawyer dashboard, admin dashboard, or landing workflow:
   ```bash
   make lawyer
   make admin
   make landing
   ```
3. Use `make help` to discover the exact target names.

## Database Work

1. Start the required local services:
   ```bash
   make backend
   ```
2. Open the database shell:
   ```bash
   make db-shell
   ```
3. Apply existing schema changes:
   ```bash
   make migrate
   ```
4. Create a new schema change with a required name:
   ```bash
   make migrate-add NAME=AddUserTable
   ```

## Testing

1. Run the unified test command:
   ```bash
   make test
   ```
2. Use targeted test commands for faster feedback:
   ```bash
   make test-backend
   make test-lawyer
   make test-admin
   ```

## Cleanup and Recovery

1. Use the safe cleanup path (preserves data volumes):
   ```bash
   make clean
   ```
2. Use the destructive cleanup path only when a full reset is required:
   ```bash
   make nuke
   ```
3. Confirm the destructive action explicitly when prompted.

## Production-Oriented Operations

1. Copy the production environment template:
   ```bash
   cp .env.docker.prod.example .env.docker.prod
   ```
2. Fill `.env.docker.prod` with real production values.
3. Start the production-oriented stack:
   ```bash
   make prod
   ```
4. Use `make prod-down`, `make prod-logs`, and `make prod-build` for lifecycle management.
