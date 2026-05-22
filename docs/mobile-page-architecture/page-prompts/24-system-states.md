# System States — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Reusable empty, loading, error, offline, and permission states across the app.

## Visual Prompt
Design a consistent RTL system-state layout that can appear inside any screen content area. Use a centered compact block with line icon, bold title, one short explanation, and exactly one primary action plus optional secondary text action. Empty states use warm neutral icon backgrounds, errors use restrained red, offline uses muted neutral. Loading states use skeleton cards matching the destination screen rather than generic spinners where possible.

## Content Blocks (Arabic copy)
- لا توجد بيانات بعد
- أضف أول عنصر للبدء
- حدث خطأ غير متوقع
- إعادة المحاولة
- لا يوجد اتصال بالإنترنت
- تحقق من الشبكة ثم حاول مرة أخرى
- ليس لديك صلاحية لهذا الإجراء
- العودة للرئيسية
- الرصيد غير كاف
- شراء نقاط

## Components Used
- Empty state block
- Error state block
- Offline banner
- Skeleton list/card
- Primary/secondary action buttons

## Interaction Notes
Primary action must always recover or move forward. Retry re-fetches data. Buy points opens subscription.

## States to Design
| State | Description |
|-------|-------------|
| empty | No data with creation CTA |
| loading | Screen-specific skeleton |
| error | Retry action |
| offline | Offline message and retry |
| permission-denied | Back/home action |
| insufficient-points | Buy points CTA |

## Linked Screens
- **Navigates from**: All screens
- **Navigates to**: Relevant recovery target

## Design Tokens Reference
Neutral icon bg `#FBFAE8`, primary `#EF950A`, danger `#CA0000`, dark surface `#1D1D1D`.

