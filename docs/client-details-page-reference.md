# صفحة تفاصيل الموكل (Client Details Page)

> **المسار:** `/clients/:id`
> **الملف الرئيسي:** `mohamy-smart-lawyer-dashboard/src/pages/clients/ClientDetails.tsx`
> **الستايل:** `mohamy-smart-lawyer-dashboard/src/pages/clients/ClientDetails.css`
> **اتجاه الصفحة:** RTL (من اليمين لليسار)
> **اللغة:** عربي بالكامل
> **الثيم:** Tajawal font · `#EF950A` (ذهبي) · `#FBFAE8` (أصفر فاتح) · Dark mode عبر `.dark` class

---

## 1. هيكل الصفحة العام (من أعلى لأسفل)

```
┌─────────────────────────────────────────────────────────┐
│  Breadcrumb: الموكلين ← / اسم الموكل    [تعديل البيانات] │
├─────────────────────────────────────────────────────────┤
│  Profile Hero                                            │
│  ┌──────┐  اسم الموكل  📱رقم  📧ايميل  📍محافظة  📅تاريخ  │
│  │Avatar│  🏷️ الرقم القومي                                │
│  └──────┘  ┌─────────┬─────────┬─────────┐              │
│            │X قضية   │X قضية   │X توكيل  │              │
│            │نشطة     │مغلقة    │         │              │
│            └─────────┴─────────┴─────────┘              │
├─────────────────────────────────────────────────────────┤
│  Main Grid (2 أعمدة)                                     │
│  ┌──────────┐  ┌────────────────────────────────────┐   │
│  │ Sidebar  │  │ Main Area                           │   │
│  │          │  │                                     │   │
│  │ البيانات │  │ التوكيلات (POAs Grid)               │   │
│  │ الأساسية │  │                                     │   │
│  │          │  │                                     │   │
│  │ القضايا  │  │                                     │   │
│  │          │  │                                     │   │
│  └──────────┘  └────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Full-Width: ملفات الموكل                                │
├─────────────────────────────────────────────────────────┤
│  Full-Width: سجل إخلاء الطرف وتسليم المستندات            │
├─────────────────────────────────────────────────────────┤
│  Full-Width: كشف الحساب المالي للموكل                     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Breadcrumb (شريط التنقل العلوي)

- **موقع:** أعلى الصفحة، يمين-يسار
- **المحتوى:**
  - سهم ← `الموكلين` (رابط لصفحة `/clients`)
  - فاصل `/`
  - اسم الموكل (نص عادي، مقطوع بـ ellipsis لو طويل)
- **على اليمين:** زر **"تعديل البيانات"** (لو مش في وضع التعديل)
- **في وضع التعديل:** زرين **"إلغاء"** (أحمر flat) + **"حفظ التعديلات"** (أساسي مع loading)

### الأزرار

| الزر | الحالة | الأيقونة | اللون | الحجم | الشكل |
|------|--------|----------|-------|-------|-------|
| تعديل البيانات | عرض | FiEdit2 | primary | sm | full |
| إلغاء | تعديل | FiX | danger (flat) | sm | full |
| حفظ التعديلات | تعديل | FiSave | primary (مع loading) | sm | full |

---

## 3. Profile Hero (بطاقة البروفايل)

- **خلفية:** `#FBFAE8` (أصفر فاتح جداً) مع بوردر `rgba(239, 149, 10, 0.14)`
- **Dark:** `#1a1500` مع بوردر `rgba(239, 149, 10, 0.2)`
- **حشوة:** 24px 28px
- **Border Radius:** `var(--lg-radius)`

### Avatar (صورة رمزية)
- **حجم:** 68×68px دائري
- **اللون:** أبيض نص على خلفية ديناميكية (حسب أول حرف من ID)
- **الألوان المتاحة:** `['#EF950A', '#1B1B1B', '#CA0000', '#34BF49', '#C47A06']`
- **المحتوى:** أول حرفين من اسم الموكل (Initials)

### معلومات الموكل (يسار الـ Avatar)

| العنصر | الأيقونة | السلوك |
|--------|----------|--------|
| **اسم الموكل** (h1) | — | حجم 1.45rem، bold 700 |
| **الرقم القومي** (badge) | FiCreditCard | pill صغير، خلفية بيضاء شفافة، بوردر ذهبي |
| **رقم الهاتف** | FiPhone | رابط `tel:` |
| **البريد الإلكتروني** | FiMail | رابط `mailto:` |
| **المحافظة** | FiMapPin | نص عادي |
| **تاريخ الانضمام** | LuCalendar | "انضم D MMMM YYYY" بالعربي |

### إحصائيات سريعة (Hero Stats)
- **خلفية:** بيضاء شفافة `rgba(255,255,255,0.6)` مع بوردر ذهبي
- **Dark:** `rgba(255,255,255,0.06)`
- **Border Radius:** 16px
- **3 إحصائيات مفصولة بـ divider عمودي:**

| الإحصائية | القيمة | اللون |
|-----------|--------|-------|
| قضية نشطة | `activeCasesCount` | ذهبي (main-color) |
| قضية مغلقة | `closedCasesCount` | ذهبي (main-color) |
| توكيل | `clientPOAs.length` | ذهبي (main-color) |

- الرقم بحجم 1.5rem ووزن 800
- التسمية بحجم 0.68rem ووزن 500

---

## 4. Main Grid (شبكة المحتوى الرئيسية)

- **تخطيط:** CSS Grid `300px 1fr`
- **على شاشات < 1024px:** عمود واحد
- **اتجاه:** RTL
- **Gap:** 16px

### 4.1 Sidebar (الشريط الجانبي الأيسر - 300px)

#### 4.1.1 بطاقة البيانات الأساسية

**وضع العرض (Read Mode):**

| الحقل | التسمية | القيمة |
|-------|---------|--------|
| الرقم القومي | nationalId | نص أو "—" |
| المحافظة | governorate | نص أو "—" |
| العنوان | address | نص أو "—" |
| ملاحظات | notes | نص داخل صندوق أصفر منفصل (لو موجود) |

- كل صف مفصول بـ border أفقي خفيف
- الملاحظات في صندوق خاص خلفية `#FBFAE8` مع أيقونة FiMessageSquare

**وضع التعديل (Edit Mode):**

| الحقل | نوع الحقل | الـ Label | التحقق (Validation) |
|-------|-----------|-----------|---------------------|
| clientName | CustomInput | الاسم الكامل | مطلوب (min 1) |
| phoneNumber | CustomInput | رقم الهاتف | مطلوب (min 1) |
| nationalId | CustomInput | الرقم القومي | اختياري |
| email | CustomInput (email) | البريد الإلكتروني | اختياري لكن لو موجود لازم يكون email صحيح |
| governorate | CustomInput | المحافظة | اختياري |
| address | CustomInput | العنوان التفصيلي | اختياري |
| notes | Textarea (HeroUI) | ملاحظات | اختياري |

- الفورم داخل `CustomCard` بخلفية `#FBFAE8/0.3`
- كل الحقول بـ variant `bordered` و labelPlacement `outside`

#### 4.1.2 بطاقة القضايا

**العنوان:** "القضايا (X)"

**لو فاضي:**
- أيقونة MdOutlineGavel كبيرة
- نص "لا توجد قضايا مُسندة"

**لو فيها قضايا:** قائمة عمودية، كل قضية تحتوي على:
```
┌─────────────────────────────┐
│ 🟢 عنوان القضية               │
│ رقم القضية • المحكمة   [عرض] │
└─────────────────────────────┘
```

| العنصر | الوصف |
|--------|-------|
| نقطة الحالة | دائرة 7px: أخضر (Active) أو رمادي (Closed) |
| عنوان القضية | bold 700، مقطوع بـ ellipsis |
| رقم القضية + المحكمة | حجم صغير، لون نص خفيف |
| رابط "عرض" | رابط لـ `/cases/:id`، لون main-color |

- خلفية كل عنصر: `#FBFAE8`
- Dark: `rgba(239,149,10,0.06)`
- Hover: بوردر يغمق

### 4.2 Main Area (المنطقة الرئيسية - يمين)

#### بطاقة التوكيلات

**العنوان:** "التوكيلات (X)"

**لو فاضي:**
- أيقونة MdOutlineReceipt كبيرة
- نص "لا توجد توكيلات مُسجلة لهذا الموكل"

**لو فيها توكيلات:** شبكة (Grid) `repeat(auto-fill, minmax(240px, 1fr))`:

```
┌─────────────────────────┐
│ عنوان التوكيل     [ساري] │
│ ┌─────────────────────┐ │
│ │ رقم التوكيل    XXXX │ │
│ │ جهة الإصدار    XXXX │ │
│ └─────────────────────┘ │
│ أُصدر YYYY/MM/DD  [إلغاء]│
└─────────────────────────┘
```

| العنصر | الوصف |
|--------|-------|
| عنوان التوكيل | bold 700، مقطوع بـ ellipsis |
| Badge حالة | "ساري" (أخضر) أو "ملغى" (أحمر) pill |
| رقم التوكيل | `poa.number` |
| جهة الإصدار | `poa.issuingAuthority`، مقطوع بـ max-w-[140px] |
| التاريخ | "أُصدر YYYY/MM/DD" أو "أُلغي YYYY/MM/DD" |
| زر إلغاء التوكيل | ظاهر بس لو التوكيل ساري، لون danger flat |

**التوكيل الملغى:**
- بوردر أحمر خفيف `rgba(202,0,0,0.15)`
- خلفية حمراء خفيفة `rgba(202,0,0,0.03)`

---

## 5. قسم الملفات (Full-Width)

**العنوان:** "ملفات الموكل (X)" + زر **"إضافة ملف"** على اليسار

### زر إضافة ملف
- يفتح file picker مخفي
- يرفع الملف عبر `POST /Client/{id}/files` (multipart/form-data)
- Toast loading → success/error

### لو فاضي:
- أيقونة MdOutlineFilePresent كبيرة
- نص "لا توجد ملفات مرتبطة بهذا الموكل"

### لو فيه ملفات: قائمة عمودية

```
┌─────────────────────────────────────────┐
│ 📄  اسم الملف.pdf          [حذف]         │
│     125.3 KB • منذ 3 أيام               │
└─────────────────────────────────────────┘
```

| العنصر | الوصف |
|--------|-------|
| أيقونة الملف | 📄 في صندوق 36×36 ذهبي |
| اسم الملف | رابط يفتح الملف في tab جديد، bold 700 |
| حجم الملف + التاريخ | حجم بـ KB + "منذ X" (relative time بالعربي) |
| زر حذف | danger flat، مع confirm dialog |

---

## 6. قسم إخلاء الطرف وتسليم المستندات (DocumentHandoffTab)

**الملف:** `tabs/DocumentHandoffTab.tsx`
**العنوان:** "سجل إخلاء الطرف وتسليم المستندات"
**الأزرار:** "تسليم مستند جديد" (primary + أيقونة MdUploadFile)

### فورم إضافة مستند جديد (يظهر عند الضغط على الزر)

| الحقل | النوع | المطلوب | Placeholder |
|-------|-------|---------|-------------|
| اسم المستند | text | مطلوب | "مثال: عقد الإيجار الأصلي" |
| تاريخ التسليم | date | مطلوب | default: اليوم |
| إيصال الاستلام | file (image/*, .pdf) | اختياري | — |

- أزرار: "إلغاء" (default flat) + "حفظ" (primary مع loading)
- الـ API: `POST /ClientDocuments` (multipart/form-data)

### لو فاضي:
- CustomCard بخلفية `#FBFAE8/0.30` مع بوردر متقطع ذهبي
- أيقونة MdOutlineFilePresent كبيرة
- نص "لا توجد مستندات مُسلَّمة مسجلة لهذا الموكل"

### لو فيه بيانات: قائمة عمودية

```
┌──────────────────────────────────────────┐
│ 📎  اسم المستند            [عرض الإيصال]  │
│     سُلِّم في 15 أبريل 2026               │
└──────────────────────────────────────────┘
```

| العنصر | الوصف |
|--------|-------|
| أيقونة مشبك | FiPaperclip في صندوق 40×40 أصفر |
| اسم المستند | bold 700 |
| تاريخ التسليم | "سُلِّم في D MMMM YYYY" |
| زر عرض الإيصال | ظاهر بس لو فيه `receiptFilePath`، primary flat |

---

## 7. قسم كشف الحساب المالي (FinancialsTab)

**الملف:** `tabs/FinancialsTab.tsx`
**العنوان:** "كشف الحساب المالي للموكل"
**الأزرار:**
- "تصدير Excel" (default flat) — ظاهر بس لو فيه معاملات
- "إضافة معاملة" (primary + أيقونة MdOutlineAccountBalanceWallet)

### بطاقات الملخص المالي (3 كروت في شبكة)

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 📈           │  │ 📉           │  │ 💰           │
│ إجمالي الدخل │  │ إجمالي المصروفات│ │ الرصيد الصافي │
│ X,XXX ج.م   │  │ X,XXX ج.م   │  │ X,XXX ج.م   │
└─────────────┘  └─────────────┘  └─────────────┘
   أخضر              أحمر              ذهبي
```

| البطاقة | الخلفية | لون الأيقونة | لون الرقم |
|---------|---------|-------------|----------|
| إجمالي الدخل | أخضر فاتح `green-50` | أخضر `green-600` | أخضر داكن `green-700` |
| إجمالي المصروفات | أحمر فاتح `red-50` | أحمر `red-500` | أحمر `red-600` |
| الرصيد الصافي | ذهبي فاتح `#FBFAE8` | main-color | أخضر (لو موجب) أو أحمر (لو سالب) |

- الأرقام بصيغة عربية `toLocaleString('ar-EG')`
- على mobile: عمود واحد

### فورم إضافة معاملة مالية (يظهر عند الضغط على الزر)

| الحقل | النوع | المطلوب | ملاحظات |
|-------|-------|---------|---------|
| النوع | select | مطلوب | "دخل (إيراد)" أو "مصروف" |
| المبلغ (ج.م) | number | مطلوب | min=0, step=0.01, placeholder "0.00" |
| الوصف | text | مطلوب | placeholder "مثال: أتعاب جلسة 8 أبريل" |
| التاريخ | date | مطلوب | default: اليوم |

- أزرار: "إلغاء" (default flat) + "حفظ" (primary مع loading)
- الـ API: `POST /ClientTransactions`

### تصدير Excel
- يستخدم مكتبة `xlsx`
- يصدر ملف اسمه `كشف_حساب_{اسم الموكل}_{التاريخ}.xlsx`
- فيه sheet اسمها "كشف الحساب"
- فيها البيانات + ملخص (إجمالي الدخل، المصروفات، الرصيد)

### لو فاضي:
- CustomCard بخلفية `#FBFAE8/0.30` مع بوردر متقطع ذهبي
- نص "لا توجد معاملات مالية مسجلة لهذا الموكل"

### لو فيه معاملات: قائمة عمودية

```
┌──────────────────────────────────────────────┐
│ 📈  وصف المعاملة                    +X,XXX ج.م │
│     15 أبريل 2026                               │
└──────────────────────────────────────────────┘
     أخضر (Income)

┌──────────────────────────────────────────────┐
│ 📉  وصف المعاملة                    -X,XXX ج.م │
│     15 أبريل 2026                               │
└──────────────────────────────────────────────┘
     أحمر (Expense)
```

| العنصر | الدخل | المصروف |
|--------|-------|---------|
| أيقونة | MdTrendingUp في صندوق أخضر | MdTrendingDown في صندوق أحمر |
| الوصف | bold 700 | bold 700 |
| التاريخ | "D MMMM YYYY" بالعربي | "D MMMM YYYY" بالعربي |
| المبلغ | أخضر `+X,XXX ج.م` | أحمر `-X,XXX ج.م` |

---

## 8. أنواع البيانات (Data Types)

### TClientDetails

```typescript
{
  id: string;
  clientName: string;
  phoneNumber: string;
  email: string | null;
  notes: string | null;
  address: string | null;
  nationalId: string | null;
  governorate: string | null;
  lawyerId: string;
  caseId: string | null;
  creationDate: string;
  cases: TClientCaseSummary[];
  files: TClientFile[];
}
```

### TClientCaseSummary

```typescript
{
  id: string;
  title: string;
  number: string;
  court: string;
  status: 'Active' | 'Closed';
  creationDate: string;
}
```

### TClientFile

```typescript
{
  id: string;
  fileName: string;
  filePath: string;
  contentType: string;
  fileSize: number;
  creationDate: string;
}
```

### POA (clientPOAs — typed as `any[]`)

```typescript
{
  id: string;
  title: string;
  number: string;
  issuingAuthority: string;
  isCanceled: boolean;
  issueDate: string;
  cancellationDate?: string;
}
```

### TDocumentHandoff

```typescript
{
  id: string;
  clientId: string;
  documentName: string;
  deliveryDate: string;
  receiptFilePath?: string;
  createdAt: string;
}
```

### TClientTransaction

```typescript
{
  id: string;
  clientId: string;
  type: 'Income' | 'Expense';
  amount: number;
  description: string;
  transactionDate: string;
  createdAt: string;
}
```

---

## 9. API Endpoints المستخدمة

| العملية | الـ Method | الـ Endpoint | البيانات |
|---------|-----------|-------------|---------|
| جلب بيانات الموكل | GET | `/Client/{clientID}` | — |
| تحديث بيانات الموكل | PUT | `/Client/{clientId}` | query params |
| جلب التوكيلات | GET | `/PowerOfAttorney/client/{clientId}` | — |
| إلغاء توكيل | PUT | `/PowerOfAttorney/{poaId}/cancel` | — |
| رفع ملف | POST | `/Client/{id}/files` | multipart/form-data |
| حذف ملف | DELETE | `/Client/{id}/files/{fileId}` | — |
| جلب إخلاءات الطرف | GET | `/ClientDocuments/client/{clientId}` | — |
| إنشاء إخلاء طرف | POST | `/ClientDocuments` | multipart/form-data |
| جلب المعاملات المالية | GET | `/ClientTransactions/client/{clientId}` | — |
| إنشاء معاملة مالية | POST | `/ClientTransactions` | JSON |

---

## 10. الـ Loading States

| الحالة | العرض |
|--------|-------|
| جاري تحميل بيانات الموكل | `SkeletonForm` (شكل فورم وهمي مع عنوان "إدارة الموكلين") |
| جاري تحديث البيانات | الزر "حفظ التعديلات" يظهر loading spinner |
| جاري إلغاء التوكيل | الزر "إلغاء التوكيل" يظهر loading spinner |
| جاري رفع/حذف ملف | Toast loading → success/error |
| جاري تحميل إخلاءات الطرف | نص "جاري التحميل..." |
| جاري تحميل المعاملات المالية | نص "جاري التحميل..." |

---

## 11. Toast Notifications

| الحدث | النوع | الرسالة |
|-------|------|---------|
| تحديث بيانات الموكل | success | "تم تحديث بيانات الموكل بنجاح" |
| خطأ في التحديث | error | "حدث خطأ أثناء التحديث" |
| إلغاء التوكيل | success | "تم إلغاء التوكيل بنجاح" |
| خطأ إلغاء التوكيل | error | "حدث خطأ أثناء إلغاء التوكيل" |
| رفع ملف | loading → success | "جاري رفع الملف..." → "تم الرفع بنجاح" |
| خطأ رفع ملف | error | "حدث خطأ أثناء الرفع" |
| حذف ملف | loading → success | "جاري الحذف..." → "تم الحذف" |
| خطأ حذف ملف | error | "حدث خطأ أثناء الحذف" |
| إنشاء إخلاء طرف | success | "تم تسجيل إخلاء الطرف بنجاح" |
| خطأ إخلاء طرف | error | "حدث خطأ أثناء الحفظ" |
| إنشاء معاملة مالية | success | "تمت إضافة المعاملة بنجاح" |
| خطأ معاملة مالية | error | "حدث خطأ أثناء الإضافة" |
| تصدير Excel | success | "تم تصدير الملف بنجاح" |

---

## 12. Empty States (الحالات الفارغة)

كل empty state فيه:
- أيقونة كبيرة بلون `main-color` مع opacity 0.22
- نص وصفي
- بوردر متقطع ذهبي `dashed`
- خلفية صفراء خفيفة `#FBFAE8/0.4`
- Dark: خلفية `rgba(239,149,10,0.04)`

---

## 13. Dark Mode

- بيشتغل بـ class `.dark` على العنصر الأب (مش `prefers-color-scheme`)
- التغييرات الأساسية:
  - خلفية Hero: `#1a1500`
  - خلفية البطاقات: `rgba(239,149,10,0.05)`
  - بوردرات: أغمق شوية
  - النصوص: تعتمد على `var(--title-color)` و `var(--text-color)`

---

## 14. Responsive Breakpoints

| الشاشة | التغيير |
|--------|---------|
| < 1024px | الـ Grid يبقى عمود واحد بدل 2 |
| < 768px | Hero Stats بقي عرض كامل في سطر جديد، Hero padding يقل |

---

## 15. المكتبات والأيقونات المستخدمة

### أيقونات (react-icons)

| الأيقونة | الاستخدام |
|----------|----------|
| FiEdit2 | زر تعديل |
| FiPhone | رقم الهاتف |
| FiMail | البريد الإلكتروني |
| FiSave | حفظ التعديلات |
| FiX | إلغاء التعديل |
| FiMapPin | المحافظة |
| FiCreditCard | الرقم القومي |
| FiMessageSquare | الملاحظات |
| FiPaperclip | إخلاء طرف |
| LuCalendar | تاريخ الانضمام |
| LuArrowRight | سهم الـ breadcrumb |
| MdOutlineGavel | empty state القضايا |
| MdOutlineFilePresent | empty state الملفات / إخلاءات الطرف |
| MdOutlineReceipt | empty state التوكيلات |
| MdUploadFile | زر تسليم مستند جديد |
| MdTrendingUp | دخل / إحصائية |
| MdTrendingDown | مصروف |
| MdOutlineAccountBalanceWallet | زر إضافة معاملة / الرصيد |

### مكتبات

| المكتبة | الاستخدام |
|---------|----------|
| react-hook-form + zod | إدارة وتحقق فورم التعديل |
| @heroui/react | Textarea, Input (عبر CustomInput) |
| moment (locale: ar) | تنسيق التواريخ بالعربي |
| react-hot-toast | إشعارات |
| react-router-dom | useParams, Link |
| xlsx | تصدير Excel |

---

## 16. الملفات المرتبطة

### ملفات الصفحة
- `src/pages/clients/ClientDetails.tsx` (463 سطر)
- `src/pages/clients/ClientDetails.css` (787 سطر)
- `src/pages/clients/tabs/DocumentHandoffTab.tsx` (162 سطر)
- `src/pages/clients/tabs/FinancialsTab.tsx` (244 سطر)

### Redux
- `src/redux/clients/clientsSlice.ts`
- `src/redux/clients/thunk/thunkGetClientDetails.ts`
- `src/redux/clients/thunk/thunkUpdateClient.ts`
- `src/redux/clients/thunk/thunkGetClientPOAs.ts`
- `src/redux/clients/thunk/thunkCancelPOA.ts`
- `src/redux/documentHandoff/documentHandoffSlice.ts`
- `src/redux/clientTransactions/clientTransactionSlice.ts`

### Components مشتركة
- `src/components/ui/Container.tsx`
- `src/components/ui/inputs/CustomInput.tsx`
- `src/components/ui/buttons/CustomButton.tsx`
- `src/components/ui/card/CustomCard.tsx`
- `src/components/skeleton/SkeletonForm.tsx`
- `src/components/headTitle/HeadTitle.tsx`

### Routing
- `src/router/AppRouter.tsx` — سطر 58: `<Route path="/clients/:id" element={<ClientDetails />} />`
