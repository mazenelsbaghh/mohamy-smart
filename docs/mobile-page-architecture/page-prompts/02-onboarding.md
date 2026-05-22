# Onboarding — UI Design Prompt

## Page Metadata
- **Platform**: Mobile
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390x844

## Design Context
Three-slide first-run onboarding for new lawyers explaining case control, AI legal drafting, and agenda/document readiness.

## Visual Prompt
Create a native RTL onboarding screen with a full warm canvas `#F0EEE7`. Use a top row with "تخطي" aligned left and the small Mohamy Smart mark aligned right. The main area contains one large rounded card with radius 24px and light surface `#FFFEFA`, showing a refined legal UI preview, not a cartoon. Below it place a bold Arabic title, concise supporting text, and three page dots. Bottom safe area has a full-width primary amber button `#EF950A` labeled "التالي" and a secondary text link "لدي حساب بالفعل". In dark mode use `#0A0A0A` background and `#1D1D1D` card with `#FFFFFF15` border.

## Content Blocks (Arabic copy)
- تخطي
- كل قضاياك في مكان واحد
- تابع القضايا والجلسات والمستندات من هاتفك بدون ازدحام.
- مذكرات قانونية بمساعدة الذكاء الاصطناعي
- اختر الوقائع والمستندات واترك النظام يصيغ مسودة منظمة.
- لا تفوّت جلسة أو إجراء
- تنبيهات واضحة لما يحتاج متابعة اليوم.
- التالي
- ابدأ الآن
- لدي حساب بالفعل

## Components Used
- Swipe carousel
- Primary button
- Text link
- Page indicator

## Interaction Notes
Swiping moves between slides. "تخطي" opens Login. Final primary action opens Sign Up.

## States to Design
| State | Description |
|-------|-------------|
| normal | Current slide active |
| completed | Final slide shows "ابدأ الآن" |

## Linked Screens
- **Navigates from**: Splash
- **Navigates to**: Login, Sign Up

## Design Tokens Reference
Cards `#FFFEFA`, accent `#EF950A`, radius 24px, button radius 16px.

