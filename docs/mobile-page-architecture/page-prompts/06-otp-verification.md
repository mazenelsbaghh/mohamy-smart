# OTP Verification — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Verifies phone/email during sign-up or password reset.

## Visual Prompt
Create an RTL verification screen with a centered compact form. The title "تأكيد رقم الجوال" appears near top, followed by a masked destination line. Six OTP boxes are arranged horizontally with RTL-friendly numeric input, each 48px square, radius 14px, warm cream fill. Timer and resend action sit below. Primary amber button "تأكيد" is full width. Dark mode uses dark surface boxes and amber focus ring.

## Content Blocks (Arabic copy)
- تأكيد رقم الجوال
- أدخل رمز التحقق المرسل إلى
- رمز التحقق
- تأكيد
- إعادة إرسال الرمز
- يمكنك طلب رمز جديد خلال
- الرمز غير صحيح
- انتهت صلاحية الرمز

## Components Used
- OTP input
- Timer
- Primary button
- Inline error

## Interaction Notes
Auto-submit may trigger when all digits are entered. Resend resets timer.

## States to Design
| State | Description |
|-------|-------------|
| normal | Empty OTP boxes |
| active | One focused box with amber ring |
| error | Red message and subtle shake |
| expired | Resend enabled |
| loading | Verify button spinner |

## Linked Screens
- **Navigates from**: Sign Up, Forgot Password
- **Navigates to**: Home Dashboard, Login

## Design Tokens Reference
Box radius 14px, focus `#EF950A`, danger `#CA0000`.

