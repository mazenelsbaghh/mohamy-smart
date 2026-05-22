# Cases List — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Mobile list for finding and opening legal cases quickly.

## Visual Prompt
Create a right-to-left cases screen with a compact title "القضايا" and an add icon button. Place a search input under the header with placeholder "ابحث برقم القضية أو اسم العميل". Add horizontally scrollable filter chips for status and court. The list uses rich case cards showing case number, client name, court, next session, and status chip. Use no tables. A floating amber FAB in the lower left above bottom nav adds a case. Dark mode uses dark cards with warm borders.

## Content Blocks (Arabic copy)
- القضايا
- ابحث برقم القضية أو اسم العميل
- الكل
- نشطة
- قيد الانتظار
- منتهية
- جلسة قادمة
- لا توجد قضايا بعد
- أضف أول قضية
- لا توجد نتائج مطابقة

## Components Used
- Header
- Search input
- Filter chips
- Case card
- Floating action button
- Bottom navigation

## Interaction Notes
Search filters live. Card tap opens Case Details. FAB opens Add Case.

## States to Design
| State | Description |
|-------|-------------|
| normal | Scrollable case cards |
| loading | List skeleton |
| empty | First-case CTA |
| no-results | Search-specific empty state |
| error | Retry card |

## Linked Screens
- **Navigates from**: Home, Bottom navigation
- **Navigates to**: Case Details, Add Case

## Design Tokens Reference
Search radius 16px, card radius 18px, chip radius 999px.

