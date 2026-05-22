# Sign Up — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Account creation for a lawyer. The screen captures essential profile and license data without overwhelming the user.

## Visual Prompt
Create an RTL multi-section sign-up screen with a compact top bar and back arrow mirrored for RTL. Use a scrollable form with grouped cards: "بيانات الحساب" and "بيانات الممارسة". Each card is `#FFFEFA`, radius 18px, with warm borders. Inputs use `#FBFAE8`; required fields have small amber markers. A sticky bottom area contains the primary amber button "إنشاء الحساب" and a compact terms checkbox above it. In dark mode, cards are `#1D1D1D`, borders `#FFFFFF15`, and text is `#F7F2E8`.

## Content Blocks (Arabic copy)
- إنشاء حساب محام
- ابدأ تنظيم مكتبك القانوني
- الاسم الكامل
- رقم الجوال
- البريد الإلكتروني
- كلمة المرور
- رقم الترخيص
- المدينة
- أوافق على الشروط والأحكام وسياسة الخصوصية
- إنشاء الحساب
- لديك حساب؟ تسجيل الدخول
- هذا الحقل مطلوب

## Components Used
- Form cards
- Text input
- Password input
- Select
- Checkbox
- Sticky bottom action

## Interaction Notes
Submit opens OTP Verification after validation. Terms links open legal pages.

## States to Design
| State | Description |
|-------|-------------|
| normal | Form ready |
| loading | Sticky button spinner |
| error | Field-level validation |
| success | Routes to OTP |

## Linked Screens
- **Navigates from**: Onboarding, Login
- **Navigates to**: OTP Verification, Login

## Design Tokens Reference
Card radius 18px, button radius 16px, amber `#EF950A`.

