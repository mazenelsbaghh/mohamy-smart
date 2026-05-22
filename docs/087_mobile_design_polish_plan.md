# Plan - Mobile Design Polish and Header/Color Sync

Sync the Flutter mobile application's UI styles and header layout with the production website's theme tokens, remove the profile image placeholder, and replace it with a clean vector-based User-Tie avatar.

## Proposed Changes

### Component: Flutter Mobile Application (mohamy_smart_mobile)

#### [NEW] [user_tie_avatar.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/core/widgets/user_tie_avatar.dart)
- Create a lightweight custom widget `UserTieAvatar` utilizing `CustomPainter` to draw a vector tie icon (`FaUserTie` representation) inside a circular container matching the website's header style.
- Set background to `AppColors.primary` and foreground icon to white.

#### [MODIFY] [home_screen.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/features/home/home_screen.dart)
- Update the fixed `TopAppBar` to use `AppColors` variables (e.g., `AppColors.lightSurface` and `AppColors.darkSurface` for header background).
- Style the counselor greeting name using `AppColors.primary` (light mode) and `Colors.white` (dark mode) to match the website style exactly.
- Replace the `Icons.person` icon with the new `UserTieAvatar` widget.
- Style the application title text using a premium `ShaderMask` with `AppColors.mainGradient` to match the metallic gold gradient branding.
- Remove hardcoded color declarations and replace them with standard `AppColors` mappings.

#### [MODIFY] [app_shell.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/features/shell/app_shell.dart)
- Realign bottom navigation bar active and inactive colors to use `AppColors.primary` (active) and `AppColors.lightMuted` / `AppColors.darkMuted` (inactive).
- Replace Tailwind amber/brown colors (`Color(0xFFFEF3C7)`, `Color(0x6678350F)`, etc.) with the exact brand design system tokens (`AppColors.lightAccentSoft` / `AppColors.darkAccentSoft`).

## Verification Plan

### Automated Tests
- Run `flutter test` inside `apps/mohamy_smart_mobile` to ensure compilation success and that all widget navigation assertions pass.

### Manual Verification
- Visual inspection of the dashboard components on Flutter Web.
