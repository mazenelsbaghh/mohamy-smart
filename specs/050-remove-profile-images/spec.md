# Feature Specification: Remove Profile Images and Photo Upload Features

**Feature Branch**: `050-remove-profile-images`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "نشيل الصور اللي بتحطط ف البروفيل و اتلحاجات دي"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Profile Page Without Image (Priority: P1)

As a lawyer or admin using the dashboard, when I visit my profile/settings page, I see my name initials displayed in a styled avatar instead of a photo. There is no photo upload button, no pencil edit icon on the avatar, and no reference to image uploading anywhere on the profile page.

**Why this priority**: This is the core change — removing the profile image display and upload UI from the settings/profile pages in both dashboards.

**Independent Test**: Can be fully tested by navigating to the settings/profile page in both the Lawyer Dashboard and Admin Dashboard and verifying that no image upload controls exist and the avatar shows user initials.

**Acceptance Scenarios**:

1. **Given** a logged-in lawyer on the Lawyer Dashboard, **When** they navigate to the Settings > Profile page, **Then** they see a styled avatar with their name initials instead of a profile photo, and no upload or edit-image button is present.
2. **Given** a logged-in admin on the Admin Dashboard, **When** they navigate to the Settings page, **Then** they see a styled avatar with their name initials instead of a profile photo, and no upload or edit-image button is present.
3. **Given** a user whose profile previously had a stored `profileImageUrl` value, **When** they view their profile, **Then** the stored URL is ignored and initials are shown instead.

---

### User Story 2 - Header Avatar Without Placeholder Image (Priority: P2)

As a lawyer or admin, when I look at the header/sidebar of the dashboard, I see my name initials in a compact avatar instead of a hardcoded external placeholder image. The avatar no longer makes requests to external image services.

**Why this priority**: Headers are visible on every page and currently load external placeholder images — removing them eliminates unnecessary external network calls.

**Independent Test**: Can be tested by loading any page in both dashboards and inspecting the header avatar element for external image URLs.

**Acceptance Scenarios**:

1. **Given** a logged-in lawyer on any page of the Lawyer Dashboard, **When** the header renders, **Then** the avatar shows the user's initials and does not load any image from `pravatar.cc` or any other external URL.
2. **Given** a logged-in admin on any page of the Admin Dashboard, **When** the header renders, **Then** the avatar shows the user's initials and does not load any image from `pravatar.cc` or any other external URL.

---

### User Story 3 - Lawyer Details Page Without Placeholder Image (Priority: P3)

As an admin viewing a lawyer's details page, I see the lawyer's name initials in an avatar instead of a hardcoded external placeholder image.

**Why this priority**: This page is less frequently visited but still uses a hardcoded placeholder that should be replaced.

**Independent Test**: Can be tested by navigating to any lawyer's details page in the Admin Dashboard.

**Acceptance Scenarios**:

1. **Given** an admin on the Lawyer Details page, **When** the page loads, **Then** the lawyer's avatar shows their name initials and does not load any external placeholder image.

---

### Edge Cases

- What happens when a user's name is empty or null? The avatar should display a generic fallback (e.g., a user icon or "?" character).
- What happens to existing `ProfileImageUrl` data stored in the database? The column and data should be removed via a migration.
- What happens to existing uploaded profile image files on disk? The `/uploads/profiles/` directory and its contents should be cleaned up, and the upload service method should be removed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST remove all profile image upload UI elements (avatar with edit pencil icon, file input triggers) from the Lawyer Dashboard settings profile page.
- **FR-002**: The system MUST remove all profile image upload UI elements from the Admin Dashboard settings page.
- **FR-003**: The system MUST replace all profile photo displays (settings pages, headers) with initials-based avatars that show the first letter of the user's first name and last name.
- **FR-004**: The system MUST replace all hardcoded external placeholder avatar images (`pravatar.cc` URLs) in headers and detail pages with initials-based avatars.
- **FR-005**: The system MUST remove the `ProfileImageUrl` field from the backend user entity and create a database migration to drop the column.
- **FR-006**: The system MUST remove the `ProfileImageUrl` property from all backend DTOs (`ProfileDto`, `UpdateProfileDto`).
- **FR-007**: The system MUST remove the `UploadUserProfileImageAsync` method from `IFileUploadService` and its implementation, as it was never used.
- **FR-008**: The system MUST remove `profileImageUrl` from all frontend type definitions (`TProfile`, `AdminProfile`).
- **FR-009**: The system MUST ensure no external network requests are made to load avatar/placeholder images for any dashboard user.
- **FR-010**: The system MUST provide a generic fallback avatar (icon or "?") when the user's name is unavailable for generating initials.

### Key Entities

- **ApplicationUser**: The user entity loses its `ProfileImageUrl` attribute — users are identified by text-based data only (name, email, phone).
- **Initials Avatar**: A computed, non-persisted visual representation derived from the user's `FullName` — displayed as a colored circle with 1-2 characters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No profile image upload controls exist anywhere in the Lawyer Dashboard or Admin Dashboard — verified by visual inspection of all settings and profile pages.
- **SC-002**: Zero external network requests to `pravatar.cc` or any other image placeholder service are made when loading any dashboard page.
- **SC-003**: Every avatar instance across both dashboards displays user initials or a fallback character within 1 second of page load.
- **SC-004**: The database migration successfully drops the `ProfileImageUrl` column without data loss in other fields, and all existing API endpoints continue to function correctly.

## Assumptions

- Users will be identified visually by their name initials rather than photographs — this is acceptable for a professional legal platform.
- The `FileUploadService.UploadUserProfileImageAsync` method can be safely removed since it was never called by any controller endpoint.
- The `FileUploadService` class itself may still be needed for `UploadClientFileAsync`, so only the profile image method is removed.
- Client avatars in the Lawyer Dashboard already use CSS-based initials and are not affected by this change.
- Chat avatars (AI icon, user "أنت" text) are not affected by this change.
- Existing uploaded profile image files in `/uploads/profiles/` will be orphaned and should be documented as a manual cleanup task.
