# Add Case — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Creates a new case manually or from scanned/OCR documents.

## Visual Prompt
Design a scrollable RTL form with top app bar "إضافة قضية". Under the title place a segmented control with two options: "يدوي" and "من مستند". Manual mode shows grouped cards for client, court, case number, case type, opponent, and first session. Document mode shows a large dashed upload area with scan icon and OCR status. Keep a sticky bottom action bar with "حفظ القضية" primary button and "حفظ كمسودة" secondary action. Use warm cards and tight but readable spacing.

## Content Blocks (Arabic copy)
- إضافة قضية
- يدوي
- من مستند
- بيانات العميل
- اختر العميل
- إضافة عميل جديد
- بيانات القضية
- رقم القضية
- المحكمة
- نوع القضية
- الخصم
- أول جلسة
- ارفع صحيفة الدعوى أو الحكم
- حفظ القضية
- حفظ كمسودة
- تم حفظ المسودة تلقائيا

## Components Used
- Top app bar
- Segmented control
- Form cards
- Select fields
- Upload drop zone
- Sticky bottom action bar

## Interaction Notes
Switching modes preserves entered data. Save routes to Case Details.

## States to Design
| State | Description |
|-------|-------------|
| normal | Manual form |
| upload | Document mode ready |
| uploading | Progress indicator |
| error | Validation messages |
| success | Save confirmation |

## Linked Screens
- **Navigates from**: Cases List, Home
- **Navigates to**: Case Details, Clients List

## Design Tokens Reference
Segment active `#EF950A`, input fill `#FBFAE8`, sticky bar surface `#FFFEFA`.

