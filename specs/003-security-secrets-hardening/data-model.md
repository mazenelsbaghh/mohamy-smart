# Data Model: Phase 2 — Security & Secrets Hardening

> This feature has no database schema changes. This document serves as a **configuration
> registry** — the canonical reference for all configuration keys, their locations, and
> validation rules.

## Configuration Keys Registry

### Secrets (in `appsettings.Development.json` — git-ignored)

| Key Path | Type | Validation Rule | Source |
|----------|------|----------------|--------|
| `ConnectionStrings:SqlServer` | string | Not null, not "TODO*" | SQL Server admin |
| `JWT:Key` | string | Not null, not "TODO*", length ≥ 32 | Generate locally |
| `OpenAI:ApiKey` | string | Not null, not "TODO*" | platform.openai.com |
| `Gemini:ApiKey` | string | Not null, not "TODO*" | aistudio.google.com |
| `Paymob:APIKey` | string | Not null, not "TODO*" | Paymob portal |
| `Paymob:SecretKey` | string | Not null, not "TODO*" | Paymob portal |
| `Paymob:PublicKey` | string | Not null, not "TODO*" | Paymob portal |
| `Paymob:HMAC` | string | Not null, not "TODO*" | Paymob portal |
| `Paymob:CardIntegrationId` | string | Not null, not "TODO*" | Paymob portal |
| `Paymob:MobileIntegrationId` | string | Not null, not "TODO*" | Paymob portal |
| `Paymob:CallbackBaseUrl` | string (URL) | Not null, valid absolute URL | Paymob portal |

### Non-Secret Config (in `appsettings.json` — committed)

| Key Path | Type | Default Value | Notes |
|----------|------|--------------|-------|
| `CorsOrigins` | string[] | `["http://localhost:5078", "http://localhost:5079", "http://localhost:3000"]` | NEW — development origins |
| `FrontendBaseUrl` | string (URL) | `http://localhost:5078` | Existing — used by PaymentController |
| `JWT:Issuer` | string | `SecureApi` | Existing |
| `JWT:Audience` | string | `SecureApiUser` | Existing |
| `JWT:DurationInMinutes` | int | `15` | Existing |
| `AIProvider:Active` | string | `Chatgpt` | Existing |
| `OpenAI:Model` | string | `gpt-4.1` | Existing |
| `Gemini:Model` | string | `gemini-3-pro-preview` | Existing |
| `AppSetting:BaseUrl` | string (URL) | `http://localhost:8976` | Existing |
| `AppSettings:TimeZoneId` | string | `Africa/Cairo` | Existing |
| `AllowedHosts` | string | `*` | Existing |

### Frontend Environment Variables (in `.env` files — git-ignored)

| Variable | File | Value (Dev) |
|----------|------|-------------|
| `VITE_API_BASE_URL` | `mohamy-smart-lawyer-dashboard/.env` | `http://localhost:8976/api` |
| `VITE_API_BASE_URL` | `mohamy-smart-admin-dashboard/.env` | `http://localhost:8976/api` |

## File Ownership Map

| File | Status | Contains Secrets? |
|------|--------|------------------|
| `appsettings.json` | Committed ✅ | ❌ No — placeholders only |
| `appsettings.Development.json` | Git-ignored ✅ | ✅ Yes — real secrets |
| `appsettings.example.json` | Committed ✅ (new) | ❌ No — `YOUR_*_HERE` placeholders |
| `appsettings.Production.json` | Git-ignored (or env vars) | ✅ Yes — production secrets |
| `.env` (frontends) | Git-ignored ✅ | ⚠️ Partially — API URL only |
| `.env.example` (frontends) | Committed ✅ | ❌ No |

## State Transitions

N/A — No entities with state in this feature.
