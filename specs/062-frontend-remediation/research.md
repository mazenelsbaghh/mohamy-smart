# Research: Frontend Remediation — Phases 2–5

**Branch**: `062-frontend-remediation` | **Date**: 2026-04-23

## Research Tasks & Findings

### R-001: Admin Dashboard Static Page Audit

**Decision**: All 3 identified static pages confirmed fully hardcoded. Must be converted to dynamic API-driven.

**Findings**:
| Page | Current State | Action Required |
|------|--------------|-----------------|
| `SubscriptionDetails.tsx` | 100% hardcoded (name: "محمد احمد", plan: "الباقة الأساسية", etc.) | Create `fetchSubscriptionById` thunk, connect to URL param `:id`, add loading/error/empty states |
| `Reviews.tsx` | Renders 6 hardcoded `ReviewCard` from `[1,2,3,4,5,6]` array | Create `fetchReviews` thunk, add approve/reject `onClick` handlers |
| `SubscriptionsChart.tsx` | Inline hardcoded data array (6 months) | Create thunk to fetch chart data from API |

**Dead components to delete**:
- `components/charts/PieChartHome.tsx` — hardcoded donut chart (3 segments)
- `components/charts/LineChartHome.tsx` — hardcoded line chart (6 months revenue)

**Rationale**: API-first integration (Constitution Principle II) requires all admin pages to fetch from backend.

---

### R-002: Admin Dashboard isLoading Race Condition

**Decision**: Replace single `isLoading: boolean` with per-thunk loading flags in `reportsSlice` and `aiUsageSlice`.

**Findings**:
- `redux/reports/reportsSlice.ts`: single `isLoading` shared by 4 thunks (`fetchLawyersReport`, `fetchSubscriptionsReport`, `fetchRevenueReport`, `fetchAccountMessagingAudit`)
- `redux/aiUsage/aiUsageSlice.ts`: single `isLoading` shared by 4 thunks (`fetchAiUsageSummary`, `fetchModelUsage`, `fetchLawyerUsage`, `fetchLawyerUsageDetail`)
- **Race condition**: concurrent dispatches clobber the loading state

**Approach**: Use individual boolean flags (e.g., `isLoadingLawyersReport`, `isLoadingSubscriptionsReport`) or a `Record<string, boolean>` loading map.

**Alternatives considered**:
- Single counter (`loadingCount`) — rejected: loses per-thunk granularity needed for UI
- Loading map (`Record<string, boolean>`) — viable but more complex; individual flags are clearer for 4 thunks

---

### R-003: Admin Dashboard Code Duplication

**Decision**: Consolidate `TAdminUser` type, remove duplicate thunks, standardize Redux hooks.

**Findings**:
- `TAdminUser` duplicated in 3 files (`authSlice.ts:6`, `thunkAuthLogin.ts:5`, `thunkAuthMe.ts:4`) — all identical, not exported
- `fetchSubscriptionsReport.ts` exists in both `redux/reports/thunk/` and `redux/subscriptions/thunk/` — different endpoints, different purposes (confusing naming)
- `reportThunks.ts` re-exports thunks with duplicate type definitions — ambiguous canonical source
- `useAppDispatch`/`useAppSelector` defined in `hooks/reduxHooks.ts` but not used consistently (some pages import directly from `react-redux`)

**Approach**: Move `TAdminUser` to `types/index.ts`. Keep both `fetchSubscriptionsReport` thunks (different purposes) but rename one. Delete `reportThunks.ts`. Replace all direct `react-redux` imports with typed hooks.

---

### R-004: Lawyer Dashboard Error Handling Gaps

**Decision**: Add per-section error UI with retry on home page, error states on case details and clients, spinner on ProtectedRoute, proper 404 page.

**Findings**:
- `Home.tsx`: 4 API calls, zero error handling — `loading === 'failed'` never rendered
- `ProtectedRoute.tsx:21`: returns `null` during auth check — blank page flash
- `AppRouter.tsx:94`: catch-all route is bare `<h1>الصفحة غير موجودة</h1>` — no layout, no navigation
- `NotFoundImage` component already exists with variants (cases, clients, etc.) but unused for 404 route

**Approach**: Wrap each home page section in error boundary. Add error+retry rendering. Use `NotFoundImage` for the catch-all route. Add spinner/skeleton in `ProtectedRoute` for `status === "unknown"`.

---

### R-005: Lawyer Dashboard Performance — moment.js & Mantine Removal

**Decision**: Replace moment.js with date-fns (already installed as `^3.6.0`). Replace Mantine components with HeroUI equivalents.

**Findings**:
- **moment.js**: used in 8 files (`ProcessServerPapersList`, `Clients`, `ClientDetails`, `Cases`, `Subscription`, `settings/Subscription`, `DocumentHandoffTab`, `FinancialsTab`)
- **Mantine**: used in 4 files — `main.tsx` (MantineProvider), `SanitizedContentEmpty.tsx` (Alert), `SkeletonForm.tsx` (Skeleton), `StepperComponent.tsx` (Stepper, Button, Group)
- **date-fns**: already installed as dependency (`^3.6.0`) — can replace moment immediately
- **HeroUI**: already the primary UI library — has equivalents for Alert, Skeleton

**Migration plan**:
- `moment(date).format('...')` → `format(date, '...')` from date-fns
- `MantineProvider` → remove from `main.tsx` (HeroUI Provider already present)
- `Alert` → HeroUI `Snippet` or custom alert component
- `Skeleton` → HeroUI `Skeleton`
- `StepperComponent` → appears to be demo/placeholder; evaluate if used, otherwise delete

**Alternatives considered**:
- `dayjs` — rejected: date-fns already installed, no need for third date library
- Keep moment — rejected: ~300KB gzipped, deprecated, contradicts bundle optimization goal

---

### R-006: Lawyer Dashboard Bugs

**Decision**: Fix 3 confirmed bugs.

**Findings**:
1. **`Cases.tsx:190`**: `setPageNumber(page)` called without `dispatch()` — pagination broken. Fix: `dispatch(setPageNumber(page))`
2. **`useWorkflowAutoSave.ts:89`**: `isSaving` uses `useRef`, returns `isSavingRef.current` — never triggers re-renders. Fix: replace with `useState`
3. **`Cases.tsx:33,121`**: `searchQuery` state updated but never used to filter cases — search input is non-functional. Fix: implement server-side search (send query to API per FR-030)

---

### R-007: Lawyer Dashboard Hardcoded Values

**Decision**: Extract to shared constants or environment variables.

**Findings**:
| Value | Location | Action |
|-------|----------|--------|
| `EGYPT_GOVERNORATES` (27 items) | `pages/auth/SignUp.tsx:17` | Move to `@mohamy/shared-utils/constants.ts` |
| `FALLBACK_PLANS` (3 plans) | `pages/subscription/Subscription.tsx:31` | Remove or replace with API data |
| WhatsApp `201289221056` | `AuthLayout.tsx:23`, `AuthLegalPage.tsx:49-53` | Move to `VITE_SUPPORT_WHATSAPP` env var |
| `#EF950A` (18 occurrences) | 7 files including inline styles | Replace with `var(--main-color)` CSS variable |
| `getInitials` + `getAvatarColor` | `Clients.tsx:45-48`, `ClientDetails.tsx:44-48` (identical) | Extract to `utils/avatar.ts` |
| Many API URLs | Hardcoded in thunks/components | Add to `APIs/routes.ts` |

---

### R-008: Landing Page CTA & SEO Audit

**Decision**: Wire all CTA/pricing buttons to navigation. Fix SEO metadata gaps.

**Findings**:
- `CallToAction.tsx`: plain `<button type="button">` with **no navigation** — dead button
- `PricingPlans.tsx`: all 3 plan buttons are `<button type="button">` with **no navigation**
- Professional plan content is copy-paste of basic plan (has TODO comment)
- Hero section CSS: `min-height: 170vh` (from `HeroSection.css`) overrides Tailwind `min-h-[100vh]` due to higher specificity — **actual height is 170vh**
- OG image: `/images/1-eb26d7be.ico` — ICO file won't render as social preview image
- Privacy/refund policy pages: `'use client'` components with **no exported metadata** — share root metadata
- `register/` directory: **does not exist** — nothing to delete (already removed or never created)
- 5 unused SVGs in `public/`: `next.svg`, `vercel.svg`, `file.svg`, `window.svg`, `globe.svg`
- `framer-motion` used in 3 source files: HeroSection, FeaturesSection, HowToUseSection
- `next.config.ts`: `unoptimized: true` is correct for static export (`output: "export"`)

**Approach**:
- CTA/pricing buttons: use `<a href>` linking to dashboard signup URL (same pattern as HeroSection which already works)
- Professional plan: define distinct features content
- Hero height: fix CSS `min-height: 170vh` → `100vh` or remove CSS rule
- OG image: replace `.ico` with proper PNG/WEBP (1200x630)
- Policy pages: convert to server components or export `generateMetadata`
- Lazy-load Framer Motion sections via `next/dynamic`

---

### R-009: Landing Page — Shared Package Integration

**Decision**: Integrate `@mohamy/shared-validations` and `@mohamy/shared-api` into the landing app.

**Findings**:
- Landing `package.json` has **no `@mohamy/shared-*` dependencies** — completely standalone
- `lib/api.ts`: standalone Axios with no CSRF, no refresh token, no shared client
- `lib/validations/`: empty directory
- `envValidator.ts` only supports Vite `VITE_*` prefix — needs `NEXT_PUBLIC_*` support for Next.js

**Blocker**: Zod version mismatch — shared packages declare `zod: ^3.0.0` peerDependency, landing uses `zod: ^4.3.6`. Must resolve first (Phase 5).

**Approach**: After Zod alignment (R-010), add shared packages as landing dependencies. Extend `envValidator.ts` to accept `NEXT_PUBLIC_*` env vars.

---

### R-010: Zod Version Alignment

**Decision**: Adopt Zod v4 across all packages and apps.

**Findings**:
| Package | Current Zod Version |
|---------|-------------------|
| Admin Dashboard | `^4.1.11` |
| Lawyer Dashboard | `^4.1.9` |
| Landing | `^4.3.6` |
| shared-validations | `^3.0.0` (peerDependency) |
| shared-utils | `^3.0.0` (peerDependency) |

**Migration steps**:
1. Update shared package peerDependencies to `^4.0.0`
2. Update `shared-validations/src/common.ts`: `.nonempty()` → `.min(1)` (Zod v4 prefers this)
3. Update `shared-validations/src/auth.ts`: remove explicit `data: any` annotations, let TypeScript infer
4. Verify all schemas work with Zod v4 (test each validation form)
5. Run `npm install` at monorepo root to resolve versions

**Rationale**: All 3 apps already use Zod v4. Upgrading 2 shared packages is less work than downgrading 3 apps.

**Alternatives considered**:
- Downgrade apps to v3 — rejected: apps are already on v4 with v4 features in use
- Keep mismatch — rejected: runtime errors when shared validations are consumed by v4 apps

---

### R-011: Shared Package Type Safety

**Decision**: Eliminate all `any` type assertions in shared packages.

**Findings**:
| Package | File | Issue | Fix |
|---------|------|-------|-----|
| shared-validations | `auth.ts:24,42` | `.refine((data: any) => ...)` | Remove explicit `any`, let TS infer |
| shared-api | `createApiClient.ts:34` | `(import.meta as any).env?.PROD` | Use `typeof import.meta !== 'undefined' && (import.meta as {env?: {PROD?: boolean}}).env?.PROD` or environment-agnostic detection |
| shared-ui | `CustomInput.tsx:20,36` | `radius={radius as any}` | Use HeroUI's `Radius` type or cast to correct type |
| shared-ui | `CustomTable.tsx:34` | `(item as Record<string, ReactNode>)[column.key]` | Use generic type parameter `<T extends Record<string, ReactNode>>` |

---

### R-012: Shared Package Configuration Consistency

**Decision**: All package tsconfig files must extend root `tsconfig.base.json`.

**Findings**:
- Root `tsconfig.base.json` exists with proper settings (ES2022, strict, composite, etc.)
- Each package has its own `tsconfig.json` — need to verify they extend the base
- Duplicate dependencies in package.json files should be converted to peerDependencies

**Approach**: Update each package's `tsconfig.json` to include `"extends": "../../tsconfig.base.json"` (or appropriate relative path). Move shared runtime deps to peerDependencies.

---

### R-013: CSRF Flag Reset in shared-api

**Decision**: Add `_csrfFailedPreAuth = false` reset after successful authentication.

**Findings**:
- `createApiClient.ts` has a `_csrfFailedPreAuth` flag that prevents retry loops before login
- The flag is set to `true` when a CSRF-related error occurs before the user is authenticated
- **Missing**: the flag is never reset to `false` after successful login
- **Impact**: if a user encounters a CSRF error before logging in, then logs in successfully, the flag remains `true` and may prevent proper CSRF handling

**Fix**: Add `_csrfFailedPreAuth = false` in the response interceptor after a successful login response (status 200 on `/auth/login`).

---

### R-014: Code Splitting Strategy

**Decision**: Use `React.lazy()` + `<Suspense>` for route-level code splitting in both dashboards.

**Findings**:
- **Admin**: `AppRouter.tsx` statically imports 20+ page components — no code splitting
- **Lawyer**: `AppRouter.tsx` statically imports 15+ page components — no code splitting
- Both use React Router v6 — `React.lazy` works natively

**Approach**:
```typescript
const Home = React.lazy(() => import('../pages/home/Home'));
// ... for each route component

<Suspense fallback={<PageSkeleton />}>
  <Route path="/" element={<Home />} />
</Suspense>
```

**Expected impact**: Initial bundle split into ~15-20 smaller chunks loaded on demand. Combined with moment.js + Mantine removal, should achieve 30%+ bundle size reduction for lawyer dashboard.

---

### R-015: Server-Side vs Client-Side Search

**Decision**: Implement server-side search for the lawyer Cases page.

**Findings**:
- `Cases.tsx`: `searchQuery` state exists but is never used — search input is non-functional
- `Clients.tsx`: already has client-side filtering (using `searchQuery` to filter `clients` array)
- Constitution Principle II (API-First): search should be server-side for both

**Approach for Cases** (FR-030):
- Send `searchQuery` as a parameter to the existing `thunkGetAllCases` API call
- Let the backend handle filtering
- Remove client-side filtering code

**Approach for Clients** (deferred to future phase):
- Current client-side filtering works; migrating to server-side is a backend API change that's out of scope for this remediation
