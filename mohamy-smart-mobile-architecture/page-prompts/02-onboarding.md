# Onboarding — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844 (iPhone 14 reference)

## Design Context
شاشة الترحيب التي تظهر مرة واحدة فقط عند أول استخدام للتطبيق. هدفها شرح القيمة الأساسية للتطبيق في 3 خطوات سريعة وتحفيز المحامي لإنشاء حساب. التصميم يجب أن يوصل إحساس الثقة والاحترافية — ليس طفولياً أو مبالغاً.

## Visual Prompt
شاشة Onboarding مكونة من 3 slides يتنقل بينها المستخدم بالسحب (swipe) أو بالضغط على زر "التالي".

**الهيكل العام لكل slide:**
- **الثلثان العلويان** (66% من الشاشة): illustration أو graphic كبير بأسلوب flat/minimal بألوان دافئة (أبرتقالي `#EF950A` + كريمي `#FBFAE8` + أسود `#1B1B1B`). لا صور فوتوغرافية. الرسوم توضيحية ذات طابع قانوني عصري.
- **الثلث السفلي** (34%): خلفية بيضاء `#FFFFFF` (فاتح) أو `#1D1D1D` (معتم) مع:
  - عنوان رئيسي بخط Tajawal Bold حجم 22px بلون `#1B1B1B`
  - وصف مختصر بخط Tajawal Regular حجم 14px بلون `#1B1B1BA6` — سطرين ماكس
  - Page indicator: 3 نقاط أفقية — النشطة `#EF950A` بعرض 24px والباقي `#1B1B1B20` بعرض 8px
  - زر "التالي" أو "ابدأ الآن" (في الشاشة الأخيرة): عرض كامل - 48px padding جانبي، ارتفاع 52px، خلفية `#EF950A`، نص أبيض Bold 16px، radius `full` (pill)
  - رابط "تخطّي" في أعلى الثلث السفلي: Tajawal Medium حجم 13px بلون `#1B1B1BA6`

**Slide 1 — "أدر قضاياك بذكاء":**
- Illustration: ميزان عدالة مع عناصر رقمية/ذكاء اصطناعي حوله
- عنوان: "أدر قضاياك بذكاء"
- وصف: "تابع جميع قضاياك وجلساتك ومستنداتك من مكان واحد"

**Slide 2 — "ذكاء اصطناعي قانوني":**
- Illustration: مستند قانوني مع أيقونة ⚡ ونقاط تحليل
- عنوان: "ذكاء اصطناعي قانوني"
- وصف: "مذكرات دفاع وصحف دعوى وتحليل أحكام — في دقائق"

**Slide 3 — "ابدأ الآن":**
- Illustration: محامٍ (بأسلوب مسطح) مع شاشة تطبيق
- عنوان: "جاهز لممارسة أذكى؟"
- وصف: "سجّل الآن واستكشف أدوات تسرّع عملك القانوني"
- الزر يتغير إلى "ابدأ الآن" بدلاً من "التالي"

## Content Blocks (Arabic copy)
- تخطّي: "تخطّي"
- Slide 1 Title: "أدر قضاياك بذكاء"
- Slide 1 Body: "تابع جميع قضاياك وجلساتك ومستنداتك من مكان واحد"
- Slide 2 Title: "ذكاء اصطناعي قانوني"
- Slide 2 Body: "مذكرات دفاع وصحف دعوى وتحليل أحكام — في دقائق"
- Slide 3 Title: "جاهز لممارسة أذكى؟"
- Slide 3 Body: "سجّل الآن واستكشف أدوات تسرّع عملك القانوني"
- Button (Slides 1-2): "التالي"
- Button (Slide 3): "ابدأ الآن"

## Components Used
- Swipeable pager / horizontal scroll
- Page indicator dots (custom styled)
- Primary Button (pill, full-width)
- Ghost link ("تخطّي")
- Illustrations (3 custom graphics)

## Interaction Notes
- Swipe left (RTL: right) to advance slides
- "التالي" button advances to next slide
- "تخطّي" skips to Login screen
- "ابدأ الآن" navigates to Sign Up screen
- Page indicators animate between slides
- Mark `hasSeenOnboarding = true` in AsyncStorage so it doesn't show again

## States to Design
| State | Description |
|-------|-------------|
| slide-1 (light) | First slide active, dot 1 orange |
| slide-2 (light) | Second slide active, dot 2 orange |
| slide-3 (light) | Third slide active, CTA changes to "ابدأ الآن" |
| slide-1 (dark) | Dark variant of slide 1 |

## Linked Screens
- **Navigates from**: Splash (first launch only)
- **Navigates to**: Sign Up ("ابدأ الآن") / Login ("تخطّي")

## Design Tokens Reference
```
Background: #FFFFFF / #1D1D1D
Title: #1B1B1B / #FFFFFF
Body: #1B1B1BA6 / #FFFFFF99
CTA Background: #EF950A
CTA Text: #FFFFFF
Skip Text: #1B1B1BA6
Active Dot: #EF950A (width 24px)
Inactive Dot: #1B1B1B20 (width 8px)
```
