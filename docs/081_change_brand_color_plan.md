# Plan - Change Brand Primary Color to Gold

Change the primary color of the brand across all components, dashboards, stylesheets, configs, and assets from the old orange color (`#EF950A`) to the gold color (`#EF950A`) which has been selected by the user.

## Proposed Changes

### Component: Global Theme Settings & Stylesheets

#### [MODIFY] [index.css](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/index.css)
- Change primary variables: `--main-color: #EF950A;`
- Update any direct references to `#EF950A` or `rgba(239, 149, 10, ...)` to `#EF950A` and `rgba(239, 149, 10, ...)`.

#### [MODIFY] [index.css](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/admin-dashboard/src/index.css)
- Change primary variables: `--main-color: #EF950A;`
- Update any direct references to `#EF950A` or `rgba(239, 149, 10, ...)` to `#EF950A` and `rgba(239, 149, 10, ...)`.

#### [MODIFY] [globals.css](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/landing/src/app/globals.css)
- Change primary variables: `--main-color: #EF950A;`
- Update any direct references to `#EF950A` or `rgba(239, 149, 10, ...)` to `#EF950A` and `rgba(239, 149, 10, ...)`.

#### [MODIFY] [Auth.css](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/auth/Auth.css)
- Update gradients and overlays to use `#EF950A` (and matching hover/translucent values) instead of orange.
- Update any remaining orange values.

### Component: Configurations & Inline CSS Files

#### [MODIFY] [DESIGN.md](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/DESIGN.md) & [DESIGN.json](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/DESIGN.json)
- Update design token guidelines to specify `#EF950A` as the primary color.

#### [MODIFY] [hero.ts](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/hero.ts) and [hero.ts](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/admin-dashboard/src/hero.ts)
- Update primary hero brand colors to `#EF950A`.

#### [MODIFY] [avatar.ts](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/utils/avatar.ts)
- Replace `#EF950A` inside the avatar colors array with `#EF950A`.

#### [MODIFY] Inline CSS & SVGs
- Update SVGs under public images folder that reference `#EF950A` (e.g. warning icons).
- Update stylesheets like `Chat.css`, `NotFound.css`, `Sidebar.css`, `ClientDetails.css`, `FaqSection.css`, etc. to replace `rgba(239, 149, 10, ...)` with `rgba(239, 149, 10, ...)`.

## Verification Plan

### Automated Tests
- Run `npm test` and `npm run lint` in the workspaces.

### Manual Verification
- Verify the appearance of all websites/dashboards (lawyer-dashboard, admin-dashboard, landing) to ensure they show the new gold color as the primary theme color.
