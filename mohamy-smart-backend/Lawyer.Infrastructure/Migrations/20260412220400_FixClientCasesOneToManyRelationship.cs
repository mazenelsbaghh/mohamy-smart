using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixClientCasesOneToManyRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clients_Cases_CaseId",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_CaseId",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Cases_ClientId",
                table: "Cases");

            migrationBuilder.DropColumn(
                name: "CaseId",
                table: "Clients");

            migrationBuilder.CreateIndex(
                name: "IX_Cases_ClientId",
                table: "Cases",
                column: "ClientId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Cases_ClientId",
                table: "Cases");

            migrationBuilder.AddColumn<Guid>(
                name: "CaseId",
                table: "Clients",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_CaseId",
                table: "Clients",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Cases_ClientId",
                table: "Cases",
                column: "ClientId",
                unique: true,
                filter: "[ClientId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_Cases_CaseId",
                table: "Clients",
                column: "CaseId",
                principalTable: "Cases",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
