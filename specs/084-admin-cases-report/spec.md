# Feature Specification: Admin Cases Stats Report and Excel Export

**Feature Branch**: `084-admin-cases-report`  
**Created**: 2026-06-09  
**Status**: Draft  
**Input**: User description: "عايز من الادمن اننا نشوف فيه كام واحد قضيه و انزل شيت اكسل فيه كام واحد عمل قضيه و عددلهم و رقمهم و عمل كام خطوه منهم و كام نسخه منهم"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Case and Workflow Stats in Admin Panel (Priority: P1)

As an Admin, when I navigate to the Lawyers Management page, I want to see an "إحصائيات القضايا" (Cases Statistics) view/table displaying a list of lawyers who created cases, along with their names, phone numbers, case counts, completed workflow steps, and case snapshot versions, so that I can easily monitor platform utilization.

**Why this priority**: It is the baseline view requested by the admin to visualize the data.

**Independent Test**:
- Log in as Admin.
- Navigate to "إدارة المحامين" (Lawyers Management).
- Click on the "إحصائيات القضايا" tab or toggle.
- **Result**: The table displays a list of lawyers with:
  - Name (الاسم)
  - Phone Number (رقم الهاتف)
  - Number of Cases (عدد القضايا)
  - Completed AI Steps (الخطوات المنفذة)
  - Versions/Snapshots (عدد النسخ/النسخ الاحتياطية)

---

### User Story 2 - Export Case Stats to Excel Sheet (Priority: P1)

As an Admin viewing the Cases Statistics report, I want to click a button to download the entire dataset as an Excel file (`lawyers-cases-report.xlsx`) containing the lawyer name, phone number, case count, completed AI steps, and workflow versions, so that I can share or analyze it.

**Why this priority**: Directly requested by the user ("انزل شيت اكسل فيه...").

**Independent Test**:
- Log in as Admin.
- Go to "إدارة المحامين" -> "إحصائيات القضايا".
- Click "تحميل التقرير" (Download Report) Excel button.
- **Result**: An Excel spreadsheet downloads containing all lawyers, their case counts, phone numbers, completed steps, and snapshot counts.

---

## Edge Cases

- **Lawyer has 0 cases**: Should still appear in the report if they are a registered lawyer, with `0` for cases, steps, and versions.
- **Lawyer has no phone number**: The Excel sheet and table should show a dash `"-"` or be blank without throwing errors.
- **Excel download size**: The download must fetch all records (using `pageSize: 1000` or unpaginated query) to ensure the Excel sheet contains all lawyers, not just the active page.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Implement a C# DTO `LawyerCasesStatsDto` containing:
  - `LawyerId` (Guid)
  - `FullName` (string)
  - `PhoneNumber` (string?)
  - `CasesCount` (int)
  - `CompletedStepsCount` (int)
  - `WorkflowVersionsCount` (int)
- **FR-002**: Implement a new method in `IAdminReportService` and `AdminReportService` called `GetLawyersCasesStatsAsync(int pageNumber, int pageSize, string? search, CancellationToken cancellationToken)` that queries lawyers, joins their case counts, completed steps (`AiJob` with `Completed` status), and workflow versions (`WorkflowSnapshot`), and returns paginated data.
- **FR-003**: Expose this service in `AdminReportController` at `GET /api/v1/admin/reports/lawyers-cases-stats` (authorized for Admin role).
- **FR-004**: Add a subpage/tab in `apps/admin-dashboard/src/pages/lawyers/Lawyers.tsx` to toggle between "إدارة الحسابات" (Accounts Management) and "إحصائيات القضايا" (Cases Statistics).
- **FR-005**: Add an Excel export button using client-side `xlsx` library to download the full cases stats report as `.xlsx` file.

### Key Entities

- **ApplicationUser/Lawyer**: To get Name and Phone Number.
- **Case**: To count cases.
- **AiJob**: To count completed steps.
- **WorkflowSnapshot**: To count versions/copies.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can switch to "إحصائيات القضايا" view in under 1 second.
- **SC-002**: Excel download exports 100% of lawyers with accurate cases, steps, and snapshot counts in `.xlsx` format.
