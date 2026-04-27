# Agenda / Calendar — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
أجندة المحامي — جلسات المحاكم والإجراءات القانونية. على الموبايل الأجندة حيوية لأن المحامي يتفقدها قبل كل جلسة. التصميم يراعي السرعة — المحامي يريد يعرف "إيه اللي عندي النهاردة/.

## Visual Prompt
خلفية `#F0EEE7` / `#0A0A0A`. Header "الأجندة" Bold 22px + زر "+" على اليسار.

**Month Strip** (ثابت): scrollable horizontal من أسماء الأشهر. الشهر الحالي: Bold `#EF950A`. الباقي: Regular `#1B1B1BA6`.

**Week View** (ثابت أسفل الشهر): صف من 7 أيام (السبت → الجمعة). كل يوم:
- اسم اليوم (سبت/أحد...) Regular 10px
- رقم اليوم Bold 16px
- اليوم المحدد: دائرة `#EF950A` + نص أبيض
- أيام بها أحداث: نقطة صغيرة 4px أسفل الرقم بلون `#EF950A`
- اليوم الحالي (إذا غير محدد): حدود `#EF950A`

**Legend**: صف صغير أسفل الأسبوع:
- 🟠 pill "جلسة" + 🟡 pill "إجراء" — حجم صغير Bold 10px

**Day Events** (scrollable main content): قائمة أحداث اليوم المحدد:

كل حدث:
- بطاقة radius `12px` padding `14px`
- شريط جانبي يمين 3px: `#EF950A` (جلسة) / `#F59E0B` (إجراء)
- عنوان الحدث Bold 15px
- صف معلومات: 🕐 الوقت + 🏛️ المحكمة (جلسة) / 📍 الموقع (إجراء)
- Badge الحالة: "متداولة" أخضر / "مؤجلة" أصفر / "منتهية" أزرق / "ملغاة" أحمر
- Tap → Detail bottom sheet

**Empty State** (لا أحداث في اليوم المحدد):
- أيقونة تقويم فارغ 48px `#1B1B1B20`
- "لا توجد مواعيد في هذا اليوم" Regular 14px `#1B1B1BA6`
- زر "إضافة" outlined

**FAB**: دائرة `#EF950A` + أيقونة +

## Content Blocks (Arabic copy)
- Title: "الأجندة"
- Days: "سبت" / "أحد" / "اثنين" / "ثلاثاء" / "أربعاء" / "خميس" / "جمعة"
- Legend: "جلسة" / "إجراء"
- Statuses: "متداولة" / "مؤجلة" / "منتهية" / "ملغاة"
- Empty: "لا توجد مواعيد في هذا اليوم"
- Add: "إضافة"
- Detail sheet title: "تفاصيل الموعد"

## Components Used
- Month horizontal scroller
- Week day bar
- Legend pills
- Event cards with side strip
- Status badges
- Empty state
- FAB
- Detail Bottom Sheet
- Add Event Bottom Sheet with tabs (Session/Action)
- Bottom Navigation ("الأجندة" active)

## Interaction Notes
- Swipe week bar left/right → previous/next week
- Tap day → shows that day's events
- FAB → bottom sheet: select case → tabs (جلسة/إجراء) → form
- Event card tap → detail sheet with full info + edit/delete
- Pull-to-refresh
- Today button (left of header if scrolled away from today)

## States to Design
| State | Description |
|-------|-------------|
| normal | Day with events |
| empty-day | No events message + add button |
| loading | Skeleton event cards |
| add-session | Bottom sheet with session form |
| add-action | Bottom sheet with action form |
| detail | Bottom sheet with event details |

## Linked Screens
- **Navigates from**: Home / Bottom Nav
- **Navigates to**: Case Details (via event) / Add Event Sheet

## Design Tokens Reference
```
Selected Day: #EF950A circle + white text
Today (unselected): #EF950A border
Event dot: #EF950A (4px)
Session strip: #EF950A
Action strip: #F59E0B
Status scheduled: #34BF49
Status postponed: #F59E0B
Status completed: #3B82F6
Status cancelled: #CA0000
```
