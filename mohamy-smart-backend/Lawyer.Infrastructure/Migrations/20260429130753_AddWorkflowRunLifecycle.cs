using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkflowRunLifecycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RulingAnalysisWorkflows_CaseId",
                table: "RulingAnalysisWorkflows");

            migrationBuilder.DropIndex(
                name: "IX_LegalWarningWorkflows_CaseId",
                table: "LegalWarningWorkflows");

            migrationBuilder.DropIndex(
                name: "IX_ExecRequestWorkflows_CaseId",
                table: "ExecRequestWorkflows");

            migrationBuilder.DropIndex(
                name: "IX_AppealWorkflows_CaseId",
                table: "AppealWorkflows");

            migrationBuilder.DropIndex(
                name: "UX_AiJobs_CaseId_StepType_Active",
                table: "AiJobs");

            migrationBuilder.DropIndex(
                name: "IX_AdminComplaintWorkflows_CaseId",
                table: "AdminComplaintWorkflows");

            migrationBuilder.AddColumn<string>(
                name: "ConflictStepMetadata",
                table: "RulingAnalysisWorkflows",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CurrentAccessibleStep",
                table: "RulingAnalysisWorkflows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LastCompletedStep",
                table: "RulingAnalysisWorkflows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RunId",
                table: "RulingAnalysisWorkflows",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ConflictStepMetadata",
                table: "LegalWarningWorkflows",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CurrentAccessibleStep",
                table: "LegalWarningWorkflows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LastCompletedStep",
                table: "LegalWarningWorkflows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RunId",
                table: "LegalWarningWorkflows",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ConflictStepMetadata",
                table: "ExecRequestWorkflows",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CurrentAccessibleStep",
                table: "ExecRequestWorkflows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LastCompletedStep",
                table: "ExecRequestWorkflows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RunId",
                table: "ExecRequestWorkflows",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ConflictStepMetadata",
                table: "AppealWorkflows",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CurrentAccessibleStep",
                table: "AppealWorkflows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LastCompletedStep",
                table: "AppealWorkflows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RunId",
                table: "AppealWorkflows",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ErrorCode",
                table: "AiJobs",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RunId",
                table: "AiJobs",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StepNumber",
                table: "AiJobs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkflowType",
                table: "AiJobs",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ConflictStepMetadata",
                table: "AdminComplaintWorkflows",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CurrentAccessibleStep",
                table: "AdminComplaintWorkflows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LastCompletedStep",
                table: "AdminComplaintWorkflows",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RunId",
                table: "AdminComplaintWorkflows",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RulingAnalysisWorkflows_CaseId_RunId",
                table: "RulingAnalysisWorkflows",
                columns: new[] { "CaseId", "RunId" });

            migrationBuilder.CreateIndex(
                name: "IX_LegalWarningWorkflows_CaseId_RunId",
                table: "LegalWarningWorkflows",
                columns: new[] { "CaseId", "RunId" });

            migrationBuilder.CreateIndex(
                name: "IX_ExecRequestWorkflows_CaseId_RunId",
                table: "ExecRequestWorkflows",
                columns: new[] { "CaseId", "RunId" });

            migrationBuilder.CreateIndex(
                name: "IX_AppealWorkflows_CaseId_RunId",
                table: "AppealWorkflows",
                columns: new[] { "CaseId", "RunId" });

            migrationBuilder.CreateIndex(
                name: "IX_AiJobs_RunId_StepNumber",
                table: "AiJobs",
                columns: new[] { "RunId", "StepNumber" });

            migrationBuilder.CreateIndex(
                name: "UX_AiJobs_CaseId_StepType_RunId_StepNumber_Active",
                table: "AiJobs",
                columns: new[] { "CaseId", "StepType", "RunId", "StepNumber" },
                unique: true,
                filter: "[Status] IN (0, 1)");

            migrationBuilder.CreateIndex(
                name: "IX_AdminComplaintWorkflows_CaseId_RunId",
                table: "AdminComplaintWorkflows",
                columns: new[] { "CaseId", "RunId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RulingAnalysisWorkflows_CaseId_RunId",
                table: "RulingAnalysisWorkflows");

            migrationBuilder.DropIndex(
                name: "IX_LegalWarningWorkflows_CaseId_RunId",
                table: "LegalWarningWorkflows");

            migrationBuilder.DropIndex(
                name: "IX_ExecRequestWorkflows_CaseId_RunId",
                table: "ExecRequestWorkflows");

            migrationBuilder.DropIndex(
                name: "IX_AppealWorkflows_CaseId_RunId",
                table: "AppealWorkflows");

            migrationBuilder.DropIndex(
                name: "IX_AiJobs_RunId_StepNumber",
                table: "AiJobs");

            migrationBuilder.DropIndex(
                name: "UX_AiJobs_CaseId_StepType_RunId_StepNumber_Active",
                table: "AiJobs");

            migrationBuilder.DropIndex(
                name: "IX_AdminComplaintWorkflows_CaseId_RunId",
                table: "AdminComplaintWorkflows");

            migrationBuilder.DropColumn(
                name: "ConflictStepMetadata",
                table: "RulingAnalysisWorkflows");

            migrationBuilder.DropColumn(
                name: "CurrentAccessibleStep",
                table: "RulingAnalysisWorkflows");

            migrationBuilder.DropColumn(
                name: "LastCompletedStep",
                table: "RulingAnalysisWorkflows");

            migrationBuilder.DropColumn(
                name: "RunId",
                table: "RulingAnalysisWorkflows");

            migrationBuilder.DropColumn(
                name: "ConflictStepMetadata",
                table: "LegalWarningWorkflows");

            migrationBuilder.DropColumn(
                name: "CurrentAccessibleStep",
                table: "LegalWarningWorkflows");

            migrationBuilder.DropColumn(
                name: "LastCompletedStep",
                table: "LegalWarningWorkflows");

            migrationBuilder.DropColumn(
                name: "RunId",
                table: "LegalWarningWorkflows");

            migrationBuilder.DropColumn(
                name: "ConflictStepMetadata",
                table: "ExecRequestWorkflows");

            migrationBuilder.DropColumn(
                name: "CurrentAccessibleStep",
                table: "ExecRequestWorkflows");

            migrationBuilder.DropColumn(
                name: "LastCompletedStep",
                table: "ExecRequestWorkflows");

            migrationBuilder.DropColumn(
                name: "RunId",
                table: "ExecRequestWorkflows");

            migrationBuilder.DropColumn(
                name: "ConflictStepMetadata",
                table: "AppealWorkflows");

            migrationBuilder.DropColumn(
                name: "CurrentAccessibleStep",
                table: "AppealWorkflows");

            migrationBuilder.DropColumn(
                name: "LastCompletedStep",
                table: "AppealWorkflows");

            migrationBuilder.DropColumn(
                name: "RunId",
                table: "AppealWorkflows");

            migrationBuilder.DropColumn(
                name: "ErrorCode",
                table: "AiJobs");

            migrationBuilder.DropColumn(
                name: "RunId",
                table: "AiJobs");

            migrationBuilder.DropColumn(
                name: "StepNumber",
                table: "AiJobs");

            migrationBuilder.DropColumn(
                name: "WorkflowType",
                table: "AiJobs");

            migrationBuilder.DropColumn(
                name: "ConflictStepMetadata",
                table: "AdminComplaintWorkflows");

            migrationBuilder.DropColumn(
                name: "CurrentAccessibleStep",
                table: "AdminComplaintWorkflows");

            migrationBuilder.DropColumn(
                name: "LastCompletedStep",
                table: "AdminComplaintWorkflows");

            migrationBuilder.DropColumn(
                name: "RunId",
                table: "AdminComplaintWorkflows");

            migrationBuilder.CreateIndex(
                name: "IX_RulingAnalysisWorkflows_CaseId",
                table: "RulingAnalysisWorkflows",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_LegalWarningWorkflows_CaseId",
                table: "LegalWarningWorkflows",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecRequestWorkflows_CaseId",
                table: "ExecRequestWorkflows",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_AppealWorkflows_CaseId",
                table: "AppealWorkflows",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "UX_AiJobs_CaseId_StepType_Active",
                table: "AiJobs",
                columns: new[] { "CaseId", "StepType" },
                unique: true,
                filter: "[Status] IN (0, 1)");

            migrationBuilder.CreateIndex(
                name: "IX_AdminComplaintWorkflows_CaseId",
                table: "AdminComplaintWorkflows",
                column: "CaseId");
        }
    }
}
