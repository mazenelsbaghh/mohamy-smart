# AI Workflow Hub — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Case-specific screen where the lawyer chooses an AI legal workflow.

## Visual Prompt
Create an RTL AI workflow selection screen with a top case context bar and AI points pill. Below, show a readiness banner stating whether documents/facts/points are ready. Workflow cards are stacked vertically, each with icon, title, one-line description, point cost badge, and status button: "ابدأ", "استكمال", or disabled reason. Use amber sparingly for the recommended workflow and primary buttons. Recent outputs appear in a lower section. Dark mode keeps amber highlights vivid but limited.

## Content Blocks (Arabic copy)
- الذكاء الاصطناعي للقضية
- جاهزية القضية
- المستندات متوفرة
- الوقائع مكتملة
- الرصيد كاف
- مذكرة دفاع
- صحيفة دعوى
- لائحة اعتراضية
- تحليل حكم
- إنذار قانوني
- طلب تنفيذ
- شكوى إدارية
- ابدأ
- استكمال
- رصيد غير كاف
- أضف مستندات أولا

## Components Used
- Case context bar
- Readiness banner
- Workflow cards
- Point cost badge
- Recent output list

## Interaction Notes
Start opens AI Workflow Runner. Insufficient points opens Subscription and AI Points.

## States to Design
| State | Description |
|-------|-------------|
| normal | Workflows available |
| insufficient-points | Disabled buttons with buy points CTA |
| missing-documents | Shows required preparation |
| running | Card shows progress |

## Linked Screens
- **Navigates from**: Case Details, Home
- **Navigates to**: AI Workflow Runner, Subscription and AI Points, Documents

## Design Tokens Reference
Recommended border `#EF950A`, disabled text `#1B1B1BA6`, dark surface `#1D1D1D`.

