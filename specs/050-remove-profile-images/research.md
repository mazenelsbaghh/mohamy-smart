# Research: Remove Profile Images

**Branch**: `050-remove-profile-images` | **Date**: 2026-04-20

## Research Task 1: Initials Avatar Implementation Approach

**Decision**: Use HeroUI's `Avatar` component with the `name` prop (no `src`), which auto-generates initials from the provided name string.

**Rationale**:
- HeroUI `Avatar` already used throughout both dashboards (imported from `@heroui/react`).
- When `Avatar` receives a `name` prop without `src`, it renders a colored circle with initials extracted from the name. This is built-in behavior — no custom CSS or component needed.
- The component handles the edge case of empty/null names by showing a generic fallback icon automatically.
- This approach is consistent with how client avatars already work in the Lawyer Dashboard (though those use custom CSS divs).

**Alternatives considered**:
- Custom CSS-based initials avatar (like the client list uses): Would require new CSS and a new component. Overkill when HeroUI Avatar already does this.
- Using `getInitials()` utility function: Unnecessary since HeroUI Avatar's `name` prop handles this natively.

## Research Task 2: Database Migration Strategy for Dropping Column

**Decision**: Create an EF Core migration that drops the `ProfileImageUrl` column from the `AspNetUsers` table. No data preservation needed.

**Rationale**:
- The column is nullable and the upload endpoint was never implemented, so the column likely contains only null or default values in most environments.
- Dropping a nullable column is a non-destructive operation for SQL Server — it doesn't affect other columns.
- Standard EF Core approach: remove the property from `ApplicationUser`, run `dotnet ef migrations add RemoveProfileImageUrl`, apply via `make db-migrate`.

**Alternatives considered**:
- Keep the column but ignore it: Leaves dead data and dead code, violating the purpose of this cleanup.
- Soft-delete (mark as unused): No point — the column should simply not exist.

## Research Task 3: IFileUploadService Cleanup Scope

**Decision**: Remove only `UploadUserProfileImageAsync` from both the interface and implementation. Keep `UploadClientFileAsync` and the `FileUploadService` class intact.

**Rationale**:
- `UploadClientFileAsync` is used for client document uploads and must remain functional.
- The interface `IFileUploadService` is registered in DI and injected where needed — removing only the profile method is a backward-compatible interface change (in practice, no code calls the profile method).
- This is a minor breaking change to the interface but since nothing implements or calls the removed method, it's safe.

**Alternatives considered**:
- Remove the entire `IFileUploadService` and merge into `IFileService`: Too risky — client file upload depends on it. Out of scope.

## Research Task 4: Frontend Type Cleanup

**Decision**: Remove `profileImageUrl` from `TProfile` (Lawyer Dashboard) and `AdminProfile` (Admin Dashboard). No other frontend types reference it.

**Rationale**:
- `TProfile` is used in `settingsSlice.ts` and `ProfileComponent.tsx` — removing the field is straightforward.
- `AdminProfile` is used in `settingsSlice.ts` and `Settings.tsx` — same.
- `TUser` (auth slice) in both dashboards does NOT contain `profileImageUrl`, so auth flow is unaffected.
- Removing the field from TypeScript types is backward-compatible — the API will simply stop returning it, and existing code that reads `profile.profileImageUrl` will be updated.

**Alternatives considered**:
- Keep the field as optional `profileImageUrl?: string | null`: Leaves dead data flowing through the app. Defeats the purpose.

## Research Task 5: External Placeholder Image Elimination

**Decision**: Remove all `pravatar.cc` URLs and replace `<Avatar src="...">` with `<Avatar name="...">` across all 4 locations.

**Locations identified**:
1. `mohamy-smart-lawyer-dashboard/src/components/header/Header.tsx` line 47 — hardcoded `pravatar.cc` URL
2. `mohamy-smart-admin-dashboard/src/components/public/header/Header.tsx` line 69 — hardcoded `pravatar.cc` URL
3. `mohamy-smart-admin-dashboard/src/pages/lawyers/LawyerDetails.tsx` line 45 — hardcoded `pravatar.cc` URL
4. `mohamy-smart-lawyer-dashboard/src/pages/settings/subPagesSettings/ProfileComponent.tsx` line 80 — dynamic fallback to `pravatar.cc`
5. `mohamy-smart-admin-dashboard/src/pages/settings/Settings.tsx` lines 88-90 — dynamic fallback to `pravatar.cc`

**Rationale**: HeroUI `Avatar` with `name` prop renders initials automatically. Using `user?.fullName` (from auth slice) for headers and `profile.fullName` for settings pages. For `LawyerDetails`, use `lawyer.fullName`.

## Research Task 6: CSS Cleanup

**Decision**: Remove `.edit-user-img` styles from both CSS files since the pencil edit icon will be removed.

**Locations**:
1. `mohamy-smart-lawyer-dashboard/src/pages/settings/subPagesSettings/Settings.css` lines 3-12
2. `mohamy-smart-admin-dashboard/src/pages/settings/Settings.css` lines 1-10

**Rationale**: The `Badge` + `FaPencilAlt` edit icon overlay is being removed from both settings pages. The CSS that styles this icon is dead code after removal.

## Research Task 7: AccountService Mapping Cleanup

**Decision**: Remove `ProfileImageUrl = user.ProfileImageUrl ?? string.Empty` from both `GetProfileAsync` and `UpdateProfileAsync` mapping blocks in `AccountService.cs`.

**Rationale**: After removing the property from `ProfileDto`, the mapping lines will cause compile errors. They must be removed simultaneously. The `UpdateProfileAsync` method never wrote to `ProfileImageUrl` anyway — it only read it for the response DTO.

## Summary of All Changes

| # | File | Change |
|---|------|--------|
| 1 | `ApplicationUser.cs` | Remove `ProfileImageUrl` property (line 25) |
| 2 | `IFileUploadService.cs` | Remove `UploadUserProfileImageAsync` method (line 12) |
| 3 | `FileUploadService.cs` | Remove `UploadUserProfileImageAsync` method (lines 22-46) |
| 4 | `ProfileDto.cs` | Remove `ProfileImageUrl` from `ProfileDto` (line 14) |
| 5 | `AccountService.cs` | Remove `ProfileImageUrl` mapping (lines 475, 509) |
| 6 | New EF migration | Drop `ProfileImageUrl` column from `AspNetUsers` |
| 7 | `types.ts` (lawyer) | Remove `profileImageUrl` from `TProfile` (line 37) |
| 8 | `index.ts` (admin) | Remove `profileImageUrl` from `AdminProfile` (line 10) |
| 9 | `ProfileComponent.tsx` | Replace `Avatar`+`Badge` with `Avatar name={profile.fullName}` |
| 10 | `Header.tsx` (lawyer) | Replace `Avatar src="pravatar..."` with `Avatar name={user?.fullName}` |
| 11 | `Settings.tsx` (admin) | Replace `Avatar`+`Badge` with `Avatar name={profile?.fullName}` |
| 12 | `Header.tsx` (admin) | Replace `Avatar src="pravatar..."` with `Avatar name={user?.fullName}` |
| 13 | `LawyerDetails.tsx` | Replace `Avatar src="pravatar..."` with `Avatar name={lawyer.fullName}` |
| 14 | `Settings.css` (lawyer) | Remove `.edit-user-img` styles |
| 15 | `Settings.css` (admin) | Remove `.edit-user-img` styles |
