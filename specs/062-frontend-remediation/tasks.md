# Tasks: Frontend Remediation — Phases 2–5

**Input**: Design documents from `/specs/062-frontend-remediation/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Test tasks are omitted; existing tests will be updated as needed during implementation.

**Organization**: Tasks grouped by user story. US5 (Shared Packages) is foundational because Zod version alignment and type changes block all app-level work.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Paths are absolute from repository root

---

## Phase 1: Setup (Environment & Dependencies)

**Purpose**: Prepare environment variables and dependency alignment before any code changes.

- [x] T001 Add `VITE_SUPPORT_WHATSAPP=201289221056` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/.env.local`
- [x] T002 [P] Add `NEXT_PUBLIC_SITE_URL=https://mohamy-smart.com` and `NEXT_PUBLIC_DASHBOARD_URL=http://localhost:5078` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/.env.local`
- [x] T003 [P] Update Zod peerDependency from `^3.0.0` to `^4.0.0` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-validations/package.json`
- [x] T004 [P] Update Zod peerDependency from `^3.0.0` to `^4.0.0` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-utils/package.json`
- [x] T005 Run `npm install` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/` to resolve Zod version alignment across the monorepo

---

## Phase 2: Foundational — US5 Shared Packages (Priority: P3)

**Purpose**: Unify shared packages before app-level work. Zod alignment, type safety, and validation regex changes must land first because all three apps consume these packages.

**Goal**: All shared packages use Zod v4, have zero `any` escapes, unified regex, proper TypeScript configs, and correct CSRF handling.

**Independent Test**: Run `npx turbo build` from repo root — all 5 shared packages must compile with zero TypeScript errors. Verify Zod versions match in all package.json files.

### Implementation for US5

- [x] T006 [P] [US5] Replace `.nonempty()` with `.min(1)` and update phone regex to `/^(01[0125][0-9]{8}|\+20[0125][0-9]{9})$/` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-validations/src/common.ts`
- [x] T007 [P] [US5] Remove explicit `data: any` type annotations from `.refine()` callbacks (lines 24 and 42), let TypeScript infer the type, in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-validations/src/auth.ts`
- [x] T008 [P] [US5] Add `_csrfFailedPreAuth = false` reset in the response interceptor after detecting a successful login response (path contains `/auth/login` and status is 200) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-api/src/createApiClient.ts`
- [x] T009 [P] [US5] Replace `(import.meta as any).env?.PROD` with environment-agnostic detection using `typeof import.meta !== 'undefined'` guard in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-api/src/createApiClient.ts`
- [x] T010 [P] [US5] Add branded type `type ISODateString = string & { __brand: 'ISODate' }` and export it from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-types/src/common.ts`
- [x] T011 [P] [US5] Change `NotificationItem.type` from `string` to `'info' | 'warning' | 'error' | 'success'` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-types/src/notification.ts`
- [x] T012 [P] [US5] Extend the `envSchema` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-utils/src/envValidator.ts` to accept `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SENTRY_DSN` alongside the existing `VITE_*` keys using `z.union()` or a merged schema
- [x] T013 [P] [US5] Replace `radius={radius as any}` with proper HeroUI `Radius` type import and cast in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-ui/src/components/CustomInput.tsx` (lines 20 and 36)
- [x] T014 [P] [US5] Add generic type parameter `<T extends Record<string, React.ReactNode>` to `CustomTable` component props and replace `(item as Record<string, ReactNode>)` assertion with typed access in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-ui/src/components/CustomTable.tsx`
- [x] T015 [P] [US5] Ensure `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-validations/tsconfig.json` extends `"../../tsconfig.base.json"` and overrides only package-specific settings (`outDir`, `rootDir`)
- [x] T016 [P] [US5] Ensure `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-api/tsconfig.json` extends `"../../tsconfig.base.json"` and overrides only package-specific settings
- [x] T017 [P] [US5] Ensure `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-types/tsconfig.json` extends `"../../tsconfig.base.json"` and overrides only package-specific settings
- [x] T018 [P] [US5] Ensure `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-utils/tsconfig.json` extends `"../../tsconfig.base.json"` and overrides only package-specific settings
- [x] T019 [P] [US5] Ensure `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-ui/tsconfig.json` extends `"../../tsconfig.base.json"` and overrides only package-specific settings
- [x] T020 [US5] Run `npx turbo build --filter=@mohamy/shared-validations --filter=@mohamy/shared-api --filter=@mohamy/shared-types --filter=@mohamy/shared-utils --filter=@mohamy/shared-ui` from repo root and verify zero TypeScript errors (depends on T006–T019)
- [x] T021 [P] [US5] Update any `NotificationItem.type` consumers in admin and lawyer dashboards that pass arbitrary strings — change to valid union values (`'info'`, `'warning'`, `'error'`, `'success'`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/types/index.ts` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/types/types.ts`

**Checkpoint**: All shared packages compile. Zod versions unified. Zero `any` in shared code. CSRF flag resets correctly.

---

## Phase 3: User Story 1 — Admin Views Live Data (Priority: P1) 🎯 MVP

**Goal**: All admin dashboard pages fetch real data from the API. Every page has loading, error (with retry), and empty states. Dead static components removed.

**Independent Test**: Log in as admin. Navigate to SubscriptionDetails (with valid ID), Reviews, SubscriptionsChart, ContactRequests, SubscriptionReports. Verify each shows API data with loading spinner, error+retry on failure, empty-state when no data. Click approve/reject on a review card and verify API call.

### Implementation for US1

- [x] T022 [US1] Add missing admin API route constants (`SUBSCRIPTION_DETAIL: (id) => \`Subscription/\${id}\``, `REVIEWS`, `REVIEW_STATUS: (id) => \`Review/\${id}/status\``, `SUBSCRIPTIONS_CHART`, `LAWYER_DETAIL: (id) => \`Subscription/lawyers/\${id}\``) to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/APIs/routes.ts`
- [x] T023 [US1] Replace the single `isLoading` boolean with four individual flags (`isLoadingLawyersReport`, `isLoadingSubscriptionsReport`, `isLoadingRevenueReport`, `isLoadingAccountMessaging`) and update all 4 thunk matchers in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/reports/reportsSlice.ts`
- [x] T024 [US1] Replace the single `isLoading` boolean with four individual flags (`isLoadingSummary`, `isLoadingModels`, `isLoadingLawyers`, `isLoadingLawyerDetail`) and update all 4 thunk matchers in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/aiUsage/aiUsageSlice.ts`
- [x] T025 [US1] Update all components reading `reportsSlice.isLoading` to use the correct per-thunk flag (e.g., `isLoadingLawyersReport`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/SubscriptionReports.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/analytics/` (depends on T023)
- [x] T026 [US1] Update all components reading `aiUsageSlice.isLoading` to use the correct per-thunk flag in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/aiUsage/` (depends on T024)
- [x] T027 [US1] Create `fetchSubscriptionById` async thunk calling `GET /Subscription/{id}` using `ADMIN_ROUTES.SUBSCRIPTION_DETAIL(id)` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/subscriptions/thunk/fetchSubscriptionById.ts`
- [x] T028 [US1] Create `fetchReviews` async thunk calling the reviews API endpoint in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/plans/thunk/fetchReviews.ts`
- [x] T029 [US1] Create `updateReviewStatus` async thunk accepting `{ id, status: 'approved' | 'rejected' }` and calling `PUT /Review/{id}/status` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/plans/thunk/updateReviewStatus.ts`
- [x] T030 [US1] Create `fetchSubscriptionsChartData` async thunk calling the chart data endpoint in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/subscriptions/thunk/fetchSubscriptionsChartData.ts`
- [x] T031 [US1] Add new state fields (`subscriptionDetail`, `isLoadingDetail`, `detailError`, `reviews`, `isLoadingReviews`, `reviewsError`, `chartData`, `isLoadingChart`, `chartError`) and wire T027–T030 thunks into `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/subscriptions/subscriptionsSlice.ts` (depends on T027, T030)
- [x] T032 [US1] Add `reviews`, `isLoadingReviews`, `reviewsError` state and wire T028–T029 thunks into `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/plans/plansSlice.ts` (depends on T028, T029)
- [x] T033 [US1] Rewrite `SubscriptionDetails.tsx` to accept URL param `:id` via `useParams`, dispatch `fetchSubscriptionById`, and render loading spinner / error with retry / data from API (replacing all hardcoded values) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/SubscriptionDetails.tsx` (depends on T027, T031)
- [x] T034 [US1] Rewrite `Reviews.tsx` to dispatch `fetchReviews` on mount and render ReviewCards from API data (replacing hardcoded `[1,2,3,4,5,6]` array) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/plansAndReview/Reviews.tsx` (depends on T028, T032)
- [x] T035 [US1] Add `onClick` handlers to the approve and reject buttons that dispatch `updateReviewStatus({ id, status })` and show success/error toast in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/components/pagesComponents/plansAndReview/ReviewCard.tsx` — change component to accept `review` prop with id and status (depends on T029)
- [x] T036 [US1] Rewrite `SubscriptionsChart.tsx` to accept `data` prop from Redux state populated by `fetchSubscriptionsChartData` (replacing hardcoded inline data array) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/components/charts/SubscriptionsChart.tsx` (depends on T030, T031)
- [x] T037 [US1] Delete dead chart components: `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/components/charts/PieChartHome.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/components/charts/LineChartHome.tsx`, and remove any imports of these components
- [ ] T038 [US1] Add loading spinner during fetch, error message with retry button on failure, and empty-state illustration when no contact requests exist in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/contactRequests/ContactRequests.tsx`
- [ ] T039 [US1] Add empty-state message "لا توجد نتائج" when filter returns zero results in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/SubscriptionReports.tsx`
- [ ] T040 [US1] Add loading spinner on initial page load in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/settings/Settings.tsx`
- [ ] T041 [US1] Wire the "تحميل التقرير" button to a real download API call or remove the button if no endpoint exists in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/SubscriptionReports.tsx`
- [ ] T042 [US1] Create `fetchLawyerById` async thunk calling `GET /Subscription/lawyers/{id}` using `ADMIN_ROUTES.LAWYER_DETAIL(id)` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/lawyers/thunk/fetchLawyerById.ts`
- [x] T043 [US1] Convert all static page imports to `React.lazy()` dynamic imports, wrap each `<Route>` element in `<Suspense fallback={<Spinner />}>`, and remove static imports in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/router/AppRouter.tsx`

**Checkpoint**: All admin pages show real API data. Loading/error/empty states work. Dead charts removed. Code splitting active.

---

## Phase 4: User Story 2 — Lawyer Error Handling (Priority: P2)

**Goal**: Every lawyer dashboard page shows meaningful error states with retry. Protected route shows spinner during auth check. Proper 404 page with layout and navigation.

**Independent Test**: Simulate network failure on lawyer home page — verify each section shows error+retry independently. Navigate to invalid case ID — verify error message. Navigate to unrecognized URL — verify 404 page with layout. Refresh page during auth — verify spinner, not blank screen.

### Implementation for US2

- [x] T044 [US2] Add error state rendering with retry button for each of the 4 API sections (cases, clients, reports, agenda) when `loading === 'failed'` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/home/Home.tsx` — wrap each section in a conditional that checks the corresponding thunk status
- [x] T045 [US2] Add error state rendering with "القضية غير موجودة" message and back button when case fetch fails or returns 404 in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/` (the case details component)
- [x] T046 [US2] Add error state rendering with retry button when client list fetch fails in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/clients/Clients.tsx`
- [x] T047 [US2] Replace `return null` (line 21) with a spinner or skeleton component when `status === 'unknown'` during auth verification in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/router/ProtectedRoute.tsx`
- [x] T048 [US2] Create a `NotFoundPage` component using the existing `NotFoundImage` component with `variant='default'` plus layout wrapper and navigation links (home, back button) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/notFound/NotFoundPage.tsx`
- [x] T049 [US2] Replace the bare `<h1>الصفحة غير موجودة</h1>` catch-all route element with the new `NotFoundPage` component in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/router/AppRouter.tsx` (depends on T048)

**Checkpoint**: All lawyer pages show error states with retry. Protected route shows spinner. 404 page has proper layout.

---

## Phase 5: User Story 3 — Lawyer Performance (Priority: P2)

**Goal**: moment.js and Mantine removed from bundle. Route-level code splitting active. Sidebar resize debounced. PDF processing uses lazy rendering.

**Independent Test**: Build lawyer dashboard and analyze bundle — confirm zero moment/Mantine. Navigate routes and verify lazy chunk loading in network tab. Resize sidebar rapidly — verify no jank.

### Implementation for US3

- [x] T050 [P] [US3] Replace `moment(...).format(...)` with `format(...)` from `date-fns` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/processServerPapers/ProcessServerPapersList.tsx`
- [x] T051 [P] [US3] Replace `moment` with `date-fns format/parseISO` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/clients/Clients.tsx`
- [x] T052 [P] [US3] Replace `moment` with `date-fns` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/clients/ClientDetails.tsx`
- [x] T053 [P] [US3] Replace `moment` with `date-fns` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/Cases.tsx`
- [x] T054 [P] [US3] Replace `moment` with `date-fns` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/subscription/Subscription.tsx`
- [x] T055 [P] [US3] Replace `moment` with `date-fns` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/settings/subPagesSettings/Subscription.tsx`
- [x] T056 [P] [US3] Replace `moment` with `date-fns` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/clients/tabs/DocumentHandoffTab.tsx`
- [x] T057 [P] [US3] Replace `moment` with `date-fns` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/clients/tabs/FinancialsTab.tsx`
- [x] T058 [US3] Remove `MantineProvider` wrapper and `@mantine/core/styles.css` import from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/main.tsx` (depends on T059, T060, T061)
- [x] T059 [P] [US3] Replace Mantine `Alert` with HeroUI `Snippet` or custom alert component in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/ui/SanitizedContentEmpty.tsx`
- [x] T060 [P] [US3] Replace Mantine `Skeleton` with HeroUI `Skeleton` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/skeleton/SkeletonForm.tsx`
- [x] T061 [P] [US3] Evaluate if `StepperComponent` is used anywhere in routes/pages; if not, delete `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/ui/stepper/StepperComponent.tsx`; if used, replace Mantine `Stepper`/`Button`/`Group` with HeroUI equivalents
- [x] T062 [US3] Convert all static page imports to `React.lazy()` dynamic imports, wrap each `<Route>` in `<Suspense fallback={<Spinner />}>` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/router/AppRouter.tsx`
- [x] T063 [US3] Add debounce (150ms) to the resize event listener using a utility function or `setTimeout`/`clearTimeout` pattern in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/sidebar/Sidebar.tsx` (lines 25–32)
- [x] T064 [US3] Remove `"moment": "^2.30.1"`, `"@mantine/core": "^8.3.10"`, `"@mantine/hooks": "^8.3.10"`, `"postcss-preset-mantine"`, and `"postcss-simple-vars"` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/package.json` (depends on T050–T061)
- [x] T065 [US3] Run `npm install` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/` to clean up removed dependencies, then `npm run build` in lawyer-dashboard to verify bundle compiles without moment or Mantine (depends on T064)

**Checkpoint**: moment.js and Mantine absent from bundle. Code splitting active. Sidebar debounce working.

---

## Phase 6: User Story 4 — Landing Page Interactive & SEO (Priority: P3)

**Goal**: All CTA and pricing buttons navigate to signup. Professional plan has distinct features. SEO metadata unique per page. robots.txt/sitemap.xml generated. Hero height corrected. Unused files removed.

**Independent Test**: Click every CTA/pricing button — verify navigation. View page source on each sub-page — verify unique metadata. Request /robots.txt and /sitemap.xml — verify valid responses. Run Lighthouse — verify SEO 90+.

### Implementation for US4

- [x] T066 [US4] Change the CTA `<button type="button">` to an `<a href>` linking to `${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5078'}/auth/sign-up` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/src/components/callToAction/CallToAction.tsx`
- [x] T067 [US4] Change all 3 plan `<button type="button">` elements to `<a href>` linking to `${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5078'}/auth/sign-up` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/src/components/pricingPlans/PricingPlans.tsx`
- [x] T068 [US4] Replace the professional plan's features array with distinct content (e.g., "إدارة قضايا غير محدودة", "مساعد ذكي متقدم", "دعم فني ذو أولوية", "تقارير متقدمة وتحليلات") different from the basic plan in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/src/components/pricingPlans/PricingPlans.tsx`
- [x] T069 [US4] Fix hero section height by changing `min-height: 170vh` to `min-height: 100vh` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/src/components/heroSection/HeroSection.css` (line 3)
- [x] T070 [US4] Replace the OG image `icon` entry from `.ico` to a proper PNG/WEBP file path, and add `NEXT_PUBLIC_SITE_URL` for the `url` field in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/src/app/layout.tsx` metadata export
- [x] T071 [US4] Convert privacy-policy page from `'use client'` to a server component and export `generateMetadata` returning unique title "سياسة الخصوصية | محامي سمارت" and description in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/src/app/privacy-policy/page.tsx`
- [x] T072 [US4] Convert refund-policy page from `'use client'` to a server component and export `generateMetadata` returning unique title "سياسة الاسترداد | محامي سمارت" and description in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/src/app/refund-policy/page.tsx`
- [x] T073 [US4] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/src/app/robots.ts` exporting default function that returns `MetadataRoute.Robots` allowing all crawlers with sitemap URL
- [x] T074 [US4] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/src/app/sitemap.ts` exporting default function that returns `MetadataRoute.Sitemap` with entries for `/`, `/privacy-policy`, `/refund-policy` using `NEXT_PUBLIC_SITE_URL`
- [x] T075 [US4] Lazy-load the 3 Framer Motion animated sections using `next/dynamic` with `ssr: false` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/src/app/page.tsx` for HeroSection, FeaturesSection, and HowToUseSection
- [x] T076 [US4] Delete unused boilerplate SVGs: `next.svg`, `vercel.svg`, `file.svg`, `window.svg`, `globe.svg` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/public/`
- [ ] T077 [US4] Add `@mohamy/shared-validations` and `@mohamy/shared-api` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/package.json` dependencies, then replace the local `apiClient` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/src/lib/api.ts` with an import from `@mohamy/shared-api` (depends on T008, T009 from Phase 2)
- [x] T078 [US4] Run `npm run build` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/` and verify static export succeeds with all new metadata and routes (depends on T066–T077)

**Checkpoint**: All CTA buttons navigate. SEO metadata unique per page. robots.txt/sitemap.xml generated. Hero height corrected.

---

## Phase 7: User Story 6 — Code Quality & Cleanup (Priority: P4)

**Goal**: Zero duplicate types, consistent Redux hooks, centralized error handling and API routes, hardcoded values extracted, bugs fixed.

**Independent Test**: Search codebase for duplicate `TAdminUser`, hardcoded WhatsApp numbers, `moment` imports, `@mantine` imports, direct `react-redux` usage, commented-out code, inline `#EF950A`. Verify all eliminated.

### Implementation for US6

- [x] T079 [P] [US6] Add `TAdminUser` type (with fields `userId`, `fullName`, `roles: string[]`, `email?: string`, `phone?: string`) to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/types/index.ts` and update imports in `authSlice.ts`, `thunkAuthLogin.ts`, `thunkAuthMe.ts` to import from there, removing the 3 local definitions
- [x] T080 [P] [US6] Delete `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/reports/thunk/reportThunks.ts` and update any imports that reference it to use the individual thunk files directly
- [x] T081 [US6] Replace all direct `import { useDispatch, useSelector } from 'react-redux'` with `import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'` in all admin page components that bypass the typed hooks in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/`
- [x] T082 [P] [US6] Fix `setPageNumber` bug: wrap call with `dispatch()` — change `onChange={(page) => setPageNumber(page)}` to `onChange={(page) => dispatch(setPageNumber(page))}` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/Cases.tsx` (line 190)
- [x] T083 [P] [US6] Fix `isSaving` tracking: replace `useRef<boolean>(false)` with `useState<boolean>(false)` and update all `isSavingRef.current = ...` to `setIsSaving(...)` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/hooks/useWorkflowAutoSave.ts`
- [x] T084 [P] [US6] Extract `getInitials(name: string)` and `getAvatarColor(id: string)` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/utils/avatar.ts` and update imports in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/clients/Clients.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/clients/ClientDetails.tsx`, removing the local definitions
- [x] T085 [P] [US6] Move `EGYPT_GOVERNORATES` constant from component-local to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-utils/src/constants.ts` (new file), export it, and update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/auth/SignUp.tsx` to import from shared-utils
- [x] T086 [US6] Replace hardcoded WhatsApp number `201289221056` with `import.meta.env.VITE_SUPPORT_WHATSAPP` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/auth/AuthLayout.tsx` (line 23) and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/auth/AuthLegalPage.tsx` (lines 49–53) (depends on T001)
- [x] T087 [P] [US6] Replace all inline `#EF950A` color references with `var(--main-color)` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/clients/Clients.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/clients/ClientDetails.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/auth/ForgotPassword.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/auth/VerifyPhone.tsx`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/Documents/Documents.css`
- [ ] T088 [US6] Add all missing API route constants (Cases CRUD, Clients CRUD, Agenda, Legal Library, Process Server Papers) to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/APIs/routes.ts` and update thunks to use them instead of hardcoded URL strings
- [x] T089 [P] [US6] Delete the empty `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/store/api/` directory
- [x] T090 [P] [US6] Remove or replace `FALLBACK_PLANS` hardcoded array with API-only data in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/subscription/Subscription.tsx` — if API returns plans, render those; if empty, show empty state
- [x] T091 [P] [US6] Remove commented-out code in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/components/header/Header.tsx` (if any dead commented blocks exist)
- [ ] T092 [P] [US6] Remove Zod validation import from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/validations/settingsSchema.ts` if it duplicates shared-validations, and import from `@mohamy/shared-validations` instead
- [ ] T093 [US6] Run `npx turbo build` and `npx turbo lint` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/` to verify all apps and packages compile and lint cleanly (depends on T079–T092)

**Checkpoint**: Zero duplicate types. All Redux hooks standardized. API URLs centralized. Hardcoded values extracted. Bugs fixed.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all user stories.

- [ ] T094 Verify all new error and empty state messages are in Arabic across admin and lawyer dashboards by searching for English-only strings in newly modified files
- [ ] T095 Run `npm run build` in all 3 apps (`apps/admin-dashboard`, `apps/lawyer-dashboard`, `apps/landing`) and verify zero build errors
- [ ] T096 Run `npm run lint` in all 3 apps and verify zero lint errors
- [ ] T097 Verify landing page Lighthouse SEO score by running `npx lighthouse http://localhost:3000 --output=json --only-categories=seo` and confirming score ≥ 90
- [ ] T098 Verify lawyer dashboard bundle size reduction by running `npm run build` in `apps/lawyer-dashboard` and comparing `dist/assets/` total size against pre-remediation baseline — target 30%+ reduction

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US5 — Shared Packages)**: Depends on Phase 1 (T003–T005 for Zod alignment)
- **Phase 3 (US1 — Admin Dashboard)**: Depends on Phase 2 (shared types must compile)
- **Phase 4 (US2 — Lawyer Errors)**: Depends on Phase 2 (shared types must compile)
- **Phase 5 (US3 — Lawyer Performance)**: No dependency on US1/US2 but depends on Phase 2 for shared package changes
- **Phase 6 (US4 — Landing Page)**: Depends on Phase 2 (shared packages integration T077)
- **Phase 7 (US6 — Code Quality)**: Can start after Phase 2; best done after US1–US3 to avoid conflicts
- **Phase 8 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US5 (Shared Packages)**: FOUNDATIONAL — blocks all other stories
- **US1 (Admin Dashboard)**: Depends on US5. Independent of US2, US3, US4.
- **US2 (Lawyer Errors)**: Depends on US5. Independent of US1, US3, US4.
- **US3 (Lawyer Performance)**: Depends on US5. Independent of US1, US2, US4.
- **US4 (Landing Page)**: Depends on US5 (shared-api/shared-validations integration). Independent of US1, US2, US3.
- **US6 (Code Quality)**: Depends on US5. Best after US1–US3 to avoid merge conflicts.

### Parallel Opportunities

**After Phase 2 completes**, all 4 user stories can proceed in parallel:
- Developer A: US1 (Admin Dashboard) — Phase 3
- Developer B: US2 (Lawyer Errors) + US3 (Lawyer Performance) — Phases 4–5
- Developer C: US4 (Landing Page) — Phase 6

Within Phase 5 (US3), all moment.js replacements (T050–T057) can run in parallel — different files, no dependencies.

Within Phase 7 (US6), T079, T080, T082, T083, T084, T085, T087, T089, T090, T091, T092 can all run in parallel — different files.

---

## Parallel Example: Phase 5 (US3 — moment.js Replacement)

```bash
# All 8 moment.js replacements are independent — launch together:
Task T050: "Replace moment with date-fns in ProcessServerPapersList.tsx"
Task T051: "Replace moment with date-fns in Clients.tsx"
Task T052: "Replace moment with date-fns in ClientDetails.tsx"
Task T053: "Replace moment with date-fns in Cases.tsx"
Task T054: "Replace moment with date-fns in Subscription.tsx"
Task T055: "Replace moment with date-fns in settings/Subscription.tsx"
Task T056: "Replace moment with date-fns in DocumentHandoffTab.tsx"
Task T057: "Replace moment with date-fns in FinancialsTab.tsx"
```

---

## Implementation Strategy

### MVP First (US1 — Admin Dashboard Only)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: US5 Shared Packages (T006–T021)
3. Complete Phase 3: US1 Admin Dashboard (T022–T043)
4. **STOP and VALIDATE**: Test admin pages independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Shared Packages → Foundation ready
2. Add US1 (Admin) → Test independently → Deploy (MVP!)
3. Add US2 (Lawyer Errors) → Test independently → Deploy
4. Add US3 (Lawyer Performance) → Test independently → Deploy
5. Add US4 (Landing Page) → Test independently → Deploy
6. Add US6 (Code Quality) → Final cleanup → Deploy
7. Polish → Full validation → Ship

---

## Notes

- All error/empty state messages must be in Arabic — search for English strings before marking complete
- When replacing moment.js, verify date formatting matches existing Arabic locale output
- The `register/` directory does not exist in landing — no action needed for FR-036
- `next.config.ts` `unoptimized: true` is correct for static export — do not change
- Landing CTA buttons should use `<a href>` not Next.js `<Link>` (cross-app navigation)
- Professional plan feature content is a business decision — use placeholder distinct features if not provided
- Verify backend endpoint paths in T022 by checking the actual .NET controllers before wiring thunks
