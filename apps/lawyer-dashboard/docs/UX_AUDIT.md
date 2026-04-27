# تقرير مراجعة UI/UX الشامل — Mohamy Smart Lawyer Dashboard
**تاريخ التقرير:** 27 أبريل 2026  
**المنهجية:** فحص ثابت (static analysis) + مراجعة يدوية للكود  
**الحالة الراهنة:** بعد جلسات `/normalize` + `/clarify` + `/polish` + `/adapt`

---

## مقياس الأولوية

| الدرجة | المعنى | يجب إصلاحه |
|---|---|---|
| **P0** | يكسر التجربة / يعطّل وظيفة جوهرية | فوراً |
| **P1** | يؤثر على إمكانية الوصول أو يسبب ارتباكاً واضحاً | قبل الشحن |
| **P2** | عدم اتساق مرئي أو سلوكي | في الجولة القادمة |
| **P3** | تحسينات جماليةيمكن تأجيلها | متى أمكن |

---

## 1. إمكانية الوصول (Accessibility / A11y)

### 1.1 — `<main>` يستخدم كـ Flex Container لا كـ Landmark ❌ **P1**
**الملف:** `src/layout/Layout.tsx:56`
```tsx
<main className={`flex ${theme} ...`}>
  <div className="sidebar-box">
  <div className="outlet-box">
```
**المشكلة:** `<main>` يجب أن يحتوي مباشرةً على المحتوى الرئيسي، لا على sidebar + outlet معاً. قارئات الشاشة تتخطى إلى `<main>` وتجد العارضة الجانبية أولاً.  
**الحل:** اجعل `<div role="main" id="main-content">` هو outlet-box ذاته، أو أعد هيكلة `<main>` لتشمل فقط المحتوى.

---

### 1.2 — أزرار بدون `aria-label` في مناطق حرجة ❌ **P1**
**العدد:** 30+ زر `<button>` بدون `aria-label` أو نص ظاهر كافٍ  
**الملفات الأسوأ:**

| الملف | الأزرار المشكلة |
|---|---|
| `AnalysisFactsSelectionStep.tsx:218,368,397,446,453` | أزرار تعديل/حذف وقائع |
| `AnalysisStageLayout.tsx:160` | زر غير واضح |
| `AutoSaveButton.tsx:96` | زر الحفظ التلقائي |
| `ClarifyFactsModal.tsx:101,131,183,190` | أزرار إجراءات |
| `DocumentCard.tsx:31` | زر فتح/تحميل |
| `CaseHeaderBanner.tsx:37` | زر header |
| `ClientDetails.tsx:533` | زر في قائمة الملفات |
| `Chat.tsx:112` | زر إرسال الرسالة |
| `WorkflowStepBar.tsx:73` | شريط الخطوات |

**الحل:** إضافة `aria-label` وصفي لكل زر لا يحتوي نصاً ظاهراً.

---

### 1.3 — `console.log` واحد في production ❌ **P1**
**الملف:** `src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/DefensesList.tsx`  
يسرّب بيانات تشغيل المشروع في بيئة الإنتاج.

---

### 1.4 — لا يوجد إدارة لـ `document.title` ❌ **P1**
**الوضع الحالي:** لا يوجد أي `document.title =` أو `<Helmet>` في أي صفحة.  
**التأثير:**
- كل الصفحات تظهر نفس العنوان في التبويبات — المحامي لا يعرف أين هو عند التبديل
- قارئات الشاشة لا تعلن الانتقال بين الصفحات
- SEO معطوب (للصفحات العامة مثل Landing)

**الحل:** إضافة `useEffect(() => { document.title = 'القضايا | محامي سمارت'; }, [])` في كل صفحة، أو استخدام مكتبة `react-helmet-async`.

---

### 1.5 — نموذج `AddNewFact.tsx` بدون `dir="rtl"` ❌ **P1**
**الملف:** `src/components/forms/AddNewFact.tsx:25`  
النموذج عربي لكن الـ `<form>` بدون `dir` — الـ placeholder والأخطاء قد تظهر بالجهة الخطأ.

---

### 1.6 — 84 موضع `transition-all` بدون `prefers-reduced-motion` ⚠️ **P2**
المستخدمون الذين يطلبون تقليل الحركة يحصلون على نفس الأنيماشن.  
**الحل في CSS:** إضافة `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { transition-duration: 0.01ms !important; } }` في `index.css`.

---

## 2. Dark Mode — عدم الاتساق

### 2.1 — `bg-white` بدون `dark:` في 5 مواضع ❌ **P1**
**الملف:** `src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/LegalAnalysis.tsx`  
السطور: 263, 281, 310, 319 — بطاقات بيضاء تماماً في الوضع الداكن، مكسورة بصرياً.

```tsx
// ❌ قبل
className="bg-white border app-border rounded-xl p-4"
// ✅ بعد
className="app-surface border app-border rounded-xl p-4"
```

---

### 2.2 — `dark:bg-[#1A1A1A]` مكتوبة بشكل حرفي 21 مرة ⚠️ **P2**
**أسوأ ملف:** `src/pages/subscription/Subscription.tsx` (7 مرات)  
هذه القيمة يجب أن تكون في CSS variable `--surface-dark` أو `app-surface`.  
إذا تغيّر لون الخلفية في المستقبل، يجب تعديل 21 ملف.

---

### 2.3 — `DefensesList.tsx` — ألوان HTML مضمّنة في PDF templates ❌ **P1**
**الملف:** `src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/DefensesList.tsx:430-451`
```html
<h2 style="color: #9b6a00; margin-bottom: 20px;">
<h3 style="color: #3b3b3b; margin-top: 15px;">
```
هذه ألوان hardcoded داخل HTML strings للطباعة — لكنها تستخدم ألوان light mode فقط. في الوضع الداكن، البيانات المطبوعة ستبدو صحيحة (هذه للـ PDF)، لكن الرنة البصرية مكسورة إذا عُرضت كـ preview.

---

## 3. Design Token Hygiene — نظافة الرموز

### 3.1 — 19 لون hex مكتوب مباشرة في `style={{}}` ❌ **P2**
مثال من `DefensesList.tsx`:
```tsx
style={{ color: '#9b6a00' }}  // amber مكتوبة يدوياً
style={{ background: '#f5f5f5' }}  // رمادي بدون token
```
هذه الألوان لا تتغير مع الـ theme ولا تحترم dark mode.

---

### 3.2 — `SkeletonPreview.tsx` (dev page) مليء بـ hardcoded hex ⚠️ **P3**
السطور: 116, 133, 204, 215 — لكن هذه صفحة dev فقط، تأثيرها محدود.

---

### 3.3 — 5 أزرار تستخدم `bg-[var(--main-color)]` بدلاً من `<Button color="primary">` ⚠️ **P2**
عدم الاتساق يؤدي إلى فارق بصري طفيف في الضغط (active state) وتأثيرات الـ hover.

---

## 4. UX النماذج (Form UX)

### 4.1 — لا يوجد مؤشر للحقول المطلوبة ❌ **P1**
**العدد:** 0 استخدام لـ `isRequired` أو `*` في أي نموذج.  
المستخدم لا يعرف أي الحقول إلزامية قبل الضغط على إرسال.  
**الحل:** إضافة `isRequired` على HeroUI inputs أو نجمة حمراء يدوياً.

---

### 4.2 — 53 `placeholder` بدون `label` مرئي ⚠️ **P2**
الـ placeholder يختفي عند الكتابة. المستخدم لا يتذكر ما طُلب منه.  
الأسوأ في نماذج البحث والفلاتر السريعة.

---

### 4.3 — حقول التاريخ (`type="date"`) بدون `aria-label` واضح ⚠️ **P2**
**الملفات:** `FinancialsTab.tsx`, `DocumentHandoffTab.tsx`, `ProcessServerPapersList.tsx`, `AgendaRollTable.tsx`  
المتصفحات تُعرض picker مختلف بين Android/iOS وهو أحياناً غير واضح. لا يوجد تنسيق واضح للتاريخ المطلوب.

---

### 4.4 — 10 نماذج `<form>` بدون `dir="rtl"` ⚠️ **P2**
```
AddNewFact.tsx, AddNewDefense.tsx, AddNewClientForm.tsx,
AddNewContractsForm.tsx, FinancialsTab.tsx, DocumentHandoffTab.tsx,
ClientDetails.tsx (edit form), ProfileComponent.tsx, ChangePassword.tsx
```
في بعض البيئات، اتجاه النموذج يرث من الـ DOM parent وقد يختلف.

---

### 4.5 — `AddNewCaseFromOCRForm` — خطوة اختيار الطرف (defending party) بدون `role="radiogroup"` ⚠️ **P2**
زرا "الموكل / الخصم" في `step='defending'` يبدوان كـ radio buttons لكن بدون `role="radiogroup"` / `role="radio"` / `aria-checked`.

---

### 4.6 — نموذج الدفع (`PaymentModal`) — حالة اختيار طريقة الدفع تفتقر لتأكيد مرئي ⚠️ **P2**
عند الضغط على "محفظة إلكترونية" لا يوجد animation واضح أو رسالة تأكيد — فقط تغيير border. على الموبايل، يصعب التمييز.

---

## 5. التنقل (Navigation)

### 5.1 — الصفحات لا تعلن نفسها (لا عنوان مميز) ❌ **P1**
كما ذُكر في 1.4 — `document.title` لا يتغير أبداً. مشكلة حرجة لـ:
- استخدام المتصفح عبر تبويبات متعددة
- قارئات الشاشة
- التاريخ (history back button)

---

### 5.2 — زر "رجوع" في `WorkflowStepBar` غير موجود على الموبايل ❌ **P1**
**الملف:** `src/components/analysisWorkflow/WorkflowStepBar.tsx`  
شريط الخطوات (step bar) أفقي ويختفي جزئياً على الشاشات الصغيرة. لا يوجد زر "السابق" واضح على الموبايل.

---

### 5.3 — `ClarifyFactsModal` بحجم `size="3xl"` على جميع الشاشات ⚠️ **P2**
**الملف:** `src/components/clarifyFacts/ClarifyFactsModal.tsx:74`  
على شاشة 375px، 3xl يأخذ معظم الشاشة مع overflow. يجب `size="full"` على الموبايل.

---

### 5.4 — لا يوجد Breadcrumb في صفحات القضية المتداخلة ⚠️ **P2**
**مثال:** القضية > التحليل > مذكرة الدفاع > خطوة 3  
المستخدم لا يعرف مكانه في الـ workflow بدون شريط الخطوات.

---

## 6. الحالات الفارغة (Empty States)

### 6.1 — 9 حالات فارغة بدون CTA ❌ **P1**

| الصفحة | الرسالة | المفقود |
|---|---|---|
| `ClientDetails.tsx:353` | "لا توجد قضايا مُسندة" | زر "ربط قضية" |
| `ClientDetails.tsx:388` | "لا توجد توكيلات مُسجلة" | زر "إضافة توكيل" |
| `ClientDetails.tsx:483` | "لا توجد ملفات مرتبطة" | زر "رفع ملف" |
| `FinancialsTab.tsx:229` | "لا توجد معاملات مالية" | زر "تسجيل معاملة" |
| `DocumentHandoffTab.tsx:143` | "لا توجد مستندات مُسلَّمة" | زر "تسجيل تسليم" |
| `Clients.tsx:184` | "لا توجد بيانات موكلين" | زر "إضافة موكل" |
| `ProcessServerPapersList.tsx:392` | "لا توجد أوراق محضرين" | زر "إضافة ورقة" |
| `DefensesList.tsx:946` | "لا توجد دفوع" | زر "إعادة التوليد" مميز |
| `Home.tsx:254` | "لا توجد مواعيد في هذا اليوم" | زر "إضافة موعد" |

---

## 7. الاتساق البصري (Visual Consistency)

### 7.1 — خلط بين `bg-white` و `app-surface` ⚠️ **P2**
`DefensesList.tsx` و `LegalAnalysis.tsx` يستخدمان `bg-white` مباشرة في 12+ موضع، مما يكسر dark mode.

---

### 7.2 — `text-[11px]` لا تزال موجودة في 43 موضع ⚠️ **P2**
11px أصغر من الحد الأدنى لقراءة مريحة (12px للتسميات، 14px للنص الأساسي).  
أسوأ الحالات في:
- `FinancialsTab.tsx` — تسميات إجمالي الدخل/المصروف
- `DefensesList.tsx` — metadata cards

---

### 7.3 — `21` حالة `dark:bg-[#1A1A1A]` مكتوبة مباشرة ⚠️ **P2**
بدلاً من `dark:app-surface` — راجع 2.2.

---

### 7.4 — `SkeletonCards.tsx` بارتفاع ثابت `h-[300px]` ⚠️ **P3**
**الملف:** `src/components/skeleton/SkeletonCards.tsx:6,24,42...`  
ارتفاع ثابت 300px قد لا يتطابق مع ارتفاع المحتوى الفعلي — يسبب CLS (Content Layout Shift) عند الانتهاء من التحميل.

---

### 7.5 — `SkeletonForm.tsx` بعرض ثابت `w-[25px]` ⚠️ **P3**
**الملف:** `src/components/skeleton/SkeletonForm.tsx:8`  
عرض 25px hardcoded — لا يتناسب مع responsive layout.

---

## 8. الأداء (Performance)

### 8.1 — `transition-all` بدلاً من `transition-[specific]` في 84 موضع ⚠️ **P2**
`transition-all` تُحرّك جميع properties بما فيها layout properties (width, height) مما يسبب reflow. الأصح استخدام `transition-colors` أو `transition-shadow`.

---

### 8.2 — `eslint-disable` في `DefensesList.tsx` لـ missing dependency ⚠️ **P2**
**الملف:** `src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/DefensesList.tsx:146`  
تجاهل تحذير `react-hooks/exhaustive-deps` يخفي potential stale closure bug.

---

## 9. النصوص والمحتوى

### 9.1 — "المحادثه الذكيه" — خطأ إملائي ❌ **P2**
**الملف:** `src/components/sidebar/Sidebar.tsx:135`
```tsx
// ❌
المحادثه الذكيه
// ✅
المحادثة الذكية
```

---

### 9.2 — "الاعدادات" — بدون همزة ⚠️ **P2**
**الملف:** `src/components/sidebar/Sidebar.tsx:153`
```tsx
// ❌
الاعدادات
// ✅
الإعدادات
```

---

### 9.3 — `FinalStatementOfClaims` — نص PDF يستخدم `color:#666` hardcoded ⚠️ **P2**
**الملفات:**
- `FinalStatementOfClaims.tsx:81,89,94,154`
- `DefensesList.tsx:430-451`

هذه strings مدمجة في HTML للطباعة — ألوانها ثابتة ولن تتغير مع theme.  
على الأقل يجب توثيقها كـ intentional (للطباعة فقط).

---

### 9.4 — "الصفحة الرئيسة" — بدون تاء التأنيث الصحيحة ⚠️ **P3**
**الملف:** `src/components/sidebar/Sidebar.tsx:79`
```tsx
// مقبول لكن الأفضل:
الصفحة الرئيسية
```

---

## ملخص الأولوية التنفيذي

| الفئة | P0 | P1 | P2 | P3 | الإجمالي |
|---|---|---|---|---|---|
| إمكانية الوصول | 0 | 6 | 1 | 0 | **7** |
| Dark Mode | 0 | 1 | 2 | 0 | **3** |
| Design Tokens | 0 | 0 | 3 | 1 | **4** |
| Form UX | 0 | 2 | 4 | 0 | **6** |
| التنقل | 0 | 2 | 2 | 0 | **4** |
| Empty States | 0 | 1 | 0 | 0 | **1** |
| الاتساق البصري | 0 | 0 | 4 | 2 | **6** |
| الأداء | 0 | 0 | 2 | 0 | **2** |
| النصوص | 0 | 0 | 3 | 1 | **4** |
| **الإجمالي** | **0** | **12** | **21** | **4** | **37** |

---

## الـ 12 الأشد إلحاحاً (P1 — يجب إصلاحها قبل الشحن)

1. **`document.title` — لا يتغير أبداً** → أضف `usePageTitle` hook
2. **`<main>` يحتوي sidebar** → أعد الهيكلة الدلالية
3. **30+ زر بدون `aria-label`** → مسح شامل بـ `aria-label`
4. **5 حالات `bg-white` تكسر dark mode** في `LegalAnalysis.tsx`
5. **لا يوجد مؤشر للحقول المطلوبة** → `isRequired` على جميع الحقول الإلزامية
6. **9 حالات فارغة بدون CTA** → أضف زر فعل لكل حالة
7. **`console.log` في production** → احذفه
8. **`AddNewFact.tsx` بدون `dir="rtl"`** على الـ form
9. **`WorkflowStepBar` لا يعمل على الموبايل** → أضف زر "السابق" مرئي
10. **`DefensesList.tsx:eslint-disable`** → ابحث عن الـ stale closure وأصلحه
11. **`AddNewCaseFromOCRForm` defending party بدون `role="radiogroup"`**
12. **10 نماذج `<form>` بدون `dir="rtl"`** → أضف للجميع

---

*تم إنشاؤه بالفحص الثابت للكود. بعض المشاكل قد تكون مخففة بإعدادات CSS موروثة لم تظهر في البحث.*
