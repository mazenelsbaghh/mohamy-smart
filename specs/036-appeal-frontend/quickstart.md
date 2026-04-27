# Quickstart

## Local Development (With Docker)
As mandated by Constitution Principle VII, local development should rely on the automated Makefile wrappers.

1. Ensure Docker is running.
2. Initialize environment configs if this is your first time:
   ```bash
   make setup
   ```
3. Start the entire application stack:
   ```bash
   make dev
   ```
   **Important**: This boots up the SQL Server database container, the .NET Web API Backend, Lawyer Dashboard, Admin Dashboard, and Landing Page.
4. If there are new database migrations, run them in another terminal while `make dev` is active:
   ```bash
   make db-migrate
   ```

5. Access the Lawyer Dashboard at `http://localhost:5078`.

6. Navigate to an existing Case, start the **Appeal Brief** workflow, and step through the 6 generated phases.
