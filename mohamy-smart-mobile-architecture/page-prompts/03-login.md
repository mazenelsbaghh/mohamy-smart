# Login — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
شاشة تسجيل الدخول — نقطة الدخول اليومية للتطبيق. يجب أن تكون بسيطة وسريعة — المحامي يريد الوصول لقضاياه فوراً. التصميم هادئ وأنيق، بدون زحمة بصرية.

## Visual Prompt
الشاشة مقسمة عمودياً بشكل واضح:

**الجزء العلوي (30% من الشاشة):** خلفية `#F0EEE7` (فاتح) أو `#0A0A0A` (معتم). في المنتصف شعار محامي سمارت بحجم 80×80px. أسفله بمسافة 12px عنوان "مرحبًا بعودتك" بخط Tajawal Bold حجم 24px بلون `#1B1B1B`. أسفله بمسافة 6px وصف "سجّل دخولك لمتابعة قضاياك" بخط Tajawal Regular حجم 14px بلون `#1B1B1BA6`.

**الجزء السفلي (70% من الشاشة):** خلفية بيضاء `#FFFFFF` مع حواف علوية مستديرة radius `24px` — كأنها بطاقة كبيرة ترتفع من الأسفل. داخلها:

1. **حقل البريد الإلكتروني**: ارتفاع 52px، حدود `#1B1B1B15`، radius `12px`، padding أفقي 16px. Label أعلى الحقل "البريد الإلكتروني" بخط Tajawal Medium حجم 12px بلون `#1B1B1BA6`. أيقونة بريد على اليمين (RTL) بلون `#1B1B1B40`. Placeholder: "example@email.com" بلون `#1B1B1B30`.

2. **حقل كلمة المرور**: نفس أسلوب الحقل السابق. Label: "كلمة المرور". أيقونة قفل على اليمين. أيقونة عين (show/hide) على اليسار. Placeholder: "••••••••".

3. **رابط "نسيت كلمة المرور؟"**: محاذاة يسار (RTL: شمال)، Tajawal Medium حجم 13px بلون `#EF950A`. بمسافة 8px أسفل حقل كلمة المرور.

4. **زر "تسجيل الدخول"**: عرض كامل، ارتفاع 52px، خلفية `#EF950A`، نص أبيض Bold 16px، radius `full`. بمسافة 24px أسفل الرابط.

5. **فاصل "أو"**: خط أفقي رفيع `#1B1B1B10` مع كلمة "أو" في المنتصف بخلفية بيضاء وخط Tajawal Regular حجم 12px بلون `#1B1B1B60`. بمسافة 20px أسفل الزر.

6. **أزرار Social Login** (اختياري): زر Google + زر Apple — حدود `#1B1B1B15`، خلفية شفافة، radius `12px`، ارتفاع 48px. أيقونة + نص "المتابعة مع Google/Apple".

7. **رابط إنشاء حساب**: في أسفل الشاشة (safe area + 16px)، "ليس لديك حساب؟ **إنشاء حساب**" — النص العادي `#1B1B1BA6` والرابط `#EF950A` Bold.

## Content Blocks (Arabic copy)
- عنوان: "مرحبًا بعودتك"
- وصف: "سجّل دخولك لمتابعة قضاياك"
- Label 1: "البريد الإلكتروني"
- Placeholder 1: "example@email.com"
- Label 2: "كلمة المرور"
- Placeholder 2: "••••••••"
- رابط: "نسيت كلمة المرور؟"
- CTA: "تسجيل الدخول"
- فاصل: "أو"
- Social: "المتابعة مع Google" / "المتابعة مع Apple"
- Footer: "ليس لديك حساب؟ إنشاء حساب"
- Error: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
- Loading: spinner داخل الزر

## Components Used
- Logo Image
- Text Input (email type)
- Text Input (password type + toggle visibility)
- Primary Button (full-width pill)
- Text Link (forgot password)
- Divider with text
- Social Login Buttons (outlined)
- Bottom text link

## Interaction Notes
- Keyboard auto-shows on screen open with focus on email
- "Return" key on email → moves focus to password
- "Return" key on password → submits form
- Button shows spinner while loading
- Error toast shows below the form card
- Successful login → navigates to Home with slide transition
- "نسيت كلمة المرور" → Forgot Password screen
- "إنشاء حساب" → Sign Up screen
- Haptic feedback on button press

## States to Design
| State | Description |
|-------|-------------|
| normal (light) | Empty form, ready for input |
| normal (dark) | Dark variant |
| filled | Both fields have content |
| loading | Spinner replaces button text, fields disabled |
| error | Red border on invalid field + error message below |
| success | Brief checkmark animation → navigate away |

## Linked Screens
- **Navigates from**: Splash / Onboarding / Logout
- **Navigates to**: Home Dashboard (success) / Forgot Password / Sign Up

## Design Tokens Reference
```
Card Background: #FFFFFF / #1D1D1D
Input Border: #1B1B1B15 / #FFFFFF15
Input Border Focus: #EF950A
Input Background: transparent / #2A2A2A
Label: #1B1B1BA6 / #FFFFFF99
Placeholder: #1B1B1B30 / #FFFFFF30
CTA: #EF950A
Error Border: #CA0000
Error Text: #CA0000
Link: #EF950A
```
