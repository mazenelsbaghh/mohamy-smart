# AI Workflow Steps — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
شاشة تنفيذ مسار العمل الذكي — متعددة الخطوات. هذه الشاشة هي قلب المنتج — المحامي يتابع خطوات التحليل الذكي واحدة تلو الأخرى. يجب أن تكون واضحة وتبث الثقة أن "النظام يعمل". الحفظ التلقائي أساسي.

## Visual Prompt
الخلفية `#F0EEE7` / `#0A0A0A`. Header بزر رجوع + عنوان المسار (مثلاً "إعداد مذكرة دفاع").

**Stepper** (ثابت أعلى المحتوى): شريط أفقي من النقاط المتصلة بخطوط. عرض كامل مع padding 20px أفقي.
- كل خطوة: دائرة 28px
  - مكتملة: خلفية `#34BF49` + أيقونة ✓ أبيضاء 14px
  - حالية: خلفية `#EF950A` + رقم أبيض Bold
  - قادمة: حدود `#1B1B1B20` + رقم `#1B1B1B40`
- الخطوط بين النقاط: مكتملة `#34BF49` / قادمة `#1B1B1B15`
- أسفل كل نقطة: اسم الخطوة بخط Regular 9px — يظهر للخطوة الحالية فقط

**Auto-save Indicator** (أعلى يسار): نقطة خضراء صغيرة 6px + "تم الحفظ ✓" بخط Regular 10px `#34BF49`. أو نقطة برتقالية + "جاري الحفظ..." أثناء الحفظ.

**Step Content Area**: بطاقة كبيرة بعرض كامل - 40px, radius `20px`, padding `20px`.
- عنوان الخطوة: Bold 18px
- وصف الخطوة: Regular 13px `#1B1B1BA6`
- فاصل خفيف
- **المحتوى** (حسب نوع الخطوة):
  - **نتيجة AI**: نص قانوني بتنسيق — headings bold + body regular + bullet points. Scrollable.
  - **حقل إدخال**: Text area كبير بارتفاع 150px+ للتعديل
  - **جدول بيانات**: جدول مبسط بصفوف وأعمدة
  - **تحميل AI**: مؤشر شامل — skeleton gradient مع رسالة "يعمل الذكاء الاصطناعي... ⏳"

**Footer Actions** (ثابت أسفل — فوق Bottom Nav):
شريط بخلفية `#FFFFFF` / `#1D1D1D` بظل علوي، padding 16px. يحتوي:
- زر "السابق" (outlined, نص `#1B1B1B`, radius `12px`) على اليمين — يختفي في الخطوة الأولى
- زر "إرسال للذكاء" أو "التالي" (solid `#EF950A`, radius `12px`) على اليسار
- إذا AI يعمل: الزر يتحول إلى "جاري التحليل..." مع spinner

## Content Blocks (Arabic copy)
- Nav: اسم المسار (مثلاً "إعداد مذكرة دفاع")
- Auto-save: "تم الحفظ ✓" / "جاري الحفظ..."
- Step titles: تختلف حسب المسار (مثلاً "تحليل الوقائع" / "الدفوع الشكلية" / "الدفوع الموضوعية" / "التجميع النهائي")
- AI loading: "يعمل الذكاء الاصطناعي على التحليل... ⏳"
- AI loading sub: "قد يستغرق هذا دقيقة أو اثنتين"
- Button Previous: "السابق"
- Button Next: "التالي"
- Button Submit: "إرسال للذكاء ⚡"
- Button Retry: "إعادة المحاولة"
- Success: "تم اكتمال المسار بنجاح! 🎉"

## Components Used
- Navigation Header
- Horizontal Stepper (custom)
- Auto-save indicator
- Content Card (large, scrollable)
- Rich text display (AI output)
- Text Area input
- Simplified Table
- AI Loading skeleton
- Sticky Footer with action buttons
- Bottom Navigation

## Interaction Notes
- Auto-save triggers on text change (debounced 2 seconds)
- "إرسال للذكاء" starts AI processing → shows loading state
- SignalR/polling updates status in real-time
- "السابق" returns to previous step (state preserved)
- "التالي" only enabled if current step is complete
- On last step completion → celebration animation → redirects to Case Details
- Swipe back gesture → confirmation if unsaved changes
- Pull-to-refresh re-checks AI status

## States to Design
| State | Description |
|-------|-------------|
| step-idle | Step ready, awaiting user action |
| step-processing | AI loading skeleton + message |
| step-complete | AI results displayed, editable |
| step-error | Error message + retry button |
| auto-saving | Orange dot + "جاري الحفظ..." |
| auto-saved | Green dot + "تم الحفظ ✓" |
| workflow-complete | Celebration screen with success |

## Linked Screens
- **Navigates from**: Workflow Selection / Case Details (analysis tab)
- **Navigates to**: Next step / Previous step / Case Details (completion or back)

## Design Tokens Reference
```
Step Complete: #34BF49
Step Active: #EF950A
Step Upcoming: #1B1B1B20
Step Line Complete: #34BF49
Step Line Upcoming: #1B1B1B15
Auto-save Success: #34BF49
Auto-save Pending: #EF950A
AI Loading bg: #EF950A08
Footer: #FFFFFF / #1D1D1D + shadow top
```
