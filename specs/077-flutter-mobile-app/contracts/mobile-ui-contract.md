# Mobile UI Contract: Mohamy Smart Mobile App

## App Launch Contract

- Launch displays splash or onboarding before protected content.
- Demo login accepts an obviously non-secret local credential path for tests.
- Authenticated users land on Home Dashboard.
- Logout returns to Login and hides protected content.

## Navigation Contract

Bottom navigation exposes:
- الرئيسية
- القضايا
- الجلسات
- المساعد
- المزيد

More screen exposes:
- العملاء
- المستندات
- المكتبة القانونية
- العقود
- أوراق المحضرين
- الاشتراك والنقاط
- الإعدادات

## Theme Contract

- Root app is Arabic RTL.
- Light mode uses `#F0EEE7`, `#FFFEFA`, `#1B1B1B`, `#EF950A`.
- Dark mode uses `#0A0A0A`, `#1D1D1D`, `#F7F2E8`, `#EF950A`.
- Theme toggling updates all protected screens without restart.

## Case Search Contract

- Search input placeholder: `ابحث برقم القضية أو اسم العميل`.
- Matching by case number, title, client name, court, and type.
- Empty query shows all cases.
- No matches show `لا توجد نتائج مطابقة`.

## Add Case Validation Contract

Required fields:
- رقم القضية
- اسم العميل
- المحكمة
- نوع القضية

Submitting empty fields must show Arabic validation under each missing field and must not add a case.

## AI Workflow Contract

- Workflow cards show title, description, point cost, and status action.
- Insufficient balance blocks start action before point deduction.
- Running state shows progress and explanatory text.
- Completed state shows output preview and export/copy actions.

## Test Contract

Automated tests must verify:
- App launches and login reaches Home Dashboard.
- Bottom navigation reaches Cases and Agenda.
- Case search filters matching demo data and shows no-results text.
- Add Case submit with empty required fields shows Arabic validation.

