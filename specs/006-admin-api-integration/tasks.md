# Implementation Tasks: Admin Dashboard API Integration
> **Branch**: `006-admin-api-integration`
> Generated via /speckit-tasks

## Dependencies

- **US1 (Dashboard Analytics)**: Independent.
- **US2 (Lawyers Auditing)**: Independent.
- **US3 (Subscriptions Oversight)**: Independent.
- **US4 (Plans Governance)**: Independent.

> **Note to LLM Implementer**: All these tasks inherently depend on existing Redux Slices built in Phase 3. The objective here is strictly bridging the `mohamy-smart-admin-dashboard/src/pages` view layer to these existing `useDispatch` thunks.

---

## Phase 1: Setup
*(No tasks required. Environment configured from previous phases.)*

---

## Phase 2: User Story 1 - Real-time Dashboard Analytics
> **Goal**: Replace static metrics in the home view with live aggregate endpoints.
> **Independent Test**: Landing on `/admin` resolves accurate DB values matching `GET /api/platform/stats`.

- [X] T001 [P] [US1] افتح ملف الواجهة الرئيسية للإحصائيات `mohamy-smart-admin-dashboard/src/pages/home/Home.tsx`. استورد `useDispatch` و `useSelector` من `react-redux`.
- [X] T002 [US1] استورد الـ Thunk المناسب `fetchLawyersReport` و `fetchSubscriptionsReport` من شريحة `reportsSlice`. قم بإضافة `useEffect` ليتم استدعاء `dispatch(fetchLawyersReport())` و `dispatch(fetchSubscriptionsReport())` عند التحميل الأولي للمكون (مصفوفة تبعيات فارغة `[]`).
- [X] T003 [US1] اربط حالة التحميل `isLoading` المستردة من Redux لإظهار `Spinner` أثناء التحميل. قم باستبدال الأرقام الثابتة الوهمية في (Lawyers Count, Revenue, etc) بالقيم الآتية من `state.reports`.

---

## Phase 3: User Story 2 - Lawyer Directory & Auditing
> **Goal**: Interface for managing lawyers combined with real paginated HTTP calls.
> **Independent Test**: The pagination UI dynamically fetches chunked pages from the server. Action buttons (like Suspend) alter the target in DB and optimisticly update UI.

- [X] T004 [P] [US2] افتح المكون `mohamy-smart-admin-dashboard/src/pages/lawyers/Lawyers.tsx`. حدد حالة صفحات محلية `const [page, setPage] = useState(1)`.
- [X] T005 [US2] استورد `fetchLawyers` من شريحة المحامين واعمد لتشغيلها داخل `useEffect` يضع `[page]` كمراقب للتحديثات، بحيث عند تغير رقم الصفحة يُجلب المحتوى المقابل للـ `page`.
- [X] T006 [US2] نظّف المكون من بيانات المصدر الثابتة (`mock data`) ومرر `state.lawyers.list` إلى الجدول لطباعة الصفوف. اربط زر تعديل الصفحات (Pagination Component من `@heroui`) بـ `onChange={setPage}`.
- [X] T007 [US2] في نفس الملف، قم بربط أزرار التحكم في حالة المحامي (Validation/Suspension) بدالة تقوم بإرسال `dispatch(updateLawyerStatus({ id, isActive }))`. واحرص على عرض التنبيهات باستخدام دوال `showSuccessToast` و `showErrorToast`.

---

## Phase 4: User Story 3 - Financial & Subscriptions Oversight
> **Goal**: Render chronological transaction ledgers dynamically.
> **Independent Test**: Changing the date picker queries the API with bounds and redraws the transaction table instantly.

- [X] T008 [P] [US3] افتح `mohamy-smart-admin-dashboard/src/pages/subscriptions/SubscriptionReports.tsx`. استدع `fetchSubscriptionsReport` داخل المكون باستخدام `useEffect` مقترن بمكونات اختيار تواريخ إذا وجدت وبخلافه يُطلب الجميع.
- [X] T009 [US3] قدم مخرجات `state.subscriptions.records` داخل مكون جداول العرض، مع استخدام مؤشر تحميل قياسي أثناء أوقات جلب الطلبات (Resolving Promise).

---

## Phase 5: User Story 4 - System Plans Governance
> **Goal**: Interface to read and toggle Active states and pricing on default Subscriptions Tiers.
> **Independent Test**: Altering a plan form submits cleanly to `/api/plans/{id}`.

- [X] T010 [P] [US4] افتح المكون المسؤول عن إدارة الباقات `mohamy-smart-admin-dashboard/src/pages/plansAndReview/PlansAndReview.tsx`. استخدم `useEffect` لاستدعاء عرض الباقات الموجودة باستخدام الـ Thunk المخصص `fetchPlans`.
- [X] T011 [US4] قم ببرمجة نماذج التعديل الموجودة ضمن البطاقات (أو العوائم Modals) لتنفيذ نداء التحديث `dispatch(updatePlan(formState))` عند موافقة الإدارة (Submit). تأكد أنك تظهر التنبيه بالنجاح عند الانتهاء دون عمل Refresh للصفحة.
