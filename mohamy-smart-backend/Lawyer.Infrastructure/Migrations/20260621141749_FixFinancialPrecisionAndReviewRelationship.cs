using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixFinancialPrecisionAndReviewRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Lawyer_LawyerId1",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "LawyerId",
                table: "Reviews");

            migrationBuilder.RenameColumn(
                name: "LawyerId1",
                table: "Reviews",
                newName: "LawyerId");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_LawyerId1",
                table: "Reviews",
                newName: "IX_Reviews_LawyerId");

            migrationBuilder.AlterColumn<decimal>(
                name: "EstimatedCostUsd",
                table: "AiUsageRecords",
                type: "decimal(18,8)",
                precision: 18,
                scale: 8,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Lawyer_LawyerId",
                table: "Reviews",
                column: "LawyerId",
                principalTable: "Lawyer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Lawyer_LawyerId",
                table: "Reviews");

            migrationBuilder.RenameColumn(
                name: "LawyerId",
                table: "Reviews",
                newName: "LawyerId1");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_LawyerId",
                table: "Reviews",
                newName: "IX_Reviews_LawyerId1");

            migrationBuilder.AddColumn<string>(
                name: "LawyerId",
                table: "Reviews",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<decimal>(
                name: "EstimatedCostUsd",
                table: "AiUsageRecords",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,8)",
                oldPrecision: 18,
                oldScale: 8);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Lawyer_LawyerId1",
                table: "Reviews",
                column: "LawyerId1",
                principalTable: "Lawyer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
