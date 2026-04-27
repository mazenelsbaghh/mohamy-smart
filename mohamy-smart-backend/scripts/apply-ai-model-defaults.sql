-- ─────────────────────────────────────────────────────────────────────────────
-- Apply recommended AI model per pipeline stage.
--
-- Mapping rationale (Arabic):
--   Pro        → تحليل قانوني عميق / حكم نوعي / صياغة عالية المخاطر
--   Flash      → صياغة متوسطة / تحليل منظم / محادثة / OCR
--   Flash Lite → تصنيف / استخراج حقول ثابتة / تجميع قوالب
--
-- Safe to re-run (idempotent): updates by StepType; does not insert.
-- Usage:
--   docker exec -i mohamysmart-sqlserver-1 /opt/mssql-tools18/bin/sqlcmd \
--     -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -d Lawyer -C -N \
--     -i /path/to/apply-ai-model-defaults.sql
-- ─────────────────────────────────────────────────────────────────────────────

SET NOCOUNT ON;

DECLARE @Pro        NVARCHAR(50) = N'gemini-3.1-pro-preview';
DECLARE @Flash      NVARCHAR(50) = N'gemini-3-flash-preview';
DECLARE @FlashLite  NVARCHAR(50) = N'gemini-3.1-flash-lite-preview';
DECLARE @Admin      NVARCHAR(100) = N'apply-ai-model-defaults.sql';
DECLARE @Now        DATETIME2 = SYSUTCDATETIME();

BEGIN TRAN;

-- ── 🧠 Pro — تحليل قانوني عميق / حكم نوعي ───────────────────────────────────
UPDATE AiStageModelConfigs
   SET ModelIdentifier = @Pro, UpdatedAt = @Now, UpdatedBy = @Admin
 WHERE StepType IN (
        1,   -- FactAnalysis                    — تحليل الوقائع
        2,   -- GenerateDefenses                — توليد الدفوع
        3,   -- AnalysisDefense                 — تحليل الدفاع
        5,   -- DefenseMemoDraft                — صياغة مذكرة الدفاع
        14,  -- LawsuitLegalBasis               — السند القانوني للدعوى
        41,  -- AppealBriefReasoningAnalysis    — تحليل أسباب الحكم
        42,  -- AppealBriefGrounds              — تحديد أوجه الطعن
        44,  -- AppealBriefLegalBasis           — السند القانوني للطعن
        52,  -- AdminComplaintViolation         — تحليل المخالفة الإدارية
        61,  -- RulingAnalysisReasoning         — تحليل أسباب الحكم
        62,  -- RulingAnalysisDefectEvaluation  — تقييم عيوب الحكم
        63,  -- RulingAnalysisFeasibilityReport — تقرير جدوى الطعن
        90   -- LegalContractDraft              — صياغة مسودة العقد
   );

-- ── ⚡ Flash — صياغة متوسطة / تحليل منظم / محادثة / OCR ─────────────────────
UPDATE AiStageModelConfigs
   SET ModelIdentifier = @Flash, UpdatedAt = @Now, UpdatedBy = @Admin
 WHERE StepType IN (
        4,   -- FinalRequirements               — الطلبات الختامية
        12,  -- LawsuitSubjects                 — موضوعات الدعوى
        13,  -- LawsuitFacts                    — وقائع الدعوى
        15,  -- LawsuitRequests                 — طلبات الدعوى
        20,  -- Ocr                             — التعرف البصري
        21,  -- ClarifyFacts                    — تقييم اكتمال الوقائع
        30,  -- Chat                            — المحادثة
        43,  -- AppealBriefRequests             — صياغة طلبات الطعن
        45,  -- AppealBriefAssembly             — تجميع صحيفة الطعن
        51,  -- AdminComplaintFacts             — وقائع الشكوى
        53,  -- AdminComplaintRequests          — طلبات الشكوى
        54,  -- AdminComplaintAssembly          — تجميع الشكوى النهائية
        60,  -- RulingAnalysisOperative         — تحليل المنطوق
        70,  -- LegalWarningClassification      — تصنيف الإنذار
        71,  -- LegalWarningBodyDraft           — صياغة متن الإنذار
        81   -- ExecRequestDrafting             — صياغة الطلب التنفيذي
   );

-- ── 🏃 Flash Lite — تصنيف / استخراج بسيط / تجميع قوالب ──────────────────────
UPDATE AiStageModelConfigs
   SET ModelIdentifier = @FlashLite, UpdatedAt = @Now, UpdatedBy = @Admin
 WHERE StepType IN (
        10,  -- LawsuitCaseType                 — نوع القضية
        11,  -- LawsuitParties                  — أطراف الدعوى
        40,  -- AppealBriefJudgmentData         — استخراج بيانات الحكم
        50,  -- AdminComplaintClassification    — تصنيف الشكوى
        72,  -- LegalWarningAssembly            — تجميع الإنذار
        80,  -- ExecRequestClassification       — تصنيف الطلب التنفيذي
        82   -- ExecRequestAssembly             — تجميع العريضة
   );

COMMIT TRAN;

-- ── Report: show final mapping grouped by model ─────────────────────────────
SELECT
    ModelIdentifier,
    COUNT(*)                                 AS stage_count,
    STRING_AGG(CAST(StepType AS NVARCHAR(10)), N', ')
        WITHIN GROUP (ORDER BY StepType)     AS step_types
FROM AiStageModelConfigs
GROUP BY ModelIdentifier
ORDER BY ModelIdentifier;
