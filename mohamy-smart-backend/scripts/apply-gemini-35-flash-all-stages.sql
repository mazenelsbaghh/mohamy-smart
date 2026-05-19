-- Apply Gemini 3.5 Flash to every known AI stage configuration.
--
-- Safe to re-run (idempotent): updates existing rows by StepType and inserts
-- missing rows for known AiStepType values.
--
-- Usage with a local Docker SQL Server container:
--   docker cp mohamy-smart-backend/scripts/apply-gemini-35-flash-all-stages.sql mohamysmart-sqlserver-1:/tmp/apply-gemini-35-flash-all-stages.sql
--   docker exec -i mohamysmart-sqlserver-1 /opt/mssql-tools18/bin/sqlcmd \
--     -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -d Lawyer -C -N \
--     -i /tmp/apply-gemini-35-flash-all-stages.sql

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @ModelIdentifier NVARCHAR(50) = N'gemini-3.5-flash';
DECLARE @Admin NVARCHAR(100) = N'apply-gemini-35-flash-all-stages.sql';
DECLARE @Now DATETIME2 = SYSUTCDATETIME();

DECLARE @Stages TABLE
(
    StepType INT NOT NULL PRIMARY KEY,
    StepName NVARCHAR(100) NOT NULL
);

INSERT INTO @Stages (StepType, StepName)
VALUES
    (1,  N'FactAnalysis'),
    (2,  N'GenerateDefenses'),
    (3,  N'AnalysisDefense'),
    (4,  N'FinalRequirements'),
    (5,  N'DefenseMemoDraft'),
    (10, N'LawsuitCaseType'),
    (11, N'LawsuitParties'),
    (12, N'LawsuitSubjects'),
    (13, N'LawsuitFacts'),
    (14, N'LawsuitLegalBasis'),
    (15, N'LawsuitRequests'),
    (16, N'StatementOfClaimsDraft'),
    (20, N'Ocr'),
    (21, N'ClarifyFacts'),
    (30, N'Chat'),
    (40, N'AppealBriefJudgmentData'),
    (41, N'AppealBriefReasoningAnalysis'),
    (42, N'AppealBriefGrounds'),
    (43, N'AppealBriefRequests'),
    (44, N'AppealBriefLegalBasis'),
    (45, N'AppealBriefAssembly'),
    (50, N'AdminComplaintClassification'),
    (51, N'AdminComplaintFacts'),
    (52, N'AdminComplaintViolation'),
    (53, N'AdminComplaintRequests'),
    (54, N'AdminComplaintAssembly'),
    (60, N'RulingAnalysisOperative'),
    (61, N'RulingAnalysisReasoning'),
    (62, N'RulingAnalysisDefectEvaluation'),
    (63, N'RulingAnalysisFeasibilityReport'),
    (70, N'LegalWarningClassification'),
    (71, N'LegalWarningBodyDraft'),
    (72, N'LegalWarningAssembly'),
    (80, N'ExecRequestClassification'),
    (81, N'ExecRequestDrafting'),
    (82, N'ExecRequestAssembly'),
    (90, N'LegalContractDraft'),
    (91, N'LegalContractAnalysis'),
    (92, N'LegalContractReview');

BEGIN TRAN;

MERGE AiStageModelConfigs WITH (HOLDLOCK) AS target
USING @Stages AS source
   ON target.StepType = source.StepType
WHEN MATCHED THEN
    UPDATE SET
        ModelIdentifier = @ModelIdentifier,
        UpdatedAt = @Now,
        UpdatedBy = @Admin
WHEN NOT MATCHED BY TARGET THEN
    INSERT (StepType, ModelIdentifier, UpdatedAt, UpdatedBy)
    VALUES (source.StepType, @ModelIdentifier, @Now, @Admin);

COMMIT TRAN;

SELECT
    c.ModelIdentifier,
    COUNT(*) AS stage_count,
    STRING_AGG(CAST(c.StepType AS NVARCHAR(10)), N', ')
        WITHIN GROUP (ORDER BY c.StepType) AS step_types
FROM AiStageModelConfigs c
WHERE c.StepType IN (SELECT StepType FROM @Stages)
GROUP BY c.ModelIdentifier
ORDER BY c.ModelIdentifier;
