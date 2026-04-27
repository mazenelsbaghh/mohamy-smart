using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_FinalPrayers_CaseId_Created",
                table: "FinalPrayers",
                columns: new[] { "CaseId", "Created" });

            migrationBuilder.CreateIndex(
                name: "IX_FactAnalyses_CaseId_Created",
                table: "FactAnalyses",
                columns: new[] { "CaseId", "Created" });

            migrationBuilder.CreateIndex(
                name: "IX_Defenses_CaseId_Created",
                table: "Defenses",
                columns: new[] { "CaseId", "Created" });

            migrationBuilder.CreateIndex(
                name: "IX_Defenses_CaseId_Type",
                table: "Defenses",
                columns: new[] { "CaseId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_Cases_LawyerId_Status",
                table: "Cases",
                columns: new[] { "LawyerId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_AiJobs_CaseId_StepType_CreatedAt",
                table: "AiJobs",
                columns: new[] { "CaseId", "StepType", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FinalPrayers_CaseId_Created",
                table: "FinalPrayers");

            migrationBuilder.DropIndex(
                name: "IX_FactAnalyses_CaseId_Created",
                table: "FactAnalyses");

            migrationBuilder.DropIndex(
                name: "IX_Defenses_CaseId_Created",
                table: "Defenses");

            migrationBuilder.DropIndex(
                name: "IX_Defenses_CaseId_Type",
                table: "Defenses");

            migrationBuilder.DropIndex(
                name: "IX_Cases_LawyerId_Status",
                table: "Cases");

            migrationBuilder.DropIndex(
                name: "IX_AiJobs_CaseId_StepType_CreatedAt",
                table: "AiJobs");
        }
    }
}
