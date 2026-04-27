using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOtpCodeSalt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AttemptCount",
                table: "Otps",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CodeSalt",
                table: "Otps",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ConsumedAtUtc",
                table: "Otps",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryChannel",
                table: "Otps",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FailureReason",
                table: "Otps",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InvalidatedAtUtc",
                table: "Otps",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsVerified",
                table: "Otps",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MaskedDestination",
                table: "Otps",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "MaxAttempts",
                table: "Otps",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Otps",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "AccountEmailEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Updated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    BusinessEventId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RecipientEmail = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SubjectTemplateKey = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    DeliveryStatus = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    SentAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailureReasonCategory = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RetryState = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TriggeredBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountEmailEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccountEmailEvents_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccountEmailEvents_UserId",
                table: "AccountEmailEvents",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UX_AccountEmailEvents_Event_Business_Recipient",
                table: "AccountEmailEvents",
                columns: new[] { "EventType", "BusinessEventId", "RecipientEmail" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountEmailEvents");

            migrationBuilder.DropColumn(
                name: "AttemptCount",
                table: "Otps");

            migrationBuilder.DropColumn(
                name: "CodeSalt",
                table: "Otps");

            migrationBuilder.DropColumn(
                name: "ConsumedAtUtc",
                table: "Otps");

            migrationBuilder.DropColumn(
                name: "DeliveryChannel",
                table: "Otps");

            migrationBuilder.DropColumn(
                name: "FailureReason",
                table: "Otps");

            migrationBuilder.DropColumn(
                name: "InvalidatedAtUtc",
                table: "Otps");

            migrationBuilder.DropColumn(
                name: "IsVerified",
                table: "Otps");

            migrationBuilder.DropColumn(
                name: "MaskedDestination",
                table: "Otps");

            migrationBuilder.DropColumn(
                name: "MaxAttempts",
                table: "Otps");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Otps");
        }
    }
}
