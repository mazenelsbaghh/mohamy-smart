# Process Server Papers — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Tracks process server papers, delivery state, and deadlines.

## Visual Prompt
Design a professional RTL list screen titled "أوراق المحضرين". Use status filter chips at top: "الكل"، "قيد التسليم"، "تم التسليم"، "متأخر". Paper cards show recipient, linked case, delivery date, deadline, and status chip. Overdue cards get a thin danger marker and a clear action "تحديث الحالة". Use a FAB to add a new paper.

## Content Blocks (Arabic copy)
- أوراق المحضرين
- قيد التسليم
- تم التسليم
- متأخر
- المستلم
- القضية
- تاريخ التسليم
- الموعد النهائي
- تحديث الحالة
- إضافة ورقة
- لا توجد أوراق مسجلة

## Components Used
- Filter chips
- Paper cards
- Status chips
- Floating action button
- Update status sheet

## Interaction Notes
Update opens bottom sheet with statuses. Case link opens Case Details.

## States to Design
| State | Description |
|-------|-------------|
| normal | Paper list |
| overdue | Danger marker |
| completed | Success chip |
| empty | Add first paper CTA |

## Linked Screens
- **Navigates from**: More, Case Details
- **Navigates to**: Case Details, Add Paper

## Design Tokens Reference
Danger `#CA0000`, success `#34BF49`, card radius 18px.

