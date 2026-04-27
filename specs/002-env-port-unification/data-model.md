# Data Model: Phase 1 — Environment & Port Unification

**Date**: 2026-04-04
**Feature**: 002-env-port-unification

## Overview

This feature is purely configuration — **no database entities, tables, or data structures
are created, modified, or deleted.** This document exists for completeness in the planning
workflow.

## Configuration Entities

While no database models change, the following configuration "entities" are relevant:

### Port Assignment Registry

| Component | Port | Config Location | Enforced By |
|-----------|------|----------------|-------------|
| Backend (.NET) | 8976 | `launchSettings.json` → `applicationUrl` | ASP.NET Kestrel binding |
| Lawyer Dashboard | 5078 | `vite.config.ts` → `server.port` | Vite `strictPort: true` |
| Admin Dashboard | 5079 | `vite.config.ts` → `server.port` | Vite `strictPort: true` |
| Landing Page | 3000 | `package.json` → `dev` script `-p 3000` | Next.js CLI flag |

### Environment Variable Registry

| Variable | Component | Value (Local Dev) | Source |
|----------|-----------|-------------------|--------|
| `VITE_API_BASE_URL` | Lawyer Dashboard | `http://localhost:8976/api` | `.env` (git-ignored) |
| `VITE_API_BASE_URL` | Admin Dashboard | `http://localhost:8976/api` | `.env` (git-ignored) |
| `ASPNETCORE_ENVIRONMENT` | Backend | `Development` | `launchSettings.json` |
| `FrontendBaseUrl` | Backend | `http://localhost:5078` | `appsettings.json` |
| `AppSetting:BaseUrl` | Backend | `http://localhost:8976` | `appsettings.json` |

### Validation Rules

- All ports are non-negotiable (Constitution Principle V DEC-001).
- Environment variables must not have hardcoded fallbacks in source code.
- `.env` files with real values must be git-ignored.
- `.env.example` files with placeholder values must be committed.

## State Transitions

N/A — no stateful entities in this feature.
