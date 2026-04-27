# Quickstart: Docker Setup

## Purpose

Validate the Docker setup feature from a fresh checkout once implementation is complete.

## Prerequisites

- Docker Desktop or an equivalent Docker runtime is installed and running
- Required local secrets are available to populate Docker env files
- The repository has been cloned locally

## Local Development Validation

1. Create `.env.docker` from `.env.docker.example` and fill in the required local values.
2. Start the local stack with the documented local compose command.
3. Wait until the database and backend report healthy startup.
4. Open the canonical local addresses for:
   - Backend
   - Lawyer Dashboard
   - Admin Dashboard
   - Landing app
5. Confirm each frontend uses the local backend target rather than an external environment.
6. Create representative application data, stop the stack, then start it again.
7. Confirm the data still exists after restart.

## Production-Oriented Validation

1. Create `.env.docker.prod` from `.env.docker.prod.example` and supply production-like values.
2. Build and start the production-oriented compose definition.
3. Confirm each frontend surface loads from its built runtime package.
4. Confirm the backend starts with production-oriented configuration and connects to the configured database target.
5. Confirm direct browser navigation and refresh actions still resolve correctly on each user-facing web app.

## Failure Validation

1. Remove one required env value and confirm startup fails with an actionable error.
2. Occupy one canonical port before startup and confirm the conflicting service does not silently choose another port.
3. Delay or interrupt database availability and confirm dependent services do not report healthy startup prematurely.

## Expected Outcome

- The full local stack is reproducible for developers.
- The production-oriented package is reproducible for release validation.
- Persistence, port consistency, and startup diagnostics all behave according to the feature spec.
