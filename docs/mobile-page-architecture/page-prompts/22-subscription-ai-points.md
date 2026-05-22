# Subscription and AI Points — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Shows current plan, AI point balance, usage history, and upgrade/buy actions.

## Visual Prompt
Design an RTL subscription screen with a strong top balance card: "رصيد الذكاء الاصطناعي" and a large numeric balance. Under it show current plan card with renewal date and status. Then show package cards for buying points, followed by a recent usage list explaining deductions. Use amber for the main balance and primary purchase buttons. Payment actions should feel secure and calm, not sales-heavy.

## Content Blocks (Arabic copy)
- الاشتراك والنقاط
- رصيد الذكاء الاصطناعي
- نقطة متبقية
- خطتك الحالية
- تاريخ التجديد
- ترقية الخطة
- شراء نقاط
- سجل الاستخدام
- مذكرة دفاع
- تحليل حكم
- تم خصم
- رصيد غير كاف
- إتمام الدفع

## Components Used
- Balance card
- Plan card
- Point package cards
- Usage history list
- Payment modal/sheet

## Interaction Notes
Buy opens payment sheet. Usage item can open related AI job or case.

## States to Design
| State | Description |
|-------|-------------|
| normal | Balance and packages |
| low-balance | Warning copy and buy CTA |
| payment-loading | Disabled payment action |
| payment-success | Success state |
| payment-error | Retry state |

## Linked Screens
- **Navigates from**: Settings, AI Workflow Hub, Home AI points pill
- **Navigates to**: Payment sheet, AI Workflow Hub

## Design Tokens Reference
Balance amber `#EF950A`, success `#34BF49`, danger `#CA0000`.

