# Case Details — UI Design Prompt

## Page Metadata
- **Platform**: Mobile (iOS + Android)
- **Direction**: RTL
- **Theme**: Light + Dark
- **Screen size**: 390×844

## Design Context
أهم شاشة في التطبيق — يقضي المحامي معظم وقته هنا. تعرض كل تفاصيل القضية مع إمكانية بدء التحليل الذكي ومراجعة النتائج. يجب أن تكون منظمة بـ Tabs لتقليل التصفح.

## Visual Prompt
شاشة scrollable. الخلفية `#F0EEE7` / `#0A0A0A`.

**Header** (ثابت): شريط شفاف بزر رجوع (→) على اليمين + عنوان "ملف القضية" بخط Bold 17px + أيقونة menu (⋮) على اليسار.

**Hero Card**: بطاقة كبيرة أسفل الـ Header مباشرة بعرض كامل (margin 20px أفقي)، radius `20px`، خلفية gradient خفيف من `#EF950A08` إلى `#FFFFFF` / `#1D1D1D`. داخلها:
- عنوان القضية: Bold 20px — سطرين ماكس
- Badge الحالة: على نفس الصف مع العنوان (يمين العنوان)
- وصف مختصر: Regular 13px `#1B1B1BA6`: "راجع بيانات القضية ثم ابدأ التحليل الذكي"
- **زر CTA كبير**: عرض كامل داخل الـ Card، ارتفاع 48px، خلفية `#EF950A`، radius `12px`:
  - أيقونة ⚡ + نص "ابدأ التحليل الذكي" Bold 15px أبيض
  - ظل خفيف `shadow-sm`

**Tabs Bar** (ثابت عند الـ scroll أو sticky): 3 تبويبات:
- "التفاصيل" (active: خط سفلي `#EF950A` 2px + نص Bold `#EF950A`)
- "التحليل الذكي"
- "الملخص"
كل tab: Tajawal Medium 14px. الـ غير نشط: `#1B1B1BA6`. خلفية: `#FFFFFF` / `#1D1D1D`.

**تبويب التفاصيل** (active by default):
قائمة معلومات عمودية. كل عنصر:
- label: Regular 12px `#1B1B1BA6` (أعلى)
- value: Medium 15px `#1B1B1B` (أسفل)
- فاصل خفيف بين العناصر

العناصر: رقم القضية / نوع القضية / المحكمة / الموكل / الخصم / تاريخ الإنشاء / الحالة

**قسم الوقائع**: بطاقة بلون `#FBFAE8` / `#2A2A2A` radius `16px`. عنوان "وقائع القضية" Bold 16px + أيقونة تعديل ✏️. النص: Regular 14px leading `1.8` — scrollable داخلياً بحد أقصى ارتفاع 200px.

**تبويب التحليل الذكي**:
جدول أو قائمة cards لمسارات العمل الـ 7. كل عنصر:
- أيقونة المسار (28px) في دائرة
- اسم المسار Bold 14px
- Badge الحالة: "لم يبدأ" (رمادي) / "مكتمل ✓" (أخضر) / "قيد التنفيذ ⏳" (برتقالي)
- سهم → على اليسار
Tap → Workflow Selection أو مباشرة للـ Workflow إذا بدأ

**تبويب الملخص**:
ملخص مجمّع من كل الـ Workflows المكتملة. كل قسم:
- عنوان المسار Bold 14px
- النتيجة المختصرة Regular 14px
- زر "عرض التفاصيل" Ghost

## Content Blocks (Arabic copy)
- Nav: "ملف القضية"
- Hero subtitle: "راجع بيانات القضية ثم ابدأ التحليل الذكي"
- CTA: "ابدأ التحليل الذكي ⚡"
- Tabs: "التفاصيل" / "التحليل الذكي" / "الملخص"
- Labels: "رقم القضية" / "نوع القضية" / "المحكمة" / "الموكل" / "الخصم" / "تاريخ الإنشاء" / "الحالة"
- Facts section: "وقائع القضية"
- Workflow statuses: "لم يبدأ" / "مكتمل ✓" / "قيد التنفيذ ⏳"
- Empty summary: "لم تكتمل أي مسارات عمل بعد"

## Components Used
- Navigation Header with back + menu
- Hero Card with gradient
- Primary CTA Button
- Sticky Tabs Bar (3 tabs)
- Key-Value list (detail pairs)
- Facts Card (scrollable text)
- Workflow Status List
- Summary Sections
- Bottom Navigation

## Interaction Notes
- Pull-to-refresh reloads case data + workflow states
- Hero CTA → Workflow Selection screen
- Tab switch is instant (no page reload)
- Tabs bar sticks to top when scrolling past hero card
- Menu (⋮) → Bottom sheet: "تعديل القضية" / "مشاركة" / "حذف"
- Facts card edit icon → editable text area with save
- Workflow item tap → respective workflow screen

## States to Design
| State | Description |
|-------|-------------|
| loading | Skeleton hero + skeleton list |
| normal (details tab) | Full case data displayed |
| normal (analysis tab) | Workflow list with statuses |
| normal (summary tab) | Completed workflow summaries |
| empty-summary | "لم تكتمل أي مسارات عمل بعد" |
| editing-facts | Editable text area with save/cancel |

## Linked Screens
- **Navigates from**: Cases List / Home Dashboard
- **Navigates to**: Workflow Selection / Individual Workflows / Cases List (back)

## Design Tokens Reference
```
Hero Gradient: #EF950A08 → transparent
CTA: #EF950A
Active Tab: #EF950A (text + underline)
Inactive Tab: #1B1B1BA6
Facts Card: #FBFAE8 / #2A2A2A
Workflow Badge Pending: #F59E0B15 bg + #F59E0B text
Workflow Badge Complete: #34BF4915 bg + #34BF49 text
Workflow Badge Not Started: #1B1B1B10 bg + #1B1B1B60 text
```
