# Research: Project Operations Command Surface

## Decision 1: Align the Makefile with the repository's existing Docker env file names

- **Decision**: Use `.env.docker` and `.env.docker.prod` as the runtime env files wrapped by the root command surface, with `.env.docker.example` and `.env.docker.prod.example` as the tracked onboarding templates.
- **Rationale**: The repository already contains `docker-compose.yml`, `docker-compose.prod.yml`, and both tracked Docker env examples using these exact names. Aligning the Makefile to them avoids introducing a second naming convention and stays compatible with the current constitution language about Docker-first setup.
- **Alternatives considered**:
  - Adopt `.env.local` and `.env.production` at the root for Docker orchestration. Rejected because it would diverge from the committed Compose files and create duplicate source-of-truth files.
  - Inline environment variables directly in the Makefile. Rejected because it would conflict with Security-First rules and make secrets harder to manage safely.

## Decision 2: Treat the command surface as a wrapper over existing workflows, not a new orchestration system

- **Decision**: The feature should wrap the existing Compose files, backend migration commands, and app test commands rather than re-implementing orchestration logic in custom scripts.
- **Rationale**: The repository already has Compose definitions, Dockerfiles, solution/package entry points, and env templates. The user value comes from discoverability and consistency, not from replacing working operational building blocks.
- **Alternatives considered**:
  - Replace Compose usage with custom shell scripts. Rejected because it increases maintenance surface and duplicates existing infrastructure definitions.
  - Add a dedicated task runner dependency. Rejected because the project already expects `make` and Docker Compose, so an extra tool would raise onboarding friction without clear benefit.

## Decision 3: Keep target names explicit and map them to user intent categories

- **Decision**: Organize targets into categories: full-stack lifecycle, production lifecycle, service-scoped startup, database workflows, testing workflows, cleanup, and help.
- **Rationale**: The feature spec emphasizes discoverability, partial service work, and safe recovery. Grouping commands by operational intent makes the help output easier to scan and keeps the Makefile stable as the main command surface.
- **Alternatives considered**:
  - Use highly abbreviated target names. Rejected because they reduce discoverability for new team members.
  - Expose only one or two generic targets with free-form arguments. Rejected because it shifts complexity onto the caller and weakens contract clarity.

## Decision 4: Separate safe cleanup from destructive cleanup with explicit confirmation

- **Decision**: Provide a non-destructive cleanup path for removing containers and related runtime resources while preserving persisted data, and a separate destructive cleanup path that requires explicit user confirmation before deleting volumes.
- **Rationale**: The constitution and feature spec both require predictable environment recovery without silent data loss. Split workflows make the dangerous path unmistakable.
- **Alternatives considered**:
  - Use a single cleanup command with flags. Rejected because flags are easy to omit or misuse and make destructive behavior less obvious in day-to-day use.
  - Always preserve volumes. Rejected because some support and recovery scenarios require a full reset.

## Decision 5: Document a command contract because the feature exposes a user-facing operational interface

- **Decision**: Create a contract artifact for the command surface even though the feature is internal to the repository.
- **Rationale**: The direct consumer is the development team, and the root command surface is a public interface within the repository. A contract helps keep target names, required inputs, safety rules, and expected outputs stable across implementation and future maintenance.
- **Alternatives considered**:
  - Skip contracts entirely because there is no HTTP API. Rejected because command-driven features still expose stable interfaces and the planning workflow explicitly allows command schemas for this case.
  - Fold the contract into the quickstart only. Rejected because quickstart is tutorial-oriented, while the contract should serve as a normative reference.
