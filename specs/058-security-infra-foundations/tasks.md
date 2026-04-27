# Tasks: Security & Infrastructure Foundations

**Input**: Design documents from `/specs/058-security-infra-foundations/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install the one new dependency and create the shared utility needed by multiple stories.

- [x] T001 Install DOMPurify and its types in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/package.json` by running `npm install dompurify && npm install -D @types/dompurify`
- [x] T002 Create `sanitizeHtml` utility with `sanitizeHtml(html: string): string` and `isSanitizedEmpty(html: string): boolean` functions in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/utils/sanitizeHtml.ts` — use DOMPurify with ALLOWED_TAGS: `['b','i','em','strong','ul','ol','li','p','br','h1','h2','h3','h4','span','div','table','tr','td','th','thead','tbody']` and ALLOWED_ATTR: `['class','style','dir']` (depends on T001)
- [x] T003 [P] Create `SanitizedContentEmpty` warning component that displays "المحتوى غير متاح — يُرجى مراجعة البيانات الأصلية" in an alert box in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/ui/SanitizedContentEmpty.tsx`

**Checkpoint**: DOMPurify installed, sanitization utility ready, empty-content warning component ready.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No cross-story blockers — all stories are independent. Proceed directly to user stories.

**⚠️ Note**: Phase 1 setup (T001-T003) must complete before US1. All other stories are independent of each other and of US1.

---

## Phase 3: User Story 1 — Protect Users from XSS Attacks (Priority: P1) 🎯 MVP

**Goal**: Sanitize all `dangerouslySetInnerHTML` usages in the Lawyer Dashboard to prevent XSS attacks. Display Arabic warning when sanitization produces empty content.

**Independent Test**: Inject `<script>alert('xss')</script>` into a case client name field, view the analysis page, verify the script tag is stripped and only safe text is displayed.

### Implementation for User Story 1

- [x] T004 [US1] Import `sanitizeHtml` and `isSanitizedEmpty` from `src/utils/sanitizeHtml.ts`, wrap the `getHighlightedText(finalDocument.documentText)` call with `sanitizeHtml()`, and add `SanitizedContentEmpty` fallback when `isSanitizedEmpty()` returns true in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/steps/ComplaintStep5FinalAssembly.tsx` (line ~163)
- [x] T005 [P] [US1] Import `sanitizeHtml` and `isSanitizedEmpty` from `src/utils/sanitizeHtml.ts`, wrap the `getHighlightedText(finalAssemblyData.fullAppealText || '')` call with `sanitizeHtml()`, and add `SanitizedContentEmpty` fallback when `isSanitizedEmpty()` returns true in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/steps/AppealStep6Assembly.tsx` (line ~123)
- [x] T006 [P] [US1] Import `sanitizeHtml` and `isSanitizedEmpty` from `src/utils/sanitizeHtml.ts`, wrap the `getHighlightedText(finalAssembly.documentText)` call with `sanitizeHtml()`, and add `SanitizedContentEmpty` fallback when `isSanitizedEmpty()` returns true in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/steps/ExecStep3Assembly.tsx` (line ~91)
- [x] T007 [P] [US1] Import `sanitizeHtml` and `isSanitizedEmpty` from `src/utils/sanitizeHtml.ts`, wrap the `getHighlightedText(finalDocument.documentText)` call with `sanitizeHtml()`, and add `SanitizedContentEmpty` fallback when `isSanitizedEmpty()` returns true in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/steps/WarningStep3FinalAssembly.tsx` (line ~168)

**Checkpoint**: All 4 `dangerouslySetInnerHTML` usages now pass through DOMPurify. Zero unsanitized HTML rendering in the codebase.

---

## Phase 4: User Story 2 — Ensure Secure Communication (HTTPS Guard) (Priority: P1)

**Goal**: Add HTTPS enforcement to the Landing page API client, matching the existing guard in the Admin and Lawyer dashboards.

**Independent Test**: Set `NEXT_PUBLIC_API_BASE_URL=http://example.com/api` and run the Landing page in production mode — verify it throws an error and logs a warning. Then set `https://` and verify it works normally.

### Implementation for User Story 2

- [x] T008 [US2] Create API client module with HTTPS guard at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing/src/lib/api.ts` — read `process.env.NEXT_PUBLIC_API_BASE_URL`, check `process.env.NODE_ENV === 'production'`, throw `Error('[Security] NEXT_PUBLIC_API_BASE_URL must use HTTPS in production. Got: ${url}')` and `console.warn` if URL doesn't start with `https://`, allow HTTP only for localhost in development. Export the validated `apiBaseUrl` constant and an `apiClient` axios instance with `baseURL` set to it.
- [x] T009 [US2] Install axios as a dependency in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing/package.json` by running `npm install axios` (required for T008 if not already present)

**Checkpoint**: Landing page API client rejects HTTP in production, allows HTTP only for localhost in dev. Matches dashboard behavior.

---

## Phase 5: User Story 3 — Automated CI Quality Checks (Priority: P1)

**Goal**: Enhance the existing CI workflow to add lint, type-check, and npm audit steps to all 3 frontend jobs. Update Node.js version to 22.

**Independent Test**: Create a PR with a TypeScript type error in any dashboard — verify the CI pipeline fails and reports the error. Fix it — verify CI passes.

### Implementation for User Story 3

- [x] T010 [US3] Update the `lawyer-dashboard` job in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.github/workflows/ci.yml` — change `node-version` from `'20'` to `'22'`, and add 3 new steps after `npm ci` and before `npm run build`: (1) `npm run lint` step named "Lint", (2) `npx tsc --noEmit` step named "Type Check", and after `npm run build` add (3) `npm audit --production --audit-level=high` step named "Security Audit". All steps must use `working-directory: mohamy-smart-lawyer-dashboard`.
- [x] T011 [P] [US3] Update the `admin-dashboard` job in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.github/workflows/ci.yml` — change `node-version` from `'20'` to `'22'`, and add 3 new steps after `npm ci` and before `npm run build`: (1) `npm run lint` step named "Lint", (2) `npx tsc --noEmit` step named "Type Check", and after `npm run build` add (3) `npm audit --production --audit-level=high` step named "Security Audit". All steps must use `working-directory: mohamy-smart-admin-dashboard`.
- [x] T012 [P] [US3] Update the `landing` job in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.github/workflows/ci.yml` — change `node-version` from `'20'` to `'22'`, and add 3 new steps after `npm ci` and before `npm run build`: (1) `npm run lint` step named "Lint", (2) `npx tsc --noEmit` step named "Type Check", and after `npm run build` add (3) `npm audit --production --audit-level=high` step named "Security Audit". All steps must use `working-directory: mohamy-smart-landing`.

**Checkpoint**: CI pipeline now runs lint + type-check + build + security audit on all 3 frontend apps with Node 22. Backend job unchanged.

---

## Phase 6: User Story 4 — Proactive Dependency Monitoring (Priority: P2)

**Goal**: Configure Dependabot for all 3 frontend apps, the backend, and GitHub Actions to automatically create update PRs for vulnerable dependencies.

**Independent Test**: Verify the Dependabot configuration file is valid YAML matching the GitHub Dependabot v2 schema, and targets all 5 ecosystems.

### Implementation for User Story 4

- [x] T013 [US4] Create Dependabot configuration file at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.github/dependabot.yml` with `version: 2` and 5 `updates` entries: (1) npm for `/mohamy-smart-admin-dashboard` weekly with limit 5, (2) npm for `/mohamy-smart-lawyer-dashboard` weekly with limit 5, (3) npm for `/mohamy-smart-landing` weekly with limit 5, (4) nuget for `/mohamy-smart-backend` weekly with limit 5, (5) github-actions for `/` weekly with limit 3.

**Checkpoint**: Dependabot configured for all ecosystems. Will generate update PRs on next scheduled scan.

---

## Phase 7: User Story 5 — Eliminate Type Safety Gaps (Priority: P2)

**Goal**: Enable `noImplicitAny: true` in both Vite dashboard tsconfigs and fix all ~23 `any` usages with proper types.

**Independent Test**: Run `npx tsc --noEmit` in both dashboards — zero type errors expected.

### Implementation for User Story 5

- [x] T014 [US5] Add `"noImplicitAny": true` to the `compilerOptions` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/tsconfig.json` (or `tsconfig.app.json` if that's the app config)
- [x] T015 [US5] Run `npx tsc --noEmit` in `mohamy-smart-admin-dashboard/`, identify all `any`-related errors, and fix each one with proper types in the following files (replace `any` with the correct type — use `unknown` with type guards for truly dynamic data): `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/pages/analytics/AnalyticsDashboard.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/pages/analytics/components/SubscriptionLifecycle.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/pages/analytics/components/CohortRetentionTable.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/pages/analytics/components/UserEngagement.tsx` (depends on T014)
- [x] T016 [US5] Fix remaining `any` usages in Admin Dashboard — replace `any` with proper types in: `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/features/analytics/analyticsSlice.ts`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/components/ui/inputs/FilterSelect.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/components/ui/inputs/CustomInput.tsx` (depends on T014)
- [x] T017 [US5] Add `"noImplicitAny": true` to the `compilerOptions` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/tsconfig.json` (or `tsconfig.app.json` if that's the app config)
- [x] T018 [US5] Run `npx tsc --noEmit` in `mohamy-smart-lawyer-dashboard/`, identify all `any`-related errors, and fix each one with proper types across the affected source files (expected ~12 files). Replace `any` with the correct type — use `unknown` with type guards for truly dynamic data, define proper interfaces for API responses in the relevant type definition files (depends on T017)

**Checkpoint**: Both dashboards compile with `noImplicitAny: true` and zero type errors. Zero `any` annotations in application code.

---

## Phase 8: User Story 6 — Environment Configuration Validation (Priority: P3)

**Goal**: Replace fragile Sentry DSN string checks with Zod validators. Update all `.env.example` files with descriptive comments.

**Independent Test**: Set `VITE_SENTRY_DSN=TODO_REPLACE_ME` and start the app — verify Sentry is NOT initialized and a warning is logged. Set a valid DSN URL — verify Sentry initializes.

### Implementation for User Story 6

- [x] T019 [US6] Create `envValidator.ts` utility at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/utils/envValidator.ts` — define a Zod schema validating `VITE_SENTRY_DSN` as optional `z.string().url().startsWith('https://')` or empty string, and `VITE_API_BASE_URL` as required `z.string().url()`. Export a `validateEnv()` function that calls `safeParse` on `import.meta.env` values and logs warnings for failures.
- [x] T020 [US6] Replace the Sentry DSN check (`sentryDsn && !sentryDsn.startsWith('TODO')`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/main.tsx` (lines 11-22) with a call to `validateEnv()` from `src/utils/envValidator.ts`. Only call `Sentry.init()` if the validated `VITE_SENTRY_DSN` is a non-empty valid URL. Log `console.warn('[Config] Sentry DSN invalid or missing — monitoring disabled')` otherwise. (depends on T019)
- [x] T021 [P] [US6] Create `envValidator.ts` utility at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/utils/envValidator.ts` — same Zod schema as Admin (T019): validate `VITE_SENTRY_DSN` as optional URL starting with `https://` or empty string, and `VITE_API_BASE_URL` as required URL. Export `validateEnv()`.
- [x] T022 [US6] Replace the Sentry DSN check (`sentryDsn && !sentryDsn.startsWith('TODO')`) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/main.tsx` (lines 13-24) with a call to `validateEnv()` from `src/utils/envValidator.ts`. Only call `Sentry.init()` if the validated `VITE_SENTRY_DSN` is a non-empty valid URL. (depends on T021)
- [x] T023 [P] [US6] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/.env.example` — add descriptive comments above each variable explaining: purpose, expected format (URL, string, boolean), whether required or optional. Include examples: `# VITE_API_BASE_URL (required) — Base URL for the backend API. Format: https://domain.com/api`, `# VITE_SENTRY_DSN (optional) — Sentry error monitoring DSN. Format: https://key@sentry.io/project. Leave empty to disable.`
- [x] T024 [P] [US6] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/.env.example` — add descriptive comments above each variable with same format as T023 (purpose, format, required/optional).
- [x] T025 [P] [US6] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing/.env.example` — add descriptive comments above each variable. Use `NEXT_PUBLIC_` prefix naming convention. Include: `# NEXT_PUBLIC_API_BASE_URL (required) — Base URL for the backend API. Must use HTTPS in production.`

**Checkpoint**: Sentry DSN validated via Zod in both dashboards. All 3 `.env.example` files have descriptive comments. New developers can set up any app within 15 minutes.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation.

- [x] T026 Verify zero `dangerouslySetInnerHTML` without `sanitizeHtml` wrapper by running `grep -r "dangerouslySetInnerHTML" --include="*.tsx" --include="*.ts"` across all `src/` directories (exclude `node_modules`). Document results in a verification comment in this tasks file.
- [x] T027 [P] Verify both dashboards compile cleanly by running `npx tsc --noEmit` in both `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/`. Zero errors expected.
- [x] T028 [P] Validate CI workflow YAML syntax by running `cat .github/workflows/ci.yml | python3 -c "import sys,yaml; yaml.safe_load(sys.stdin.read()); print('Valid')"` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/`
- [x] T029 Run the quickstart verification steps from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/058-security-infra-foundations/quickstart.md` — execute `npm run lint && npx tsc --noEmit && npm run build && npm audit --production` in all 3 frontend app directories and confirm all pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 XSS (Phase 3)**: Depends on Setup (T001-T003) — uses sanitizeHtml utility
- **US2 HTTPS (Phase 4)**: No dependencies on other stories — independent
- **US3 CI (Phase 5)**: No dependencies on other stories — independent
- **US4 Dependabot (Phase 6)**: No dependencies — independent
- **US5 TypeScript (Phase 7)**: No dependencies on other stories — independent (but best done after US1 since sanitizeHtml.ts needs types)
- **US6 Env Validation (Phase 8)**: No dependencies on other stories — independent
- **Polish (Phase 9)**: Depends on ALL stories being complete

### User Story Dependencies

- **US1 (XSS)**: Depends on T001-T003 (Setup) — needs DOMPurify + utility
- **US2 (HTTPS)**: Fully independent — can start immediately
- **US3 (CI)**: Fully independent — can start immediately (but should be done AFTER US5 to ensure type-check passes)
- **US4 (Dependabot)**: Fully independent — can start immediately
- **US5 (TypeScript)**: Fully independent — can start immediately (RECOMMENDED to do before US3 so CI type-check passes)
- **US6 (Env Validation)**: Fully independent — can start immediately

### Recommended Execution Order (Single Developer)

1. **Setup** (T001-T003) — 15 min
2. **US5 TypeScript strict** (T014-T018) — 2-3 hours (do first so CI type-check will pass)
3. **US1 XSS** (T004-T007) — 1 hour
4. **US2 HTTPS** (T008-T009) — 30 min
5. **US6 Env Validation** (T019-T025) — 1-2 hours
6. **US3 CI** (T010-T012) — 30 min (do after US5 so type-check passes on first CI run)
7. **US4 Dependabot** (T013) — 10 min
8. **Polish** (T026-T029) — 30 min

---

## Parallel Opportunities

### Independent Story Parallelism (Multi-Developer)

```
Developer A: Setup → US1 (XSS) → US6 (Env Validation)
Developer B: US5 (TypeScript) → US3 (CI)
Developer C: US2 (HTTPS) → US4 (Dependabot) → Polish
```

### Within-Story Parallelism

```
# US1: All 4 file fixes can run in parallel (T004, T005, T006, T007)
# US3: All 3 CI job updates can run in parallel (T010, T011, T012)
# US5: Admin (T014-T016) and Lawyer (T017-T018) can run in parallel
# US6: T023, T024, T025 (.env.example updates) can run in parallel
# US6: T019+T020 (admin) and T021+T022 (lawyer) can run in parallel
```

---

## Implementation Strategy

### MVP First (US1 Only — XSS Protection)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 3: US1 XSS (T004-T007)
3. **STOP and VALIDATE**: Inject XSS payload, verify sanitization works
4. Critical security fix deployed ✅

### Incremental Delivery

1. Setup → US1 XSS → **Security Risk Eliminated** ✅
2. + US5 TypeScript → **Type Safety Enforced** ✅
3. + US3 CI → **Quality Gates Active** ✅
4. + US2 HTTPS + US6 Env → **Full Security Posture** ✅
5. + US4 Dependabot → **Monitoring Active** ✅
6. + Polish → **Phase 0 Complete** 🎉

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- The Landing page currently has NO API calls (static export) — the HTTPS guard (US2) is proactive protection for when API calls are added
- `DefenseMemoPage/steps/FinalNote.tsx` was listed in the issue report but does NOT contain `dangerouslySetInnerHTML` — only 4 files need fixing, not 5
- Node version in CI should be 22 (matching Docker constitution spec), not 20 (current)
- The existing `security.yml` with gitleaks + Trivy + CodeQL is NOT being modified — it complements the CI changes
