using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInternalRegulations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InternalRegulationsContext",
                table: "Cases",
                type: "nvarchar(max)",
                maxLength: 50000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "InternalRegulations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LawyerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(240)", maxLength: 240, nullable: false),
                    RegulationNumber = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    IssuingAuthority = table.Column<string>(type: "nvarchar(240)", maxLength: 240, nullable: true),
                    Summary = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", maxLength: 50000, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InternalRegulations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InternalRegulations_Lawyer_LawyerId",
                        column: x => x.LawyerId,
                        principalTable: "Lawyer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CaseInternalRegulations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InternalRegulationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaseInternalRegulations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CaseInternalRegulations_Cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CaseInternalRegulations_InternalRegulations_InternalRegulationId",
                        column: x => x.InternalRegulationId,
                        principalTable: "InternalRegulations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CaseInternalRegulations_InternalRegulationId",
                table: "CaseInternalRegulations",
                column: "InternalRegulationId");

            migrationBuilder.CreateIndex(
                name: "UX_CaseInternalRegulations_Case_Regulation",
                table: "CaseInternalRegulations",
                columns: new[] { "CaseId", "InternalRegulationId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InternalRegulations_LawyerId",
                table: "InternalRegulations",
                column: "LawyerId");

            migrationBuilder.CreateIndex(
                name: "IX_InternalRegulations_LawyerId_IsActive",
                table: "InternalRegulations",
                columns: new[] { "LawyerId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_InternalRegulations_LawyerId_Title",
                table: "InternalRegulations",
                columns: new[] { "LawyerId", "Title" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CaseInternalRegulations");

            migrationBuilder.DropTable(
                name: "InternalRegulations");

            migrationBuilder.DropColumn(
                name: "InternalRegulationsContext",
                table: "Cases");
        }
    }
}
