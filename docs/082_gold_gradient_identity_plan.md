# Plan - Gold Gradient Brand Identity Transition

The user requested to change the brand color from the gold (#EF950A) to a more metallic gold hue, and to introduce a premium gold gradient for the identity (buttons, highlights, visual panels).

## Selected Gold Color Palette
- **Solid Gold Color**: `#EF950A` (RGB: `239, 149, 10`)
- **Vibrant Gold Gradient**: `linear-gradient(135deg, #f5d77f 0%, #EF950A 50%, #99731a 100%)`
- **Gold Hover Gradient**: `linear-gradient(135deg, #e6c66c 0%, #d18105 50%, #805f10 100%)`
- **Hover Solid Color**: `#d18105` (RGB: `184, 145, 46`)
- **Dark Gold range (for visual panels)**: `#EF950A` to `#99731a` to `#664e10`

## Proposed Changes

### Component: Global Theme Stylesheets

#### [MODIFY] [index.css](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/index.css)
- Change primary variables: `--main-color: #EF950A;`
- Define `--main-gradient` and `--main-gradient-hover` variables.
- Update `rgba(239, 149, 10, ...)` references to `rgba(239, 149, 10, ...)`.
- Modify primary buttons (`.ds-btn-primary` or similar) to use `--main-gradient` instead of solid backgrounds.

#### [MODIFY] [index.css](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/admin-dashboard/src/index.css)
- Similarly define gold variables and gradients.
- Update buttons to use gradients.

#### [MODIFY] [globals.css](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/landing/src/app/globals.css)
- Define gold variables and gradients.
- Update active classes to use gold gradient buttons.

#### [MODIFY] [Auth.css](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/auth/Auth.css) and [Auth.css](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/admin-dashboard/src/pages/auth/Auth.css)
- Update gradients and OKLCH color codes to match the gold range (Hue 80, Chroma 0.14).

### Component: Configurations & SVGs

#### [MODIFY] [DESIGN.md](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/DESIGN.md) & [DESIGN.json](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/DESIGN.json)
- Update token descriptions.

#### [MODIFY] SVGs & Charts
- Update case warning SVGs to use `#EF950A`.
- Update dashboard chart color arrays and configurations in `hero.ts`.

## Verification Plan

### Automated Tests
- Run `npm run lint` and `npm run type-check`.

### Manual Verification
- Visual inspection of the dashboard components, login screen split panels, and landing page buttons.
