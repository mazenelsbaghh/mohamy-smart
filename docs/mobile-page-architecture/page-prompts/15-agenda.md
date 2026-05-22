# Agenda — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Daily agenda for hearings, sessions, tasks, and reminders.

## Visual Prompt
Design an RTL agenda screen optimized for day-by-day use. Header says "الأجندة" with add button. Under it place a horizontal date strip showing the week, with today highlighted in amber. The main content is a grouped vertical list: "اليوم"، "غدا"، "هذا الأسبوع". Each session card shows time, court, case number, client, and status. Overdue items have a subtle danger marker, not a loud background. Bottom nav remains visible.

## Content Blocks (Arabic copy)
- الأجندة
- اليوم
- غدا
- هذا الأسبوع
- جلسة
- مهمة
- المحكمة
- افتح القضية
- تم
- تذكير
- لا توجد جلسات اليوم
- إضافة جلسة

## Components Used
- Date strip
- Agenda cards
- Status chips
- Add button
- Bottom navigation

## Interaction Notes
Date tap changes list. Card opens Case Details. Mark done updates status.

## States to Design
| State | Description |
|-------|-------------|
| normal | Sessions grouped by day |
| empty-day | Calm empty state |
| overdue | Danger marker |
| loading | Date and card skeletons |

## Linked Screens
- **Navigates from**: Home, Bottom navigation
- **Navigates to**: Case Details, Add Session

## Design Tokens Reference
Today highlight `#EF950A`, danger `#CA0000`, cards `#FFFEFA`.

