# Plan: Mobile Layout Overlaps and Guidance Z-Index Fixes

This plan addresses visual styling and layout issues on mobile viewports:
1. Overlapping elements in the Document Upload section (`Documents.tsx`).
2. The page video/guidance launcher button (`.page-guidance-launcher`) showing on top of modal popups.

## Proposed Changes

### 1. Document Upload Layout (`Documents.tsx` & `Documents.css`)
- **Problem**: The dropzone container `.documents-box` has a fixed height of `47vh` and uses `justify-content: center` flex centering. When the viewport is small (on mobile), the text content is forced to wrap and overflows the container, spilling over both upwards (overlapping the page title and "إضافة قضية جديدة" button) and downwards (overlapping action buttons).
- **Solution**:
  - Change `.documents-box` height from fixed `47vh` to `auto` with `min-height: 400px` or `47vh` so that it expands naturally on smaller viewports.
  - Add proper padding to `.documents-box` (`padding: 2.5rem 1.5rem;` on desktop and `padding: 2rem 1rem;` on mobile).
  - Modify the flex layout inside `.documents-box` for the upload icon and description text:
    - Stack vertically (`flex-col`) on mobile and center-align the text and icon (`items-center text-center`).
    - Stack horizontally (`md:flex-row`) on desktop with right-aligned text (`md:items-start md:text-right`).

### 2. Guidance Launcher Button Z-Index (`PageGuidance.css`)
- **Problem**: The page guidance launcher (`.page-guidance-launcher`), which displays as a floating "فيديو الصفحة" button at the bottom of pages, has a z-index of `2147482500`. This is higher than HeroUI modals (which are typically `50`+), causing the launcher button to render on top of modal dialogs.
- **Solution**:
  - Reduce the z-index of `.page-guidance-launcher` in `PageGuidance.css` to `40`.
  - This keeps the launcher button on top of normal page elements, but below the sidebar (`z-index: 49`) and modals/overlays (which will cover it when they are active).

## Verification Plan

### Automated/Lint Checks
- Run tests and linting to ensure no regressions:
  ```bash
  npm run lint
  ```

### Manual Verification
- Resize browser to mobile viewport (e.g., 375px width) and verify:
  1. The Document Upload page (`/documents`) has correct spacing, no overlapping headers/buttons, and the `.documents-box` expands naturally.
  2. Clicking "إضافة قضية جديدة" opens the modal popup, and the floating launcher button "فيديو الصفحة" at the bottom is hidden behind the modal backdrop/dialog.
