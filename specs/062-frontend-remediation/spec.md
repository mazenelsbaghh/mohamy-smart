# Feature Specification: Frontend Remediation — Phases 2–5

**Feature Branch**: `062-frontend-remediation`  
**Created**: 2026-04-23  
**Status**: Draft  
**Input**: User description: "Frontend Remediation: Admin Dashboard (P2), Lawyer Dashboard (P3), Landing Page (P4), Shared Packages Integration (P5) — from PROJECT_REMEDIATION_PLAN.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Views Live Data on Dashboard Pages (Priority: P1)

An admin user navigates to the subscription details, reviews, or subscriptions chart pages and sees real data fetched from the backend API instead of hardcoded or static mock data. Every page shows appropriate loading spinners while fetching, error messages with retry buttons when the API fails, and empty-state illustrations when no data exists. The admin can also approve or reject reviews using functional buttons.

**Why this priority**: The admin dashboard currently shows static/hardcoded data on several pages, making those pages unusable for their intended purpose. Fixing this unblocks the core admin workflows.

**Independent Test**: Navigate to each admin page (SubscriptionDetails, Reviews, SubscriptionsChart, ContactRequests, SubscriptionReports, Settings). Verify each shows real data from the API, has a loading spinner during fetch, displays an error message with retry on failure, and shows an empty-state message when no data is returned. Verify ReviewCard approve/reject buttons trigger API calls.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they navigate to SubscriptionDetails with a valid ID, **Then** the page fetches and displays the subscription data from the API, showing a spinner during load and an error message with retry on failure.
2. **Given** an admin views the Reviews page, **When** they click "Approve" or "Reject" on a review card, **Then** the review status is updated via the API and the UI reflects the change immediately.
3. **Given** an admin views SubscriptionsChart, **When** the page loads, **Then** the chart renders data from the API (not hardcoded mock data).
4. **Given** an admin views ContactRequests and the API returns no results, **When** the page finishes loading, **Then** an empty-state illustration with a descriptive message is displayed.
5. **Given** an admin views SubscriptionReports with filters applied, **When** the filter returns no results, **Then** the page shows "No results found" instead of a blank screen.

---

### User Story 2 - Lawyer Dashboard Handles Errors Gracefully (Priority: P2)

A lawyer user navigates through their dashboard and encounters appropriate error states on every page. The home page shows error UI with retry for each of its data sections when API calls fail. Case details, client lists, and protected routes all display meaningful messages instead of blank screens or crashes. A proper 404 page with navigation is shown for unknown routes.

**Why this priority**: Without error handling, any API failure causes a broken or blank experience. This is critical for user trust and daily usability.

**Independent Test**: Simulate API failures (network offline or backend errors) on the lawyer home page, case details, and clients pages. Verify each shows an error message with a retry button. Navigate to an invalid URL and verify a proper 404 page appears with layout and navigation. Verify the protected route shows a spinner while checking authentication.

**Acceptance Scenarios**:

1. **Given** a lawyer is on the home page, **When** one or more API calls fail, **Then** each affected section shows an error message with a retry button independently.
2. **Given** a lawyer navigates to a case that does not exist, **When** the API returns 404, **Then** the page displays "Case not found" with a back button.
3. **Given** a lawyer navigates to an unrecognized URL, **When** the route does not match any defined route, **Then** a 404 page with full layout and navigation links is displayed.
4. **Given** a lawyer opens the app, **When** authentication is being verified, **Then** a spinner or skeleton is shown instead of a blank screen.

---

### User Story 3 - Lawyer Dashboard Performance is Optimized (Priority: P2)

A lawyer user experiences faster page loads and a smaller initial bundle. Heavy libraries (moment.js, Mantine) are removed and replaced with lighter alternatives. Each route loads only its own code on demand. PDF processing is optimized with lazy rendering and concurrency limits. Sidebar resizing does not cause performance jank.

**Why this priority**: Bundle size and rendering performance directly impact the lawyer's daily productivity. Removing unused heavy libraries is a quick win with measurable impact.

**Independent Test**: Measure the initial bundle size before and after changes. Verify code splitting is active by checking network tab for lazy-loaded chunks on route navigation. Confirm moment.js and Mantine are not present in the bundle. Test PDF upload with a large file and verify lazy page rendering.

**Acceptance Scenarios**:

1. **Given** the lawyer dashboard is loaded, **When** viewing the network tab, **Then** only the code for the current route is loaded; navigating to a new route triggers a separate chunk load.
2. **Given** the lawyer dashboard is built, **When** analyzing the bundle, **Then** moment.js and Mantine are absent from the output.
3. **Given** a lawyer uploads a multi-page PDF, **When** processing begins, **Then** pages are rendered lazily with a maximum concurrency limit preventing browser freezes.
4. **Given** a lawyer resizes the sidebar, **When** dragging the resize handle, **Then** the resize events are debounced and do not cause layout jank.

---

### User Story 4 - Landing Page Interactive Elements and SEO Work (Priority: P3)

A visitor lands on the landing page and can click CTA buttons that navigate to the signup page, click pricing plan buttons that start checkout or signup, and see different content for the professional plan vs. the basic plan. The page has proper SEO metadata (OG images, per-page metadata, robots.txt, sitemap.xml) and loads efficiently with optimized images and lazy-loaded animations.

**Why this priority**: The landing page is the first impression for potential customers. Non-functional CTAs mean lost conversions. Poor SEO means low discoverability.

**Independent Test**: Click every CTA and pricing button on the landing page and verify navigation. View page source and verify OG meta tags, unique metadata per sub-page, and the existence of robots.txt and sitemap.xml. Run a Lighthouse audit and verify improved performance and SEO scores.

**Acceptance Scenarios**:

1. **Given** a visitor clicks a CTA button on the landing page, **When** the click occurs, **Then** the visitor is navigated to the signup/dashboard page.
2. **Given** a visitor views pricing plans, **When** they click a plan button, **Then** they are directed to the appropriate signup or checkout flow.
3. **Given** a visitor views the professional plan section, **When** comparing with the basic plan, **Then** the professional plan shows distinctly different feature content.
4. **Given** a search engine crawls the landing page, **When** requesting /robots.txt and /sitemap.xml, **Then** valid files are returned with proper directives and URLs.
5. **Given** a visitor shares the landing page on social media, **When** the OG metadata is read, **Then** a proper PNG/WEBP image and descriptive metadata are displayed.

---

### User Story 5 - Shared Packages Are Consistent Across All Apps (Priority: P3)

Developers and the build system use a single consistent Zod version across all packages and apps. Validation rules (password, phone) are identical everywhere. The shared API client handles CSRF correctly. TypeScript configurations are unified, and type safety is enforced without `any` escapes.

**Why this priority**: Inconsistencies in shared packages cause subtle bugs, validation mismatches, and maintenance overhead. Unifying them prevents regressions and reduces technical debt.

**Independent Test**: Check package.json files across all apps and packages for Zod version consistency. Test form validations in admin, lawyer, and landing apps with the same inputs and verify identical behavior. Verify CSRF flow works end-to-end (failed pre-auth → login → reset). Run TypeScript compilation with strict mode and confirm no `any` escape issues in shared packages.

**Acceptance Scenarios**:

1. **Given** all packages and apps are installed, **When** checking Zod versions, **Then** every package.json lists the same Zod version.
2. **Given** a user enters a phone number in any app, **When** validation runs, **Then** the same regex is applied accepting both local and international formats.
3. **Given** a CSRF failure occurs before authentication, **When** the user logs in successfully, **Then** the CSRF flag is reset and subsequent requests succeed.
4. **Given** all TypeScript configs, **When** reviewed, **Then** every package extends the shared base configuration.
5. **Given** the shared-ui components, **When** compiled, **Then** no `any` type assertions remain in CustomInput or CustomTable.

---

### User Story 6 - Admin and Lawyer Dashboards Have Clean, Maintainable Code (Priority: P4)

Developers work with a codebase free of dead code, duplicate types, duplicate thunks, and inconsistent patterns. Redux hooks are standardized. Error handling uses a single utility. Hardcoded values are moved to shared constants or environment variables. API route URLs are centralized.

**Why this priority**: Code quality improvements reduce future bugs and make development faster. This is important but does not block users directly.

**Independent Test**: Search the codebase for duplicate type definitions, duplicate thunk files, commented-out code, inline hardcoded values, and inconsistent Redux hook usage. Verify all are eliminated or consolidated. Verify all API URLs are defined in a single routes file.

**Acceptance Scenarios**:

1. **Given** the admin dashboard codebase, **When** searching for duplicate TAdminUser types, **Then** only one definition exists in the shared types file.
2. **Given** the lawyer dashboard codebase, **When** searching for hardcoded WhatsApp numbers, **Then** the number is read from an environment variable.
3. **Given** both dashboard codebases, **When** reviewing error handling, **Then** all API error handling uses the centralized error handler utility.
4. **Given** the admin dashboard, **When** reviewing thunk files, **Then** duplicate report thunks have been removed, keeping only the specialized files.

---

### Edge Cases

- What happens when an admin navigates to SubscriptionDetails with an invalid or non-existent ID?
- What happens when the lawyer dashboard home page has partial API failures (some succeed, some fail)?
- What happens when a lawyer resizes the sidebar rapidly for an extended period?
- What happens when the landing page OG image file is missing or corrupted?
- What happens when shared-validations regex changes affect existing data that was validated with the old regex?
- What happens when Zod version upgrade introduces breaking changes to existing schemas?
- What happens when the CSRF token expires during a long-lived session?

## Requirements *(mandatory)*

### Functional Requirements

**Phase 2 — Admin Dashboard**

- **FR-001**: SubscriptionDetails page MUST fetch and display subscription data from the API using a URL parameter ID.
- **FR-002**: Reviews page MUST fetch reviews from the API and display them with functional approve/reject buttons.
- **FR-003**: SubscriptionsChart MUST render chart data from the API instead of hardcoded mock data.
- **FR-004**: Dead chart components (PieChartHome, LineChartHome) MUST be removed from the codebase.
- **FR-005**: Every admin page MUST display a loading spinner while fetching data.
- **FR-006**: Every admin page MUST display an error message with a retry option when API calls fail.
- **FR-007**: Every admin page MUST display an empty-state message or illustration when no data is available.
- **FR-008**: PlansAndReview forms MUST include proper input validation.
- **FR-009**: The "Download Report" button MUST either connect to a download endpoint or be removed.
- **FR-010**: Admin dashboard MUST fetch individual lawyer data by ID instead of loading all lawyers.
- **FR-011**: Loading states MUST be separated per thunk/operation instead of a single shared isLoading flag.
- **FR-012**: Admin dashboard MUST use route-level code splitting for lazy loading.
- **FR-013**: Duplicate types, thunks, and dead code MUST be removed from the admin codebase.
- **FR-014**: Error handling MUST use a centralized error handler utility consistently.
- **FR-015**: Redux hooks (useAppDispatch/useAppSelector) MUST be used consistently everywhere.

**Phase 3 — Lawyer Dashboard**

- **FR-016**: Lawyer home page MUST show error UI with retry for each section independently when API calls fail.
- **FR-017**: Case details page MUST display an error message when the case is not found or an error occurs.
- **FR-018**: Clients page MUST display an error message with retry when client data cannot be loaded.
- **FR-019**: Protected route MUST show a spinner or skeleton while verifying authentication.
- **FR-020**: A proper 404 page with full layout and navigation MUST be displayed for unrecognized routes.
- **FR-021**: moment.js MUST be removed and replaced with a lighter date utility throughout the lawyer dashboard.
- **FR-022**: Mantine components MUST be replaced with existing HeroUI equivalents throughout the lawyer dashboard.
- **FR-023**: Lawyer dashboard MUST use route-level code splitting for lazy loading.
- **FR-024**: PDF processing MUST use lazy page rendering with a maximum concurrency limit.
- **FR-025**: Sidebar resize events MUST be debounced.
- **FR-026**: The setPageNumber dispatch bug in Cases page MUST be fixed.
- **FR-027**: Orphaned routes and dead entry files MUST be removed.
- **FR-028**: Helper functions (getInitials, getAvatarColor) MUST be extracted to shared utilities.
- **FR-029**: All API route URLs MUST be centralized in a single routes configuration file.
- **FR-030**: Search queries MUST be sent to the API for server-side filtering instead of client-side filtering.
- **FR-031**: The useWorkflowAutoSave hook MUST track saving state properly.
- **FR-032**: Hardcoded EGYPT_GOVERNORATES MUST be moved to shared constants.
- **FR-033**: FALLBACK_PLANS data MUST be removed or replaced with API data.
- **FR-034**: Inline styles MUST be replaced with CSS classes.
- **FR-035**: WhatsApp contact number MUST be read from an environment variable.

**Phase 4 — Landing Page**

- **FR-036**: The empty Register page MUST be deleted or redirected.
- **FR-037**: CTA buttons MUST navigate visitors to the signup/dashboard page.
- **FR-038**: Pricing plan buttons MUST link to the appropriate signup or checkout flow.
- **FR-039**: The professional plan section MUST display distinctly different feature content from the basic plan.
- **FR-040**: OG image MUST be in PNG or WEBP format (not ICO).
- **FR-041**: Production site URL MUST be read from an environment variable.
- **FR-042**: Each sub-page (privacy-policy, refund-policy) MUST have its own unique metadata.
- **FR-043**: robots.txt and sitemap.xml MUST be generated and accessible.
- **FR-044**: Internal navigation links MUST use proper link components instead of plain anchor tags.
- **FR-045**: Hero section height MUST be corrected to 100vh.
- **FR-046**: Image optimization MUST be enabled or an external CDN loader must be used.
- **FR-047**: Framer Motion animated sections MUST be lazy-loaded.
- **FR-048**: Unused boilerplate SVGs (next.svg, vercel.svg, etc.) MUST be removed.
- **FR-049**: Duplicate Swiper CSS imports MUST be consolidated to a single import.
- **FR-050**: Security headers (CSP, HSTS) MUST be configured on the web server.
- **FR-051**: Landing page MUST use shared-validations package instead of local schemas.
- **FR-052**: Landing page MUST use shared-api package instead of local API client.

**Phase 5 — Shared Packages**

- **FR-053**: All packages and apps MUST use a single consistent Zod version.
- **FR-054**: Password validation regex MUST be unified in a single shared validation module.
- **FR-055**: Phone validation regex MUST accept both local and international formats, defined once in shared validations.
- **FR-056**: All `any` type usage in shared-validations MUST be replaced with proper Zod-inferred types.
- **FR-057**: The CSRF flag in shared-api MUST reset after a successful authentication.
- **FR-058**: All `any` type assertions in shared-api MUST be replaced with proper typing.
- **FR-059**: A branded ISO date type MUST be defined in shared-types.
- **FR-060**: NotificationItem.type MUST be a strict string union instead of a broad string type.
- **FR-061**: TClient.email consistency MUST be aligned with TProfile across all apps.
- **FR-062**: The environment variable validator MUST support Next.js NEXT_PUBLIC_* variables.
- **FR-063**: All package tsconfig files MUST extend a shared base configuration.
- **FR-064**: Duplicate dependencies across packages MUST be converted to peer dependencies where appropriate.
- **FR-065**: CustomInput component MUST have full type safety without `any` assertions.
- **FR-066**: CustomTable component MUST use proper generic typing without `any` assertions.

### Key Entities

- **Subscription**: Represents a user subscription with plan details, status, billing info. Key attributes: ID, plan name, status, start/end dates, amount.
- **Review**: User-submitted review with status (pending/approved/rejected). Key attributes: ID, content, rating, status, submitter, timestamps.
- **Case**: Legal case in the lawyer dashboard. Key attributes: ID, title, number, court, status, client, assigned lawyer.
- **Client**: Legal client in the lawyer dashboard. Key attributes: ID, name, phone, email, national ID.
- **Plan (Pricing)**: Subscription plan on the landing page. Key attributes: name, price, features list, CTA link.
- **Contact Request**: Form submission from the landing page. Key attributes: ID, name, phone, message, timestamps.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All admin dashboard pages display real data from the API with zero hardcoded or static mock data remaining.
- **SC-002**: Every page in admin and lawyer dashboards shows appropriate loading, error (with retry), and empty states — achieving 100% coverage across all data-fetching views.
- **SC-003**: Lawyer dashboard initial bundle size is reduced by at least 30% through removal of moment.js and Mantine and implementation of code splitting.
- **SC-004**: Landing page Lighthouse SEO score reaches 90+ (from current baseline).
- **SC-005**: All CTA and pricing buttons on the landing page are functional and navigate to the correct destination — 100% button coverage.
- **SC-006**: All packages and apps use exactly one Zod version with zero version mismatches.
- **SC-007**: Validation rules (password, phone) produce identical results when tested with the same inputs across admin, lawyer, and landing apps.
- **SC-008**: Zero `any` type assertions remain in shared packages (shared-validations, shared-api, shared-ui).
- **SC-009**: All sub-pages of the landing page have unique metadata — verifiable by viewing page source on each route.
- **SC-010**: 100% of API route URLs in the lawyer dashboard are centralized in a single configuration file.

## Assumptions

- Backend APIs for subscriptions, reviews, charts, and reports already exist and return the expected data shapes.
- HeroUI component library provides adequate replacements for all Mantine components currently in use (InputOtp, Calendar, Textarea, Spinner).
- The date-fns library provides equivalent functionality to all moment.js features currently used.
- Docker and nginx configurations are accessible for adding security headers (CSP, HSTS) to the landing page.
- The shared packages (shared-validations, shared-api, shared-types, shared-utils, shared-ui) already exist in the monorepo and can be extended.
- Phase 0 (urgent security fixes) and Phase 1 (critical backend fixes) are either completed or being addressed in parallel.
- Existing test suites will be updated to reflect component and utility changes, but writing new comprehensive tests is deferred to Phase 7.
- The Paymob payment/checkout integration already exists for linking pricing plan buttons.
- A single Zod version (v3 or v4) can be adopted across all packages without blocking changes; the choice is deferred to implementation.
