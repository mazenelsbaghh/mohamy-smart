# Research: Docker Setup

## Decision 1: Use Docker-specific root env files instead of reusing generic local env names

- **Decision**: Standardize Docker orchestration on `.env.docker` for local Docker runs and `.env.docker.prod` for production-oriented runs, while committing `.env.docker.example` and `.env.docker.prod.example`.
- **Rationale**: The constitution explicitly reserves Docker secrets for those filenames and separates them from non-Docker local env usage. This keeps Docker onboarding predictable and avoids mixing Part B container concerns with Part C broader environment strategy.
- **Alternatives considered**:
  - Reuse `.env.local` and `.env.production`: rejected because those names are already overloaded across frontend and backend workflows and conflict with the constitution’s Docker-specific secret policy.
  - Store real values directly in compose files: rejected because it violates Security-First rules and makes environment switching error-prone.

## Decision 2: Keep two compose entrypoints, one for local development and one for production-oriented packaging

- **Decision**: Use `docker-compose.yml` as the local baseline and `docker-compose.prod.yml` as the production-oriented definition.
- **Rationale**: The feature spec requires separate behaviors for development and production. Local mode needs source feedback, a bundled SQL Server container, and development runtimes; production mode needs built artifacts, restart policies, and the ability to target an external database.
- **Alternatives considered**:
  - Single compose file with many profiles and conditionals: rejected because it increases operator ambiguity and makes the local-vs-production intent harder to audit.
  - Completely separate per-service startup documentation without a shared compose contract: rejected because it undermines the “single coordinated workspace” requirement.

## Decision 3: Use multi-stage images for every service package

- **Decision**: The backend will use build and runtime stages; each frontend will use development, build, and production stages.
- **Rationale**: Multi-stage images satisfy the constitution, improve cacheability, reduce production image size, and clearly separate local development behavior from production runtime behavior.
- **Alternatives considered**:
  - Single-stage images: rejected because they carry unnecessary tooling into production and slow down rebuilds.
  - Run production directly from development servers: rejected because that would preserve development-only behavior in release environments.

## Decision 4: Serve the two dashboards and the landing site as static assets in production

- **Decision**: Serve the lawyer dashboard, admin dashboard, and landing app from static web server images in production-oriented mode.
- **Rationale**: The current app setup already supports Vite-built dashboards and a statically exported Next.js landing experience. Static serving aligns with the feature spec and reduces operational complexity.
- **Alternatives considered**:
  - Keep Node-based runtime containers for all frontends in production: rejected because the landing app does not require it and the dashboards can be served more simply as built assets.
  - Add a reverse-proxy gateway as part of this feature: rejected because it expands scope beyond Part B and is not required to satisfy the current spec.

## Decision 5: Gate backend startup on database readiness and persist SQL Server data in a named volume

- **Decision**: The local Docker workspace will wait for the database health contract before backend startup, and SQL Server data will live in a named volume that survives routine stack restarts.
- **Rationale**: This directly addresses the spec’s persistence and startup-reliability requirements while matching constitution guidance that local SQL Server must run in Docker with persistent storage.
- **Alternatives considered**:
  - Start all services simultaneously without readiness checks: rejected because it makes startup failures noisy and non-deterministic.
  - Use a bind mount for database persistence: rejected because named volumes are less host-specific and better for team reproducibility.

## Decision 6: Treat backend runtime assets as an explicit packaging concern

- **Decision**: The backend image design will require project configuration to copy runtime assets such as fonts and OCR data into the published output.
- **Rationale**: The feature scope includes reliable backend startup inside containers, and the existing codebase depends on non-code assets. Capturing this now avoids a class of container-only runtime failures.
- **Alternatives considered**:
  - Assume the publish output already includes all assets: rejected because the current repository state does not prove that guarantee.
  - Defer asset packaging to a later bug-fix task: rejected because that would leave the main Docker feature incomplete and brittle.
