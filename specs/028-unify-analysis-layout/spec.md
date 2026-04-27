# Feature Specification: توحيد صفحات التحليل القانوني

**Feature Branch**: `028-unify-analysis-layout`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: جميع صفحات مسارات التحليل القانوني (الإنذار الرسمي، تحليل الحكم الجنائي، الشكوى الإدارية، الطلب التنفيذي، صحيفة الطعن) يجب أن تنتقل إلى مجلد `cases/subPagesCases/analysis/` وتتوحد بصريًا وتقنيًا لتشبه مذكرة الدفاع وصحيفة الدعوى تمامًا — باستخدام: (1) نفس المكونات المشتركة (AnalysisWorkflowShell, CaseHeaderBanner, CustomCard, SubTitle)، (2) نفس الـ AI Jobs queue + polling pattern بدلًا من direct API calls، (3) `SmartAnalysisLoader` بين كل خطوة وأخرى، (4) عرض مخرجات مهيكل (chips/banners/lists) بدلًا من raw JSON.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — تجربة موحدة عبر جميع المسارات (Priority: P1)

المحامي يفتح أي مسار تحليلي (إنذار / تحليل حكم / شكوى إدارية) ويجد نفس تخطيط مذكرة الدفاع بالضبط: رأس القضية في الأعلى، Stepper جانبي يظهر المراحل ويسمح بالتنقل بين المكتملة، والمحتوى النشط في عمودين مع sidebar ثابت يحتوي على CTA وعداد.

**Why this priority**: التوحيد البصري يقلل الـ cognitive load للمحامي ويجعل كل المسارات تبدو وكأنها نظام واحد متكامل.

**Independent Test**: فتح صفحة الإنذار الرسمي وصفحة تحليل الحكم ومقارنتهما بصفحة مذكرة الدفاع — يجب أن يكون التخطيط والمكونات والتفاعل متطابقة تمامًا.

**Acceptance Scenarios**:

1. **Given** المحامي في صفحة الإنذار الرسمي, **When** يفتح الصفحة, **Then** يرى CaseHeaderBanner + AnalysisWorkflowShell + grid ثلاثية مع sticky sidebar، ولا يرى Card/CardBody من HeroUI أو الـ stepper القديم (rounded-full).
2. **Given** المحامي أكمل مرحلة, **When** يضغط على مرحلة سابقة في الـ stepper, **Then** يتنقل إليها بدون إعادة تحميل.
3. **Given** المحامي في مرحلة لم تُنفَّذ بعد, **When** يشاهد المحتوى, **Then** يرى حالة "جاهز للتشغيل" مع زر تشغيل في الـ sidebar.

---

### User Story 2 — نقل الصفحات إلى التسلسل الصحيح (Priority: P1)

جميع صفحات المسارات التحليلية تنتقل من مجلداتها المتفرقة (`/legalWarning`, `/rulingAnalysis`, `/adminComplaint`, `/execRequest`, `/appealBrief`) إلى داخل `cases/subPagesCases/analysis/` كما هو الحال مع مذكرة الدفاع وصحيفة الدعوى.

**Why this priority**: التنظيم الهيكلي يجعل المشروع أسهل في الصيانة ويعكس العلاقة المنطقية — كل المسارات تنبع من قضية محددة.

**Independent Test**: مسار `cases/:id/document-selection/legal-warning` يحمّل الـ component من المسار الجديد بدون أي خطأ.

**Acceptance Scenarios**:

1. **Given** المطور يفتح `cases/subPagesCases/analysis/`, **When** يتصفح المجلد, **Then** يجد جميع المسارات السبعة (defenseMemo, preparingStatementOfClaims, appealBrief, adminComplaint, rulingAnalysis, legalWarning, execRequest) كل منها في مجلد فرعي منظم بنفس البنية.
2. **Given** الـ router يحمّل أي مسار, **When** يفتح `/cases/:id/document-selection/legal-warning`, **Then** يحمّل الصفحة من المسار الجديد بدون 404 أو أخطاء import.

---

### User Story 3 — Shared Workflow Shell Component للمسارات البسيطة (Priority: P2)

المسارات البسيطة (legalWarning, rulingAnalysis, adminComplaint) التي تتبع نمط "مرحلة واحدة → تشغيل → نتيجة" تستخدم `AnalysisWorkflowShell` و`CaseHeaderBanner` بدلًا من الـ Card القديم، مع تقسيم كل مرحلة إلى component منفصل في `/steps/`.

**Why this priority**: التوحيد الكامل مع التقسيم إلى components يتيح إعادة الاستخدام وسهولة الصيانة مستقبلًا.

**Independent Test**: فتح صفحة تحليل الحكم الجنائي وإكمال المرحلة الأولى — الـ UI يستخدم grid ثلاثي مع sticky sidebar بدون أي Card/Spinner من HeroUI.

**Acceptance Scenarios**:

1. **Given** مسار تحليل الحكم, **When** لم يبدأ بعد, **Then** يرى المحامي start screen بـ `CustomCard` + `SubTitle` + sticky sidebar، لا `Card` من HeroUI.
2. **Given** مسار الإنذار, **When** يكمل مرحلة, **Then** يظهر محتوى المرحلة في layout ثلاثي الأعمدة مع sidebar يحوي زر "الذهاب للمرحلة التالية".

---

### User Story 4 — AI Jobs Queue + SmartAnalysisLoader (Priority: P0 — شرط لكل ما بعده)

عندما يضغط المحامي زر المرحلة في أي مسار، ينتقل فورًا إلى المرحلة التالية ويرى `SmartAnalysisLoader` أثناء معالجة الـ AI — لا ينتظر على الصفحة الحالية حتى تنتهي المعالجة. هذا يُوحِّد التجربة مع مذكرة الدفاع وصحيفة الدعوى تمامًا.

**Why this priority**: P0 لأنه شرط معماري — بدونه لا يمكن تنفيذ باقي الـ user stories بشكل صحيح. الـ Redux slices والـ step components كلها ستُبنى على هذا الـ pattern.

**Independent Test**: الضغط على "تشغيل" في Step 1 من الإنذار الرسمي — يجب أن يُنتقل فورًا إلى Step 2 وتظهر فيه `SmartAnalysisLoader` بينما الـ AI job في حالة Queued/Processing.

**Acceptance Scenarios**:

1. **Given** المحامي في Step 1 ويضغط "تشغيل", **When** يُرسل الـ AI job, **Then** ينتقل فورًا لـ Step 2 ويرى `SmartAnalysisLoader` — لا ينتظر على Step 1.
2. **Given** الـ AI job في حالة `Completed`, **When** تُكتشف النتيجة في `resultJson`, **Then** يختفي الـ loader وتظهر النتائج المهيكلة في نفس الصفحة.
3. **Given** الـ AI job في حالة `Failed`, **When** يرى المحامي الخطأ, **Then** يظهر error banner واضح مع زر "إعادة المحاولة" في الـ sidebar.
4. **Given** المحامي يُعيد تحميل الصفحة, **When** كان الـ workflow قيد التنفيذ, **Then** يُستعاد الـ job status تلقائيًا عبر `thunkGetAllAiJobs` ويعاد المحامي للمرحلة الصحيحة.

---

### User Story 5 — تظبيط عرض مخرجات المراحل (Output Mapping) (Priority: P1)

عندما تُكمل أي مرحلة في أي مسار وترجع نتيجة من الـ AI، يُعرض المحتوى بشكل مهيكل ومقروء بدلًا من عرضه كـ raw JSON أو نص مسطوح غير منسق. كل حقل في الـ JSON له طريقة عرض محددة تناسب طبيعته: النصوص الطويلة في كروت، القوائم بأرقام أو نقاط، الحالات الثنائية كـ banners ملونة، الأرقام كـ metrics بارزة. المسارات المشمولة: **الإنذار الرسمي، تحليل الحكم الجنائي، الشكوى الإدارية، صحيفة الطعن، الطلب التنفيذي**.

**Why this priority**: عرض raw JSON يجعل التطبيق يبدو غير مكتمل ويُصعّب على المحامي قراءة النتائج واتخاذ القرار.

**Independent Test**: تشغيل أي مرحلة في الإنذار الرسمي — يجب أن تظهر النتيجة في كروت وقوائم منسقة، لا `{"key": "value"}` أو `whitespace-pre-wrap` مسطوح.

**Acceptance Scenarios**:

1. **Given** مرحلة التصنيف في الإنذار أنتجت `warningType` و`legalBasis` و`obligationDetails`, **When** تُعرض النتيجة, **Then** يُظهر `warningType` كـ chip ملوّن، و`legalBasis` في كرت منفصل، و`obligationDetails` في نص منسق.
2. **Given** مرحلة تحليل المنطوق في تحليل الحكم أنتجت مصفوفة `verdictPoints`, **When** تُعرض النتيجة, **Then** تظهر كقائمة مرقمة مع أرقام بارزة، لا كـ JSON.stringify.
3. **Given** أي مرحلة في صحيفة الطعن أنتجت نتيجة تحليل, **When** تُعرض, **Then** لا يوجد أي `pre` أو `JSON.stringify` مرئي للمستخدم النهائي.
4. **Given** حقل boolean مثل `isServiceRequired` أو `isAppealViable`, **When** يُعرض, **Then** يظهر كـ banner أخضر أو رمادي مع نص واضح، لا `true/false` كنص.

---

### Edge Cases

- ماذا يحدث إذا فُقدت بيانات القضية (caseId غير موجود)؟ → يُعرض Loader ثم إعادة توجيه أو رسالة خطأ.
- ماذا يحدث إذا كان الـ workflow موجودًا مسبقًا عند فتح الصفحة؟ → يُستعاد الـ state وتُعرض المرحلة الصحيحة.
- ماذا يحدث إذا فشل الـ step؟ → يُعرض error banner واضح مع إمكانية إعادة المحاولة.
- هل يتأثر الـ routing الحالي؟ → لا، نفس الـ routes تعمل لكن imports من مسار جديد.

---

## Requirements *(mandatory)*

### Functional Requirements

**نقل الملفات (FR-001 → FR-005)**:

- **FR-001**: يجب نقل `AppealBriefPage` ومجلد `steps/` الخاص به من `pages/appealBrief/` إلى `cases/subPagesCases/analysis/appealBrief/`.
- **FR-002**: يجب نقل `AdminComplaintPage` ومجلد `steps/` من `pages/adminComplaint/` إلى `cases/subPagesCases/analysis/adminComplaint/`.
- **FR-003**: يجب نقل `RulingAnalysisPage` من `pages/rulingAnalysis/` إلى `cases/subPagesCases/analysis/rulingAnalysis/` مع تقسيمه إلى steps منفصلة.
- **FR-004**: يجب نقل `LegalWarningPage` من `pages/legalWarning/` إلى `cases/subPagesCases/analysis/legalWarning/` مع تقسيمه إلى steps منفصلة.
- **FR-005**: يجب نقل `ExecRequestPage` ومجلد `steps/` من `pages/execRequest/` إلى `cases/subPagesCases/analysis/execRequest/`.

**توحيد الشكل (FR-006 → FR-010)**:

- **FR-006**: `LegalWarningPage` يجب أن يستخدم `AnalysisWorkflowShell` بدلًا من الـ stepper القديم (rounded-full chips)، و`CaseHeaderBanner`، و`Container`، و`CustomCard`.
- **FR-007**: `RulingAnalysisPage` يجب أن يستخدم نفس المكونات المشتركة ونفس تخطيط مذكرة الدفاع.
- **FR-008**: `AdminComplaintPage` يجب أن يوحَّد بنفس الطريقة إذا لم يكن موحدًا بالفعل.
- **FR-009**: كل صفحة يجب أن تتلقى `caseId` من الـ route params وتجلب `singleCase` لعرض `CaseHeaderBanner`.
- **FR-010**: كل مرحلة تحتوي على محتوى لم يُنفَّذ بعد تعرض layout ثلاثي (2/3 محتوى + 1/3 sticky sidebar مع زر CTA).

**الـ Router (FR-011)**:

- **FR-011**: يجب تحديث `AppRouter.tsx` لاستيراد الـ components من مساراتها الجديدة مع الحفاظ على نفس الـ route paths.

**تظبيط Output Mapping لكل مسار (FR-012 → FR-017)**:

> **ملاحظة**: صحيفة الدعوى (`preparingStatementOfClaims`) ومذكرة الدفاع (`defenseMemoPage`) مظبوطتان بالفعل ومستثنيتان.

- **FR-012 — الإنذار الرسمي (LegalWarning)**:
  - **المرحلة 1 (تصنيف وتحليل)**: يُعرض `warningType` كـ chip ملوّن، `obligationDetails` في كرت، `legalBasis` (النص + النوع) في كرت منفصل، `recommendedAction` كـ banner مميز.
  - **المرحلة 2 (صياغة المتن)**: يُعرض `warningBody` كنص منسق في كرت بحجم كبير مع إمكانية التعديل.
  - **المرحلة 3 (الإنذار النهائي)**: يُعرض `documentText` كوثيقة رسمية مع تمييز placeholders بالأصفر.

- **FR-013 — تحليل الحكم الجنائي (RulingAnalysis)**:
  - **المرحلة 1 (تحليل المنطوق)**: يُعرض `verdictSummary` في كرت، `verdictPoints` كقائمة مرقمة، `charges` كـ chips.
  - **المرحلة 2 (تحليل الأسباب)**: يُعرض `reasoningPoints` كقائمة مرقمة، `keyFindings` في كروت.
  - **المرحلة 3 (تقييم العيوب)**: يُعرض `defects` كقائمة مع درجة خطورة لكل عيب (chip ملوّن حسب الأهمية).
  - **المرحلة 4 (جدوى الطعن)**: يُعرض `isAppealViable` كـ banner أخضر/أحمر بارز، `appealStrength` كـ progress indicator، `recommendedGrounds` كقائمة.

- **FR-014 — الشكوى الإدارية (AdminComplaint)**:
  - **المرحلة 1 (التصنيف)**: يُعرض `complaintType` كـ chip، `targetAuthority` في كرت، `legalBasis` في كرت.
  - **المرحلة 2–4 (حسب بنية المسار)**: كل حقل نصي طويل في كرت، كل قائمة كـ numbered list، كل boolean كـ banner.
  - **المرحلة النهائية**: يُعرض `documentText` كوثيقة RTL منسقة مع تمييز placeholders.

- **FR-015 — صحيفة الطعن بالنقض (AppealBrief)**:
  - المراحل 1–5 تستخدم بالفعل `renderArray` وعرض هيكلي جيد — يُراجَع كل مرحلة ويُتأكد من عدم وجود `JSON.stringify` مرئي للمستخدم في أي حالة output.
  - إذا وُجدت مرحلة تعرض `pre + JSON.stringify` كـ fallback، تُستبدل بـ `renderArray` أو عرض مهيكل مناسب.

- **FR-016 — الطلب التنفيذي (ExecRequest)**:
  - المراحل الثلاث مظبوطة بالفعل (ExecStep1, ExecStep2, ExecStep3) — تُراجَع بعد النقل للتأكد من عدم حدوث regression.

- **FR-017 — قاعدة عامة لجميع المسارات**:
  - لا يجوز ظهور `JSON.stringify` أو `pre` tag أو `whitespace-pre-wrap` مع raw object في أي حالة output للمستخدم النهائي.
  - كل حقل boolean → banner ملوّن.
  - كل array من strings → numbered list مع كروت.
  - كل string طويل (>100 حرف) → كرت منفصل مع label.
  - كل رقم مهم → metric بارز في الـ sidebar.

### Key Entities

- **AnalysisPage**: صفحة مسار تحليلي — تحتوي على workflowId + currentStep + stepsOutputs + loading/error + CaseHeaderBanner + AnalysisWorkflowShell.
- **AnalysisStep**: component مرحلة منفصل — يقرأ الـ state مباشرة من Redux، يعرض نتيجة أو استمارة إدخال، يحتوي على زر تشغيل/تعديل في الـ sidebar.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: كل صفحة من الصفحات السبع تستخدم `AnalysisWorkflowShell` كـ stepper — لا يوجد أي استخدام لـ `rounded-full` stepper أو `Card`/`CardBody` من HeroUI في أي صفحة مسار.
- **SC-002**: جميع الملفات المتعلقة بالمسارات التحليلية موجودة تحت `cases/subPagesCases/analysis/` — لا يوجد مسار تحليلي خارج هذا المجلد.
- **SC-003**: المحامي يكمل أي مسار (إنذار / تحليل / شكوى) بنفس عدد الضغطات وبنفس التجربة البصرية لمذكرة الدفاع.
- **SC-004**: الـ router يحمّل جميع الصفحات بدون أخطاء TypeScript أو broken imports بعد النقل.
- **SC-005**: كل صفحة تعرض `CaseHeaderBanner` مع بيانات القضية الصحيحة (العنوان، الحالة).
- **SC-006**: لا يظهر raw JSON أو `{"key": "value"}` أو `pre` tag في أي نتيجة مرحلة مرئية للمحامي — كل حقل له طريقة عرض بصرية واضحة (chip / banner / list / metric).
- **SC-007**: مكونات عرض النتائج تجتاز "اختبار التصميم" — أي شخص يرى الواجهة لا يشعر أنها مخرج آلي أو template جاهز، بل تصميم متعمد ومناسب لتطبيق قانوني احترافي.
- **SC-008**: الضغط على زر "تشغيل" في أي step ينقل المحامي فورًا للـ step التالي ويعرض `SmartAnalysisLoader` — لا يوجد blocking wait على نفس الصفحة في أي مسار.

---

## Design Quality Requirements

> هذا القسم يُحدد المعايير البصرية والتفاعلية التي يجب أن تلتزم بها مكونات عرض المخرجات (output rendering components) في جميع المسارات. الهدف هو تصميم يبدو **متعمدًا ومميزًا** لا generic أو "AI slop".

### المبادئ البصرية

**الألوان والتباين**:
- استخدام النظام اللوني الموجود بالفعل (`--main-color` البرتقالي + درجات الرمادي) بشكل متسق.
- الـ chips والـ banners تستخدم ألوان مناسبة للحالة: أخضر للإيجابي، رمادي للمحايد، برتقالي للتحذير، أحمر للخطر.
- تجنب الرمادي النقي على الخلفية الملونة — استخدام درجة من لون الخلفية بدلًا منه.
- لا `#000` أو `#fff` خالصة — دائمًا مع تدرج خفيف.

**الطباعة والنص**:
- التسلسل الهرمي واضح: `label` صغير خفيف → `value` كبير عريض.
- النصوص القانونية الطويلة: `leading-[2.2]` مع خط Tajawal لراحة القراءة العربية.
- الـ chips والـ labels تستخدم `text-xs font-bold tracking-wider` للتمييز البصري.

**التخطيط والفراغ**:
- تنويع المسافات — ليس نفس الـ padding في كل مكان.
- الـ sticky sidebar يحتوي على indicator بارز (عداد / حالة) + CTA رئيسي واضح + CTA ثانوي `variant="bordered"`.
- كل كرت نتيجة يحتوي على `label` بـ `text-xs font-bold text-gray-400` في الأعلى ثم القيمة.

**التفاصيل البصرية**:
- الـ chips: `rounded-full px-4 py-1.5 text-sm font-bold` — ليست مجرد `badge` مسطح.
- الـ banners: `rounded-[22px] px-5 py-4` مع أيقونة + نص + لون خلفية مناسب.
- الـ numbered list items: كل عنصر في كرت فرعي مع رقم دائري `w-6 h-6 rounded-full` باللون المميز.
- الـ sidebar indicator: رقم/حالة بارزة + `div` فاصل + نص وصفي صغير.

### الأنماط المحظورة (Anti-patterns)

- **لا** لـ `Card`/`CardBody` من HeroUI كـ wrapper رئيسي — استخدام `CustomCard` فقط.
- **لا** لـ `Spinner` من HeroUI — استخدام `div` دوّار مخصص `border-t-transparent animate-spin`.
- **لا** لبطاقات متطابقة بنفس الحجم بالضبط في grid — تنويع الأحجام يعطي إيقاعًا بصريًا.
- **لا** لـ glassmorphism أو `backdrop-blur` — تجنب الموضة البصرية التي تبدو "AI مولودة".
- **لا** لـ gradient text على العناوين — يبدو ديكورًا لا معنى له.
- **لا** لتكرار نفس المعلومات — label أعلى الكرت كافٍ، لا حاجة لتكراره في الـ heading.
- **لا** لجعل كل button أساسيًا (primary) — تسلسل هرمي واضح: primary → bordered → ghost.
- **لا** لعرض `true` / `false` كنص — دائمًا banner أو أيقونة.

### الحالات التفاعلية

- **حالة التحميل (pending)**: spinner مخصص دوّار في زر الـ sidebar، مع تعطيل الزر وتغيير نصه.
- **حالة النجاح**: يظهر المحتوى مع animation خفيفة (`opacity-0 → opacity-100` + `translateY` خفيف).
- **حالة التعديل (editMode)**: تنتقل الصفحة لـ `Textarea` في الـ grid الرئيسي مع تحذير برتقالي واضح بأن التعديل يحذف المراحل التالية.
- **حالة الخطأ**: banner أحمر/برتقالي في الأعلى مع إمكانية إعادة المحاولة.

---

## Assumptions

- **التحول المعماري الكبير**: جميع المسارات ستتخلى عن Direct API calls وتتحول لـ **AI Jobs queue + polling** — نفس pattern مذكرة الدفاع وصحيفة الدعوى تمامًا.
- **Redux slices القديمة** (`legalWarning`, `rulingAnalysis`, `adminComplaint`, `execRequest`) ستُستبدل بـ slices جديدة تُخزّن النتائج بعد hydration من `resultJson`.
- **`AiStepType` enum** في `aiJobsSlice.ts` يحتاج إضافة step types جديدة لكل مسار — يلزم تنسيق مع Backend لقبولها.
- **`ExecRequestPage`** وخطواته التي بُنيت مؤخرًا بـ direct API ستُعاد كتابتها بـ AI Jobs pattern أيضًا.
- **`AppealBriefPage`** يُراجع: إذا كان يستخدم AI Jobs بالفعل يُحافظ عليه، إذا لا يُحوَّل أيضًا.
- صحيفة الدعوى (`preparingStatementOfClaims`) ومذكرة الدفاع (`defenseMemoPage`) **مستثنيتان تمامًا** من أي تغيير — هما المرجع المعماري والبصري.
- الـ step component template الصحيح هو: **`LawsuitFacts.tsx`** و**`FactsReview.tsx`** — لا ExecStep.
- الـ `SmartAnalysisLoader` يُعرض تلقائيًا عند `job.status === 'Queued' || 'Processing'` أو `status === 'Completed' && !result`.
- الـ route paths تبقى كما هي بعد النقل.
- الأولوية: التوحيد المعماري (AI Jobs) أولًا ← ثم التوحيد البصري ← ثم output mapping.
