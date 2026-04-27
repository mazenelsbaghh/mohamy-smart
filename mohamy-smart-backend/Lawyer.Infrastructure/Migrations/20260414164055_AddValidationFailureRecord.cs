using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddValidationFailureRecord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ValidationFailureRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkflowType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StepType = table.Column<int>(type: "int", nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ErrorSummary = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    RawOutput = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LawyerId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ValidationFailureRecords", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ValidationFailureRecords");
        }
    }
}
