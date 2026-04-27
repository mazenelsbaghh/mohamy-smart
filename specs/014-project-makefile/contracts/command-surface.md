# Contract: Root Operations Command Surface

## Purpose

Define the stable developer-facing contract for the repository's root command surface so implementation can preserve predictable target names, required inputs, safety checks, and observable outcomes.

## General Rules

- Commands are invoked from the repository root.
- Help output must list the supported commands and a short purpose for each.
- Commands that depend on a runtime env file must fail fast with a corrective message when the file is missing.
- Commands that can delete persisted local data must require an explicit confirmation step.
- Commands that require caller input must validate that input before attempting execution.

## Command Reference

### 1. Help

| Target | Required Input | Preconditions | Observable Outcome |
|--------|----------------|---------------|--------------------|
| `make help` | None | None | Lists all public targets with one-line descriptions |

### 2. Full-Stack Lifecycle

| Target | Required Input | Preconditions | Observable Outcome |
|--------|----------------|---------------|--------------------|
| `make dev` | None | `.env.docker` present and valid | Full local stack starts detached; canonical endpoints printed (`http://localhost:8976`, `:5078`, `:5079`, `:3000`) |
| `make down` | None | `.env.docker` present | `docker compose down`; containers stop, volumes preserved |
| `make logs` | None | `.env.docker` present, at least one service is running or loggable | `docker compose logs -f` streams runtime output |
| `make ps` | None | `.env.docker` present | `docker compose ps` lists active services |
| `make build` | None | `.env.docker` present | `docker compose build` rebuilds local images |

### 3. Production-Oriented Lifecycle

| Target | Required Input | Preconditions | Observable Outcome |
|--------|----------------|---------------|--------------------|
| `make prod` | None | `.env.docker.prod` present and valid | `docker compose --env-file .env.docker.prod -f docker-compose.prod.yml up -d --build`; production stack starts |
| `make prod-down` | None | `.env.docker.prod` present | `docker compose --env-file .env.docker.prod -f docker-compose.prod.yml down`; production containers stop |
| `make prod-logs` | None | `.env.docker.prod` present, at least one prod service is running or loggable | `docker compose --env-file .env.docker.prod -f docker-compose.prod.yml logs -f` |
| `make prod-build` | None | `.env.docker.prod` present | `docker compose --env-file .env.docker.prod -f docker-compose.prod.yml build` |

### 4. Service-Scoped Startup

| Target | Required Input | Preconditions | Observable Outcome |
|--------|----------------|---------------|--------------------|
| `make backend` | None | `.env.docker` present | `docker compose up sqlserver backend` — backend + SQL Server only |
| `make lawyer` | None | `.env.docker` present | `docker compose up lawyer-dashboard` |
| `make admin` | None | `.env.docker` present | `docker compose up admin-dashboard` |
| `make landing` | None | `.env.docker` present | `docker compose up landing` |

### 5. Database Workflows

| Target | Required Input | Preconditions | Observable Outcome |
|--------|----------------|---------------|--------------------|
| `make db-shell` | None | `.env.docker` present, SQL Server container is reachable | Opens interactive `sqlcmd` session using credentials from `.env.docker` |
| `make migrate` | None | `.env.docker` present, backend tooling available, DB reachable | `dotnet ef database update --project Lawyer.Infrastracture --startup-project Lawyer` |
| `make migrate-add` | `NAME=<migration>` | Caller provides non-empty `NAME` | `dotnet ef migrations add <NAME> --project Lawyer.Infrastracture --startup-project Lawyer` or validation error |

### 6. Test Workflows

| Target | Required Input | Preconditions | Observable Outcome |
|--------|----------------|---------------|--------------------|
| `make test` | None | All test toolchains available | Runs `test-backend`, `test-lawyer`, `test-admin` sequentially |
| `make test-backend` | None | .NET SDK available | `dotnet test` in backend solution |
| `make test-lawyer` | None | Node.js available in lawyer dashboard | `npm run test -- --run` in lawyer dashboard |
| `make test-admin` | None | Node.js available in admin dashboard | `npm run test -- --run` in admin dashboard |

### 7. Cleanup Workflows

| Target | Required Input | Preconditions | Observable Outcome |
|--------|----------------|---------------|--------------------|
| `make clean` | None | `.env.docker` present | `docker compose down --rmi local --remove-orphans`; removes containers and local images, preserves volumes |
| `make nuke` | Explicit confirmation | `.env.docker` present | Prompts for confirmation, then `docker compose down -v --rmi local --remove-orphans`; removes containers, images, AND volumes |

## Error Contract

- Missing env file errors must tell the caller which template to copy from.
- Missing required arguments must tell the caller which argument is missing and how to provide it.
- Destructive cleanup must warn that persisted local data will be removed before proceeding.
- Commands should surface underlying execution failures rather than silently swallowing them.
