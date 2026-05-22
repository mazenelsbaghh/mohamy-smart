# AI Workflow Runner — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Multi-step AI generation flow for memos, appeals, warnings, and analysis.

## Visual Prompt
Design a focused RTL workflow runner with a compact top bar showing workflow name and case number. Under it place a horizontal stepper with four steps: "المستندات"، "الوقائع"، "التشغيل"، "المخرجات". The current step content uses one main card and one sticky bottom action. For running state, show a refined progress panel with amber progress line, job status text, and "يمكنك مغادرة الشاشة وسنحفظ التقدم". Output state shows generated text in a readable document-style card with export actions. Avoid chat-like visuals; this is a legal production tool.

## Content Blocks (Arabic copy)
- مذكرة دفاع
- المستندات
- الوقائع
- التشغيل
- المخرجات
- اختر المستندات المطلوبة
- راجع الوقائع المختارة
- سيتم خصم النقاط عند بدء التشغيل
- تشغيل التحليل
- إيقاف مؤقت
- استكمال
- تم حفظ المسودة تلقائيا
- تصدير PDF
- تصدير DOCX
- نسخ النص

## Components Used
- Workflow stepper
- Document picker
- Fact checklist
- AI point confirmation panel
- Progress card
- Output document card
- Sticky action bar

## Interaction Notes
Continue advances steps. Run confirms point deduction. Export opens share/download sheet.

## States to Design
| State | Description |
|-------|-------------|
| draft | User can continue editing |
| loading | Preparing job |
| running | Progress visible |
| paused | Resume action visible |
| failed | Retry with preserved context |
| completed | Output and export actions |

## Linked Screens
- **Navigates from**: AI Workflow Hub
- **Navigates to**: Case Details, Documents, Subscription and AI Points

## Design Tokens Reference
Progress `#EF950A`, output card `#FFFEFA`, sticky bar shadow `0 -10px 30px rgba(27,27,27,0.08)`.

