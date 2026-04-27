# Home Dashboard — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
الشاشة الرئيسية — أول ما يراه المحامي بعد تسجيل الدخول. يجب أن تلخص حالة عمله في ثوانٍ وتوجهه لأهم المهام. التصميم يراعي الاستخدام بيد واحدة — المعلومات الأهم في المنطقة الوسطى والعليا، والإجراءات في الأسفل.

## Visual Prompt
الشاشة scrollable عمودياً. الخلفية `#F0EEE7` / `#0A0A0A`.

**Status Bar + Header** (ثابت): خلفية شفافة. على اليمين (RTL): "مرحبًا، أ/ أحمد" بخط Tajawal Bold 18px + أسفله "صباح الخير ☀️" بخط Regular 12px `#1B1B1BA6`. على اليسار: avatar دائري 40px بأحرف الاسم + أيقونة إشعارات (جرس) بـ badge أحمر صغير (عدد).

**Quick Actions Bar**: صف أفقي من 4 أيقونات دائرية (60x60px) متساوية المسافات. كل دائرة: خلفية `#FFFFFF` / `#1D1D1D` مع ظل `shadow-sm`، أيقونة 24px بلون `#EF950A`، واسم أسفلها بخط Bold 10px:
1. ⚡ "قضية جديدة"
2. 👤 "موكل جديد"  
3. 📄 "رفع مستند"
4. 📅 "الأجندة"

**Stats Cards**: 3 بطاقات أفقية scrollable (snap scroll). كل بطاقة: عرض 140px تقريباً، ارتفاع 90px، radius `16px`، خلفية `#FFFFFF` / `#1D1D1D`.
- بطاقة 1: أيقونة ⚖️ بدائرة `#EF950A20` + رقم كبير Bold 28px + "إجمالي القضايا" Regular 11px
- بطاقة 2: أيقونة ✓ بدائرة `#34BF4920` + رقم + "القضايا النشطة"
- بطاقة 3: أيقونة 👥 بدائرة `#8B5CF620` + رقم + "الموكلين"

**Section: "مواعيد اليوم"**: عنوان بخط Bold 16px على اليمين + "عرض الكل" بلون `#EF950A` Bold 13px على اليسار. أسفله بطاقات مواعيد (2 بطاقات كحد أقصى):
- كل بطاقة: خلفية `#FFFFFF` / `#1D1D1D`، radius `12px`، ارتفاع ~72px
- على اليمين: شريط عمودي رفيع 3px بلون `#EF950A` (جلسة) أو `#F59E0B` (إجراء)
- المحتوى: عنوان Bold 14px + وقت Regular 12px `#1B1B1BA6` + اسم الموكل Regular 12px
- أيقونة سهم صغيرة على اليسار

**Section: "القضايا الأخيرة"**: نفس Header style. قائمة من 3-5 بطاقات:
- كل بطاقة: radius `12px`، padding `16px`
- عنوان القضية Bold 14px
- صف: نوع القضية Regular 12px `#1B1B1BA6` + Badge حالة (أخضر "نشطة" / رمادي "منتهية")
- تاريخ الإنشاء Regular 11px مع أيقونة تقويم صغيرة

**Bottom Navigation**: شريط سفلي ثابت بارتفاع 64px + safe area. خلفية `#FFFFFF` / `#1D1D1D` مع ظل علوي. 5 عناصر:
1. 🏠 "الرئيسية" (active: `#EF950A`)
2. ⚖️ "القضايا"
3. 👥 "الموكلين"
4. 📅 "الأجندة"
5. ⚙️ "المزيد"

العنصر النشط: أيقونة ملونة `#EF950A` + نص `#EF950A` Bold. غير النشط: `#1B1B1B60`. لا يوجد خلفية على العنصر النشط — لون فقط.

## Content Blocks (Arabic copy)
- ترحيب: "مرحبًا، أ/ أحمد"
- تحية: "صباح الخير ☀️" / "مساء الخير 🌙"
- Quick Actions: "قضية جديدة" / "موكل جديد" / "رفع مستند" / "الأجندة"
- Stats: "إجمالي القضايا" / "القضايا النشطة" / "الموكلين"
- Section: "مواعيد اليوم" + "عرض الكل"
- Appointment: "جلسة قضية مدنية" / "12:30 - 04:36 PM" / "موكل: أحمد علي"
- Section: "القضايا الأخيرة" + "عرض الكل"
- Empty: "لا توجد مواعيد اليوم"
- Bottom Nav: "الرئيسية" / "القضايا" / "الموكلين" / "الأجندة" / "المزيد"

## Components Used
- Custom Header with greeting
- Avatar with initials
- Notification bell with badge
- Quick Action circles (4)
- Horizontal scrollable Stats Cards (3)
- Section header with "view all" link
- Appointment cards with color strip
- Case list cards with status badge
- Bottom Navigation Bar (5 items)

## Interaction Notes
- Pull-to-refresh refreshes all data
- Stats cards horizontally scrollable with snap
- Appointment card tap → Agenda detail modal
- Case card tap → Case Details screen
- Quick Action circles → respective creation screens
- Notification bell → Notifications screen
- Avatar → Settings/Profile
- "عرض الكل" → respective list screen
- Greeting changes based on time of day (صباح/مساء)

## States to Design
| State | Description |
|-------|-------------|
| normal | All data loaded, appointments exist |
| empty-appointments | "لا توجد مواعيد اليوم" message |
| empty-cases | "لا توجد قضايا بعد — أنشئ أول قضية" |
| loading | Skeleton cards for stats + skeleton list |
| error | Pull-to-refresh hint |

## Linked Screens
- **Navigates from**: Login (success) / Splash (authenticated)
- **Navigates to**: Cases / Clients / Documents / Agenda / Notifications / Settings / Case Details / Create Case

## Design Tokens Reference
```
Background: #F0EEE7 / #0A0A0A
Card: #FFFFFF / #1D1D1D
Quick Action Circle: #FFFFFF / #1D1D1D + shadow-sm
Active Nav: #EF950A
Inactive Nav: #1B1B1B60
Stats Icon Circles: #EF950A20 / #34BF4920 / #8B5CF620
Appointment Strip Session: #EF950A
Appointment Strip Action: #F59E0B
Badge Active: #34BF49 bg + white text
Badge Closed: #1B1B1B15 bg + #1B1B1B80 text
```
