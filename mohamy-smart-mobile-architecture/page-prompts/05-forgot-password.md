# Forgot Password — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
شاشة استعادة كلمة المرور — بسيطة وهادئة. المحامي في لحظة إحباط (نسي كلمته) — الشاشة يجب أن تطمئنه وتساعده بسرعة.

## Visual Prompt
الخلفية `#F0EEE7` / `#0A0A0A`. Header بزر رجوع وعنوان "استعادة كلمة المرور".

بطاقة بيضاء `#FFFFFF` / `#1D1D1D` في المنتصف بـ radius `20px`. داخلها:

- أيقونة قفل مفتوح بحجم 48px داخل دائرة `#FBFAE8` حجم 80px — centered
- عنوان "نسيت كلمة المرور؟" بخط Bold 20px — centered
- وصف "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين" بخط Regular 14px `#1B1B1BA6` — centered — 2 سطور ماكس
- حقل البريد الإلكتروني (نفس أسلوب Login)
- زر "إرسال الرابط" — full width pill `#EF950A`
- رابط "العودة لتسجيل الدخول" أسفل الزر بـ 16px

**حالة النجاح**: بعد الإرسال، الـ Card ينتقل بتأثير flip أو fade إلى محتوى جديد:
- أيقونة ✉️ بحجم 48px مع checkmark أخضر
- "تم إرسال الرابط!" Bold 20px
- "تحقق من بريدك الإلكتروني واتبع التعليمات" Regular 14px
- زر "العودة لتسجيل الدخول" — full width pill
- رابط "إعادة الإرسال" بعد عداد 60 ثانية (مؤقتاً معطل → "إعادة الإرسال (45s)")

## Content Blocks (Arabic copy)
- Nav Title: "استعادة كلمة المرور"
- Title: "نسيت كلمة المرور؟"
- Body: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين"
- Label: "البريد الإلكتروني"
- CTA: "إرسال الرابط"
- Back Link: "العودة لتسجيل الدخول"
- Success Title: "تم إرسال الرابط!"
- Success Body: "تحقق من بريدك الإلكتروني واتبع التعليمات"
- Resend: "إعادة الإرسال" / "إعادة الإرسال (45s)"
- Error: "لم نتمكن من إرسال الرابط، حاول مجدداً"

## Components Used
- Navigation Header
- Icon in circle
- Text Input (email)
- Primary Button
- Text Link
- Countdown timer
- Success state card

## Interaction Notes
- Auto-focus on email field
- Submit validates email format
- Success → card transitions to confirmation
- Resend disabled for 60 seconds with countdown
- Back button → Login screen

## States to Design
| State | Description |
|-------|-------------|
| normal | Email input ready |
| loading | Spinner on button |
| success | Confirmation card with email icon |
| error | Error message below input |
| resend-cooldown | "إعادة الإرسال (45s)" disabled |

## Linked Screens
- **Navigates from**: Login
- **Navigates to**: Login (back or after success)

## Design Tokens Reference
```
Icon Circle: #FBFAE8 / #2A2A2A
Success Icon: #34BF49
CTA: #EF950A
Cooldown Text: #1B1B1B60
```
