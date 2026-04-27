using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBillingCycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "YearlyDurationDays",
                table: "Subscriptions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "YearlyPrice",
                table: "Subscriptions",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingCycle",
                table: "Payments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "YearlyDurationDays",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "YearlyPrice",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "BillingCycle",
                table: "Payments");
        }
    }
}
