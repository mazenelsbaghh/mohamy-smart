# Quickstart: Mohamy Smart Mobile App

## Prerequisites

- Flutter 3.41.0 or compatible stable Flutter 3.x
- Dart 3.11.0 or compatible
- iOS Simulator or Android Emulator for manual device checks

## Create/Refresh Dependencies

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile"
flutter pub get
```

## Run Static Checks

```bash
flutter analyze
```

## Run Tests

```bash
flutter test
```

Current validation result on 2026-05-22:
- `flutter analyze`: PASS
- `flutter test`: PASS
- `flutter build apk --debug`: blocked because Android SDK is not installed or `ANDROID_HOME` is not configured in this machine.
- `flutter build ios --simulator --debug`: blocked because Xcode installation is incomplete and CocoaPods is not installed on this machine.

## Run the App

```bash
flutter run
```

## Manual Validation Scenarios

1. Launch app and confirm Arabic RTL onboarding/login appears.
2. Login using any non-empty phone/email and password that pass form validation.
3. Confirm Home Dashboard shows AI points, next action, sessions, active cases, and recent AI activity.
4. Tap bottom navigation: الرئيسية، القضايا، الجلسات، المساعد، المزيد.
5. Open Cases, search for `أحمد`, then search for a non-matching value and confirm no-results state.
6. Open Add Case and submit empty form; confirm Arabic validation messages.
7. Open a case, switch tabs, open AI workflow hub, and run a demo workflow.
8. Open Settings from More, toggle dark mode, and confirm the app remains readable.
