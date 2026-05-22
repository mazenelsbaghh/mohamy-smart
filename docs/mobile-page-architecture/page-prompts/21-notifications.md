# Notifications — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Central alert list for sessions, AI jobs, subscriptions, points, and case updates.

## Visual Prompt
Create an RTL notifications screen with title "الإشعارات" and a "تحديد الكل كمقروء" text action. Group notifications by "اليوم", "أمس", "هذا الأسبوع". Each notification row has a small icon, title, short body, time, and an amber unread dot. Use compact but touch-friendly rows with 56px minimum height. Dark mode keeps unread dot amber and surfaces dark.

## Content Blocks (Arabic copy)
- الإشعارات
- تحديد الكل كمقروء
- اليوم
- أمس
- هذا الأسبوع
- اكتملت مذكرة الدفاع
- جلسة بعد ساعة
- رصيدك منخفض
- تم خصم نقاط الذكاء الاصطناعي
- لا توجد إشعارات

## Components Used
- Grouped list
- Notification row
- Unread indicator
- Filter/action button

## Interaction Notes
Tap opens target screen and marks read. Swipe can expose mark-read/delete if implemented.

## States to Design
| State | Description |
|-------|-------------|
| normal | Grouped notifications |
| unread | Amber dot visible |
| empty | Calm empty state |
| loading | Row skeletons |

## Linked Screens
- **Navigates from**: Home header
- **Navigates to**: Case Details, AI Workflow Runner, Subscription and AI Points, Agenda

## Design Tokens Reference
Unread dot `#EF950A`, row border `#1B1B1B15`, muted text `#1B1B1BA6`.

