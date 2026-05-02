using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPoASerialNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SerialNumber",
                table: "PowerOfAttorneys",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql(@"
                WITH Ordered AS (
                    SELECT Id, ROW_NUMBER() OVER (ORDER BY Created) AS RowNum
                    FROM PowerOfAttorneys
                )
                UPDATE PoA
                SET PoA.SerialNumber = Ordered.RowNum
                FROM PowerOfAttorneys PoA
                INNER JOIN Ordered ON PoA.Id = Ordered.Id;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SerialNumber",
                table: "PowerOfAttorneys");
        }
    }
}
