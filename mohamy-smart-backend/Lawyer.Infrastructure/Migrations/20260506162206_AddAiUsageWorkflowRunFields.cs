using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAiUsageWorkflowRunFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WorkflowId",
                table: "AiUsageRecords",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkflowRunId",
                table: "AiUsageRecords",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkflowType",
                table: "AiUsageRecords",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_CaseId_WorkflowType_WorkflowRunId",
                table: "AiUsageRecords",
                columns: new[] { "CaseId", "WorkflowType", "WorkflowRunId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AiUsageRecords_CaseId_WorkflowType_WorkflowRunId",
                table: "AiUsageRecords");

            migrationBuilder.DropColumn(
                name: "WorkflowId",
                table: "AiUsageRecords");

            migrationBuilder.DropColumn(
                name: "WorkflowRunId",
                table: "AiUsageRecords");

            migrationBuilder.DropColumn(
                name: "WorkflowType",
                table: "AiUsageRecords");
        }
    }
}
