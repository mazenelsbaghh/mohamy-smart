# Documents — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Document library for uploading, scanning, searching, and attaching files to cases or AI workflows.

## Visual Prompt
Create a documents screen with header "المستندات", upload icon, search input, and filter chips for type/status. At top show a compact upload CTA card: "ارفع مستندا جديدا" with options scan or choose file. Document cards show file icon, title, linked case/client, type, date, and OCR/AI readiness status. Use a clear uploading progress card when active. Bottom nav visible.

## Content Blocks (Arabic copy)
- المستندات
- ابحث باسم المستند أو القضية
- ارفع مستندا جديدا
- تصوير مستند
- اختيار ملف
- جاهز للتحليل
- جار استخراج النص
- فشل الرفع
- إعادة المحاولة
- لا توجد مستندات بعد

## Components Used
- Search input
- Upload CTA card
- Filter chips
- Document card
- Progress indicator
- Action sheet

## Interaction Notes
Upload opens camera/files. Document tap opens preview/actions. Attach action links to case.

## States to Design
| State | Description |
|-------|-------------|
| normal | Document cards |
| uploading | Progress row |
| processing | OCR status chip |
| empty | Upload CTA |
| error | Retry upload |

## Linked Screens
- **Navigates from**: Home, More, Case Details, AI Workflow Runner
- **Navigates to**: Case Details, AI Workflow Runner

## Design Tokens Reference
Upload card border `#1B1B1B15`, status success `#34BF49`, accent `#EF950A`.

