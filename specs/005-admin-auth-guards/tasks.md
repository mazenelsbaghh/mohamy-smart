# Implementation Tasks: Admin Dashboard Auth & Guards
> **Branch**: `005-admin-auth-guards`
> Generated via /speckit-tasks

## Dependencies

- **US1 (Admin Route Protection)**: Foundational requirement for applying `<Outlet />` guarding.
- **US2 (Public Authentication Routing)**: Can be built alongside US1.
- **US3 (Admin Role Verification)**: Directly modifies the code from US1 to compound the security logic.

---

## Phase 1: Setup
*(No additional dependencies are needed over the `react-router-dom` and Redux setup configured in Phase 3).*

---

## Phase 2: User Story 1 - Admin Route Protection
> **Goal**: Prevent unauthenticated viewing of dashboard screens.
> **Independent Test**: Directly navigating to `/lawyers` forces an immediate redirect replacing the browser history to `/auth/login`.

- [x] T001 [P] [US1] قم بإنشاء الملف `mohamy-smart-admin-dashboard/src/router/AdminRoute.tsx`. استورد `Navigate` و `Outlet` من `react-router-dom`. استورد `useSelector` من `react-redux`. قم بقراءة حالة المصادقة عبر `state.auth.isAuthenticated`. إذا كانت القيمة `false`، قم بإرجاع الكود `<Navigate to="/auth/login" replace />`، وإلا أرجع `<Outlet />`.
- [x] T002 [US1] قم بتعديل ملف `mohamy-smart-admin-dashboard/src/router/AppRouter.tsx` لدمج `AdminRoute`. قم بإنشاء مسار رئيسي `<Route element={<AdminRoute />}>` واجعل جميع الصفحات الإدارية (مثل Home, Lawyers, Subscriptions, Plans) مسارات فرعية `children` داخل هذا المسار لضمان حمايتها دفعة واحدة.

---

## Phase 3: User Story 2 - Public Authentication Routing
> **Goal**: Block authenticated users from manually rendering the login page components.
> **Independent Test**: Entering `/auth/login` while logged in pushes the user immediately back to the `/` root view.

- [x] T003 [P] [US2] قم بإنشاء الملف `mohamy-smart-admin-dashboard/src/router/PublicRoute.tsx`. باستخدام `useSelector`، تحقق من `state.auth.isAuthenticated`. إذا كانت القيمة `true`، أرجع المكون `<Navigate to="/" replace />`. إذا كانت `false`، أرجع المكون `<Outlet />`.
- [x] T004 [US2] قم بتعديل `mohamy-smart-admin-dashboard/src/router/AppRouter.tsx` مجدداً وأحط مسار تسجيل الدخول `/auth/login` داخل مسار رئيسي يعتمد على `<Route element={<PublicRoute />}>` كغلاف لحجب صفحة تسجيل الدخول عن مديري النظام المُسجلين.

---

## Phase 4: User Story 3 - Admin Role Verification
> **Goal**: Prevent tokens without direct "Admin" capabilities from loading administrative components.
> **Independent Test**: Inserting a mock state locally where the user role is `["Lawyer"]` actively bounces the session out to the login screen.

- [x] T005 [US3] قم بتحديث `mohamy-smart-admin-dashboard/src/router/AdminRoute.tsx` ليتضمن التحقق من الصلاحيات. بالإضافة إلى فحص `isAuthenticated`، اختبر المصفوفة `state.auth.user?.roles` لضمان احتوائها على السلسلة النصية `"Admin"`. في حالة غياب هذا الدور، أرجع المكون للتوجه نحو `/auth/login`. 
- [x] T006 [US3] أضف استيراد دالة الفشل `showErrorToast` من `mohamy-smart-admin-dashboard/src/utils/toastHelpers.ts` داخل مكون `AdminRoute.tsx`. متى ما تم اكتشاف نقص الصلاحيات وإجراء التوجيه الخاطئ للرسالة، استدع الدالة ومرر الرسالة `"غير مصرح لك بالدخول لهذه الصفحة"` لتنبيه المستخدم بالسبب.
