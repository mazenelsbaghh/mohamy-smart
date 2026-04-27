# Data Model: إنشاء العقود القانونية بالذكاء الاصطناعي

## 1. LegalContract

- **Purpose**: يمثل عقدًا قانونيًا تم توليده أو حفظه داخل النظام لمحامٍ وموكل محددين.

### Fields

- `Id`: معرف فريد للعقد.
- `LawyerId`: معرف المحامي المالك للعقد.
- `ClientId`: معرف الموكل المرتبط بالعقد.
- `ContractTypeCode`: رمز نوع العقد المعتمد داخل النظام.
- `ContractTypeName`: الاسم العربي لنوع العقد وقت الإنشاء.
- `InputDetails`: الوصف التفصيلي الذي أدخله المحامي.
- `CustomClauses`: البنود أو الشروط الخاصة التي أدخلها المحامي.
- `GeneratedContent`: النص الكامل لمسودة العقد الناتجة.
- `Status`: حالة العقد.
- `AiStepType`: نوع مرحلة الذكاء الاصطناعي المستخدمة لإنشاء هذا العقد.
- `ModelIdentifier`: الموديل الذي استخدم فعليًا وقت الإنشاء.
- `CreatedAtUtc`: تاريخ ووقت الإنشاء.
- `CreatedByUserId`: المستخدم الذي نفذ العملية.
- `LastErrorMessage`: رسالة آخر خطأ إن فشلت المحاولة أو احتاج السجل لحفظ حالة فشل.

### Validation Rules

- يجب أن يكون `LawyerId` و`ClientId` صالحين وموجودين.
- يجب أن ينتمي `ClientId` إلى `LawyerId`.
- `ContractTypeCode` و`ContractTypeName` لا يجوز أن يكونا فارغين.
- `InputDetails` يجب ألا يكون فارغًا ويجب أن يتجاوز حدًا أدنى منطقيًا من المحتوى.
- `GeneratedContent` مطلوب عند الحالات الناجحة.
- `ModelIdentifier` يجب أن يطابق واحدًا من النماذج المعتمدة.

### State Transitions

- `DraftingRequested` → `Generated`
- `DraftingRequested` → `Failed`
- `Failed` → `DraftingRequested` عند إعادة المحاولة مستقبلًا إذا أضيفت

## 2. ContractGenerationRequest

- **Purpose**: يمثل payload القادم من واجهة المحامي لطلب إنشاء عقد جديد.

### Fields

- `ClientId`
- `ContractTypeCode`
- `Details`
- `CustomClauses`

### Validation Rules

- جميع الحقول الأساسية مطلوبة ما عدا `CustomClauses` يمكن أن تكون اختيارية مع حد أقصى مناسب للطول.
- `Details` يجب أن تكون كافية لتوليد عقد ذي معنى.

## 3. ContractType

- **Purpose**: يمثل نوع عقد معتمد يمكن للمحامي اختياره من الواجهة.

### Fields

- `Code`: قيمة مستقرة تستخدم داخليًا وفي الـ API.
- `DisplayNameAr`: الاسم العربي المعروض.
- `Description`: وصف مختصر اختياري.
- `IsActive`: هل النوع متاح للاستخدام.
- `DisplayOrder`: ترتيب الظهور في الواجهة.

### Validation Rules

- `Code` فريد.
- `DisplayNameAr` مطلوب.

## 4. Ai Contract Stage Configuration

- **Purpose**: ليس كيانًا جديدًا مستقلًا، بل توسيع للكيان الحالي `AiStageModelConfig` بإضافة `AiStepType` جديد يمثل "توليد العقود القانونية".

### Required Changes

- إضافة قيمة enum جديدة ضمن `AiStepType`.
- إضافتها إلى `PipelineRegistry` حتى تظهر في إعدادات الإدارة الحالية.
- توفير seed/default config للموديل الافتراضي لهذه المرحلة.

## 5. Client Reference Snapshot

- **Purpose**: البيانات المرجعية للموكل المستخدمة أثناء التوليد.

### Fields used at generation time

- `ClientId`
- `ClientName`
- `NationalId` إن وجد
- `Address` إن وجد
- `PhoneNumber` إن وجد
- `Email` إن وجد

### Notes

- لا يلزم إنشاء جدول جديد إذا أمكن قراءة هذه البيانات من `Client` وقت التوليد.
- يمكن حفظ نسخة نصية مختصرة داخل العقد إذا لزم الحفاظ على أثر البيانات كما كانت وقت الإنشاء.

## Relationships

- `Lawyer 1 --- * LegalContract`
- `Client 1 --- * LegalContract`
- `ContractType 1 --- * LegalContract` منطقيًا حتى لو كانت ممثلة بقائمة ثابتة أو مرجعية
- `AiStageModelConfig 1 --- * LegalContract` علاقة منطقية عبر `AiStepType` + `ModelIdentifier` المستخدم وقت الإنشاء
