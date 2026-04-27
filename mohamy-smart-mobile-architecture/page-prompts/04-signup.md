# Sign Up — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
شاشة إنشاء حساب جديد لمحامٍ. يجب أن تكون واضحة وغير مرهقة رغم عدد الحقول. التسجيل هو الخطوة الأولى نحو التحويل — الانطباع مهم.

## Visual Prompt
الشاشة scrollable عمودياً. الخلفية `#F0EEE7` (فاتح) / `#0A0A0A` (معتم).

**Header** (ثابت في الأعلى): شريط بارتفاع 56px مع زر رجوع (سهم `→` لأن RTL) على اليمين بلون `#1B1B1B`. عنوان "إنشاء حساب جديد" في المنتصف بخط Tajawal Bold حجم 17px.

**Content Card**: بطاقة بيضاء `#FFFFFF` / `#1D1D1D` بـ radius `20px` وظل `shadow-sm`، margin أفقي 20px. داخلها padding 24px. تحتوي:

1. **أيقونة + عنوان ترحيبي**: أيقونة ⚖️ بحجم 40px داخل دائرة `#FBFAE8` مع عنوان "انضم لمحامي سمارت" بخط Bold 20px وأسفله "أنشئ حسابك وابدأ بإدارة قضاياك بذكاء" Regular 13px `#1B1B1BA6`. Centered.

2. **الحقول** (كل حقل بنفس أسلوب Login — ارتفاع 52px، radius 12px، label أعلى):
   - الاسم الكامل (أيقونة شخص)
   - البريد الإلكتروني (أيقونة بريد)
   - رقم الهاتف (أيقونة هاتف) — keyboard numeric
   - كلمة المرور (أيقونة قفل + toggle عين)
   - تأكيد كلمة المرور

3. **مؤشر قوة كلمة المرور**: شريط أفقي بعرض كامل أسفل حقل كلمة المرور مباشرة. 3 أقسام مع ألوان: ضعيفة `#CA0000`، متوسطة `#F59E0B`، قوية `#34BF49`. نص صغير "قوية ✓" / "متوسطة" / "ضعيفة".

4. **Checkbox الشروط**: checkbox مخصص بـ radius `4px` + نص "أوافق على الشروط وسياسة الخصوصية" بخط Regular 12px. "الشروط" و"سياسة الخصوصية" بلون `#EF950A` كروابط.

5. **زر "إنشاء الحساب"**: عرض كامل، ارتفاع 52px، `#EF950A`، radius full، Bold 16px أبيض.

**Footer**: أسفل الـ Card بمسافة 16px، "لديك حساب؟ **تسجيل الدخول**" — centered.

## Content Blocks (Arabic copy)
- Nav Title: "إنشاء حساب جديد"
- Welcome: "انضم لمحامي سمارت"
- Subtitle: "أنشئ حسابك وابدأ بإدارة قضاياك بذكاء"
- Labels: "الاسم الكامل" / "البريد الإلكتروني" / "رقم الهاتف" / "كلمة المرور" / "تأكيد كلمة المرور"
- Placeholders: "أدخل اسمك الكامل" / "example@email.com" / "01xxxxxxxxx" / "••••••••" / "••••••••"
- Password strength: "ضعيفة" / "متوسطة" / "قوية ✓"
- Checkbox: "أوافق على الشروط وسياسة الخصوصية"
- CTA: "إنشاء الحساب"
- Footer: "لديك حساب؟ تسجيل الدخول"
- Validation errors: "الاسم مطلوب" / "بريد إلكتروني غير صالح" / "كلمة المرور يجب أن تكون 8 أحرف على الأقل" / "كلمتا المرور غير متطابقتين" / "يجب الموافقة على الشروط"

## Components Used
- Navigation Header with back button
- Text Inputs (5 fields)
- Password strength indicator
- Custom Checkbox
- Primary Button (full-width pill)
- Bottom text link

## Interaction Notes
- Form validates on blur (each field)
- Real-time password strength update
- "إنشاء الحساب" disabled until all fields valid + checkbox checked
- Button shows spinner while loading
- Success → animated checkmark → navigate to Login with toast "تم إنشاء حسابك بنجاح"
- Back button → Login screen
- Keyboard avoidance: form scrolls when keyboard opens

## States to Design
| State | Description |
|-------|-------------|
| normal (light) | Empty form |
| filling | Partially filled with inline validation |
| password-weak | Red strength bar |
| password-strong | Green strength bar |
| validation-error | Red borders on invalid fields |
| loading | Spinner on CTA, fields disabled |
| success | Checkmark animation |

## Linked Screens
- **Navigates from**: Onboarding ("ابدأ الآن") / Login ("إنشاء حساب")
- **Navigates to**: Login (success or back)

## Design Tokens Reference
```
Card: #FFFFFF / #1D1D1D
Icon Circle: #FBFAE8 / #2A2A2A
Strength Weak: #CA0000
Strength Medium: #F59E0B
Strength Strong: #34BF49
Checkbox Active: #EF950A
CTA: #EF950A
```
