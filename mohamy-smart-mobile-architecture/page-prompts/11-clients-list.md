# Clients List — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
شاشة إدارة الموكلين. قائمة بسيطة ومنظمة — المحامي يبحث عن موكل بالاسم أو الهاتف، يضيف موكل جديد، أو يفتح ملف موكل. على الموبايل: القائمة فقط (لا table view) لأنها أسهل بيد واحدة.

## Visual Prompt
الخلفية `#F0EEE7` / `#0A0A0A`. Header "الموكلين" Bold 22px + أيقونة بحث.

**Search Bar** (always visible): حقل بحث بعرض كامل - 40px. ارتفاع 44px، radius `12px`، خلفية `#FFFFFF` / `#2A2A2A`. أيقونة بحث + placeholder "ابحث بالاسم أو الهاتف...".

**Stats Row**: صف بسيط أسفل البحث:
- "إجمالي: **15** موكل" + "نشطون: **8**" — Regular 12px `#1B1B1BA6` عدا الأرقام Bold `#1B1B1B`.

**Clients List**: قائمة عمودية. كل عنصر:
- خلفية `#FFFFFF` / `#1D1D1D`, radius `12px`, padding `14px`, margin-bottom `8px`
- على اليمين: Avatar دائري 44px بأحرف الاسم الأولى + لون من مجموعة: `#EF950A`, `#1B1B1B`, `#CA0000`, `#34BF49`, `#8B5CF6`
- وسط: اسم الموكل Bold 15px + رقم الهاتف Regular 12px `#1B1B1BA6` (LTR)
- على اليسار: Badge الحالة
  - "نشط": نقطة خضراء + نص أخضر 11px
  - "عادي": نقطة رمادية + نص رمادي 11px
- Swipe actions (RTL): swipe يسار → حذف (أحمر) / تعديل (برتقالي)

**FAB**: دائرة 56px `#EF950A` + أيقونة "+" — أسفل يسار (RTL) فوق Bottom Nav.

**Bottom Navigation**: "الموكلين" active.

## Content Blocks (Arabic copy)
- Title: "الموكلين"
- Search: "ابحث بالاسم أو الهاتف..."
- Stats: "إجمالي: X موكل" / "نشطون: X"
- Badge: "نشط" / "عادي"
- Empty: "لا يوجد موكلون بعد"
- Empty CTA: "أضف أول موكل"
- FAB: "إضافة موكل"

## Components Used
- Screen Header
- Search Input (always visible)
- Stats text row
- Client list items with avatar
- Status badges
- Swipe actions
- FAB
- Bottom Navigation
- Add Client Bottom Sheet (modal)

## Interaction Notes
- Search filters in real-time
- Card tap → Client Details
- FAB → Bottom Sheet with add client form
- Swipe left → delete/edit actions
- Pull-to-refresh

## States to Design
| State | Description |
|-------|-------------|
| normal | Client list with data |
| empty | Illustration + message + CTA |
| loading | Skeleton list (5 items) |
| searching | Filtered results |
| no-results | "لا توجد نتائج" |

## Linked Screens
- **Navigates from**: Home / Bottom Nav
- **Navigates to**: Client Details / Add Client Sheet

## Design Tokens Reference
```
Avatar colors: #EF950A, #1B1B1B, #CA0000, #34BF49, #8B5CF6
Active badge: #34BF49
Normal badge: #1B1B1B60
FAB: #EF950A
Search bg: #FFFFFF / #2A2A2A
```
