# Environment Variable Reference

**Purpose**: Central reference for every tracked environment template, ownership boundaries, naming rules, and key-to-file mapping across the Mohamy Smart platform.

**Audience**: Developers setting up local environments, operators preparing production deployments, and maintainers adding or renaming configuration keys.

---

## Tracked Templates

| Template | Scope | Owner | Usage |
|----------|-------|-------|-------|
| `.env.docker.example` | Shared infrastructure (local) | Platform / DevOps | Copy to `.env.docker` for local Docker stack |
| `.env.docker.prod.example` | Shared infrastructure (production) | Platform / DevOps | Copy to `.env.docker.prod` for production Docker stack |
| `mohamy-smart-backend/Lawyer/appsettings.example.json` | Backend runtime | Backend team | Reference for `appsettings.Development.json` or `appsettings.Production.json` |
| `mohamy-smart-lawyer-dashboard/.env.example` | Lawyer dashboard build-time | Frontend team | Copy to `.env` for local development |
| `mohamy-smart-admin-dashboard/.env.example` | Admin dashboard build-time | Frontend team | Copy to `.env` for local development |
| `mohamy-smart-landing/.env.example` | Landing page build-time | Frontend team | Copy to `.env.local` for local development |

## Ownership Rules

- **Root templates** (`.env.docker.example`, `.env.docker.prod.example`) own shared infrastructure settings: database connectivity, JWT, AI providers, Paymob, CORS, email, Sentry, and public application URLs.
- **App-level templates** own only public, build-time frontend values such as API base URLs and optional monitoring DSNs.
- **Backend template** (`appsettings.example.json`) documents backend-owned runtime settings that map to the same keys consumed through Docker environment variables.
- Real secret values must only exist in untracked files or deployment-managed secret stores.

## Naming Rules

- Backend keys use `__` (double underscore) for nested configuration: `ConnectionStrings__SqlServer`, `JWT__Key`, `OpenAI__ApiKey`.
- Frontend public keys use the framework-native prefix: `VITE_*` for Vite apps, `NEXT_PUBLIC_*` for Next.js apps.
- Port and URL variable names follow `UPPER_SNAKE_CASE`.
- Shared keys must use identical names across all templates that reference them.

## Variable Categories

| Category | Keys | Sensitivity | Required (Local) | Required (Prod) |
|----------|------|-------------|-------------------|-----------------|
| Database access | `MSSQL_SA_PASSWORD`, `ConnectionStrings__SqlServer` | Secret | Yes | Yes |
| JWT / Authentication | `JWT__Key` | Secret | Yes | Yes |
| AI Providers | `OpenAI__ApiKey`, `Gemini__ApiKey` | Secret | Yes | Yes |
| Payment Integration | `Paymob__APIKey`, `Paymob__SecretKey`, `Paymob__PublicKey`, `Paymob__HMAC`, `Paymob__CardIntegrationId`, `Paymob__MobileIntegrationId`, `Paymob__CallbackBaseUrl` | Secret (except `PublicKey`) | Yes | Yes |
| Email Delivery | `EmailSettings__SmtpHost`, `EmailSettings__SmtpPort`, `EmailSettings__SmtpUser`, `EmailSettings__SmtpPassword`, `EmailSettings__FromAddress`, `EmailSettings__FromName`, `EmailSettings__UseSsl` | Secret (`SmtpUser`, `SmtpPassword`) | Optional | Yes |
| Error Monitoring | `Sentry__Dsn`, `Sentry__Environment`, `Sentry__TracesSampleRate` | Internal (`Dsn`) | Optional | Optional |
| Public Application URLs | `FrontendBaseUrl`, `CorsOrigins__0`, `CorsOrigins__1`, `CorsOrigins__2` | Public | Yes | Yes |
| Frontend API Base URLs | `VITE_API_BASE_URL`, `NEXT_PUBLIC_API_BASE_URL` | Public | Yes | Yes |
| Frontend Monitoring | `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT` | Public | Optional | Optional |
| Port Overrides | `BACKEND_PORT`, `LAWYER_PORT`, `ADMIN_PORT`, `LANDING_PORT` | Public | N/A (not in local) | Optional |
| Backend Base URL | `AppSetting__BaseUrl` | Public | Yes | Yes |

### File Ownership Boundaries

| File | Owns These Groups |
|------|------------------|
| `.env.docker.example` | All groups above (local profile) |
| `.env.docker.prod.example` | All groups above (production profile), plus port overrides and frontend build-arg passthrough |
| `appsettings.example.json` | Backend runtime equivalents of database, JWT, AI, Paymob, email, Sentry, base URL |
| `mohamy-smart-lawyer-dashboard/.env.example` | `VITE_API_BASE_URL`, `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT` |
| `mohamy-smart-admin-dashboard/.env.example` | `VITE_API_BASE_URL`, `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT` |
| `mohamy-smart-landing/.env.example` | `NEXT_PUBLIC_API_BASE_URL` |

---

## Local Profile

See [Local Profile Matrix](#local-profile-matrix) below for a complete key-by-file listing.

## Production Profile

See [Production Profile Matrix](#production-profile-matrix) below for a complete key-by-file listing.

---

## Local Profile Matrix

| Key | Owning File | Consumer | Required | Sensitivity |
|-----|------------|----------|----------|-------------|
| `MSSQL_SA_PASSWORD` | `.env.docker.example` → `.env.docker` | sqlserver container | Yes | Secret |
| `ConnectionStrings__SqlServer` | `.env.docker.example` → `.env.docker` | backend container | Yes | Secret |
| `AppSetting__BaseUrl` | `.env.docker.example` → `.env.docker` | backend container | Yes | Public |
| `JWT__Key` | `.env.docker.example` → `.env.docker` | backend container | Yes | Secret |
| `OpenAI__ApiKey` | `.env.docker.example` → `.env.docker` | backend container | Yes | Secret |
| `Gemini__ApiKey` | `.env.docker.example` → `.env.docker` | backend container | Yes | Secret |
| `Paymob__APIKey` | `.env.docker.example` → `.env.docker` | backend container | Yes | Secret |
| `Paymob__SecretKey` | `.env.docker.example` → `.env.docker` | backend container | Yes | Secret |
| `Paymob__PublicKey` | `.env.docker.example` → `.env.docker` | backend container | Yes | Public |
| `Paymob__HMAC` | `.env.docker.example` → `.env.docker` | backend container | Yes | Secret |
| `Paymob__CardIntegrationId` | `.env.docker.example` → `.env.docker` | backend container | Yes | Public |
| `Paymob__MobileIntegrationId` | `.env.docker.example` → `.env.docker` | backend container | Yes | Public |
| `Paymob__CallbackBaseUrl` | `.env.docker.example` → `.env.docker` | backend container | Yes | Public |
| `FrontendBaseUrl` | `.env.docker.example` → `.env.docker` | backend container | Yes | Public |
| `CorsOrigins__0` | `.env.docker.example` → `.env.docker` | backend container | Yes | Public |
| `CorsOrigins__1` | `.env.docker.example` → `.env.docker` | backend container | Yes | Public |
| `CorsOrigins__2` | `.env.docker.example` → `.env.docker` | backend container | Yes | Public |
| `EmailSettings__SmtpHost` | `.env.docker.example` → `.env.docker` | backend container | Optional | Internal |
| `EmailSettings__SmtpPort` | `.env.docker.example` → `.env.docker` | backend container | Optional | Internal |
| `EmailSettings__SmtpUser` | `.env.docker.example` → `.env.docker` | backend container | Optional | Secret |
| `EmailSettings__SmtpPassword` | `.env.docker.example` → `.env.docker` | backend container | Optional | Secret |
| `EmailSettings__FromAddress` | `.env.docker.example` → `.env.docker` | backend container | Optional | Public |
| `EmailSettings__FromName` | `.env.docker.example` → `.env.docker` | backend container | Optional | Public |
| `EmailSettings__UseSsl` | `.env.docker.example` → `.env.docker` | backend container | Optional | Public |
| `Sentry__Dsn` | `.env.docker.example` → `.env.docker` | backend container | Optional | Internal |
| `Sentry__Environment` | `.env.docker.example` → `.env.docker` | backend container | Optional | Public |
| `Sentry__TracesSampleRate` | `.env.docker.example` → `.env.docker` | backend container | Optional | Public |
| `VITE_API_BASE_URL` | `mohamy-smart-lawyer-dashboard/.env.example` → `.env` | lawyer-dashboard | Yes | Public |
| `VITE_API_BASE_URL` | `mohamy-smart-admin-dashboard/.env.example` → `.env` | admin-dashboard | Yes | Public |
| `VITE_SENTRY_DSN` | `mohamy-smart-lawyer-dashboard/.env.example` → `.env` | lawyer-dashboard | Optional | Public |
| `VITE_SENTRY_ENVIRONMENT` | `mohamy-smart-lawyer-dashboard/.env.example` → `.env` | lawyer-dashboard | Optional | Public |
| `VITE_SENTRY_DSN` | `mohamy-smart-admin-dashboard/.env.example` → `.env` | admin-dashboard | Optional | Public |
| `VITE_SENTRY_ENVIRONMENT` | `mohamy-smart-admin-dashboard/.env.example` → `.env` | admin-dashboard | Optional | Public |
| `NEXT_PUBLIC_API_BASE_URL` | `mohamy-smart-landing/.env.example` → `.env.local` | landing | Yes | Public |
| `NEXT_PUBLIC_DASHBOARD_URL` | `mohamy-smart-landing/.env.local` | landing | Yes | Public |

## Production Profile Matrix

| Key | Owning File | Consumer | Required | Secret/Public |
|-----|------------|----------|----------|---------------|
| `ConnectionStrings__SqlServer` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Secret |
| `JWT__Key` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Secret |
| `OpenAI__ApiKey` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Secret |
| `Gemini__ApiKey` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Secret |
| `Paymob__APIKey` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Secret |
| `Paymob__SecretKey` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Secret |
| `Paymob__PublicKey` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Public |
| `Paymob__HMAC` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Secret |
| `Paymob__CardIntegrationId` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Public |
| `Paymob__MobileIntegrationId` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Public |
| `Paymob__CallbackBaseUrl` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Public |
| `EmailSettings__SmtpHost` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Internal |
| `EmailSettings__SmtpPort` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Internal |
| `EmailSettings__SmtpUser` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Secret |
| `EmailSettings__SmtpPassword` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Secret |
| `EmailSettings__FromAddress` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Public |
| `EmailSettings__FromName` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Public |
| `EmailSettings__UseSsl` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Public |
| `AppSetting__BaseUrl` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Public |
| `FrontendBaseUrl` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Public |
| `CorsOrigins__0` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Public |
| `CorsOrigins__1` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Public |
| `CorsOrigins__2` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Yes | Public |
| `VITE_LAWYER_API_URL` | `.env.docker.prod.example` → `.env.docker.prod` | lawyer-dashboard build arg | Yes | Public |
| `VITE_ADMIN_API_URL` | `.env.docker.prod.example` → `.env.docker.prod` | admin-dashboard build arg | Yes | Public |
| `NEXT_PUBLIC_API_BASE_URL` | `.env.docker.prod.example` → `.env.docker.prod` | landing build arg | Yes | Public |
| `LAWYER_DASHBOARD_URL` | `.env.docker.prod.example` → `.env.docker.prod` | informational (nginx/CORS) | No | Public |
| `ADMIN_DASHBOARD_URL` | `.env.docker.prod.example` → `.env.docker.prod` | informational (nginx/CORS) | No | Public |
| `LANDING_URL` | `.env.docker.prod.example` → `.env.docker.prod` | informational (nginx/CORS) | No | Public |
| `Sentry__Dsn` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Optional | Internal |
| `Sentry__Environment` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Optional | Public |
| `Sentry__TracesSampleRate` | `.env.docker.prod.example` → `.env.docker.prod` | backend container | Optional | Public |
| `BACKEND_PORT` | `.env.docker.prod.example` → `.env.docker.prod` | docker-compose port mapping | Optional | Public |
| `LAWYER_PORT` | `.env.docker.prod.example` → `.env.docker.prod` | docker-compose port mapping | Optional | Public |
| `ADMIN_PORT` | `.env.docker.prod.example` → `.env.docker.prod` | docker-compose port mapping | Optional | Public |
| `LANDING_PORT` | `.env.docker.prod.example` → `.env.docker.prod` | docker-compose port mapping | Optional | Public |
| `VITE_LAWYER_SENTRY_DSN` | `.env.docker.prod.example` → `.env.docker.prod` | lawyer-dashboard build arg | Optional | Public |
| `VITE_LAWYER_SENTRY_ENVIRONMENT` | `.env.docker.prod.example` → `.env.docker.prod` | lawyer-dashboard build arg | Optional | Public |
| `VITE_ADMIN_SENTRY_DSN` | `.env.docker.prod.example` → `.env.docker.prod` | admin-dashboard build arg | Optional | Public |
| `VITE_ADMIN_SENTRY_ENVIRONMENT` | `.env.docker.prod.example` → `.env.docker.prod` | admin-dashboard build arg | Optional | Public |

## Local Database Reference

### Persistence and Destructive Reset

The local SQL Server uses the `mohamy-sqlserver-data` mapped volume. Routine teardown via `make down` or `make clean` guarantees data retention. Use `make nuke` to perform a destructive reset that permanently deletes the volume contents.

### Initialization and Baseline Accounts

Database initialization requires explicit schema application (`make migrate`). After the schema is created, the backend automatically seeds idempotent baseline roles (`Admin` and `Lawyer`) and starter user accounts (`Admin@Lawyer.com` and `Lawyer22@gmail.com`) to provide immediate, consistent access paths.

### Host-Side External Access

External SQL clients connecting to the local database at `localhost,1433` must authenticate as the `sa` user using the `MSSQL_SA_PASSWORD` value defined in `.env.docker`. This password must remain untracked to satisfy security invariants while allowing host-side inspection.

---

## Source of Truth by File

### `.env.docker.example` (Local Shared Infrastructure)

Owns all shared local infrastructure keys: database, JWT, AI, Paymob, CORS, email, Sentry, backend base URL. This is the only file operators need to copy for local Docker setup.

**Keys owned**: `MSSQL_SA_PASSWORD`, `ConnectionStrings__SqlServer`, `AppSetting__BaseUrl`, `JWT__Key`, `OpenAI__ApiKey`, `Gemini__ApiKey`, `Paymob__*`, `FrontendBaseUrl`, `CorsOrigins__*`, `EmailSettings__*`, `Sentry__*`

### `.env.docker.prod.example` (Production Shared Infrastructure)

Owns all shared production infrastructure keys plus frontend build-arg passthrough and optional port overrides. This is the only file operators need to copy for production Docker setup.

**Keys owned**: All keys from `.env.docker.example` (with production values) plus `VITE_LAWYER_API_URL`, `VITE_ADMIN_API_URL`, `NEXT_PUBLIC_API_BASE_URL`, `LAWYER_DASHBOARD_URL`, `ADMIN_DASHBOARD_URL`, `LANDING_URL`, `BACKEND_PORT`, `LAWYER_PORT`, `ADMIN_PORT`, `LANDING_PORT`

### `mohamy-smart-backend/Lawyer/appsettings.example.json` (Backend Runtime)

Documents the JSON-structured equivalents of backend-owned environment variables. Used when running the backend outside Docker (standalone `dotnet run`). Keys map to the same ASP.NET Core configuration paths as the `__`-delimited Docker env vars.

**Keys owned**: `ConnectionStrings.SqlServer`, `AppSetting.BaseUrl`, `OpenAI.ApiKey`, `Gemini.ApiKey`, `Paymob.*`, `JWT.Key`, `EmailSettings.*`, `Sentry.*`

### `mohamy-smart-lawyer-dashboard/.env.example` (Lawyer Dashboard Build-Time)

Owns only public, build-time Vite environment variables for the lawyer dashboard.

**Keys owned**: `VITE_API_BASE_URL`, `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT`

### `mohamy-smart-admin-dashboard/.env.example` (Admin Dashboard Build-Time)

Owns only public, build-time Vite environment variables for the admin dashboard.

**Keys owned**: `VITE_API_BASE_URL`, `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT`

### `mohamy-smart-landing/.env.example` (Landing Page Build-Time)

Owns only the public, build-time Next.js environment variable for the landing page API base URL. The landing app does not integrate Sentry, so no `NEXT_PUBLIC_SENTRY_*` keys exist.

**Keys owned**: `NEXT_PUBLIC_API_BASE_URL`

**Additional local keys** (not in `.env.example`): `NEXT_PUBLIC_DASHBOARD_URL` — the lawyer dashboard URL used for post-registration redirects. Set in `.env.local`.

## User Registration Setup

### Registration Flow

The user registration feature is hosted in `mohamy-smart-landing` (Next.js) at `/register/`. Upon successful registration, users are redirected to the lawyer dashboard login page.

**API Endpoint**: `POST /api/auth/register` — public endpoint (no auth required), rate-limited to 10 req/min.

**Registration Fields**: Full Name, Phone Number (Egyptian format), Email, Password, Password Confirmation, Governorate (Egyptian governorates dropdown), Terms Agreement checkbox.

**Token Storage**: After registration, JWT access and refresh tokens are returned in the API response. The lawyer dashboard persists them in browser local storage.

### Frontend Environment Variables

| Variable | File | Purpose |
|----------|------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `mohamy-smart-landing/.env.local` | Backend API base URL (e.g. `http://localhost:8976/api`) |
| `NEXT_PUBLIC_DASHBOARD_URL` | `mohamy-smart-landing/.env.local` | Lawyer dashboard URL for post-registration redirect (e.g. `http://localhost:5078`) |

### Database Schema

The `Users` table includes registration fields: `FullName`, `Governorate` (nvarchar(50), nullable), `AgreedToTerms` (bit, non-nullable). Phone number uses the Identity `PhoneNumber` column. The EF Core migration `AddUserRegistrationFields` adds `Governorate` and `AgreedToTerms`.

---

## Cross-File Change Checklist

When a shared environment key is **added, renamed, or removed**, update every file listed below that references that key:

### Adding a new shared infrastructure key

1. `.env.docker.example` — add the key with a placeholder value and required/optional label
2. `.env.docker.prod.example` — add the key with a production placeholder value
3. `mohamy-smart-backend/Lawyer/appsettings.example.json` — add the JSON equivalent
4. `docs/environment-reference.md` — add to the appropriate profile matrix and variable category table
5. `docs/setup-guide.md` — update if the key affects onboarding steps

### Adding a new frontend-only key

1. The relevant app-level `.env.example` — add the key with a local default
2. `.env.docker.prod.example` — add the production build-arg passthrough (if needed for Docker builds)
3. `docker-compose.prod.yml` — add the build arg mapping (if applicable)
4. `docs/environment-reference.md` — add to the appropriate profile matrix

### Renaming an existing key

1. Update the key in **all** templates that contain it (see Source of Truth by File above)
2. Update `docker-compose.yml` and/or `docker-compose.prod.yml` if the key is referenced in environment or args sections
3. Update both profile matrices in `docs/environment-reference.md`
4. Update `docs/setup-guide.md` if the key appears in copy commands or examples

### Removing an existing key

1. Remove from **all** templates that contain it
2. Remove from `docker-compose.yml` and/or `docker-compose.prod.yml`
3. Remove from both profile matrices in `docs/environment-reference.md`
4. Remove from `docs/setup-guide.md` if referenced
