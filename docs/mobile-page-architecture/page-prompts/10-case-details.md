# Case Details — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Core case workspace showing case status, next session, documents, facts, and AI actions.

## Visual Prompt
Design a mobile case detail screen with a sticky compact header: back arrow on right, overflow menu on left, and case number/title. The top case summary card shows client, court, status, and next session with a clear amber "الإجراء التالي" button. Below it use horizontal RTL tabs: "الملخص"، "الوقائع"، "المستندات"، "الجلسات"، "الذكاء الاصطناعي". The active tab content is card-based. For summary, show timeline and readiness indicators. Bottom nav is hidden or reduced on this deep detail screen to preserve space.

## Content Blocks (Arabic copy)
- قضية رقم ١٢٣٤ / ٢٠٢٦
- العميل
- المحكمة
- الحالة
- الجلسة القادمة
- الإجراء التالي
- الملخص
- الوقائع
- المستندات
- الجلسات
- الذكاء الاصطناعي
- أضف واقعة
- ارفع مستندا
- ابدأ تحليل

## Components Used
- Sticky detail header
- Summary card
- Tabs
- Timeline cards
- Readiness indicators
- Action buttons

## Interaction Notes
Tabs switch local content. AI tab opens AI Workflow Hub. Documents tab opens upload/action sheet.

## States to Design
| State | Description |
|-------|-------------|
| normal | Full case data |
| missing-documents | Readiness warning |
| loading | Header and card skeletons |
| error | Retry with back option |

## Linked Screens
- **Navigates from**: Cases List, Home, Agenda, Clients
- **Navigates to**: AI Workflow Hub, Documents, Agenda, Client Details

## Design Tokens Reference
Sticky header `#F0EEE7`, active tab `#EF950A`, card `#FFFEFA`.

