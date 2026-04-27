# Phase 1 Completion Plan — Remaining Infrastructure

## Objective
Complete Phase 1 by creating the 3 missing shared packages, root configs, and cleaning up `any` types before Phase 2 (Testing).

## Work Items

### 1. `packages/shared-api` — Centralized Axios Instance
**What**: Unified axios instance with CSRF, 401 refresh queue, error handler.
**Analysis**: Admin & Lawyer dashboards have near-identical `APIs/api.ts` files (~140-155 lines each). The lawyer version has an extra 403 handler + API_ROUTES import. Both share identical patterns:
- `axios.create()` with `withCredentials`, XSRF cookie/header
- `fetchCsrfToken()`, `registerLogoutDispatcher()`, `handleLogout()`
- 401 refresh queue (isRefreshing + failedQueue + processQueue)
- CSRF retry on 400
- `axiosErrorHandler` utility (identical in both)

**Plan**:
- Create `packages/shared-api/src/createApiClient.ts` — factory function taking `baseUrl` + optional config
- Create `packages/shared-api/src/axiosErrorHandler.ts` — unified error handler
- Export `createApiClient`, `fetchCsrfToken`, `registerLogoutDispatcher`, `axiosErrorHandler`
- Each dashboard calls `createApiClient(import.meta.env.VITE_API_BASE_URL)` locally

### 2. `packages/shared-types` — Shared DTOs
**What**: Common TypeScript interfaces used across dashboards.
**Analysis**: Both dashboards define overlapping types:
- `TProfile` / `AdminProfile` — same shape
- `TLoading` — identical pattern
- `TSubscriptionPlan`, `TSubscriptionStatus` — shared business entity
- API response wrapper types
**Plan**:
- `src/common.ts` — `TLoading`, `ApiResponse<T>`, pagination types
- `src/auth.ts` — `TUser`, auth response types
- `src/subscription.ts` — plan/payment shared types
- `src/profile.ts` — shared profile DTO
- `src/index.ts` — re-export all

### 3. `packages/shared-utils` — Helper Functions
**What**: Duplicated utility functions.
**Analysis**: Found these duplicates/shared candidates:
- `envValidator.ts` — IDENTICAL in both dashboards
- `axiosErrorHandler.ts` — nearly identical (moved to shared-api)
- `normalizeDigits.ts` — Arabic/Persian digit normalizer (lawyer only, but generally useful)
- `sanitizeHtml.ts` — DOMPurify wrapper (lawyer only, but critical for security)
- `parseJobResult.ts` — deepCamelize + JSON parsing (lawyer only, reusable)
- `guards.ts` — type guard helpers
**Plan**:
- `src/envValidator.ts` — unified env validation
- `src/normalizeDigits.ts` — digit normalizer
- `src/sanitizeHtml.ts` — DOMPurify wrapper
- `src/parseJobResult.ts` — job result parser with deepCamelize
- `src/guards.ts` — type guards
- `src/index.ts` — re-export all

### 4. Root Configs
- `tsconfig.base.json` — shared TS compiler options for all packages/apps
- `.eslintrc.json` — shared ESLint config
- `.prettierrc.json` — shared Prettier config

### 5. Landing `tsconfig.json`
- Add `"noImplicitAny": true` (already has `"strict": true` which includes it, but making explicit)

### 6. Clean up `any` Types (18 occurrences found)
**Admin (8)**:
- `analyticsSlice.ts` — 4x `error: any` → `error: unknown`
- `FilterSelect.tsx` — `value: any` → proper type
- `UserEngagement.tsx` — `d: any` → proper type
- `CohortRetentionTable.tsx` — `item: any` → proper type
- `SubscriptionLifecycle.tsx` — `d: any` → proper type

**Lawyer (10)**:
- `FilterSelect.tsx` — `value: any` → proper type
- `CaseAnalysis.tsx` — return any → proper type
- `AddNewContractsForm.tsx` — 2x map any → proper types
- `AgendaPage.tsx` — `arg: any` → FullCalendar event type
- `thunkGetSubscriptionPlans.ts` — `plan: any` → proper type
- `legalContractsSlice.ts` — 4x `error: any` → `error: unknown`

## Execution Order
1. Root configs (tsconfig.base.json, .eslintrc.json, .prettierrc.json)
2. packages/shared-types (no deps)
3. packages/shared-utils (no deps)
4. packages/shared-api (depends on shared-types for ApiResponse)
5. Wire dashboards to new packages
6. Clean up `any` types
7. Landing tsconfig update
