# Clients List — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Mobile client directory with fast contact actions and linked case access.

## Visual Prompt
Design an RTL clients screen with title "العملاء", add button, and search input. Client cards show avatar initials on the right, name, phone, case count, last activity, and two small icon actions for call and message. Use a clean vertical list with enough spacing for one-hand use. A FAB adds a new client. In dark mode, avatars use muted amber-tinted backgrounds and cards use `#1D1D1D`.

## Content Blocks (Arabic copy)
- العملاء
- ابحث باسم العميل أو رقم الجوال
- إضافة عميل
- القضايا المرتبطة
- آخر تواصل
- اتصال
- رسالة
- لا يوجد عملاء بعد
- أضف أول عميل

## Components Used
- Search input
- Client card
- Avatar initials
- Icon buttons
- Floating action button

## Interaction Notes
Card opens Client Details. Call opens tel link. Message opens WhatsApp/SMS action sheet.

## States to Design
| State | Description |
|-------|-------------|
| normal | Client list |
| empty | Add first client CTA |
| loading | Skeleton cards |
| no-results | Search empty |

## Linked Screens
- **Navigates from**: More, Home
- **Navigates to**: Client Details, Add Case

## Design Tokens Reference
Avatar fill `#FBFAE8`, icon active `#EF950A`, card radius 18px.

