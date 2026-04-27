# Workflow Selection — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
شاشة اختيار نوع المستند/التحليل القانوني. تعرض 7 مسارات عمل ذكية. المحامي اختار بدء التحليل — الآن يحتاج يختار المسار المناسب. التصميم يجب أن يكون واضحاً وغير مربك.

## Visual Prompt
الخلفية `#F0EEE7` / `#0A0A0A`. Header بزر رجوع + عنوان "اختر مسار العمل".

**Context Card** (أعلى): بطاقة صغيرة بخلفية `#FBFAE8` / `#2A2A2A` radius `12px` padding `12px`. على اليمين: عنوان القضية Bold 14px. على اليسار: badge عدد الوقائع "5 وقائع ✓" بلون أخضر إذا متاح، أو "غير جاهزة ⚠️" بلون برتقالي.

**Warning Card** (يظهر فقط إذا لا وقائع): بطاقة بخلفية `#CA000010`، radius `12px`. أيقونة ⚠️ + نص "لا توجد وقائع — ارجع وأكمل بيانات القضية" + زر "الرجوع" outlined.

**Workflow Grid**: قائمة عمودية من 7 بطاقات. كل بطاقة:
- خلفية `#FFFFFF` / `#1D1D1D`، radius `16px`، padding `20px`
- **يسار** (RTL): أيقونة المسار بحجم 36px داخل مربع مستدير 56x56px بخلفية `#EF950A10`
- **يمين**: 
  - عنوان المسار Bold 16px
  - وصف مختصر Regular 12px `#1B1B1BA6` — سطر واحد
  - badge "X خطوات" — خلفية `#1B1B1B08` radius `full` padding 4px 10px Bold 10px
- سهم → على أقصى اليسار
- حالة التعطيل: opacity `0.4` + لا يستجيب للضغط إذا لا وقائع

المسارات بالترتيب:
1. ⚡ إعداد مذكرة دفاع — "إنشاء مذكرة دفاع شاملة" — 5 خطوات
2. 📄 إعداد صحيفة دعوى — "إنشاء صحيفة دعوى كاملة" — 6 خطوات
3. ⚖️ صحيفة طعن بالنقض — "إعداد صحيفة طعن بالنقض" — 6 خطوات
4. ⚠️ شكوى رسمية — "إعداد شكوى رسمية" — 5 خطوات
5. ⚖️ تحليل حكم — "تحليل الحكم وتقييم العيوب" — 4 خطوات
6. 📋 إنذار رسمي — "إعداد إنذار بالصيغة القانونية" — 3 خطوات
7. 📋 طلب تنفيذي — "إعداد عريضة طلب تنفيذي" — 3 خطوات

## Content Blocks (Arabic copy)
- Nav: "اختر مسار العمل"
- Context: عنوان القضية + "X وقائع ✓" / "غير جاهزة ⚠️"
- Warning: "لا توجد وقائع — ارجع وأكمل بيانات القضية"
- Warning CTA: "الرجوع"
- Workflow titles + descriptions (listed above)
- Steps badge: "X خطوات"

## Components Used
- Navigation Header
- Context Info Card
- Warning Card (conditional)
- Workflow List Cards (7)
- Icon in rounded square
- Steps Badge
- Bottom Navigation

## Interaction Notes
- Card tap → respective AI Workflow screen (if facts available)
- Disabled cards (no facts) → haptic error + show warning
- Cards have press animation (scale 0.98 + shadow change)

## States to Design
| State | Description |
|-------|-------------|
| normal (facts available) | All cards active, green facts badge |
| no-facts | Warning card visible, all workflow cards dimmed |
| loading | Skeleton cards |

## Linked Screens
- **Navigates from**: Case Details (CTA button)
- **Navigates to**: AI Workflow Steps (specific workflow) / Case Details (back)

## Design Tokens Reference
```
Context Card: #FBFAE8 / #2A2A2A
Warning Card: #CA000010
Icon Square: #EF950A10
Steps Badge: #1B1B1B08
Arrow: #1B1B1B40
Disabled opacity: 0.4
```
