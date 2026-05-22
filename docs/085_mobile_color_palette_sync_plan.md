# Plan - Mobile Color Palette Sync with Website

Sync the Flutter mobile application's color tokens with the website's CSS custom properties exactly.

## Proposed Changes

### Component: Flutter Mobile Application (mohamy_smart_mobile)

#### [NEW] [app_colors.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/core/theme/app_colors.dart)
- Create `lib/core/theme/app_colors.dart` to store all website color variables:
  - Light mode variables mapped from `:root` in `index.css`.
  - Dark mode variables mapped from `.dark` in `index.css`.
  - Brand gradients: `mainGradient` (using `#FFAD26`, `#EF950A`, `#C35900`) and `mainGradientHover` (using `#ffbd59`, `#f3a325`, `#d96300`).
  - Keep legacy `AppColors` mappings so that existing screens and widgets don't break.

#### [MODIFY] [app_theme.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/core/theme/app_theme.dart)
- Replace the inline `AppColors` definition with `export 'app_colors.dart';`.
- Update `AppTheme.light()` and `AppTheme.dark()` to use the exact color variables that match the CSS variables (e.g. `AppColors.lightBg`, `AppColors.lightSurface`, `AppColors.lightTitle`, `AppColors.lightText`, `AppColors.lightBorder` for light mode).

## Verification Plan

### Automated Tests
- Run `flutter test` in `apps/mohamy_smart_mobile` to verify all tests pass.

### Manual Verification
- Compile and run Flutter Web to verify that the app builds and runs successfully with the synchronized colors.
