# Phase 4b — Index Migration Plan

**التاريخ:** 2026-04-25
**المرجع:** PERFORMANCE_AUDIT.md — Phase 4b

## الهدف
تسريع الـ queries الحرجة بإضافة covering indexes بدون تغيير كود.

## التحليل

### الـ Models والـ Properties الفعلية:
- `Case` — `LawyerId` (Guid), `Status` (CaseStatus enum), `IsActive` (bool)
- `AiJob` — `CaseId` (Guid), `StepType` (AiStepType enum), `CreatedAt` (DateTime), `Status` (AiJobStatus enum)
- `FactAnalysis` — `CaseId` (Guid), `Created` (DateTime من BaseEntity) — **مفيش Status**
- `Defense` — `CaseId` (Guid), `Type` (DefenseType), `Created` (DateTime) — **مفيش Status**
- `FinalPrayer` — `CaseId` (Guid), `Level` (RequestLevel), `Created` (DateTime) — **مفيش Status**

### التعديل من الأوديت:
الأوديت قال `(CaseId, Status)` على FactAnalysis/Defense/FinalPrayer بس مفيش Status فيهم.
هنستخدم بدلها `(CaseId, Created)` عشان دي الـ ordering column في الـ queries.

## الخطوات

- [x] 1. إنشاء `CaseConfiguration.cs` مع indexes: `LawyerId`, `(LawyerId, Status)`
- [x] 2. تعديل `AiJob` في `AppDbContext.cs` — إضافة `(CaseId, StepType, CreatedAt)` index
- [x] 3. إضافة `(CaseId, Created)` على `FactAnalysisConfiguration.cs`
- [x] 4. إضافة `(CaseId, Type)` + `(CaseId, Created)` على `DefenseConfiguration.cs`
- [x] 5. إضافة `(CaseId, Created)` على `FinalPrayerConfiguration.cs`
- [ ] 6. `dotnet ef migrations add AddPerformanceIndexes`
- [ ] 7. Review SQL المولّد
- [ ] 8. `dotnet ef database update`
- [x] 9. تحديث PERFORMANCE_AUDIT.md

## ملاحظات
- مش هنشغل الـ migration command عشان محتاجة connection string للـ DB
- هنعمل كل الـ configuration changes ونسيب الـ migration step ليك
