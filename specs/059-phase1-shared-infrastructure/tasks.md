# Tasks: Phase 1 — Unifying Infrastructure and Shared Library

**Input**: Design documents from `/specs/059-phase1-shared-infrastructure/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file path(s) in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the root workspace, install Turborepo, and prepare the monorepo skeleton before any application is moved.

- [x] T001 Create root `package.json` at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/package.json` with `"name": "mohamy-smart"`, `"private": true`, and `"workspaces": ["apps/*", "packages/*"]`. Add `"scripts"` for `"build": "turbo run build"`, `"dev": "turbo run dev"`, `"lint": "turbo run lint"`, `"type-check": "turbo run type-check"`. Set `"engines": { "node": ">=22" }`.
- [x] T002 Install `turbo` as a root devDependency by running `npm install --save-dev turbo` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/`.
- [x] T003 Create `turbo.json` at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/turbo.json` with pipeline configuration: `"build"` (depends on `^build`, outputs `["dist/**", "out/**", ".next/**"]`), `"dev"` (cache false, persistent true), `"lint"` (no deps), `"type-check"` (no deps).
- [x] T004 Create directory structure: `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Move the 3 existing frontend applications into `apps/` and ensure they still build and run correctly from their new locations.

**⚠️ CRITICAL**: No shared package work (US2, US3) can begin until all apps are moved and verified.

- [x] T005 Move `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/`. Update its `package.json` `"name"` field to `"@mohamy/admin-dashboard"`.
- [x] T006 Move `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/`. Update its `package.json` `"name"` field to `"@mohamy/lawyer-dashboard"`.
- [x] T007 Move `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing/` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/`. Update its `package.json` `"name"` field to `"@mohamy/landing"`.
- [x] T008 Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.github/workflows/ci.yml` — change all `working-directory` values from `mohamy-smart-lawyer-dashboard` to `apps/lawyer-dashboard`, from `mohamy-smart-admin-dashboard` to `apps/admin-dashboard`, and from `mohamy-smart-landing` to `apps/landing`. Update all `cache-dependency-path` values accordingly.
- [x] T009 Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.github/dependabot.yml` — change all 3 npm `directory` values from `/mohamy-smart-admin-dashboard` to `/apps/admin-dashboard`, from `/mohamy-smart-lawyer-dashboard` to `/apps/lawyer-dashboard`, and from `/mohamy-smart-landing` to `/apps/landing`.
- [x] T010 [P] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml` — update all `context` and `build.dockerfile` paths referencing `mohamy-smart-admin-dashboard`, `mohamy-smart-lawyer-dashboard`, `mohamy-smart-landing` to use `apps/admin-dashboard`, `apps/lawyer-dashboard`, `apps/landing` respectively.
- [x] T011 [P] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml` — apply same path changes as T010 for the production compose file.
- [x] T012 [P] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile` — replace all references to `mohamy-smart-admin-dashboard`, `mohamy-smart-lawyer-dashboard`, `mohamy-smart-landing` with `apps/admin-dashboard`, `apps/lawyer-dashboard`, `apps/landing`.
- [x] T013 Run `npm install` at the workspace root `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/` and verify it resolves all dependencies across all 3 apps. Then run `npx turbo run build` and confirm all 3 apps build successfully with zero errors.

**Checkpoint**: All 3 apps live in `apps/`, workspace install works, `npx turbo run build` succeeds, CI and Docker paths are updated.

---

## Phase 3: User Story 1 — Establish Unified Workspace Architecture (Priority: P1) 🎯 MVP

**Goal**: The monorepo is fully functional — workspace commands (`build`, `dev`, `lint`, `type-check`) orchestrate all apps via Turborepo.

**Independent Test**: Run `npx turbo run build` and `npx turbo run lint` at the root — all 3 apps succeed.

### Implementation for User Story 1

- [x] T014 [US1] Add `"type-check"` script (`"tsc --noEmit"`) to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/package.json` so that `npx turbo run type-check` can invoke it.
- [x] T015 [P] [US1] Add `"type-check"` script (`"tsc --noEmit"`) to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/package.json` so that `npx turbo run type-check` can invoke it.
- [x] T016 [P] [US1] Add `"type-check"` script (`"next lint && tsc --noEmit"` or equivalent) to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/landing/package.json` so that `npx turbo run type-check` can invoke it. Verify the Next.js project has a `tsconfig.json` that supports `--noEmit`.
- [x] T017 [US1] Run `npx turbo run build` and `npx turbo run lint` and `npx turbo run type-check` at the workspace root `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/` — confirm all 3 pass. Document any fixes required.

**Checkpoint**: Monorepo workspace is verified — all orchestration commands (`build`, `dev`, `lint`, `type-check`) work via Turborepo. US1 is complete.

---

## Phase 4: User Story 2 — Implement Shared UI Components Library (Priority: P2)

**Goal**: A `@mohamy/shared-ui` package provides CustomButton, CustomCard, CustomInput, Container, and CustomTable components — both dashboards consume them instead of their local copies.

**Independent Test**: Import `CustomButton` from `@mohamy/shared-ui` in the Admin Dashboard, build successfully, and see the button render with the correct brand styling.

### Implementation for User Story 2

- [x] T018 [US2] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-ui/package.json` with `"name": "@mohamy/shared-ui"`, `"private": true`, `"main": "src/index.ts"`, `"types": "src/index.ts"`. Add `peerDependencies` for `react`, `react-dom`, and `@heroui/react`.
- [x] T019 [US2] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-ui/tsconfig.json` extending a base TS config. Set `"compilerOptions": { "composite": true, "outDir": "dist", "rootDir": "src", "jsx": "react-jsx" }`, and `"include": ["src"]`.
- [x] T020 [US2] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-ui/src/components/CustomButton.tsx` — migrate the button component from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/components/ui/buttons/CustomButton.tsx`. Export `TCustomButton` type. Keep `--main-color` CSS variable usage for primary styling. Copy the associated `Buttons.css` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-ui/src/components/Buttons.css`.
- [x] T021 [P] [US2] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-ui/src/components/CustomCard.tsx` — migrate from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/components/ui/card/CustomCard.tsx`. Export the props type. Copy `Card.css` alongside it.
- [x] T022 [P] [US2] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-ui/src/components/CustomInput.tsx` — migrate from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/components/ui/inputs/CustomInput.tsx`. Export the props type. Copy `Inputs.css` alongside it.
- [x] T023 [P] [US2] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-ui/src/components/Container.tsx` — migrate from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/components/ui/Container.tsx`. Export the `TContainer` type.
- [x] T024 [P] [US2] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-ui/src/components/CustomTable.tsx` — migrate from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/components/ui/table/CustomTable.tsx`. Export the props type. Copy `Table.css` and `TableConfig.ts` alongside it.
- [x] T025 [US2] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-ui/src/index.ts` — re-export all 5 components and their types: `CustomButton`, `CustomCard`, `CustomInput`, `Container`, `CustomTable`.
- [x] T026 [US2] Add `"@mohamy/shared-ui": "*"` to the `dependencies` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/package.json`. Run `npm install` at workspace root to link the package.
- [x] T027 [US2] Update all imports in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/` that reference `components/ui/buttons/CustomButton`, `components/ui/card/CustomCard`, `components/ui/inputs/CustomInput`, `components/ui/Container`, or `components/ui/table/CustomTable` — change them to import from `@mohamy/shared-ui`. Then delete the original local files: `apps/admin-dashboard/src/components/ui/buttons/CustomButton.tsx`, `apps/admin-dashboard/src/components/ui/buttons/Buttons.css`, `apps/admin-dashboard/src/components/ui/card/CustomCard.tsx`, `apps/admin-dashboard/src/components/ui/card/Card.css`, `apps/admin-dashboard/src/components/ui/inputs/CustomInput.tsx`, `apps/admin-dashboard/src/components/ui/inputs/Inputs.css`, `apps/admin-dashboard/src/components/ui/Container.tsx`, `apps/admin-dashboard/src/components/ui/table/CustomTable.tsx`, `apps/admin-dashboard/src/components/ui/table/Table.css`, `apps/admin-dashboard/src/components/ui/table/TableConfig.ts`.
- [x] T028 [US2] Add `"@mohamy/shared-ui": "*"` to the `dependencies` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/package.json`. Run `npm install` at workspace root to link the package.
- [x] T029 [US2] Update all imports in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/` that reference `components/ui/buttons/CustomButton`, `components/ui/card/CustomCard`, `components/ui/inputs/CustomInput`, `components/ui/Container`, or `components/ui/table/CustomTable` — change them to import from `@mohamy/shared-ui`. Then delete the corresponding local files (same pattern as T027 but in `apps/lawyer-dashboard/src/components/ui/`).
- [x] T030 [US2] Run `npx turbo run build` at workspace root `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/` and confirm both dashboards build successfully with zero errors after consuming `@mohamy/shared-ui`.

**Checkpoint**: Both dashboards import from `@mohamy/shared-ui`. Local duplicates deleted. Build passes. US2 is complete.

---

## Phase 5: User Story 3 — Implement Shared Validations Library (Priority: P3)

**Goal**: A `@mohamy/shared-validations` package provides shared Zod schemas for authentication and common form fields — dashboards consume them instead of maintaining separate copies.

**Independent Test**: Import `loginSchema` from `@mohamy/shared-validations` in the Admin Dashboard, build successfully, and verify the login form validates identically.

### Implementation for User Story 3

- [x] T031 [US3] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-validations/package.json` with `"name": "@mohamy/shared-validations"`, `"private": true`, `"main": "src/index.ts"`, `"types": "src/index.ts"`. Add `peerDependencies` for `zod`.
- [x] T032 [US3] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-validations/tsconfig.json` with `"compilerOptions": { "composite": true, "outDir": "dist", "rootDir": "src", "strict": true }` and `"include": ["src"]`.
- [x] T033 [US3] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-validations/src/common.ts` — export shared primitive validators: `passwordSchema` (min 6, max 30, uppercase, lowercase, digit, special char rules — all with Arabic messages), `emailSchema` (nonempty + email format — Arabic messages), `phoneSchema` (nonempty + regex `^01[0125][0-9]{8}$` — Arabic messages).
- [x] T034 [US3] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-validations/src/auth.ts` — import from `./common` and export: `lawyerLoginSchema` (phone + password), `adminLoginSchema` (email + password), `signupSchema` (fullName, phoneNumber, email, password, passwordConfirmation refine, governorate, agreeToTerms), `forgotPasswordRequestSchema`, `verifyOtpSchema`, `resetPasswordSchema` with confirmPassword refine. Export all inferred types (depends on T033).
- [x] T035 [US3] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/packages/shared-validations/src/index.ts` — re-export everything from `./common` and `./auth`.
- [x] T036 [US3] Add `"@mohamy/shared-validations": "*"` to the `dependencies` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/package.json`. Run `npm install` at workspace root.
- [x] T037 [US3] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/validations/loginSchema.ts` — replace the local schema definition with a re-export from `@mohamy/shared-validations` (`export { adminLoginSchema as loginSchema, type AdminLoginSchemaType as loginSchemaType } from '@mohamy/shared-validations'`). Verify all consuming files still compile.
- [x] T038 [US3] Add `"@mohamy/shared-validations": "*"` to the `dependencies` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/package.json`. Run `npm install` at workspace root.
- [x] T039 [US3] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/validations/loginSchema.ts` — replace the local schema definition with a re-export from `@mohamy/shared-validations` (`export { lawyerLoginSchema as loginSchema, type LawyerLoginSchemaType as loginSchemaType } from '@mohamy/shared-validations'`). Verify all consuming files still compile.
- [x] T040 [US3] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/validations/signupSchema.ts` — replace the local schema with a re-export from `@mohamy/shared-validations` (`export { signupSchema, type SignupSchemaType as signupSchemaType } from '@mohamy/shared-validations'`). Verify all consuming files still compile.
- [x] T041 [US3] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/validations/forgotPasswordSchema.ts` — replace the 3 local schemas with re-exports from `@mohamy/shared-validations`. Verify all consuming files still compile.
- [x] T042 [US3] Run `npx turbo run build` at workspace root `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/` and confirm both dashboards build successfully with zero errors after consuming `@mohamy/shared-validations`.

**Checkpoint**: Auth validation schemas are centralized. Dashboards re-export from `@mohamy/shared-validations`. Build passes. US3 is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and cleanup.

- [x] T043 Verify `npx turbo run dev` starts all 3 apps on their canonical ports (admin: 5079, lawyer: 5078, landing: 3000) from workspace root `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/`.
- [x] T044 [P] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.gitignore` — add `.turbo/` directory to ignore Turborepo cache artifacts.
- [x] T045 [P] Verify `npx turbo run build` completes without errors and confirm Turborepo caching works (second run should show `FULL TURBO` for unchanged apps).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2)
- **US2 (Phase 4)**: Depends on US1 (Phase 3) — needs verified workspace before creating packages
- **US3 (Phase 5)**: Depends on US1 (Phase 3) — can run in parallel with US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Phase 3 — Independent of US3
- **User Story 3 (P3)**: Can start after Phase 3 — Independent of US2

### Within Each User Story

- Package scaffolding before component creation
- Component creation before barrel exports (index.ts)
- Barrel exports before app consumption (dependency wiring)
- App consumption before build verification

### Parallel Opportunities

- T010, T011, T012 can run in parallel (different infrastructure files)
- T014, T015, T016 can run in parallel (different app package.json files)
- T021, T022, T023, T024 can run in parallel (different component files in shared-ui)
- US2 and US3 can run in parallel by different developers after US1 is done

---

## Parallel Example: User Story 2

```bash
# Launch all shared-ui component creation tasks together:
Task T021: "Create CustomCard.tsx in packages/shared-ui/src/components/"
Task T022: "Create CustomInput.tsx in packages/shared-ui/src/components/"
Task T023: "Create Container.tsx in packages/shared-ui/src/components/"
Task T024: "Create CustomTable.tsx in packages/shared-ui/src/components/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (move apps, update paths)
3. Complete Phase 3: User Story 1 (verify workspace orchestration)
4. **STOP and VALIDATE**: `npx turbo run build && npx turbo run lint`
5. Merge if passing

### Incremental Delivery

1. Setup + Foundational → Monorepo structure ready
2. Add US1 → Verify workspace → Merge (MVP!)
3. Add US2 → Shared UI consumed → Merge
4. Add US3 → Shared Validations consumed → Merge
5. Each story adds value without breaking previous stories
