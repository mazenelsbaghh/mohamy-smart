using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProcessServerPapers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Updated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    ClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LawyerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PaperType = table.Column<int>(type: "int", nullable: false),
                    OtherPaperType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomPaperTypeTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TargetName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AttachmentUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ServedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessServerPapers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcessServerPapers_Cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "Cases",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProcessServerPapers_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProcessServerPapers_Lawyer_LawyerId",
                        column: x => x.LawyerId,
                        principalTable: "Lawyer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Updated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    LawyerId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReviewerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ReviewerRole = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LawyerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Lawyer_LawyerId1",
                        column: x => x.LawyerId1,
                        principalTable: "Lawyer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcessServerPapers_CaseId",
                table: "ProcessServerPapers",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessServerPapers_ClientId",
                table: "ProcessServerPapers",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessServerPapers_LawyerId",
                table: "ProcessServerPapers",
                column: "LawyerId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_LawyerId1",
                table: "Reviews",
                column: "LawyerId1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProcessServerPapers");

            migrationBuilder.DropTable(
                name: "Reviews");
        }
    }
}
