using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAiUsageRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AiUsageRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LawyerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AiStepType = table.Column<int>(type: "int", nullable: false),
                    ModelIdentifier = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    InputTokens = table.Column<int>(type: "int", nullable: false),
                    OutputTokens = table.Column<int>(type: "int", nullable: false),
                    TotalTokens = table.Column<int>(type: "int", nullable: false),
                    EstimatedCostUsd = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiUsageRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiUsageRecords_Cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "Cases",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AiUsageRecords_Lawyer_LawyerId",
                        column: x => x.LawyerId,
                        principalTable: "Lawyer",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_AiStepType",
                table: "AiUsageRecords",
                column: "AiStepType");

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_CaseId",
                table: "AiUsageRecords",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_CreatedAt",
                table: "AiUsageRecords",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_LawyerId",
                table: "AiUsageRecords",
                column: "LawyerId");

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_LawyerId_CreatedAt",
                table: "AiUsageRecords",
                columns: new[] { "LawyerId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_Provider",
                table: "AiUsageRecords",
                column: "Provider");

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_Provider_CreatedAt",
                table: "AiUsageRecords",
                columns: new[] { "Provider", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiUsageRecords");
        }
    }
}
