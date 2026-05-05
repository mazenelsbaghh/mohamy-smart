using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProcessServerPaperDeliveryFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeliveryNumber",
                table: "ProcessServerPapers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProcessServerName",
                table: "ProcessServerPapers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryNumber",
                table: "ProcessServerPapers");

            migrationBuilder.DropColumn(
                name: "ProcessServerName",
                table: "ProcessServerPapers");
        }
    }
}
