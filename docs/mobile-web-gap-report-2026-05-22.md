# تقرير فجوات تطبيق الموبايل مقارنة بلوحة الويب

تاريخ التقرير: 2026-05-22  
النطاق: مقارنة تطبيق Flutter في `apps/mohamy_smart_mobile` مع لوحة المحامي على الويب في `apps/lawyer-dashboard`، مع الاسترشاد بخريطة صفحات الموبايل في `docs/mobile-page-architecture`.

## 1. الملخص التنفيذي

تطبيق الموبايل ليس نسخة مكافئة للويب حتى الآن. هو أقرب إلى MVP متقدم: لديه هيكل دخول، تبويبات أساسية، عرض قضايا وموكلين وأجندة، جزء من المستندات، مكتبة قانونية، محادثة، اشتراك ونقاط، ومسارات AI موحدة. لكن الويب أوسع بكثير من حيث عمق العمليات، إدارة كل مسار AI بخطوات مخصصة، اختيار المستندات والوقائع، الحفظ والاستئناف، إدارة العقود، أوراق المحضرين، تفاصيل الموكل، تفاصيل القضية، وتغطية حالات الخطأ والإرشاد.

أكبر فجوة ليست عدد الشاشات فقط؛ الفجوة الأساسية في "عمق كل تدفق". الويب يوفر تدفقات قانونية مكتملة ومربوطة بسلوك Backend/Redux/SignalR واختبارات، بينما الموبايل يستخدم `AppState` مركزي وبعض API calls مباشرة، وبه عدة شاشات تبدو موجودة بصريا لكنها ناقصة في CRUD، التحقق، الربط، التصدير، إدارة النسخ، وتحمل الأخطاء.

## 2. مصادر المقارنة

- الويب يعرف الراوتات الرئيسية من `apps/lawyer-dashboard/src/router/AppRouter.tsx`: شاشات Auth، Home، Cases، Case Details، Document Selection، 7 مسارات AI، Clients، Documents، Legal Contracts، Legal Library، Process Server Papers، Agenda، Chat، Settings، Subscription.
- الموبايل يبدأ من `apps/mohamy_smart_mobile/lib/app/mohamy_mobile_app.dart`: Splash ثم Onboarding ثم Login ثم `AppShell`.
- `AppShell` في الموبايل يحتوي 5 تبويبات فقط: الرئيسية، القضايا، الموكلين، الأجندة، المزيد.
- خريطة الموبايل المطلوبة في `docs/mobile-page-architecture/README.md` تنص على 24 صفحة/حالة.
- خدمة API في الموبايل تغطي جزءا من Backend فقط: Login، Profile، Cases، Clients، Internal Regulations، POA، Chat، AI Jobs، Workflow Snapshots، Documents fetch، Agenda fetch، Subscription/AI points.

## 3. جدول التغطية: الويب مقابل الموبايل

| المجال | موجود في الويب | الموجود في الموبايل الآن | حالة الفجوة | المطلوب للوصول للتكافؤ |
|---|---|---|---|---|
| Splash | غير أساسي في الويب | موجود | مقبول | إضافة session refresh/offline/version-blocked بدل تأخير ثابت فقط |
| Onboarding | غير مطلوب كويب داخلي | موجود | مقبول كبداية | حفظ حالة onboarding محليا وربطه بالإصدار |
| Login | موجود | موجود | ناقص | تخزين token آمن، refresh، errors واضحة، remember/session restore |
| Sign Up | موجود | شاشة Placeholder/مبسطة | حرجة | تنفيذ فورم التسجيل كامل وربطه بـ API وOTP |
| Forgot Password | موجود | شاشة Placeholder/مبسطة | حرجة | إرسال كود، reset password، حالات الخطأ |
| OTP Verification | موجود | Placeholder | حرجة | إدخال 6 أرقام، timer، resend، verify API |
| Privacy/Terms | موجود في الويب | غير ظاهر كتدفق مستقل | متوسطة | ربط شروط الاستخدام والخصوصية من Auth/Settings |
| Home Dashboard | موجود | موجود | متوسطة | مزامنة بيانات حقيقية لكل بطاقات اليوم، AI jobs، الاختصارات |
| Cases List | موجود | موجود | متوسطة | فلاتر الويب، pagination، statuses دقيقة، empty/error/loading كاملة |
| Add Case | موجود | موجود جزئيا | حرجة | نفس حقول الويب: نوع قضية، خصوم، وقائع، مطالبات، عميل موجود/جديد، OCR |
| Case Details | موجود بتفاصيل أوسع | موجود بثلاث تبويبات | حرجة | tabs كاملة: تفاصيل، وقائع، مستندات، جلسات، مخرجات AI، إجراءات |
| Document Selection | موجود قبل مسارات AI | غير مفصول بوضوح | حرجة | شاشة اختيار مستندات وربط readiness قبل AI |
| Defense Memo | موجود بخطوات مخصصة | داخل Runner عام | حرجة | مطابقة خطوات الويب ومخرجاته، تعديل/حذف دفاعات، تنزيل/تصدير |
| Statement of Claims | موجود 7 خطوات | داخل Runner عام | حرجة | كل خطوات الصحيفة بنفس منطق الويب ومخرجات منظمة |
| Appeal Brief | موجود 6 خطوات | داخل Runner عام | حرجة | بيانات الحكم، التحليل، أسباب الطعن، الطلبات، السند، التجميع |
| Admin Complaint | موجود 5 خطوات | داخل Runner عام | حرجة | تصنيف، وقائع، مخالفة، طلبات، تجميع نهائي |
| Ruling Analysis | موجود 4 خطوات | داخل Runner عام | حرجة | منطوق، أسباب، عيوب، تقرير جدوى |
| Legal Warning | موجود 3 خطوات | داخل Runner عام | حرجة | تصنيف، مسودة إنذار، تجميع |
| Exec Request | موجود 3 خطوات | داخل Runner عام | حرجة | تصنيف، صياغة، تجميع |
| Workflow Resume/Snapshots | موجود بعمق في الويب | موجود جزئيا | حرجة | ربط runId، تحميل نسخة، rename/delete/restore موثوق، read-only previous versions |
| AI Points Deduction | موجود بمكونات تأكيد/رصيد | ظاهر جزئيا | حرجة | تأكيد تكلفة قبل التشغيل، insufficient points flow، history دقيقة |
| Documents | موجود | موجود جزئيا | حرجة | Upload حقيقي، OCR حقيقي، ربط بقضية، preview/download/delete |
| OCR to Case | موجود في الويب كنموذج OCR | موجود بمحاكاة/جزئي | حرجة | رفع ملف، مراجعة الحقول المستخرجة، إنشاء قضية حقيقي |
| Clients List | موجود | موجود | متوسطة | فلاتر، بحث، pagination، إجراءات اتصال، empty/error |
| Client Details | موجود | موجود داخل ملف واحد | متوسطة/حرجة | تفاصيل كاملة، قضايا العميل، مستندات، معاملات، POA، إجراءات |
| Agenda | موجود | موجود عرض فقط غالبا | حرجة | إنشاء/تعديل/حذف جلسات ومهام، ربط بقضية، فلترة يوم/أسبوع |
| Chat | موجود | موجود | متوسطة | محادثات متعددة، context case، regulation selection، history |
| Legal Contracts | موجود list/new/details | موجود شاشة داخل More غالبا | حرجة | CRUD كامل، اقتراحات/تفاصيل/تصدير وربط API |
| Process Server Papers | موجود | موجود شاشة داخل More غالبا | حرجة | CRUD كامل، توليد/حالة/تصدير وربط API |
| Legal Library | موجود | موجود جزئيا | متوسطة | نفس صفحات الويب للمواريث، الرسوم، الوكالات، اللوائح مع نتائج وتفاصيل دقيقة |
| Power of Attorneys | موجود | موجود جزئيا | متوسطة | تفاصيل، بحث، إلغاء، ربط موكل/قضية، validation |
| Internal Regulations | موجود | موجود جزئيا | متوسطة | بحث، أرشفة، تفاصيل، ربط بسياق AI |
| Subscription | موجود | موجود | متوسطة | شراء/دفع، تاريخ استخدام كامل، حالات فشل الدفع |
| Settings/Profile | موجود | موجود | متوسطة | تعديل بيانات، كلمة مرور، إشعارات، أمان، لغة/ثيم محفوظ |
| Notifications | مطلوبة في الموبايل | غير منفذة كشاشة واضحة | حرجة | قائمة إشعارات، read/unread، deep links |
| Guidance/Search Audit | موجود في الويب عبر PageGuidance | غير موجود | متوسطة | إرشاد سياقي أو بديل موبايل مختصر |
| Offline/Error/System States | مطلوب في التصميم | موجود SystemStates كصفحة، ليس كسلوك شامل | حرجة | offline banners، retry، skeletons، permission errors |

## 4. فروق التدفقات الأساسية

### 4.1 تدفق الدخول والحساب

الويب يغطي تسجيل، دخول، تحقق هاتف، نسيان كلمة مرور، شروط وخصوصية. الموبايل يعرض Splash/Onboarding/Login ثم شاشات Sign Up/Forgot/OTP بسيطة. لا يوجد من الكود الحالي ما يثبت اكتمال التسجيل أو الاستعادة أو OTP فعليا بنفس مستوى الويب.

الأثر: المستخدم الجديد أو المستخدم الذي فقد كلمة المرور لن يقدر يعتمد على التطبيق بشكل مستقل.

الأولوية: P0 قبل أي إطلاق حقيقي.

### 4.2 تدفق القضية

الويب لديه:
- قائمة قضايا.
- تفاصيل قضية.
- اختيار مستندات.
- دخول مسارات AI من داخل القضية.
- صفحات AI منفصلة لكل نوع.

الموبايل لديه:
- قائمة قضايا.
- إضافة قضية.
- تفاصيل قضية بثلاث تبويبات.
- زر يبدأ AI hub.

الفجوة: تفاصيل القضية في الموبايل لا تعكس كل مساحة العمل الموجودة في الويب: الوقائع، المستندات، الجلسات، المخرجات، حالة الجاهزية، وإجراءات التعديل. إضافة القضية أيضا مختصرة ولا ترسل حقول كافية: `createCase` في الموبايل يثبت `caseTypeIds: [1]` و`defendingParty: client` وحقول `facts/legalClaims` فارغة.

الأثر: القضايا المنشأة من الموبايل ستكون ناقصة سياقيا، وبالتالي جودة AI ومطابقة الويب ستتأثر.

الأولوية: P0.

### 4.3 تدفق المستندات وOCR

الويب يحتوي صفحة Documents ونموذج إنشاء قضية من OCR واختيار مستندات قبل التحليل. الموبايل لديه شاشة Documents وOCR Review، لكن API service الحالي يظهر `fetchDocuments` فقط بدون upload/delete/download/preview endpoints واضحة داخل `ApiService`.

الفجوة: أي UI لرفع المستندات أو OCR على الموبايل إن لم يكن مربوطا فعليا بالـ Backend سيظل تجربة غير مكتملة.

الأثر: مسارات AI تعتمد على مستندات ووقائع؛ بدون upload/OCR حقيقي التطبيق لا يغطي استخدام المحامي اليومي.

الأولوية: P0.

### 4.4 تدفقات الذكاء الاصطناعي

الويب لديه 7 مسارات منفصلة وكل مسار له steps ومكونات ومخرجات مخصصة:
- مذكرة دفاع: تحليل وقائع، توليد دفوع، متطلبات نهائية، مذكرة نهائية، مع منطق إضافي للدفاعات.
- صحيفة دعوى: 7 خطوات.
- صحيفة استئناف: 6 خطوات.
- شكوى إدارية: 5 خطوات.
- تحليل حكم: 4 خطوات.
- إنذار قانوني: 3 خطوات.
- طلب تنفيذ: 3 خطوات.

الموبايل يملك Hub وRunner عام مع mapping للخطوات وSignalR. هذا جيد كبنية، لكنه لا يعني التكافؤ. الويب يعالج كل خطوة بمخرجات وواجهات متخصصة، بينما الموبايل يعتمد كثيرا على شاشة عامة؛ هذا قد يخفي نقصا في:
- تحرير حقول كل خطوة بشكل مناسب.
- عرض النتائج القانونية المنظمة.
- نسخ/تصدير/تحميل.
- مراجعة الوقائع والمستندات قبل التشغيل.
- تأكيد خصم نقاط قبل كل تشغيل.
- استئناف run محدد بنفس `runId` وسلوك snapshots مثل الويب.

الأولوية: P0/P1 حسب المسار. ابدأ بمذكرة الدفاع والصحيفة لأنها غالبا الأعلى استخداما.

### 4.5 الموكلون

الويب لديه قائمة وتفاصيل. الموبايل لديه قائمة وتفاصيل وإضافة موكل. الفجوة في العمق: ربط القضايا، إجراءات الاتصال، تفاصيل المعاملات/المستندات/التوكيلات، وتحرير/حذف أو تحديث بيانات الموكل ليست كلها واضحة كتكافؤ.

الأولوية: P1.

### 4.6 الأجندة

الويب لديه Agenda route عام وroute بتفاصيل `agenda/:id`. الموبايل يعرض الأجندة من API، لكن لا يظهر من `AppState` وجود create/update/delete للموعد أو الجلسة. هذا يجعلها read-only أو شبه read-only.

الأولوية: P1 لأن الجلسات اليومية من أهم استخدامات الموبايل.

### 4.7 العقود القانونية وأوراق المحضرين

الويب لديه:
- `/legal-contracts`
- `/legal-contracts/new`
- `/legal-contracts/:id`
- `/process-server-papers`

الموبايل يعرض شاشات داخل `more_screens.dart`، لكن API service لا يحتوي endpoints للعقود القانونية أو أوراق المحضرين. إذن الفجوة غالبا وظيفية وليست فقط UI.

الأولوية: P1 إذا كانت ضمن إطلاق الموبايل الأول، P2 إذا كان الإطلاق مركزا على القضايا وAI.

### 4.8 الإشعارات وحالات النظام

خريطة الموبايل المطلوبة تتضمن Notifications وSystem States. الكود الحالي فيه SystemStatesScreen، لكن لا توجد منظومة إشعارات واضحة. كما أن حالات offline/retry/errors ليست cross-cutting؛ أغلب `fetchLiveData` يبتلع الأخطاء ويطبع debug فقط.

الأثر: المستخدم قد يرى بيانات فارغة بدل رسالة خطأ مفهومة.

الأولوية: P1.

## 5. فجوات تقنية تؤثر على التكافؤ

### 5.1 إدارة الحالة

الويب يستخدم Redux Toolkit slices/thunks لكل نطاق: cases, clients, agenda, aiJobs, subscriptions, workflows. الموبايل يستخدم `AppState` واحد ضخم يحتوي auth، data fetching، SignalR، drafts، snapshots، CRUD جزئي.

الخطر: مع توسع الموبايل سيصعب اختبار التدفقات وعزل الأخطاء. المطلوب تقسيم state إلى repositories/services وfeature controllers أو ChangeNotifiers منفصلة.

### 5.2 API Coverage

`ApiService` في الموبايل يغطي جزءا من API فقط. غير ظاهر فيه:
- signup/verify phone/forgot/reset.
- upload/download/delete documents.
- create/update/delete agenda.
- legal contracts CRUD.
- process server papers CRUD.
- settings/profile update/password change.
- payment/subscribe actions.
- notifications.
- case update/delete/facts/defenses rich operations.

### 5.3 تخزين الجلسة

Token في الموبايل محفوظ في الذاكرة فقط عبر `_token`. عند إغلاق التطبيق، المستخدم سيحتاج تسجيل دخول جديد. لا يوجد secure storage أو refresh flow واضح.

### 5.4 الأخطاء والتحميل

`fetchLiveData` يلتقط الأخطاء ويطبعها في debug ثم يكمل. هذا مفيد لعدم كسر التطبيق، لكنه يخفي فشل البيانات عن المستخدم. المطلوب حالة `loading/error/partial/offline` لكل feature.

### 5.5 الاختبارات

الويب يحتوي اختبارات hooks/slices/routes/workflows. لم يظهر من الفحص الحالي وجود تغطية Flutter test مقابلة للتدفقات الحرجة. المطلوب اختبارات widget/unit على الأقل لـ Auth، Cases، AI Runner، Documents، Agenda.

## 6. ترتيب الأولويات المقترح

### P0: قبل أي إطلاق مستخدمين

1. Auth كامل: signup، OTP، forgot/reset، token persistence، session restore.
2. Case lifecycle: إنشاء/تعديل قضية بنفس حقول الويب، تفاصيل قضية كاملة، وقائع ومستندات وجلسات.
3. Documents/OCR: upload، OCR review، create case from OCR، ربط مستند بقضية، حالات معالجة.
4. AI workflows الأساسية: مذكرة دفاع + صحيفة دعوى بتجربة موبايل مخصصة لا Runner عام فقط.
5. AI points: تأكيد تكلفة، insufficient balance، history، منع التشغيل الخاطئ.
6. Error/offline states: رسائل مفهومة، retry، skeletons.

### P1: بعد تثبيت الأساس

1. باقي مسارات AI: appeal, admin complaint, ruling analysis, legal warning, exec request.
2. Agenda CRUD كامل.
3. Client Details كامل مع ربط القضايا والتوكيلات.
4. Legal Contracts CRUD وربط API.
5. Process Server Papers CRUD وربط API.
6. Notifications وdeep links.
7. Settings/Profile update/password/security.

### P2: تحسينات تكافؤ وتجربة

1. Guidance mobile equivalent.
2. Advanced search/filter parity.
3. Export/share لكل مخرجات AI.
4. Performance، caching، pagination، offline read cache.
5. توحيد validation schemas قدر الإمكان بين الويب والموبايل عبر contracts واضحة.

## 7. Backlog تفصيلي قابل للتحويل إلى Tasks

### Auth

- تنفيذ `signup` endpoint في `ApiService`.
- تنفيذ `verifyOtp`, `resendOtp`, `forgotPassword`, `resetPassword`.
- استخدام secure storage للتوكن وبيانات refresh.
- تحميل session عند فتح التطبيق قبل عرض Login.
- إضافة Privacy/Terms links في Signup وSettings.

### Cases

- إنشاء نموذج قضية متعدد الخطوات مطابق لحقول الويب.
- جلب case types من API بدل تثبيت `[1]`.
- دعم عميل موجود/عميل جديد.
- إضافة وتعديل الوقائع والطلبات والخصوم.
- تفاصيل القضية: tabs للمستندات، الوقائع، الجلسات، AI outputs.
- update/delete/archive إن كانت مدعومة في Backend.

### Documents/OCR

- إضافة upload endpoint مع multipart.
- عرض progress وحالة OCR.
- preview/download/delete.
- ربط المستند بقضية.
- Review extracted fields ثم create case.
- اختيار المستندات قبل AI workflow.

### AI Workflows

- فصل UI steps لكل workflow مهم بدل الاعتماد على مخرجات عامة فقط.
- بناء selected facts + selected documents بنفس منطق الويب.
- تمرير `runId` واستعادة run بدقة.
- دعم snapshots: create, rename, delete, restore, readonly previous version.
- دعم export/share/copy لكل نتيجة نهائية.
- تأكيد points قبل كل job.
- عرض SignalR status مع fallback polling.

### Agenda

- إضافة create/update/delete appointment/task.
- ربط موعد بقضية.
- فلترة يوم/أسبوع/شهر.
- شاشة تفاصيل موعد.
- إشعار قبل الجلسة.

### Clients

- تعديل وحذف موكل.
- تفاصيل كاملة: بيانات، قضايا، مستندات، توكيلات، نشاط.
- إجراءات اتصال مباشرة.
- بحث وفلاتر وpagination.

### Legal Library

- توحيد حسابات المواريث والرسوم مع الويب.
- تفاصيل الوكالات واللوائح مع بحث وفلاتر.
- ربط اللوائح بسياق AI/chat.

### Contracts and Process Server Papers

- إضافة API methods.
- list/new/details/edit/delete.
- توليد/تصدير المستندات.
- حالات تشغيل AI/processing إن وجدت.

### Subscription and Notifications

- دفع/شراء/ترقية باقة.
- سجل كامل للنقاط.
- إشعارات jobs والجلسات ونقص النقاط.
- badge وread/unread وdeep link.

## 8. الخلاصة

الفجوة الحالية كبيرة. الموبايل يغطي شكل المنتج ومساراته العامة، لكنه لا يغطي عمق الويب التشغيلي. أفضل مسار تنفيذ هو عدم محاولة نقل كل الويب مرة واحدة، بل بناء تكافؤ قوي حول الاستخدام اليومي للمحامي:

1. الدخول والحساب.
2. القضايا والموكلين.
3. المستندات وOCR.
4. مذكرة الدفاع وصحيفة الدعوى.
5. الأجندة والنقاط.

بعد ذلك يتم نقل باقي مسارات AI والعقود وأوراق المحضرين والإشعارات. بهذه الطريقة يصبح التطبيق مفيدا فعليا بسرعة، ثم يقترب تدريجيا من تكافؤ الويب بدون تضخيم شاشة عامة لا تغطي التفاصيل القانونية المطلوبة.
