# Data Model: Phase 0 — Prerequisites & Decisions

**Generated**: 2026-04-04
**Branch**: `001-phase0-prerequisites-decisions`

This phase produces no DB schema changes. The "data model" here describes the structure
of the configuration files and documentation artifacts that Phase 0 creates.

---

## Decision Record (docs/decisions.md)

Each entry in the decisions log follows this structure:

```markdown
## DEC-NNN — [Topic]

**Date**: YYYY-MM-DD
**Status**: Confirmed | Pending Owner | Superseded
**Affects phases**: Phase X, Phase Y

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | ... | ... | ... |
| B | ... | ... | ... |

### Decision

[Chosen option and brief rationale]

### Migration path

[How to change this decision later if needed]
```

---

## Backend Configuration Schema

### appsettings.json (committed — NO secrets)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "TODO: set in appsettings.Development.json"
  },
  "JWT": {
    "SecretKey": "TODO: set in appsettings.Development.json (min 32 chars)",
    "Issuer": "MohamySmart",
    "Audience": "MohamySmart",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  },
  "AI": {
    "OpenAI": {
      "ApiKey": "TODO: set in appsettings.Development.json",
      "Model": "gpt-4.1"
    },
    "Gemini": {
      "ApiKey": "TODO: set in appsettings.Development.json",
      "Model": "gemini-3-pro-preview"
    }
  },
  "Payment": {
    "Paymob": {
      "ApiKey": "TODO: set in appsettings.Development.json",
      "HmacSecret": "TODO: set in appsettings.Development.json"
    }
  },
  "Email": {
    "Provider": "PLACEHOLDER: not configured — DEC-004 deferred. Phone OTP only.",
    "FromName": "محامي سمارت"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### appsettings.Development.json (git-ignored — real values here)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=91.108.121.110;Database=LawyerDB;User Id=<user>;Password=<pass>;TrustServerCertificate=True"
  },
  "JWT": {
    "SecretKey": "<min-32-char-random-secret>"
  },
  "AI": {
    "OpenAI": { "ApiKey": "<openai-key>" },
    "Gemini": { "ApiKey": "<gemini-key>" }
  },
  "Payment": {
    "Paymob": {
      "ApiKey": "<paymob-api-key>",
      "HmacSecret": "<paymob-hmac-secret>"
    }
  },
  // Email: not configured — DEC-004 deferred. No API key needed.
}
```

### launchSettings.json (committed — port change only)

```json
{
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "http://localhost:8976",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

---

## Lawyer Dashboard Environment Schema

### .env (git-ignored — real values)

```env
VITE_API_BASE_URL=http://localhost:8976/api
```

### .env.example (committed — placeholder)

```env
# Lawyer Dashboard — copy to .env and fill in values
VITE_API_BASE_URL=http://localhost:8976/api
```

---

## Admin Dashboard Environment Schema

### .env (git-ignored — real values)

```env
VITE_API_BASE_URL=http://localhost:8976/api
```

### .env.example (committed — placeholder)

```env
# Admin Dashboard — copy to .env and fill in values
VITE_API_BASE_URL=http://localhost:8976/api
```

---

## Vite Config Port Schema

Both dashboards follow the same pattern. Replace `<PORT>` with 5078 (Lawyer) or 5079 (Admin).

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: <PORT>,
    strictPort: true,   // fail fast if port is taken — no silent fallback
  },
})
```

`strictPort: true` is important — it ensures a developer gets an error immediately if the
designated port is occupied, instead of silently running on 5080 or similar.

---

## .gitignore Additions

Ensure the following patterns exist in `.gitignore` (root and/or component-level):

```gitignore
# Secrets — never commit
appsettings.Development.json
appsettings.*.json
!appsettings.json
!appsettings.Production.json.example

.env
.env.local
.env.development.local
.env.test.local
.env.production.local
!.env.example
```

---

## Key Entities Summary

| Entity | Location | Format | Committed? |
|--------|----------|--------|------------|
| Decision Record | `docs/decisions.md` | Markdown | ✅ Yes |
| Backend secrets | `appsettings.Development.json` | JSON | ❌ No (git-ignored) |
| Backend public config | `appsettings.json` | JSON | ✅ Yes (no secrets) |
| Lawyer Dashboard secrets | `.env` | dotenv | ❌ No (git-ignored) |
| Lawyer Dashboard template | `.env.example` | dotenv | ✅ Yes |
| Admin Dashboard secrets | `.env` | dotenv | ❌ No (git-ignored) |
| Admin Dashboard template | `.env.example` | dotenv | ✅ Yes |
| Developer setup guide | `docs/setup-guide.md` | Markdown | ✅ Yes |
