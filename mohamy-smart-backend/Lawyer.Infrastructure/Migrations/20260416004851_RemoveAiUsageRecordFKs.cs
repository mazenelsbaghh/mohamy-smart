using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAiUsageRecordFKs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AiUsageRecords_Cases_CaseId",
                table: "AiUsageRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_AiUsageRecords_Lawyer_LawyerId",
                table: "AiUsageRecords");

            migrationBuilder.DropIndex(
                name: "IX_AiUsageRecords_CaseId",
                table: "AiUsageRecords");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AiUsageRecords_CaseId",
                table: "AiUsageRecords",
                column: "CaseId");

            migrationBuilder.AddForeignKey(
                name: "FK_AiUsageRecords_Cases_CaseId",
                table: "AiUsageRecords",
                column: "CaseId",
                principalTable: "Cases",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AiUsageRecords_Lawyer_LawyerId",
                table: "AiUsageRecords",
                column: "LawyerId",
                principalTable: "Lawyer",
                principalColumn: "Id");
        }
    }
}
