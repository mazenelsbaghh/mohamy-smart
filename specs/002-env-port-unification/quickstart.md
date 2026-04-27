# Quickstart: Phase 1 — Environment & Port Unification

**Date**: 2026-04-04
**Feature**: 002-env-port-unification

## Prerequisites

- macOS (or Linux) development machine
- .NET 9 SDK installed (`dotnet --version` → 9.x)
- Node.js 20+ and npm installed
- SQL Server accessible (remote or local — connection string in `appsettings.Development.json`)

## Setup Steps

### 1. Clone and navigate

```bash
git clone <repo-url>
cd mohamy-smart
```

### 2. Backend Setup

```bash
cd mohamy-smart-backend/Lawyer

# Create local secrets file (git-ignored)
cp appsettings.json appsettings.Development.json
# Edit appsettings.Development.json — replace all "TODO:" values with real credentials

# Start the backend
dotnet run
# ✅ Expected output: "Now listening on: http://localhost:8976"
# ✅ Verify: open http://localhost:8976/scalar in browser
```

### 3. Lawyer Dashboard Setup

```bash
cd mohamy-smart-lawyer-dashboard

npm install

# Create local env file (git-ignored)
cp .env.example .env
# Edit .env if needed (default is already correct for local dev)

npm run dev
# ✅ Expected output: "Local: http://localhost:5078"
# ✅ Verify: open browser DevTools → Network → any API call targets localhost:8976
```

### 4. Admin Dashboard Setup

```bash
cd mohamy-smart-admin-dashboard

npm install

# Create local env file (git-ignored)
cp .env.example .env
# Edit .env if needed (default is already correct for local dev)

npm run dev
# ✅ Expected output: "Local: http://localhost:5079"
```

### 5. Landing Page Setup

```bash
cd mohamy-smart-landing

npm install

npm run dev
# ✅ Expected output: "Local: http://localhost:3000"
```

## Port Assignment Quick Reference

| Component | Port | Start Command |
|-----------|------|---------------|
| Backend | 8976 | `cd mohamy-smart-backend/Lawyer && dotnet run` |
| Lawyer Dashboard | 5078 | `cd mohamy-smart-lawyer-dashboard && npm run dev` |
| Admin Dashboard | 5079 | `cd mohamy-smart-admin-dashboard && npm run dev` |
| Landing Page | 3000 | `cd mohamy-smart-landing && npm run dev` |

## Simultaneous Running

Open 4 terminal windows/tabs and start each component. All should run without port
conflicts. The Lawyer Dashboard should be able to make API calls to the local backend.

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| "Port already in use" on 8976 | Another process using the port | `lsof -i :8976` to find and kill it |
| "Port already in use" on 5078/5079 | Another Vite dev server | `lsof -i :5078` to find and kill it |
| API calls go to production URL | Missing or wrong `.env` | Verify `VITE_API_BASE_URL` in `.env` |
| API calls go to `localhost:5000` | Old fallback in `api.ts` | Pull latest — fallback removed |
| Backend opens browser on start | Old `launchBrowser` setting | Pull latest — set to `false` |
| CORS error in browser | Backend not running | Start backend first on port 8976 |
