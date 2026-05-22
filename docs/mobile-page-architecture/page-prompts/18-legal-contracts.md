# Legal Contracts — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
List and creation hub for legal contract drafts and templates.

## Visual Prompt
Create an RTL contracts screen with header "العقود القانونية" and add button. Under it place tabs "عقودي" and "القوالب". The contracts tab lists draft cards with title, parties, status, and last update. The templates tab shows template cards grouped by category. Include a subtle AI suggestion block near top: "أنشئ عقدا من وصف مختصر" with a secondary input and amber CTA.

## Content Blocks (Arabic copy)
- العقود القانونية
- عقودي
- القوالب
- أنشئ عقدا من وصف مختصر
- صف العقد المطلوب
- إنشاء مسودة
- الأطراف
- آخر تحديث
- قيد المراجعة
- مكتمل
- لا توجد عقود بعد

## Components Used
- Tabs
- Search input
- Contract cards
- Template cards
- AI suggestion block
- FAB/Add button

## Interaction Notes
Add creates new contract. Template tap starts prefilled form. Contract tap opens details.

## States to Design
| State | Description |
|-------|-------------|
| normal | Existing contracts |
| empty | Create first contract CTA |
| generating | AI draft progress |
| error | Generation retry |

## Linked Screens
- **Navigates from**: More, Home
- **Navigates to**: Contract Details, New Contract

## Design Tokens Reference
Tabs active `#EF950A`, AI block `#FBFAE8`, card border `#1B1B1B15`.

