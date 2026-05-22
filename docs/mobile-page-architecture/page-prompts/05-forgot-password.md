# Forgot Password — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Recovery screen for lawyers who need to reset access through phone or email.

## Visual Prompt
Design a focused RTL recovery screen. Use a simple top back button, then a title "استعادة كلمة المرور" and a short explanatory paragraph. The only input is phone/email, followed by a full-width amber button. Keep the layout high on screen, leaving generous empty space below. Use warm cream input background and strong focus outline `#EF950A`. Dark mode keeps the same hierarchy on `#0A0A0A`.

## Content Blocks (Arabic copy)
- استعادة كلمة المرور
- أدخل رقم الجوال أو البريد الإلكتروني لإرسال رمز التحقق.
- رقم الجوال أو البريد الإلكتروني
- إرسال رمز التحقق
- العودة لتسجيل الدخول
- تم إرسال الرمز
- لم نتمكن من إرسال الرمز

## Components Used
- Back button
- Text input
- Primary button
- Status alert

## Interaction Notes
Send code validates input and opens OTP Verification.

## States to Design
| State | Description |
|-------|-------------|
| normal | Single input form |
| loading | Button spinner |
| success | Success toast/message |
| error | Inline error with retry |

## Linked Screens
- **Navigates from**: Login
- **Navigates to**: OTP Verification, Login

## Design Tokens Reference
Canvas `#F0EEE7`, input `#FBFAE8`, primary `#EF950A`.

