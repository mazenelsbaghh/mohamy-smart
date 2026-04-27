using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddClientManagementFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PowerOfAttorneyId",
                table: "Cases",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cases_PowerOfAttorneyId",
                table: "Cases",
                column: "PowerOfAttorneyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cases_PowerOfAttorneys_PowerOfAttorneyId",
                table: "Cases",
                column: "PowerOfAttorneyId",
                principalTable: "PowerOfAttorneys",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cases_PowerOfAttorneys_PowerOfAttorneyId",
                table: "Cases");

            migrationBuilder.DropIndex(
                name: "IX_Cases_PowerOfAttorneyId",
                table: "Cases");

            migrationBuilder.DropColumn(
                name: "PowerOfAttorneyId",
                table: "Cases");
        }
    }
}
