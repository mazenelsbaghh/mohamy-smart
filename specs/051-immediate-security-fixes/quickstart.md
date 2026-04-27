# Quickstart Guide

For developers onboarding to the project or recovering from the credential rotation:

1. Request the newly generated credentials from the security administrator.
2. Ensure you have the `appsettings.Development.json`, `.env.docker`, and `.env.local` files securely copied locally.
3. Make sure to run `make setup` and verify that the local containers start without errors using the new keys:
   ```bash
   make dev
   ```
