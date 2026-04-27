using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkflowTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminComplaintWorkflows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LawyerId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentStep = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Step1Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step2Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step3Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step4Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step5Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminComplaintWorkflows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AdminComplaintWorkflows_Cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppealWorkflows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LawyerId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentStep = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Step1Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step2Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step3Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step4Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step5Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step6Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppealWorkflows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppealWorkflows_Cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExecRequestWorkflows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LawyerId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExecutiveTitleType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentStep = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Step1Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step2Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step3Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExecRequestWorkflows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExecRequestWorkflows_Cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LegalWarningWorkflows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LawyerId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentStep = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Step1Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step2Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step3Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LegalWarningWorkflows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LegalWarningWorkflows_Cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RulingAnalysisWorkflows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LawyerId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentStep = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Step1Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step2Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step3Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Step4Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulingAnalysisWorkflows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RulingAnalysisWorkflows_Cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdminComplaintWorkflows_CaseId",
                table: "AdminComplaintWorkflows",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_AppealWorkflows_CaseId",
                table: "AppealWorkflows",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecRequestWorkflows_CaseId",
                table: "ExecRequestWorkflows",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_LegalWarningWorkflows_CaseId",
                table: "LegalWarningWorkflows",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_RulingAnalysisWorkflows_CaseId",
                table: "RulingAnalysisWorkflows",
                column: "CaseId");

            migrationBuilder.InsertData(
                table: "AiStageModelConfigs",
                columns: new[] { "Id", "ModelIdentifier", "StepType", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 13, "gemini-3-flash-preview-pro", 40, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 14, "gemini-3-flash-preview-pro", 41, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 15, "gemini-3-flash-preview-pro", 42, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 16, "gemini-3-flash-preview-pro", 43, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 17, "gemini-3-flash-preview-pro", 44, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 18, "gemini-3-flash-preview-pro", 45, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 19, "gemini-3-flash-preview-pro", 50, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 20, "gemini-3-flash-preview-pro", 51, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 21, "gemini-3-flash-preview-pro", 52, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 22, "gemini-3-flash-preview-pro", 53, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 23, "gemini-3-flash-preview-pro", 54, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 24, "gemini-3-flash-preview-pro", 60, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 25, "gemini-3-flash-preview-pro", 61, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 26, "gemini-3-flash-preview-pro", 62, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 27, "gemini-3-flash-preview-pro", 63, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 28, "gemini-3-flash-preview-pro", 70, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 29, "gemini-3-flash-preview-pro", 71, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 30, "gemini-3-flash-preview-pro", 72, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 31, "gemini-3-flash-preview-pro", 80, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 32, "gemini-3-flash-preview-pro", 81, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                    { 33, "gemini-3-flash-preview-pro", 82, new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc), null },
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminComplaintWorkflows");

            migrationBuilder.DropTable(
                name: "AppealWorkflows");

            migrationBuilder.DropTable(
                name: "ExecRequestWorkflows");

            migrationBuilder.DropTable(
                name: "LegalWarningWorkflows");

            migrationBuilder.DropTable(
                name: "RulingAnalysisWorkflows");
        }
    }
}
