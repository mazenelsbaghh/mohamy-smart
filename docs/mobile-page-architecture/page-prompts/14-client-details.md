# Client Details — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Profile and legal workspace for one client.

## Visual Prompt
Create a client detail screen with a sticky top bar and profile header card. Show avatar initials, name, phone, email, and contact icon buttons. Below, use segmented tabs: "القضايا"، "المستندات"، "الملاحظات". The cases tab shows linked case cards with status and next session. Use a bottom primary action "إضافة قضية لهذا العميل" when relevant. Keep sensitive info legible and organized.

## Content Blocks (Arabic copy)
- بيانات العميل
- اتصال
- رسالة
- تعديل
- القضايا
- المستندات
- الملاحظات
- لا توجد قضايا مرتبطة
- إضافة قضية لهذا العميل
- آخر تحديث

## Components Used
- Profile card
- Contact action buttons
- Segmented tabs
- Linked case cards
- Notes list

## Interaction Notes
Contact actions use device capabilities. Add case preselects client.

## States to Design
| State | Description |
|-------|-------------|
| normal | Client data and linked cases |
| no-cases | CTA to add case |
| loading | Profile skeleton |
| error | Retry and back action |

## Linked Screens
- **Navigates from**: Clients List, Case Details
- **Navigates to**: Add Case, Case Details, Documents

## Design Tokens Reference
Profile card `#FFFEFA`, contact buttons `#FBFAE8`, primary `#EF950A`.

