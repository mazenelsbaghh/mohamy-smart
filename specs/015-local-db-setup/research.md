# Research: Local Database Setup

## Decision 1: Treat the current repository command surface as the source of truth for local DB lifecycle

- **Decision**: Use the existing root `Makefile` and `docker-compose.yml` as the authoritative contract for local database behavior instead of copying the older wording from `plan v2.md` verbatim.
- **Rationale**: The repository already exposes real commands such as `make dev`, `make down`, `make migrate`, and `make db-shell`, and the current env key is `MSSQL_SA_PASSWORD`, not `SQL_SA_PASSWORD`. Planning against the implemented command surface prevents documentation drift and avoids designing to outdated names.
- **Alternatives considered**:
  - Use `plan v2.md` literal command and variable names as-is. Rejected because that would propagate stale names and weaken operator trust.
  - Define a brand-new command surface just for local DB operations. Rejected because the repository already has a shared operational entry point.

## Decision 2: Keep migrations manual and keep seeding as an idempotent startup concern

- **Decision**: Preserve the split where schema changes are applied only through the explicit migration workflow, while baseline roles and starter users are seeded during backend startup in an idempotent way.
- **Rationale**: The spec requires no automatic migrations at container startup, but it also needs a predictable first-run sign-in experience. The current backend already creates roles and starter accounts only when they do not yet exist, which satisfies repeat-start expectations without duplicating seed data.
- **Alternatives considered**:
  - Run migrations automatically during backend startup. Rejected because it violates the feature scope and the constitution's infrastructure rules.
  - Move all seed data to a fully manual command. Rejected because it would add onboarding friction and diverge from the current backend behavior without clear user benefit.

## Decision 3: Define persistence in terms of the named SQL Server volume mounted at `/var/opt/mssql`

- **Decision**: Treat the named Docker volume `mohamy-sqlserver-data` as the persistence boundary for both database files and SQL Server operational logs.
- **Rationale**: The current `docker-compose.yml` mounts the entire `/var/opt/mssql` path into that named volume, which covers both the data directory and SQL Server's own operational files. This means normal `make down` / restart cycles preserve state, while destructive cleanup remains the only supported reset path.
- **Alternatives considered**:
  - Document persistence only for database rows and ignore SQL Server operational history. Rejected because the feature spec explicitly includes troubleshooting continuity.
  - Use bind mounts instead of named volumes as the main contract. Rejected because the repository already standardizes on named volumes for local reproducibility.

## Decision 4: External database access should be documented as a localhost client workflow using secrets from `.env.docker`

- **Decision**: The external connection contract should use `localhost,1433`, database `Lawyer`, user `sa`, and a password sourced from `MSSQL_SA_PASSWORD` in `.env.docker`.
- **Rationale**: That is the actual local runtime contract exposed by `docker-compose.yml` and reused by `make db-shell`. Keeping external-client documentation aligned with the same values reduces confusion and ensures developers inspect the same database instance the app uses.
- **Alternatives considered**:
  - Document the internal Compose hostname `sqlserver` for all access. Rejected because tools running outside Docker on the host machine should use the published localhost port instead.
  - Hardcode a sample password in documentation. Rejected because it conflicts with Security-First rules and invites broken local setups.

## Decision 5: Validate this feature primarily through operational smoke flows and documentation consistency checks

- **Decision**: Use smoke validation around `make dev`, `make migrate`, `make down`, `make db-shell`, repeat startup, and host-side external SQL access as the main acceptance path.
- **Rationale**: This feature is mostly about lifecycle correctness and operational clarity, not new business logic. The highest-value verification is proving that the documented workflow matches what the repo actually does.
- **Alternatives considered**:
  - Rely only on static document review. Rejected because persistence and startup semantics are better verified through observable workflows.
  - Introduce a new automated integration harness in this phase. Rejected because it expands scope beyond the planning need and is not required to define the implementation shape.
