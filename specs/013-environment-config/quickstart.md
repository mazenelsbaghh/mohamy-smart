# Quickstart: Environment Variable Strategy

## Goal

Set up local or production configuration for Mohamy Smart using tracked templates while keeping all real secrets out of version control.

## Local Development

1. Start from the tracked root template for shared Docker and backend-related configuration.
2. Create the untracked local runtime file by copying the local template and supplying real values only where needed.
3. Review each dashboard’s tracked app-level template and create local app values for the public frontend settings it owns.
4. Verify that all local URLs use the canonical local ports before starting the stack.
5. Email and Sentry are the only optional integrations for local development; all other keys must have real values.

## Production Preparation

1. Start from the tracked production template at the repository root.
2. Populate deployment-specific database, authentication, integration, and public URL values.
3. Confirm that callback URLs, frontend URLs, and allowed origins all reference the intended production domains.
4. Supply frontend public API values to the production build process from the documented templates.
5. Store the real production values in deployment-managed secrets or ignored runtime files only.

## Verification Checklist

- No tracked file contains a real secret.
- Required local values are present before onboarding or development testing.
- Required production values are present before release.
- Shared naming remains consistent between root templates and app templates.
- Public endpoint values align across backend, dashboards, landing, and callback configuration.

## Operational Notes

- Root templates own shared infrastructure and backend-facing configuration.
- App templates own frontend public or build-time variables.
- If a new integration is added, update the tracked template that owns that category before relying on the value operationally.
