# Login — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Login screen for returning lawyers using phone/email and password.

## Visual Prompt
Design a clean RTL auth screen with top brand area, then form content arranged vertically. Background is `#F0EEE7`. The title "تسجيل الدخول" is large and right-aligned, with "أهلا بعودتك" below. Inputs are warm cream `#FBFAE8`, radius 16px, subtle border `#1B1B1B15`, with icons on the right inside fields. Primary login button is fixed near the lower thumb zone but above the keyboard safe area. Add "نسيت كلمة المرور؟" as a left-aligned row action under password. Dark mode uses `#0A0A0A` background and `#1D1D1D` inputs with bright text.

## Content Blocks (Arabic copy)
- تسجيل الدخول
- أهلا بعودتك
- رقم الجوال أو البريد الإلكتروني
- كلمة المرور
- تذكرني
- نسيت كلمة المرور؟
- دخول
- ليس لديك حساب؟ إنشاء حساب
- بيانات الدخول غير صحيحة
- جار تسجيل الدخول

## Components Used
- Text input
- Password input
- Checkbox/toggle
- Primary button
- Inline error alert

## Interaction Notes
Login validates fields then opens Home. Forgot password opens recovery. Sign up link opens Sign Up.

## States to Design
| State | Description |
|-------|-------------|
| normal | Empty form |
| loading | Disabled fields and spinner in button |
| error | Red inline message under fields |
| disabled | Button disabled until required fields are valid |

## Linked Screens
- **Navigates from**: Onboarding, Splash
- **Navigates to**: Home Dashboard, Forgot Password, Sign Up

## Design Tokens Reference
Input radius 16px, primary `#EF950A`, danger `#CA0000`.

