# Contract: appsettings.json Placeholder Schema

**Feature**: Phase 0 — Prerequisites & Decisions
**Date**: 2026-04-04

This contract defines what the committed `appsettings.json` MUST contain after Phase 0 —
specifically, it MUST have `TODO:` placeholders for every secret, so a fresh clone gives
a developer clear guidance on what to fill in.

---

## Committed appsettings.json (full template)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "TODO: set in appsettings.Development.json — SQL Server connection string"
  },
  "JWT": {
    "SecretKey": "TODO: set in appsettings.Development.json — must be 32+ chars",
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
    "Provider": "PLACEHOLDER: not configured — future integration point (DEC-004 deferred)",
    "FromName": "محامي سمارت"
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5078",
      "http://localhost:5079",
      "http://localhost:3000"
    ]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Serilog": {
    "MinimumLevel": "Information",
    "WriteTo": [
      { "Name": "Console" },
      { "Name": "File", "Args": { "path": "logs/log-.txt", "rollingInterval": "Day" } }
    ]
  },
  "AllowedHosts": "*"
}
```

---

## Git-ignored appsettings.Development.json (developer fills this)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "<paste your SQL Server connection string here>"
  },
  "JWT": {
    "SecretKey": "<generate: openssl rand -base64 32>"
  },
  "AI": {
    "OpenAI": { "ApiKey": "<your OpenAI API key>" },
    "Gemini": { "ApiKey": "<your Google AI API key>" }
  },
  "Payment": {
    "Paymob": {
      "ApiKey": "<your Paymob API key>",
      "HmacSecret": "<your Paymob HMAC secret>"
    }
  },
  // Email: not configured — see DEC-004. No keys needed.
}
```

---

## Invariants (enforced by convention, validated in setup-guide)

1. The word "TODO" MUST NOT appear in `appsettings.Development.json`. If it does, the
   developer hasn't finished setup.
2. The IP address `91.108.121.110` MUST NOT appear in any committed file after Phase 0.
3. The CORS `AllowedOrigins` list in `appsettings.json` MUST include all canonical
   local development origins and MUST NOT include `*`.
4. `ASPNETCORE_ENVIRONMENT=Development` MUST be set in `launchSettings.json` so that
   `appsettings.Development.json` is loaded automatically — no manual steps needed.
