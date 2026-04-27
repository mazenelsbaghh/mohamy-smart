# Contract: Runtime Configuration

## Purpose

Define the required configuration inputs and invariants for the Dockerized local and production-oriented environments.

## Required Inputs

### Local Docker Runtime

- A Docker-local env file must exist before startup.
- The env file must provide:
  - Database administrator password
  - Backend connection and app settings required for startup
  - Public application URLs or origins required for local browser access
  - Any non-secret defaults not already committed safely in source

### Production-Oriented Runtime

- A production Docker env file must exist before startup.
- The env file must provide:
  - Database host and credentials or equivalent external database target information
  - Public backend URL
  - Public lawyer dashboard URL
  - Public admin dashboard URL
  - Public landing URL
  - Any production-only secrets needed by the backend application

## Invariants

- Real secrets must never be committed in version-controlled files.
- Canonical public ports must remain stable across documentation and runtime definitions.
- Local Docker configuration must target the local backend address for frontend-to-backend communication.
- Production-oriented configuration must allow environment-specific public URLs without editing application source files.
- Missing required values must cause a clear startup failure, not a silent fallback.

## Validation Rules

- Startup is invalid if the required Docker env file is absent.
- Startup is invalid if a required secret or URL is empty or still set to a placeholder value.
- Startup is invalid if two services claim the same public port in the same runtime profile.
- Startup is invalid if a frontend package resolves to an unintended backend address for its selected environment.
