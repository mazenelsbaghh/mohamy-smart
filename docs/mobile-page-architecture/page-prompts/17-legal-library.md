# Legal Library — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Hub for calculators, power of attorneys, and internal regulations.

## Visual Prompt
Design an RTL legal library screen with title "المكتبة القانونية" and a search bar. Use tool cards with line icons and short descriptions. First row highlights "حاسبة المواريث" and "حاسبة الرسوم القضائية". Then show "الوكالات" and "اللوائح الداخلية". For mobile, use a single-column list on 390px with icon, title, description, and chevron. On larger phones, cards may become a 2-column grid if text still fits.

## Content Blocks (Arabic copy)
- المكتبة القانونية
- ابحث في الأدوات والمراجع
- حاسبة المواريث
- احسب الأنصبة بسرعة ودقة
- حاسبة الرسوم القضائية
- تقدير الرسوم حسب نوع الدعوى
- الوكالات
- نماذج وبيانات الوكالات
- اللوائح الداخلية
- مراجع مرتبطة بالقضايا
- لا توجد نتائج

## Components Used
- Search input
- Tool cards
- Recent references list
- Empty state

## Interaction Notes
Card tap opens the selected tool. Search filters tools and references.

## States to Design
| State | Description |
|-------|-------------|
| normal | Tool list |
| loading | Skeleton cards |
| no-results | Search empty |

## Linked Screens
- **Navigates from**: More, Home
- **Navigates to**: Calculator screens, Internal Regulations, Power of Attorneys

## Design Tokens Reference
Cards `#FFFEFA`, icons `#EF950A`, body text `#1B1B1BA6`.

