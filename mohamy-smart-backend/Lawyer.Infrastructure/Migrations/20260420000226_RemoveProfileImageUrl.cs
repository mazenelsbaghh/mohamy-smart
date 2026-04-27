using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    public partial class RemoveProfileImageUrl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileImageUrl",
                table: "Users");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfileImageUrl",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
