# Contract: Environment Variable Schemas

**Feature**: Phase 0 — Prerequisites & Decisions
**Date**: 2026-04-04

These schemas define the environment variables each component reads at startup.
Any variable listed here is **required** unless marked `[optional]`.

---

## Backend (.NET) — appsettings.json hierarchy

The backend uses ASP.NET Core's layered config system. Values in higher-priority files
override lower-priority ones. Load order (lowest → highest):

1. `appsettings.json` ← committed, no secrets
2. `appsettings.Development.json` ← git-ignored, all secrets
3. Environment variables ← production injection (Azure App Service / pipeline)

### Required configuration keys

| Key | Type | Example | Notes |
|-----|------|---------|-------|
| `ConnectionStrings:DefaultConnection` | string | SQL Server connection string | Contains IP, user, password |
| `JWT:SecretKey` | string | 32+ random chars | Never below 32 chars |
| `JWT:Issuer` | string | `MohamySmart` | Fixed |
| `JWT:Audience` | string | `MohamySmart` | Fixed |
| `AI:OpenAI:ApiKey` | string | `sk-...` | OpenAI API key |
| `AI:Gemini:ApiKey` | string | `AIza...` | Google AI API key |
| `Payment:Paymob:ApiKey` | string | Paymob API key | |
| `Payment:Paymob:HmacSecret` | string | Paymob HMAC secret | For callback verification |
| `Email:Provider` | string | `PLACEHOLDER` | Not configured — DEC-004 deferred |

---

## Lawyer Dashboard (Vite/React)

Variables MUST be prefixed with `VITE_` to be accessible in browser code.

### .env (git-ignored)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `VITE_API_BASE_URL` | ✅ Yes | `http://localhost:8976/api` | Development value |

### .env.example (committed)

```env
# Lawyer Dashboard environment — copy to .env and set values
# Development: http://localhost:8976/api
# Production: https://api.yourdomain.com/api
VITE_API_BASE_URL=http://localhost:8976/api
```

---

## Admin Dashboard (Vite/React)

Same pattern as Lawyer Dashboard, different port confirmation.

### .env (git-ignored)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `VITE_API_BASE_URL` | ✅ Yes | `http://localhost:8976/api` | Same backend, different frontend port |

### .env.example (committed)

```env
# Admin Dashboard environment — copy to .env and set values
# Development: http://localhost:8976/api
# Production: https://api.yourdomain.com/api
VITE_API_BASE_URL=http://localhost:8976/api
```

---

## Landing Page (Next.js)

Next.js uses `NEXT_PUBLIC_` prefix for browser-accessible variables.
Currently the Landing Page has no API calls — no environment variables required for v1.

### .env.example (committed — placeholder for future use)

```env
# Landing Page environment
# No API calls in v1 — reserved for future contact form endpoint
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8976/api
```

---

## Validation Rules

1. `JWT:SecretKey` length MUST be ≥ 32 characters. The backend SHOULD validate this on
   startup and throw a descriptive error if the key is too short or missing.
2. `VITE_API_BASE_URL` MUST NOT end with a trailing slash (to prevent double-slash URLs).
3. All `TODO:` placeholder values in `appsettings.json` MUST be overridden in
   `appsettings.Development.json` before the backend will start successfully.
4. `.env` files MUST NOT be committed. `.env.example` files MUST be committed.
