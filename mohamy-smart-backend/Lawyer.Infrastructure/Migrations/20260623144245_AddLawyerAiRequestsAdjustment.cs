using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLawyerAiRequestsAdjustment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AiRequestsAdjustment",
                table: "LawyerSubscriptions",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiRequestsAdjustment",
                table: "LawyerSubscriptions");
        }
    }
}
