# MOHAMY SMART — Developer Setup Guide

**Estimated setup time**: 15–30 minutes
**Prerequisites**: .NET 9 SDK, Node.js 22+, Git

> **Environment strategy**: This project uses tracked `.env.example` and `appsettings.example.json` templates as the source of truth for configuration. Copy each template to its untracked counterpart (`.env`, `.env.local`, `.env.docker`, `appsettings.Development.json`) and fill in real values. Untracked files are excluded from version control via `.gitignore`. The complete variable reference, ownership boundaries, and key-to-file mapping are maintained in [`docs/environment-reference.md`](environment-reference.md) — consult that document instead of this guide for per-key details.

---

## Port Reference (DEC-001)

| Component        | Port  | Directory                      |
|------------------|-------|--------------------------------|
| Backend (.NET)   | 8976  | `mohamy-smart-backend/`        |
| Lawyer Dashboard | 5078  | `mohamy-smart-lawyer-dashboard/` |
| Admin Dashboard  | 5079  | `mohamy-smart-admin-dashboard/` |
| Landing Page     | 3000  | `mohamy-smart-landing/`        |

---

## 1. Clone the repository

```bash
git clone <repo-url>
cd mohamy-smart
git submodule update --init --recursive
```

---

## 2. Backend setup

### 2a. Create local secrets file

Copy the tracked example into an untracked local file:

```bash
cp mohamy-smart-backend/Lawyer/appsettings.example.json mohamy-smart-backend/Lawyer/appsettings.Development.json
```

Edit `appsettings.Development.json` and replace placeholder values with real secrets. This file is **git-ignored** — it will never be committed.

See [`appsettings.example.json`](../mohamy-smart-backend/Lawyer/appsettings.example.json) for the full list of keys and their descriptions.

If you set `GoogleVision:ApiKey`, the OCR endpoint will use Google Vision as the primary OCR engine and fall back to local Tesseract when Google Vision is unavailable or returns an error. If you leave it empty, OCR will use local Tesseract only.

### 2b. Run the backend

```bash
cd mohamy-smart-backend
dotnet restore
dotnet run --project Lawyer
```

Expected output: `Now listening on: http://localhost:8976`

### 2c. Test the OCR endpoint with a real Arabic image

After obtaining a valid bearer token, hit the OCR endpoint with:

```bash
cd mohamy-smart-backend/Lawyer
bash scripts/test_ocr_endpoint.sh http://localhost:8976 YOUR_BEARER_TOKEN /absolute/path/to/arabic-sample.jpg
```

---

## 3. Lawyer Dashboard setup

### 3a. Create `.env`

```bash
cp mohamy-smart-lawyer-dashboard/.env.example mohamy-smart-lawyer-dashboard/.env
```

The `.env` file contains public build-time values (API base URL, optional Sentry DSN). See [`mohamy-smart-lawyer-dashboard/.env.example`](../mohamy-smart-lawyer-dashboard/.env.example) for details.

### 3b. Install and run

```bash
cd mohamy-smart-lawyer-dashboard
npm install
npm run dev
```

Expected output: `Local: http://localhost:5078/`

---

## 4. Admin Dashboard setup

### 4a. Create `.env`

```bash
cp mohamy-smart-admin-dashboard/.env.example mohamy-smart-admin-dashboard/.env
```

See [`mohamy-smart-admin-dashboard/.env.example`](../mohamy-smart-admin-dashboard/.env.example) for the tracked template.

### 4b. Install and run

```bash
cd mohamy-smart-admin-dashboard
npm install
npm run dev
```

Expected output: `Local: http://localhost:5079/`

---

## 5. Landing Page setup

### 5a. Create `.env.local`

```bash
cp mohamy-smart-landing/.env.example mohamy-smart-landing/.env.local
```

See [`mohamy-smart-landing/.env.example`](../mohamy-smart-landing/.env.example) for the tracked template.

### 5b. Install and run

```bash
cd mohamy-smart-landing
npm install
npm run dev
```

Expected output: `Local: http://localhost:3000/`

---

## 6. Credential scan verification

After making any changes, run this to ensure no secrets are committed:

```bash
git grep -n "<REDACTED_SEARCH_PATTERNS>" -- "*.json" "*.ts" "*.tsx" "*.env" ":!*.Development.json"
```

This must return **zero results**. If any results appear, the file must be edited to remove the real value before committing.

---

## 7. Local Database

### Persistence and Reset

The local SQL Server database uses a Docker volume (`mohamy-sqlserver-data`) to persist your data between sessions.

- **`make down`**: Stops containers but **preserves** the database state. Starting again with `make dev` will restore your data.
- **`make clean`**: Removes containers and local images but **preserves** the database state.
- **`make nuke`**: Removes everything, including the database data volume. The next `make dev` will create a fresh, empty database.

### Initialization and Seeding

The database relies on Entity Framework Core migrations. We do **not** apply migrations automatically at startup.
On your very first run (or after pulling new database schema changes), the backend will fail to start until migrations are applied. You must explicitly apply them:

```bash
make migrate
```

After the schema is created, you must restart the backend container so its idempotent seeder can execute:

```bash
docker compose restart backend
```

Once restarted, baseline accounts (`Admin@Lawyer.com` and `Lawyer22@gmail.com`) will be available for sign-in.

### External Inspection

You can connect to the local SQL Server using any external database client (like Azure Data Studio or DBeaver) with these settings:

- **Host**: `localhost,1433`
- **Database**: `Lawyer`
- **User**: `sa`
- **Password**: The value of `MSSQL_SA_PASSWORD` from your `.env.docker` file
- **Trust Server Certificate**: `true` (Enabled)

This connects directly to the active Docker container.

---

## Architecture Decisions

All decisions are documented in `docs/decisions.md`. Key points:

- **Secrets**: `appsettings.Development.json` (git-ignored) for backend. `.env` (git-ignored) for frontends. `.env.docker` (git-ignored) for Docker stack.
- **Email**: Not configured. Phone OTP only. Placeholder exists in config.
- **Contact Form**: Disabled. Shows static message.
- **Notifications**: In-app only. No email/push.
- **API separation**: Shared endpoints with role-based authorization.
- **Testimonials**: Static in Landing Page code.

---

## Docker Local Setup

### Create Docker environment

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` and replace placeholder values with real secrets. See [`.env.docker.example`](../.env.docker.example) for the full list of keys grouped by category.

### Start the stack

```bash
make dev
```

This starts SQL Server, backend, lawyer dashboard, admin dashboard, and landing page using the ports defined in the Port Reference table above. After startup, canonical endpoints are displayed.

### Inspect and manage the stack

```bash
make ps              # List running services
make logs            # Stream runtime output
make build           # Rebuild images after code changes
make down            # Stop the stack (preserves data)
```

### Start individual services

```bash
make backend         # Backend + SQL Server only
make lawyer          # Lawyer dashboard only
make admin           # Admin dashboard only
make landing         # Landing page only
```

### Database operations

```bash
make db-shell        # Open interactive SQL shell
make migrate         # Apply pending EF Core migrations
make migrate-add NAME=AddUserTable   # Create a new migration
```

### Run tests

```bash
make test            # Run all tests (backend + dashboards)
make test-backend    # Backend tests only
make test-lawyer     # Lawyer dashboard tests only
make test-admin      # Admin dashboard tests only
```

### Cleanup

```bash
make clean           # Remove containers & images (keeps data volumes)
make nuke            # Remove everything including data volumes (prompts for confirmation)
```

---

## Docker Production Setup

### Create production environment

```bash
cp .env.docker.prod.example .env.docker.prod
```

Edit `.env.docker.prod` and replace **all** placeholder values with real production secrets. Every section marked REQUIRED must be populated before deployment.

### Pre-deployment checks

Before starting the production stack, verify:

1. **Callback URL alignment**: `Paymob__CallbackBaseUrl` matches `AppSetting__BaseUrl`
2. **CORS alignment**: `CorsOrigins__*` entries match the actual deployed frontend domains
3. **Frontend build args**: `VITE_LAWYER_API_URL`, `VITE_ADMIN_API_URL`, and `NEXT_PUBLIC_API_BASE_URL` all point to the production backend API
4. **Domain consistency**: `FrontendBaseUrl`, `LAWYER_DASHBOARD_URL`, `ADMIN_DASHBOARD_URL`, and `LANDING_URL` match the actual deployed domains

### Start the production stack

```bash
make prod
```

### Manage the production stack

```bash
make prod-down       # Stop the production stack
make prod-logs       # Stream production logs
make prod-build      # Rebuild production images
```

See [`.env.docker.prod.example`](../.env.docker.prod.example) and [`docs/environment-reference.md`](environment-reference.md) for the complete production variable reference.

### Discover all commands

```bash
make help
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Kill the process: `lsof -ti:<port> \| xargs kill` |
| Backend not loading appsettings.Development.json | Verify `ASPNETCORE_ENVIRONMENT=Development` in launchSettings.json |
| `strictPort` error | Another process is using the port — kill it, don't change the port |
| npm install fails | Delete `node_modules` and `package-lock.json`, then retry |
