# Tasks: Remove Profile Images and Photo Upload Features

**Input**: Design documents from `/specs/050-remove-profile-images/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file path(s) in descriptions
- Keep each task small enough for a low-cost LLM to execute without architectural guesswork
- Prefer one artifact per task; if needed, keep to at most 3 explicit file paths

## Path Conventions

- **Backend**: `mohamy-smart-backend/` (Clean Architecture: Core, Application, Infrastructure, Lawyer)
- **Lawyer Dashboard**: `mohamy-smart-lawyer-dashboard/` (React 19 + Vite + TypeScript)
- **Admin Dashboard**: `mohamy-smart-admin-dashboard/` (React 19 + Vite + TypeScript)
- All paths are relative to repository root: `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/`

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Remove all backend references to `ProfileImageUrl` and clean up frontend type definitions. This MUST complete before any UI work because the frontend types will stop including `profileImageUrl`, which would cause TypeScript errors if UI components still reference it.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T001 Remove `ProfileImageUrl` property from ApplicationUser entity in `mohamy-smart-backend/Lawyer.Core/Models/ApplicationUser.cs` — delete line 25: `public string? ProfileImageUrl { get; set; }`

- [ ] T002 Remove `UploadUserProfileImageAsync` method from IFileUploadService interface in `mohamy-smart-backend/Lawyer.Core/Interface/IFileUploadService.cs` — delete line 12 only; keep `UploadClientFileAsync` method and all imports

- [ ] T003 Remove `UploadUserProfileImageAsync` implementation from FileUploadService in `mohamy-smart-backend/Lawyer.Infrastracture/Services/FileUploadService.cs` — delete lines 22–46 (the entire method); keep constructor and `UploadClientFileAsync` intact

- [ ] T004 Remove `ProfileImageUrl` property from ProfileDto in `mohamy-smart-backend/Lawyer.Application/Dtos/Account/ProfileDto.cs` — delete line 14: `public string ProfileImageUrl { get; set; } = string.Empty;`

- [ ] T005 Remove `ProfileImageUrl` mapping lines from AccountService in `mohamy-smart-backend/Lawyer.Application/Services/AccountService.cs` — delete `ProfileImageUrl = user.ProfileImageUrl ?? string.Empty` from both `GetProfileAsync` (line 475) and `UpdateProfileAsync` (line 509) DTO construction blocks

- [ ] T006 Create EF Core migration to drop ProfileImageUrl column — run `dotnet ef migrations add RemoveProfileImageUrl` from `mohamy-smart-backend/Lawyer/` project directory; verify the generated migration contains a `DropColumn("ProfileImageUrl")` operation on the `AspNetUsers` table (depends on T001)

- [ ] T007 [P] Remove `profileImageUrl` field from TProfile type in `mohamy-smart-lawyer-dashboard/src/types/types.ts` — delete line 37: `profileImageUrl: string | null;`

- [ ] T008 [P] Remove `profileImageUrl` field from AdminProfile interface in `mohamy-smart-admin-dashboard/src/types/index.ts` — delete line 10: `profileImageUrl: string | null;`

- [ ] T009 Verify backend compiles after all removals — run `dotnet build` from `mohamy-smart-backend/`; fix any compile errors related to removed `ProfileImageUrl` references in other files not listed above (depends on T001–T005)

**Checkpoint**: Backend compiles, migration is generated, frontend types no longer reference `profileImageUrl`. User story UI work can now begin in parallel.

---

## Phase 2: User Story 1 — Profile Page Without Image (Priority: P1) 🎯 MVP

**Goal**: Remove profile image upload UI and replace photo avatars with initials-based avatars on the settings/profile pages in both dashboards.

**Independent Test**: Navigate to Settings > Profile page in Lawyer Dashboard and Settings page in Admin Dashboard. Verify: no photo displayed, avatar shows user initials, no upload/pencil icon present.

### Implementation for User Story 1

- [ ] T010 [US1] Replace Avatar+Badge block with initials-only Avatar in `mohamy-smart-lawyer-dashboard/src/pages/settings/subPagesSettings/ProfileComponent.tsx` — remove `Badge` and `FaPencilAlt` imports; replace the entire `<Badge ...>` wrapper and its `<Avatar src={...}>` child (lines 71–85) with a single `<Avatar className="w-30 h-30 text-large" name={profile.fullName} isBordered color="primary" />`

- [ ] T011 [P] [US1] Remove unused edit-user-img CSS styles in `mohamy-smart-lawyer-dashboard/src/pages/settings/subPagesSettings/Settings.css` — delete the `.profile-component span.edit-user-img { ... }` rule (lines 3–12); keep `.profile-component {}` empty rule and subscription styles

- [ ] T012 [US1] Replace Avatar+Badge block with initials-only Avatar in `mohamy-smart-admin-dashboard/src/pages/settings/Settings.tsx` — remove `Badge` and `FaPencilAlt` imports; delete the `profileAvatar` variable (lines 88–90); replace the `<Badge ...>` wrapper and `<Avatar src={profileAvatar}>` child (lines 121–135) with a single `<Avatar className="w-30 h-30 text-large" name={profile?.fullName || ''} isBordered color="primary" />`

- [ ] T013 [P] [US1] Remove all CSS from admin Settings.css in `mohamy-smart-admin-dashboard/src/pages/settings/Settings.css` — delete the entire `.settings span.edit-user-img { ... }` rule (all content, lines 1–10); the file becomes empty

**Checkpoint**: Settings/profile pages in both dashboards show initials avatars. No upload icons. No external image requests from these pages. User Story 1 is complete and independently testable.

---

## Phase 3: User Story 2 — Header Avatar Without Placeholder Image (Priority: P2)

**Goal**: Replace hardcoded `pravatar.cc` placeholder images in both dashboard headers with initials-based avatars using the user's name from auth state.

**Independent Test**: Load any page in Lawyer Dashboard and Admin Dashboard. Open DevTools Network tab. Verify: no requests to `pravatar.cc`, header avatar shows user initials from `user?.fullName`.

### Implementation for User Story 2

- [x] T014 [P] [US2] Replace hardcoded pravatar.cc Avatar with initials Avatar in Lawyer Dashboard header at `mohamy-smart-lawyer-dashboard/src/components/header/Header.tsx` — replace `<Avatar size='lg' src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />` (line 47) with `<Avatar size='lg' name={user?.fullName || ''} />`; keep the surrounding `<Link to='/settings'>` wrapper

- [x] T015 [P] [US2] Replace hardcoded pravatar.cc Avatar with initials Avatar in Admin Dashboard header at `mohamy-smart-admin-dashboard/src/components/public/header/Header.tsx` — replace `<Avatar size='lg' src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />` (line 69) with `<Avatar size='lg' name={user?.fullName || ''} />`

**Checkpoint**: Both dashboard headers show user initials. No external network requests to `pravatar.cc`. User Story 2 is complete and independently testable.

---

## Phase 4: User Story 3 — Lawyer Details Page Without Placeholder Image (Priority: P3)

**Goal**: Replace hardcoded `pravatar.cc` placeholder image on the admin Lawyer Details page with an initials-based avatar using the lawyer's name.

**Independent Test**: Navigate to any lawyer's details page in Admin Dashboard. Verify: avatar shows lawyer initials, no request to `pravatar.cc`.

### Implementation for User Story 3

- [ ] T016 [US3] Replace hardcoded pravatar.cc Avatar with initials Avatar in LawyerDetails page at `mohamy-smart-admin-dashboard/src/pages/lawyers/LawyerDetails.tsx` — replace `<Avatar className="w-30 h-30 text-large" src="https://i.pravatar.cc/150?u=a04258114e29026708c" alt="lawyer" isBordered />` (lines 43–48) with `<Avatar className="w-30 h-30 text-large" name={lawyer.fullName || ''} isBordered />`

**Checkpoint**: Lawyer details page shows lawyer initials. No external placeholder images. All three user stories are complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup across all user stories

- [ ] T017 Run backend build and verify no remaining references to `ProfileImageUrl` in `mohamy-smart-backend/` — execute `dotnet build` and search codebase for any leftover `ProfileImageUrl` references in `.cs` files; remove any found

- [ ] T018 [P] Run frontend build and verify no remaining references to `profileImageUrl` or `pravatar.cc` in both dashboards — run `npm run build` in `mohamy-smart-lawyer-dashboard/` and `mohamy-smart-admin-dashboard/`; search for any leftover `pravatar` or `profileImageUrl` strings in `.tsx`/`.ts` files; remove any found

- [ ] T019 Apply database migration and run full stack verification — execute `make db-migrate` (or run migration manually); start dev environment with `make dev`; verify both dashboards load without errors; open DevTools Network tab and confirm zero requests to `pravatar.cc` or any external image placeholder service

**Checkpoint**: Feature complete. All profile image references removed. All avatars show initials.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **User Story 1 (Phase 2)**: Depends on Phase 1 completion (T001–T009)
- **User Story 2 (Phase 3)**: Depends on Phase 1 completion (T001–T009)
- **User Story 3 (Phase 4)**: Depends on Phase 1 completion (T001–T009)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 1 — no dependency on US2 or US3
- **User Story 2 (P2)**: Can start after Phase 1 — no dependency on US1 or US3
- **User Story 3 (P3)**: Can start after Phase 1 — no dependency on US1 or US2

All three user stories are **independent** and can be worked on in parallel after Phase 1.

### Within Phase 1

- T006 depends on T001 (entity must change before migration can be generated)
- T009 depends on T001–T005 (build verification after all removals)
- T002, T003 can run together (interface + implementation, same method)
- T004, T007, T008 are all independent of each other

### Parallel Opportunities

Within Phase 1:
```
T001 + T002 + T003 + T004 + T005  →  all independent removals
T007 + T008                        →  both frontend types, different files
T006                                →  after T001
T009                                →  after T001–T005
```

Across user stories (after Phase 1):
```
T010 + T011 + T012 + T013  →  US1 tasks (lawyer + admin settings)
T014 + T015                →  US2 tasks (lawyer + admin headers)
T016                        →  US3 task (lawyer details)
All can run in parallel
```

---

## Parallel Example: After Phase 1 Complete

```bash
# Launch all US1 tasks together:
Task T010: "Replace Avatar+Badge in ProfileComponent.tsx"
Task T011: "Remove edit-user-img CSS in lawyer Settings.css"
Task T012: "Replace Avatar+Badge in admin Settings.tsx"
Task T013: "Remove edit-user-img CSS in admin Settings.css"

# Launch US2 tasks in parallel with US1:
Task T014: "Replace pravatar.cc in lawyer Header.tsx"
Task T015: "Replace pravatar.cc in admin Header.tsx"

# Launch US3 task in parallel with everything:
Task T016: "Replace pravatar.cc in LawyerDetails.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (T001–T009)
2. Complete Phase 2: User Story 1 (T010–T013)
3. **STOP and VALIDATE**: Test settings pages in both dashboards
4. Deploy if ready — core cleanup is done

### Incremental Delivery

1. Phase 1 Foundational → Backend clean, types updated
2. Phase 2 US1 → Settings pages cleaned (MVP!)
3. Phase 3 US2 → Headers cleaned
4. Phase 4 US3 → Lawyer details cleaned
5. Phase 5 Polish → Full verification
6. Each story adds cleanup coverage without breaking previous stories

### Suggested MVP Scope

**US1 only** (T001–T013): Removes the primary user-facing profile image elements from settings pages. This delivers the core value — no more misleading upload UI and no more photo placeholders on the pages users interact with most.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No tests were requested — verification is manual (visual inspection + DevTools Network)
- T002 and T003 remove the same method from interface and implementation — must both be done to compile
- T010 and T012 are the largest tasks (Badge+Avatar replacement in two files) but each is self-contained
- HeroUI `Avatar` with `name` prop auto-generates initials and handles empty/null names with a fallback icon
- `UploadClientFileAsync` must NOT be removed — it is in active use for client document uploads
- After migration, existing `ProfileImageUrl` column data is permanently lost — acceptable per spec
- Post-deploy manual cleanup: `rm -rf /path/to/backend/wwwroot/uploads/profiles/` if any files exist
