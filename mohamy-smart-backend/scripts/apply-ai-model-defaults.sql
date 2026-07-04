-- Apply recommended AI model per pipeline stage by business/legal importance.
--
-- Mapping rationale:
--   Gemini 3.5 Flash -> highest priority: search-backed legal reasoning and
--                       current-law validation only.
--   Flash 3          -> medium priority: drafting, support analysis, chat,
--                       OCR and fact clarification.
--   Flash Lite 3.1   -> low priority: simple classification and fixed-field
--                       extraction.
--
-- Safe to re-run (idempotent): updates by StepType and inserts missing rows.
-- Usage with the production SQL Server container:
--   docker cp mohamy-smart-backend/scripts/apply-ai-model-defaults.sql <sql-container>:/tmp/apply-ai-model-defaults.sql
--   docker compose --env-file .env.docker.prod -f docker-compose.prod.yml exec -T sqlserver \
--     /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" \
--     -d Lawyer -C -N -i /tmp/apply-ai-model-defaults.sql

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @HighestModel NVARCHAR(50) = N'gemini-3.5-flash';
DECLARE @MediumModel  NVARCHAR(50) = N'gemini-3-flash-preview';
DECLARE @LowModel     NVARCHAR(50) = N'gemini-3.1-flash-lite-preview';
DECLARE @Admin        NVARCHAR(100) = N'apply-ai-model-defaults.sql';
DECLARE @Now          DATETIME2 = SYSUTCDATETIME();

DECLARE @Stages TABLE
(
    StepType INT NOT NULL PRIMARY KEY,
    StepName NVARCHAR(100) NOT NULL,
    PriorityLabel NVARCHAR(20) NOT NULL,
    ModelIdentifier NVARCHAR(50) NOT NULL
);

INSERT INTO @Stages (StepType, StepName, PriorityLabel, ModelIdentifier)
VALUES
    -- Smart analysis / defense memo
    (1,  N'FactAnalysis',                    N'medium', @MediumModel),
    (2,  N'GenerateDefenses',                N'high',   @HighestModel),
    (3,  N'AnalysisDefense',                 N'high',   @HighestModel),
    (4,  N'FinalRequirements',               N'medium', @MediumModel),
    (5,  N'DefenseMemoDraft',                N'medium', @MediumModel),

    -- Statement of claims
    (10, N'LawsuitCaseType',                 N'low',    @LowModel),
    (11, N'LawsuitParties',                  N'low',    @LowModel),
    (12, N'LawsuitSubjects',                 N'medium', @MediumModel),
    (13, N'LawsuitFacts',                    N'medium', @MediumModel),
    (14, N'LawsuitLegalBasis',               N'high',   @HighestModel),
    (15, N'LawsuitRequests',                 N'medium', @MediumModel),
    (16, N'StatementOfClaimsDraft',          N'medium', @MediumModel),

    -- General AI utilities
    (20, N'Ocr',                             N'medium', @MediumModel),
    (21, N'ClarifyFacts',                    N'medium', @MediumModel),
    (22, N'DocumentCaseAnalysis',            N'medium', @MediumModel),
    (30, N'Chat',                            N'medium', @MediumModel),

    -- Appeal brief
    (40, N'AppealBriefJudgmentData',         N'medium', @MediumModel),
    (41, N'AppealBriefReasoningAnalysis',    N'high',   @HighestModel),
    (42, N'AppealBriefGrounds',              N'high',   @HighestModel),
    (43, N'AppealBriefRequests',             N'medium', @MediumModel),
    (44, N'AppealBriefLegalBasis',           N'high',   @HighestModel),
    (45, N'AppealBriefAssembly',             N'medium', @MediumModel),

    -- Administrative complaints
    (50, N'AdminComplaintClassification',    N'low',    @LowModel),
    (51, N'AdminComplaintFacts',             N'medium', @MediumModel),
    (52, N'AdminComplaintViolation',         N'high',   @HighestModel),
    (53, N'AdminComplaintRequests',          N'medium', @MediumModel),
    (54, N'AdminComplaintAssembly',          N'medium', @MediumModel),

    -- Ruling analysis
    (60, N'RulingAnalysisOperative',         N'medium', @MediumModel),
    (61, N'RulingAnalysisReasoning',         N'high',   @HighestModel),
    (62, N'RulingAnalysisDefectEvaluation',  N'high',   @HighestModel),
    (63, N'RulingAnalysisFeasibilityReport', N'high',   @HighestModel),

    -- Legal warning
    (70, N'LegalWarningClassification',      N'high',   @HighestModel),
    (71, N'LegalWarningBodyDraft',           N'medium', @MediumModel),
    (72, N'LegalWarningAssembly',            N'medium', @MediumModel),

    -- Execution requests
    (80, N'ExecRequestClassification',       N'low',    @LowModel),
    (81, N'ExecRequestDrafting',             N'medium', @MediumModel),
    (82, N'ExecRequestAssembly',             N'medium', @MediumModel),

    -- Legal contracts
    (90, N'LegalContractDraft',              N'medium', @MediumModel),
    (91, N'LegalContractAnalysis',           N'medium', @MediumModel),
    (92, N'LegalContractReview',             N'high',   @HighestModel);

BEGIN TRAN;

MERGE AiStageModelConfigs WITH (HOLDLOCK) AS target
USING @Stages AS source
   ON target.StepType = source.StepType
WHEN MATCHED THEN
    UPDATE SET
        ModelIdentifier = source.ModelIdentifier,
        UpdatedAt = @Now,
        UpdatedBy = @Admin
WHEN NOT MATCHED BY TARGET THEN
    INSERT (StepType, ModelIdentifier, UpdatedAt, UpdatedBy)
    VALUES (source.StepType, source.ModelIdentifier, @Now, @Admin);

COMMIT TRAN;

SELECT
    s.PriorityLabel,
    s.ModelIdentifier,
    COUNT(*) AS stage_count,
    STRING_AGG(CONCAT(CAST(s.StepType AS NVARCHAR(10)), N':', s.StepName), N', ')
        WITHIN GROUP (ORDER BY s.StepType) AS stages
FROM @Stages s
GROUP BY s.PriorityLabel, s.ModelIdentifier
ORDER BY
    CASE s.PriorityLabel WHEN N'high' THEN 1 WHEN N'medium' THEN 2 ELSE 3 END,
    s.ModelIdentifier;
