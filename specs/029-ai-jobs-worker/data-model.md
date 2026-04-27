# Phase 1: Data Model & Contracts

**Feature**: Implement AiJobWorker Cases

## Database

No structural schema modifications to the Database. The `AiJobs` table and `AiStepType` enum integers already reside in correctly applied schemas.

## Request Mapping

**Admin Complaint**:
- `AdminComplaintClassification` -> `AdminComplaintRequestDto` -> `IAdminComplaintService.ClassifyAsync()`
- `AdminComplaintFacts` -> `AdminComplaintRequestDto` -> `IAdminComplaintService.GenerateFactsAsync()`
- `AdminComplaintViolation` -> `AdminComplaintRequestDto` -> `IAdminComplaintService.AnalyzeViolationsAsync()`
- `AdminComplaintRequests` -> `AdminComplaintRequestDto` -> `IAdminComplaintService.GenerateRequestsAsync()`
- `AdminComplaintAssembly` -> `AdminComplaintRequestDto` -> `IAdminComplaintService.AssembleComplaintAsync()`

**Ruling Analysis**:
- `RulingAnalysisOperative` -> `RulingAnalysisRequestDto` -> `IRulingAnalysisService.AnalyzeVerdictAsync()`
- `RulingAnalysisReasoning` -> `RulingAnalysisRequestDto` -> `IRulingAnalysisService.AnalyzeReasonsAsync()`
- `RulingAnalysisDefectEvaluation` -> `RulingAnalysisRequestDto` -> `IRulingAnalysisService.EvaluateDefectsAsync()`
- `RulingAnalysisFeasibilityReport` -> `RulingAnalysisRequestDto` -> `IRulingAnalysisService.GenerateFeasibilityReportAsync()`

**Legal Warning**:
- `LegalWarningClassification` -> `LegalWarningRequestDto` -> `ILegalWarningService.ClassifyWarningAsync()`
- `LegalWarningBodyDraft` -> `LegalWarningRequestDto` -> `ILegalWarningService.DraftWarningBodyAsync()`
- `LegalWarningAssembly` -> `LegalWarningRequestDto` -> `ILegalWarningService.AssembleWarningAsync()`

**Exec Request**:
- `ExecRequestClassification` -> `ExecRequestGeneralDto` -> `IExecRequestService.ClassifyExecAsync()`
- `ExecRequestDrafting` -> `ExecRequestGeneralDto` -> `IExecRequestService.DraftExecAsync()`
- `ExecRequestAssembly` -> `ExecRequestGeneralDto` -> `IExecRequestService.AssembleExecAsync()`

*(Note: Method names and exact DTO names will be verified during Task execution using language IDE insights)*
