using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Phase3PerformanceDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "RulingAnalysisWorkflows",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "LegalWarningWorkflows",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "ExecRequestWorkflows",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "AppealWorkflows",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "AdminComplaintWorkflows",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Created",
                table: "Clients",
                column: "Created");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Clients_Created",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "RulingAnalysisWorkflows");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "LegalWarningWorkflows");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "ExecRequestWorkflows");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "AppealWorkflows");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "AdminComplaintWorkflows");
        }
    }
}
