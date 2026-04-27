# Environment Configuration Contract

## Purpose

Define the repository contract for tracked environment templates, untracked real-value files, and ownership boundaries across backend, dashboards, landing, and Docker orchestration.

## Contract Summary

1. Root-level tracked templates define shared infrastructure and deployment-facing configuration.
2. App-level tracked templates define only the public or build-time values owned by that app.
3. Real secret values must be supplied through ignored files or deployment environment settings.
4. Naming conventions must stay stable and match the consuming runtime’s binding behavior.

## Contract Surfaces

### Root-Level Shared Templates

**Tracked artifacts**:
- `.env.docker.example`
- `.env.docker.prod.example`

**Contract**:
- These files document shared runtime configuration for backend services, Docker orchestration, infrastructure-level URLs, and cross-application settings.
- They must include placeholder-only values for secrets.
- They must express canonical local ports and explicit production URLs where relevant.
- They are the source of truth for shared settings such as database connectivity, JWT configuration, AI providers, payment integration, email delivery, monitoring, and CORS/public endpoints.

### App-Level Frontend Templates

**Tracked artifacts**:
- `mohamy-smart-admin-dashboard/.env.example`
- `mohamy-smart-lawyer-dashboard/.env.example`

**Contract**:
- These files document build-time or public app-specific values only.
- They must not become a second source of truth for backend secrets.
- They must identify the API base URL required by the app and any optional public monitoring configuration.

### Real-Value Runtime Inputs

**Untracked artifacts or deployment inputs**:
- `.env.docker`
- `.env.docker.prod`
- local frontend `.env` or `.env.local` files where applicable
- deployment environment variables or secret manager inputs

**Contract**:
- These inputs carry real values and must remain excluded from version control.
- They must be instantiations of the tracked templates rather than independent undocumented configurations.

## Variable Categories

The configuration contract must account for these groups where applicable:

- Database access
- JWT/authentication
- AI providers
- Payment integration
- Email delivery
- Error monitoring
- Public application URLs
- Callback and CORS origins
- Frontend API base URLs

## Required Behaviors

- A missing required value must be detectable before the system is treated as ready.
- Optional integrations must be distinguishable from required release-blocking settings.
- Shared values must not drift between root templates and app templates.
- Public URLs must remain aligned with the active runtime profile.

## Change Rules

- New shared environment keys must be added to the relevant root template first.
- New frontend-only public keys must be added to the relevant app-level template.
- Changes to variable names require updating all affected templates and any startup or build-time validation expectations in the same change set.
