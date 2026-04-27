# Cases List — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
شاشة عرض جميع قضايا المحامي. هي ثاني أهم شاشة بعد الـ Home. يجب أن تمكّن المحامي من إيجاد أي قضية بسرعة عبر البحث والفلترة، مع إمكانية إنشاء قضية جديدة بضغطة واحدة.

## Visual Prompt
الخلفية `#F0EEE7` / `#0A0A0A`.

**Header** (ثابت): عنوان "القضايا" بخط Tajawal Bold 22px على اليمين. على اليسار: أيقونة بحث (🔍) وأيقونة فلتر (ثلاثة خطوط) بحجم 22px بلون `#1B1B1B`.

**Search Bar** (يظهر عند الضغط على أيقونة البحث): ينزلق من الأعلى بتأثير slide-down. حقل بحث: خلفية `#FFFFFF` / `#2A2A2A`، radius `12px`، ارتفاع 44px، أيقونة بحث على اليمين، placeholder "ابحث في القضايا..." بخط Regular 14px، زر "إلغاء" على اليسار.

**Filter Chips** (scrollable horizontal): أسفل الـ Header. chips بحدود خفيفة:
- "الكل" (active: خلفية `#EF950A` + نص أبيض)
- "النشطة" (inactive: خلفية `#FFFFFF` + حدود `#1B1B1B15` + نص `#1B1B1B`)
- "المنتهية"
كل chip: ارتفاع 32px، radius `full`، padding أفقي 16px، Bold 12px.

**Stats Summary**: صف من 3 أرقام مضغوطة بخلفية `#FFFFFF` / `#1D1D1D` radius `12px` padding `12px`:
- "إجمالي: **12**" | "نشطة: **8**" | "منتهية: **4**"
كل قسم مفصول بخط عمودي رفيع `#1B1B1B10`.

**Cases List**: قائمة عمودية. كل بطاقة قضية:
- خلفية `#FFFFFF` / `#1D1D1D`، radius `16px`، padding `16px`، margin عمودي `8px`
- **الصف الأول**: عنوان القضية Bold 15px على اليمين + Badge الحالة على اليسار
  - Badge نشطة: خلفية `#34BF4915` + نقطة خضراء ● + نص `#34BF49` Bold 11px
  - Badge منتهية: خلفية `#1B1B1B10` + نقطة رمادية + نص `#1B1B1B60`
- **الصف الثاني**: أيقونات صغيرة 12px مع نصوص Regular 12px `#1B1B1BA6`:
  - ⚖️ نوع القضية | 🏛️ المحكمة
- **الصف الثالث**: 
  - 👤 اسم الموكل | 📅 تاريخ الإنشاء
- **الصف الرابع**: خط فاصل رفيع `#1B1B1B08` + رابط "عرض التفاصيل ←" بخط Bold 13px `#EF950A`

**FAB** (Floating Action Button): دائرة 56px بلون `#EF950A`، ظل `shadow-md`، أيقونة "+" بيضاء 24px. موقعها: أسفل يسار (RTL) بمسافة 20px من الحواف، فوق Bottom Nav بـ 16px.

**Bottom Navigation**: نفس التصميم في Home — "القضايا" active.

## Content Blocks (Arabic copy)
- Title: "القضايا"
- Search Placeholder: "ابحث في القضايا..."
- Filters: "الكل" / "النشطة" / "المنتهية"
- Stats: "إجمالي:" / "نشطة:" / "منتهية:"
- Badge: "نشطة" / "منتهية"
- Case card fields: نوع القضية / المحكمة / الموكل / التاريخ
- Link: "عرض التفاصيل ←"
- Empty: "لا توجد قضايا بعد"
- Empty CTA: "أنشئ أول قضية"
- FAB tooltip: "إنشاء قضية"

## Components Used
- Screen Header with search + filter icons
- Animated Search Bar
- Horizontal Filter Chips
- Stats Summary bar
- Case Card (custom)
- Status Badge
- FAB Button
- Bottom Navigation

## Interaction Notes
- Pull-to-refresh
- Infinite scroll or pagination (load more on scroll bottom)
- Search is real-time (debounced 300ms)
- Filter chips filter in-place (no new request for client-side data)
- Case card tap → Case Details
- FAB → Documents screen (to create case from documents)
- Swipe left (RTL: right) on card → quick actions (archive/delete)
- Long press → multi-select mode

## States to Design
| State | Description |
|-------|-------------|
| normal | Cases list with data |
| empty | Illustration + "لا توجد قضايا بعد" + CTA |
| loading | Skeleton cards (3 pulsing) |
| searching | Search bar open + filtered results |
| filtered | Filter chip active + filtered list |
| error | Error message + retry button |

## Linked Screens
- **Navigates from**: Home / Bottom Nav
- **Navigates to**: Case Details / Documents (create case)

## Design Tokens Reference
```
Active Chip: #EF950A bg + #FFFFFF text
Inactive Chip: #FFFFFF / #1D1D1D bg + #1B1B1B text
FAB: #EF950A + shadow-md
Case Card: #FFFFFF / #1D1D1D + shadow-sm
Active Badge: #34BF4915 bg + #34BF49 text
Closed Badge: #1B1B1B10 bg + #1B1B1B60 text
```
