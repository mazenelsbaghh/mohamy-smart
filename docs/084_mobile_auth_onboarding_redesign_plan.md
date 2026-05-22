# Plan - Mobile Splash, Onboarding & Login Screen Redesign

Implement the premium, editorial-style designs for the Splash screen, Onboarding (3 slides), and Login (Phone number) screen inside the Flutter mobile application (`mohamy_smart_mobile`) to match the HTML/CSS mockups exactly.

## Proposed Changes

### Component: Flutter Mobile Application (mohamy_smart_mobile)

#### [NEW] [splash_screen.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/features/auth/splash_screen.dart)
- Create a `SplashScreen` widget containing:
  - Gradient background with amber radial glow effects in top-right and bottom-left.
  - A `120x120` brand colored container with a gold linear gradient (from `#885200` to `#EF950A`).
  - Gavel icon inside a glassmorphic container (with backdrop blur and white border).
  - "محامي سمارت" and subtitle "ذكاء اصطناعي لممارسة قانونية أذكى" labels.
  - A loading bar with a gold gradient progress indicator.
  - Version footer: "الإصدار 1.0.0".

#### [MODIFY] [auth_screens.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/features/auth/auth_screens.dart)
- Redesign `OnboardingScreen` into a multi-slide screen using `PageView` and `PageController` containing:
  - **Slide 1**: "أدر قضاياك بذكاء" title, description, and visual illustration (Scale/Balance icon, auto_awesome badge, blue data_object badge, terminal badge).
  - **Slide 2**: "ذكاء اصطناعي قانوني" title, description, and visual illustration (rotated document card, floating bolt chip, floating analytics chip, auto_awesome core).
  - **Slide 3**: "جاهز لممارسة أذكى؟" title, description, and visual illustration (network image with floating glassmorphism rectangles).
  - Dot indicators at the bottom showing active/inactive slides (e.g. active slide is represented by a wider gold pill shape).
  - Transition logic to swipe or press "Next" (التالي) / "Start Now" (ابدأ الآن) / "Skip" (تخطي).
- Redesign `LoginScreen` to match Phone Number Login Variation 2:
  - Top 30% header area with warm canvas background, central brand gavel logo, "مرحبًا بعودتك" and "سجّل دخولك لمتابعة قضاياك".
  - Bottom 70% card with overlapping white container.
  - Form fields for "رقم التلفون" (Phone Number) with smartphone icon, and "كلمة المرور" (Password) with lock icon and visibility toggle.
  - Gradient "تسجيل الدخول" button with left/back arrow icon.
  - Social login divider "أو" and Google/Apple buttons (Google using the CDN logo image).

#### [MODIFY] [mohamy_mobile_app.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/app/mohamy_mobile_app.dart)
- Add state variable `_showSplash` (default to true) and a timer in `initState` to hide splash after 2 seconds.
- Update `_buildHome` to show `SplashScreen` if `_showSplash` is true.

#### [MODIFY] [app_navigation_test.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/test/app_navigation_test.dart)
- Update expected onboarding title text from "كل قضاياك في مكان واحد" to "أدر قضاياك بذكاء" to match Slide 1 of the new Onboarding screen.

## Verification Plan

### Automated Tests
- Run `flutter test` in `apps/mohamy_smart_mobile` to verify all widget tests pass successfully.

### Manual Verification
- Compile and run the app locally (dev mode) and verify:
  - Splash screen shows first for 2 seconds with accurate gold-gradient logo, loading bar, and glows.
  - Onboarding has 3 swipes, with the correct titles, subtitles, custom-drawn/fetched illustrations, dot indicators, and buttons.
  - Login screen has the split 30/70 visual design, input fields (phone and password), Apple/Google login row, and gradient submit button.
