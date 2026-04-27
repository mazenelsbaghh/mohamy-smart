# Quickstart: Frontend Remediation — Phases 2–5

**Branch**: `062-frontend-remediation` | **Date**: 2026-04-23

## Prerequisites

- Phase 0 (urgent security fixes) and Phase 1 (critical backend fixes) are completed or in progress
- Node 22 installed, npm workspaces enabled
- Docker running (for backend API access)
- `.env.docker` configured (run `make setup` if not)

## Getting Started

### 1. Start the development environment

```bash
make dev
```

This starts:
- SQL Server on port 1433
- Backend API on port 8976
- Lawyer Dashboard on port 5078
- Admin Dashboard on port 5079
- Landing Page on port 3000

### 2. Verify all services are running

```bash
make health
```

### 3. Working with each app

```bash
# Admin Dashboard
cd apps/admin-dashboard && npm run dev

# Lawyer Dashboard
cd apps/lawyer-dashboard && npm run dev

# Landing Page
cd apps/landing && npm run dev
```

### 4. Build all apps

```bash
# From monorepo root
npx turbo build
```

### 5. Run tests

```bash
# From monorepo root
npx turbo test

# Or per-app
cd apps/admin-dashboard && npm test
cd apps/lawyer-dashboard && npm test
```

### 6. Lint all apps

```bash
# From monorepo root
npx turbo lint
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `apps/admin-dashboard/src/APIs/routes.ts` | Admin API routes (add missing endpoints here) |
| `apps/admin-dashboard/src/router/AppRouter.tsx` | Admin routing (add React.lazy here) |
| `apps/admin-dashboard/src/redux/` | Admin Redux slices (modify loading states) |
| `apps/lawyer-dashboard/src/APIs/routes.ts` | Lawyer API routes (centralize all URLs) |
| `apps/lawyer-dashboard/src/router/AppRouter.tsx` | Lawyer routing (add React.lazy here) |
| `apps/lawyer-dashboard/src/hooks/useWorkflowAutoSave.ts` | Auto-save hook (fix isSaving) |
| `packages/shared-validations/src/common.ts` | Validation regex (unify phone/password) |
| `packages/shared-api/src/createApiClient.ts` | API client (fix CSRF flag) |
| `packages/shared-types/src/notification.ts` | Notification types (narrow type field) |
| `tsconfig.base.json` | Root TypeScript config |

## Verification Checklist

After completing each phase:

- [ ] **P2 — Admin**: All pages show real API data, loading/error/empty states work, code splitting active
- [ ] **P3 — Lawyer**: Error states on all pages, no moment/Mantine in bundle, code splitting active, bugs fixed
- [ ] **P4 — Landing**: CTA buttons navigate, SEO metadata unique per page, unused files removed
- [ ] **P5 — Shared**: Zod versions aligned, regex unified, no `any` in shared packages, tsconfigs extend base
