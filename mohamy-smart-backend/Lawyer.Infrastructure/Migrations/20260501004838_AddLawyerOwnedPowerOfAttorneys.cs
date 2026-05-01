using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLawyerOwnedPowerOfAttorneys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PowerOfAttorneys_Clients_ClientId",
                table: "PowerOfAttorneys");

            migrationBuilder.AlterColumn<Guid>(
                name: "ClientId",
                table: "PowerOfAttorneys",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "LawyerId",
                table: "PowerOfAttorneys",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PowerOfAttorneys_LawyerId",
                table: "PowerOfAttorneys",
                column: "LawyerId");

            migrationBuilder.AddForeignKey(
                name: "FK_PowerOfAttorneys_Clients_ClientId",
                table: "PowerOfAttorneys",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PowerOfAttorneys_Lawyer_LawyerId",
                table: "PowerOfAttorneys",
                column: "LawyerId",
                principalTable: "Lawyer",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PowerOfAttorneys_Clients_ClientId",
                table: "PowerOfAttorneys");

            migrationBuilder.DropForeignKey(
                name: "FK_PowerOfAttorneys_Lawyer_LawyerId",
                table: "PowerOfAttorneys");

            migrationBuilder.DropIndex(
                name: "IX_PowerOfAttorneys_LawyerId",
                table: "PowerOfAttorneys");

            migrationBuilder.DropColumn(
                name: "LawyerId",
                table: "PowerOfAttorneys");

            migrationBuilder.AlterColumn<Guid>(
                name: "ClientId",
                table: "PowerOfAttorneys",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PowerOfAttorneys_Clients_ClientId",
                table: "PowerOfAttorneys",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
