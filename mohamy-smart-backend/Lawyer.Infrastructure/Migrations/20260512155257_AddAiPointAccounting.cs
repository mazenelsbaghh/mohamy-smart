using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lawyer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAiPointAccounting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LawyerSubscription_Lawyer_LawyerId",
                table: "LawyerSubscription");

            migrationBuilder.DropForeignKey(
                name: "FK_LawyerSubscription_Subscriptions_SubscriptionId",
                table: "LawyerSubscription");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LawyerSubscription",
                table: "LawyerSubscription");

            migrationBuilder.RenameTable(
                name: "LawyerSubscription",
                newName: "LawyerSubscriptions");

            migrationBuilder.RenameIndex(
                name: "IX_LawyerSubscription_SubscriptionId",
                table: "LawyerSubscriptions",
                newName: "IX_LawyerSubscriptions_SubscriptionId");

            migrationBuilder.RenameIndex(
                name: "IX_LawyerSubscription_LawyerId",
                table: "LawyerSubscriptions",
                newName: "IX_LawyerSubscriptions_LawyerId");

            migrationBuilder.AddColumn<string>(
                name: "ChargeReason",
                table: "AiJobs",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChargeState",
                table: "AiJobs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ChargedAt",
                table: "AiJobs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChargedPoints",
                table: "AiJobs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConfirmationAcceptedAt",
                table: "AiJobs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRepeatAttempt",
                table: "AiJobs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PointCost",
                table: "AiJobs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RepeatIntent",
                table: "AiJobs",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_LawyerSubscriptions",
                table: "LawyerSubscriptions",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "AiPointTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LawyerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LawyerSubscriptionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AiJobId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    WorkflowType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    WorkflowRunId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    StepType = table.Column<int>(type: "int", nullable: false),
                    TransactionType = table.Column<int>(type: "int", nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    BalanceBefore = table.Column<int>(type: "int", nullable: false),
                    BalanceAfter = table.Column<int>(type: "int", nullable: false),
                    ReasonCode = table.Column<int>(type: "int", nullable: false),
                    MessageAr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiPointTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiPointTransactions_AiJobs_AiJobId",
                        column: x => x.AiJobId,
                        principalTable: "AiJobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_AiPointTransactions_LawyerSubscriptions_LawyerSubscriptionId",
                        column: x => x.LawyerSubscriptionId,
                        principalTable: "LawyerSubscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiPointTransactions_CaseId_WorkflowType_WorkflowRunId",
                table: "AiPointTransactions",
                columns: new[] { "CaseId", "WorkflowType", "WorkflowRunId" });

            migrationBuilder.CreateIndex(
                name: "IX_AiPointTransactions_CreatedAt",
                table: "AiPointTransactions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AiPointTransactions_LawyerId",
                table: "AiPointTransactions",
                column: "LawyerId");

            migrationBuilder.CreateIndex(
                name: "IX_AiPointTransactions_LawyerSubscriptionId",
                table: "AiPointTransactions",
                column: "LawyerSubscriptionId");

            migrationBuilder.CreateIndex(
                name: "UX_AiPointTransactions_AiJob_Charge",
                table: "AiPointTransactions",
                columns: new[] { "AiJobId", "TransactionType" },
                unique: true,
                filter: "[AiJobId] IS NOT NULL AND [TransactionType] = 1");

            migrationBuilder.AddForeignKey(
                name: "FK_LawyerSubscriptions_Lawyer_LawyerId",
                table: "LawyerSubscriptions",
                column: "LawyerId",
                principalTable: "Lawyer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LawyerSubscriptions_Subscriptions_SubscriptionId",
                table: "LawyerSubscriptions",
                column: "SubscriptionId",
                principalTable: "Subscriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LawyerSubscriptions_Lawyer_LawyerId",
                table: "LawyerSubscriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_LawyerSubscriptions_Subscriptions_SubscriptionId",
                table: "LawyerSubscriptions");

            migrationBuilder.DropTable(
                name: "AiPointTransactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LawyerSubscriptions",
                table: "LawyerSubscriptions");

            migrationBuilder.DropColumn(
                name: "ChargeReason",
                table: "AiJobs");

            migrationBuilder.DropColumn(
                name: "ChargeState",
                table: "AiJobs");

            migrationBuilder.DropColumn(
                name: "ChargedAt",
                table: "AiJobs");

            migrationBuilder.DropColumn(
                name: "ChargedPoints",
                table: "AiJobs");

            migrationBuilder.DropColumn(
                name: "ConfirmationAcceptedAt",
                table: "AiJobs");

            migrationBuilder.DropColumn(
                name: "IsRepeatAttempt",
                table: "AiJobs");

            migrationBuilder.DropColumn(
                name: "PointCost",
                table: "AiJobs");

            migrationBuilder.DropColumn(
                name: "RepeatIntent",
                table: "AiJobs");

            migrationBuilder.RenameTable(
                name: "LawyerSubscriptions",
                newName: "LawyerSubscription");

            migrationBuilder.RenameIndex(
                name: "IX_LawyerSubscriptions_SubscriptionId",
                table: "LawyerSubscription",
                newName: "IX_LawyerSubscription_SubscriptionId");

            migrationBuilder.RenameIndex(
                name: "IX_LawyerSubscriptions_LawyerId",
                table: "LawyerSubscription",
                newName: "IX_LawyerSubscription_LawyerId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LawyerSubscription",
                table: "LawyerSubscription",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LawyerSubscription_Lawyer_LawyerId",
                table: "LawyerSubscription",
                column: "LawyerId",
                principalTable: "Lawyer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LawyerSubscription_Subscriptions_SubscriptionId",
                table: "LawyerSubscription",
                column: "SubscriptionId",
                principalTable: "Subscriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
