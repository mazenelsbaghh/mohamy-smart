# Plan: Restyle CaseDetails Tabs to Match DefenseMemoPage

## Objective
Make the CaseDetails page tabs (التفاصيل الأساسية, التحليل القانوني الذكي, ملخص القضية الذكي, النسخ السابقة) look identical to the DefenseMemoPage tabs (مراجعة الوقائع, التحليل القانوني, الدفوع, الطلبات, المذكرة النهائية).

## Task 2: DefenseMemoPage Breadcrumb Vertical Column + Snapshot Count
- Replace horizontal Breadcrumbs with vertical column layout
- Show clickable snapshot count badge (e.g. "3 نسخة سابقة")
- Clicking badge navigates to CaseDetails with "history" tab pre-selected
- CaseDetails now accepts `state.activeTab` to auto-switch tabs

## Files Modified
- `apps/lawyer-dashboard/src/pages/cases/CaseDetails.tsx` — tab restyling + deep-link support
- `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx` — vertical breadcrumbs + snapshot count

## Status
- [x] Task 1: Restyle CaseDetails tabs
- [x] Task 2: Vertical breadcrumbs + snapshot count
