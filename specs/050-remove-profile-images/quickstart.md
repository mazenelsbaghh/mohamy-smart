# Quickstart: Remove Profile Images

**Branch**: `050-remove-profile-images` | **Date**: 2026-04-20

## Prerequisites

- Environment running on canonical ports (`make dev`)
- `.env.docker` populated (`make setup`)
- Current database migrations applied

## Implementation Order

### Step 1: Backend — Entity & Interface Cleanup

1. Remove `ProfileImageUrl` property from `ApplicationUser.cs`
2. Remove `UploadUserProfileImageAsync` from `IFileUploadService.cs`
3. Remove `UploadUserProfileImageAsync` implementation from `FileUploadService.cs`
4. Remove `ProfileImageUrl` from `ProfileDto.cs`
5. Remove `ProfileImageUrl` mapping lines from `AccountService.cs` (GetProfileAsync, UpdateProfileAsync)
6. Run `dotnet ef migrations add RemoveProfileImageUrl` from the backend project
7. Verify the migration generates a `DropColumn` operation for `ProfileImageUrl`

### Step 2: Backend — Verify Build

```bash
cd mohamy-smart-backend
dotnet build
```

All projects must compile without errors.

### Step 3: Frontend — Type Cleanup

1. Remove `profileImageUrl` from `TProfile` in lawyer-dashboard `types.ts`
2. Remove `profileImageUrl` from `AdminProfile` in admin-dashboard `index.ts`

### Step 4: Frontend — Avatar Replacement (Lawyer Dashboard)

1. `ProfileComponent.tsx`: Replace `Badge`+`Avatar` block with `Avatar name={profile.fullName}` (remove `Badge`, `FaPencilAlt` import)
2. `Header.tsx`: Replace `Avatar src="https://i.pravatar.cc/..."` with `Avatar name={user?.fullName}`
3. `Settings.css`: Remove `.profile-component span.edit-user-img` styles

### Step 5: Frontend — Avatar Replacement (Admin Dashboard)

1. `Settings.tsx`: Remove `profileAvatar` variable, replace `Badge`+`Avatar` block with `Avatar name={profile?.fullName}` (remove `Badge`, `FaPencilAlt` import)
2. `Header.tsx`: Replace `Avatar src="https://i.pravatar.cc/..."` with `Avatar name={user?.fullName}`
3. `LawyerDetails.tsx`: Replace `Avatar src="https://i.pravatar.cc/..."` with `Avatar name={lawyer.fullName}`
4. `Settings.css`: Remove `.settings span.edit-user-img` styles

### Step 6: Verify & Test

```bash
make dev
make db-migrate
```

1. Lawyer Dashboard: Navigate to Settings > Profile — initials avatar visible, no upload icon
2. Lawyer Dashboard: Check header on any page — initials avatar, no external image request
3. Admin Dashboard: Navigate to Settings — initials avatar, no upload icon
4. Admin Dashboard: Check header — initials avatar, no external image request
5. Admin Dashboard: Navigate to Lawyer Details — initials avatar
6. Open browser DevTools Network tab — verify zero requests to `pravatar.cc`

## Manual Cleanup (Post-Deploy)

If any profile images were previously uploaded to disk:
```bash
rm -rf /path/to/backend/wwwroot/uploads/profiles/
```
