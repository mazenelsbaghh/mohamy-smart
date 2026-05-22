# Chat — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Legal AI assistant chat for questions, drafting help, and case-aware suggestions.

## Visual Prompt
Design a serious RTL chat screen, not playful. Header says "المساعد القانوني" with a small case context selector under it when attached to a case. Empty state shows suggested prompt chips. Messages appear in readable bubbles: user messages aligned right, assistant responses aligned left but still RTL text. Composer is fixed above bottom safe area with attachment icon, text field, and amber send icon button. Use document attachment chips above composer when files are selected.

## Content Blocks (Arabic copy)
- المساعد القانوني
- بدون قضية محددة
- اختر قضية للسياق
- اسأل عن صياغة مذكرة أو تحليل مستند
- اقترح دفوعا لهذه القضية
- لخص هذا الحكم
- اكتب رسالة للعميل
- اكتب سؤالك
- جار الكتابة
- تعذر إرسال الرسالة

## Components Used
- Chat header
- Context selector
- Message bubbles
- Prompt chips
- Attachment chips
- Composer

## Interaction Notes
Send submits message. Attachment opens Documents. Context selector opens case picker.

## States to Design
| State | Description |
|-------|-------------|
| empty | Suggested prompts |
| normal | Message thread |
| typing | Assistant typing indicator |
| failed | Retry on failed message |

## Linked Screens
- **Navigates from**: Bottom navigation, Case Details
- **Navigates to**: Documents, Case picker, Case Details

## Design Tokens Reference
User bubble `#EF950A`, assistant bubble `#FFFEFA`, dark assistant bubble `#1D1D1D`.

