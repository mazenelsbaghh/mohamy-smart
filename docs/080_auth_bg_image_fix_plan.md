# Plan - Auth Background Image Size Fix

Ensure the background image scale and position remain identical between the Login and Sign-Up pages (by preventing stretching due to scrolling content), and revert the image scale to `cover` to cover the entire background area (so no background color is visible underneath it). Also, remove the "AI" suffix from the "محامي سمارت" welcome header.

## Proposed Changes

### Component: Lawyer Dashboard Auth Styling and Components

#### [MODIFY] [Auth.css](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/auth/Auth.css)
1. In `.auth-layout` selector:
   - Keep `background-color` as `#0F0D08` for fallback.
   - Revert `background-size` to `cover` so the background image covers the area completely without any background showing underneath.
   - Revert `background-position` to `left center`.
   - Keep `background-attachment: fixed` to maintain scale consistency between pages.

#### [MODIFY] [Login.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/auth/Login.tsx)
1. In `Login.tsx` line 93:
   - Change `محامي سمارت AI` to `محامي سمارت`.
2. In the `@media (min-width: 1024px)` media query:
   - Increase the width of `.auth-form-panel-container` from `44%` to `48%` (reducing the visual panel width from `56%` to `52%`).
3. In the `@media (min-width: 1400px)` media query:
   - Increase the width of `.auth-form-panel-container` from `40%` to `44%` (reducing the visual panel width from `60%` to `56%`).

## Verification Plan

### Automated Tests
- Run `npm test` and `npm run lint` inside the lawyer-dashboard.

### Manual Verification
- Check the Login page (`/auth/login`) and verify the robot background image placement.
- Check the Sign-Up page (`/auth/sign-up`) and verify that the background image size, scale, and position are identical to the Login page, even when scrolling.
- Confirm that the visual panel is slightly narrower (image appears smaller) and the forms have slightly more breathing room.
