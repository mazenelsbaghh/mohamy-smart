# Splash Screen — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844 (iPhone 14 reference)

## Design Context
شاشة البداية التي تظهر عند فتح التطبيق لأول مرة أو عند كل تشغيل. هدفها إعطاء انطباع أولي بأن هذا تطبيق احترافي فاخر — ليس تطبيق قانوني تقليدي. تعرض الشعار فقط مع حركة بسيطة أنيقة.

## Visual Prompt
شاشة بملء العرض والارتفاع، الخلفية لون `#F0EEE7` (warm light gray) في الوضع الفاتح، و `#0A0A0A` (jet black) في الوضع المعتم. في المنتصف تماماً (أفقياً وعمودياً) يظهر شعار محامي سمارت — الصورة الأصلية للشعار بحجم 120×120px. أسفل الشعار بمسافة 16px يظهر اسم التطبيق "محامي سمارت" بخط Tajawal Bold حجم 24px بلون `#1B1B1B` (فاتح) أو `#FFFFFF` (معتم). أسفل الاسم بمسافة 8px يظهر الشعار الفرعي "ذكاء اصطناعي لممارسة قانونية أذكى" بخط Tajawal Regular حجم 13px بلون `#1B1B1BA6` (فاتح) أو `#FFFFFF99` (معتم). لا وجود لأي زر أو حقل — فقط الشعار والنصوص. في أسفل الشاشة (40px من الحافة) يظهر نص "الإصدار 1.0.0" بخط Tajawal Regular حجم 10px بلون `#1B1B1B40`.

Animation: الشعار يظهر بتأثير fade-in + scale من 0.8 إلى 1.0 خلال 600ms مع easing `ease-out`. اسم التطبيق يظهر بتأثير fade-in بعد 200ms delay. الشعار الفرعي يظهر بعد 100ms أخرى. بعد 2 ثانية إجمالية، الشاشة كلها تنزلق لأسفل وتختفي مع fade-out لتكشف عن الشاشة التالية (Onboarding أو Login).

## Content Blocks (Arabic copy)
- اسم التطبيق: "محامي سمارت"
- الشعار الفرعي: "ذكاء اصطناعي لممارسة قانونية أذكى"
- رقم الإصدار: "الإصدار 1.0.0"

## Components Used
- Logo Image (`/images/logo.png`)
- Text labels (no interactive components)

## Interaction Notes
- لا يوجد أي تفاعل — الشاشة تختفي تلقائياً بعد 2 ثانية
- إذا كان المستخدم مسجل دخول → الانتقال إلى Home Dashboard
- إذا كان أول استخدام → الانتقال إلى Onboarding
- إذا كان مسجل خروج → الانتقال إلى Login

## States to Design
| State | Description |
|-------|-------------|
| normal (light) | خلفية `#F0EEE7` + شعار + نصوص داكنة |
| normal (dark) | خلفية `#0A0A0A` + شعار + نصوص فاتحة |

## Linked Screens
- **Navigates from**: تشغيل التطبيق
- **Navigates to**: Onboarding (أول مرة) / Login (مسجل خروج) / Home (مسجل دخول)

## Design Tokens Reference
```
Background Light: #F0EEE7
Background Dark: #0A0A0A
Title Light: #1B1B1B
Title Dark: #FFFFFF
Subtitle Light: #1B1B1BA6
Subtitle Dark: #FFFFFF99
```
