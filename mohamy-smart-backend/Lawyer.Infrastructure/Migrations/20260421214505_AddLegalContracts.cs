using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLegalContracts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LegalContracts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LawyerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContractTypeCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ContractTypeName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    InputDetails = table.Column<string>(type: "nvarchar(max)", maxLength: 5000, nullable: false),
                    CustomClauses = table.Column<string>(type: "nvarchar(3000)", maxLength: 3000, nullable: true),
                    GeneratedContent = table.Column<string>(type: "nvarchar(max)", maxLength: 50000, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    AiStepType = table.Column<int>(type: "int", nullable: false),
                    ModelIdentifier = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LegalContracts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LegalContracts_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LegalContracts_Lawyer_LawyerId",
                        column: x => x.LawyerId,
                        principalTable: "Lawyer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "AiStageModelConfigs",
                columns: new[] { "Id", "ModelIdentifier", "StepType", "UpdatedAt", "UpdatedBy" },
                values: new object[] { 900, "gemini-3-flash-preview-pro", 90, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.CreateIndex(
                name: "IX_LegalContracts_ClientId",
                table: "LegalContracts",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_LegalContracts_CreatedAtUtc",
                table: "LegalContracts",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_LegalContracts_LawyerId",
                table: "LegalContracts",
                column: "LawyerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LegalContracts");

            migrationBuilder.DeleteData(
                table: "AiStageModelConfigs",
                keyColumn: "Id",
                keyValue: 900);
        }
    }
}
