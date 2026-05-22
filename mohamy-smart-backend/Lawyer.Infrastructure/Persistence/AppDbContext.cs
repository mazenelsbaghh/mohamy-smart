using Lawyer.Application.Common.Interface;
using Lawyer.Core.Enum;
using Lawyer.Core.Models;
using Lawyer.Core.Models.Agenda;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Reflection.Emit;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Infrastructure.Persistence
{
	public class AppDbContext : IdentityDbContext<ApplicationUser ,Role, Guid>, IApplicationDbContext
	{
		public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
		

		public DbSet<Otp> Otps { get; set; } = null!;
		public DbSet<AccessToken> AccessTokens { get; set; } = null!;
		public DbSet<Subscription> Subscriptions { get; set; } = null!;
		public DbSet<LawyerSubscription> LawyerSubscriptions { get; set; } = null!;
		public DbSet<CaseType> CaseTypes { get; set; } = null!;
		public DbSet<Case> Cases { get; set; } = null!;
		public DbSet<InternalRegulation> InternalRegulations { get; set; } = null!;
		public DbSet<CaseInternalRegulation> CaseInternalRegulations { get; set; } = null!;
		public DbSet<FactAnalysis> FactAnalyses { get; set; } = null!;
		public DbSet<Defense> Defenses { get; set; } = null!;
		public DbSet<FinalPrayer> FinalPrayers { get; set; } = null!;
		public DbSet<LawSuitCaseType> LawSuitCaseTypes { get; set; } = null!;
		public DbSet<LawSuitParty> LawSuitParties { get; set; } = null!;
		public DbSet<LawSuitSubject> LawSuitSubjects { get; set; } = null!;
		public DbSet<LawSuitFacts> LawSuitFacts { get; set; } = null!;
		public DbSet<LawSuitLegalText> LawSuitLegalTexts { get; set; } = null!;
		public DbSet<LawSuitCassationRuling> LawSuitCassationRulings { get; set; } = null!;
		public DbSet<LawSuitRequest> LawSuitRequests { get; set; } = null!;
		public DbSet<Client> Clients { get; set; } = null!;
		public DbSet<LawyerTask> LawyerTasks { get; set; } = null!;
		public DbSet<Payment> Payments { get; set; } = null!;
		public DbSet<Notification> Notifications { get; set; } = null!;
		public DbSet<ContactRequest> ContactRequests { get; set; } = null!;
		public DbSet<EmailDeliveryFailure> EmailDeliveryFailures { get; set; } = null!;
		public DbSet<AccountEmailEvent> AccountEmailEvents { get; set; } = null!;
		public DbSet<AiJob> AiJobs { get; set; } = null!;
		public DbSet<AiPointTransaction> AiPointTransactions { get; set; } = null!;
		public DbSet<AgendaItem> AgendaItems { get; set; } = null!;
		public DbSet<ClientFile> ClientFiles { get; set; } = null!;
		public DbSet<DocumentHandoff> DocumentHandoffs { get; set; } = null!;
		public DbSet<ClientTransaction> ClientTransactions { get; set; } = null!;
		public DbSet<PowerOfAttorney> PowerOfAttorneys { get; set; } = null!;
		public DbSet<AiStageModelConfig> AiStageModelConfigs { get; set; } = null!;
		public DbSet<AppealWorkflow> AppealWorkflows { get; set; } = null!;
		public DbSet<AdminComplaintWorkflow> AdminComplaintWorkflows { get; set; } = null!;
		public DbSet<RulingAnalysisWorkflow> RulingAnalysisWorkflows { get; set; } = null!;
		public DbSet<LegalWarningWorkflow> LegalWarningWorkflows { get; set; } = null!;
		public DbSet<ExecRequestWorkflow> ExecRequestWorkflows { get; set; } = null!;
		public DbSet<ValidationFailureRecord> ValidationFailureRecords { get; set; } = null!;
        public DbSet<AiUsageRecord> AiUsageRecords { get; set; } = null!;
        public DbSet<LegalContract> LegalContracts { get; set; } = null!;
        public DbSet<ProcessServerPaper> ProcessServerPapers { get; set; } = null!;
		public DbSet<Review> Reviews { get; set; } = null!;
        public DbSet<WorkflowSnapshot> WorkflowSnapshots { get; set; } = null!;
        public DbSet<GuidanceDismissal> GuidanceDismissals { get; set; } = null!;
        public DbSet<ManualPhoneVerificationAudit> ManualPhoneVerificationAudits { get; set; } = null!;
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
		{
			ChangeTracker.DetectChanges();
			return base.SaveChangesAsync(cancellationToken);
		}

		protected override void OnModelCreating(ModelBuilder builder)
		{

			base.OnModelCreating(builder);

			builder.Entity<AiJob>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.RunId).HasMaxLength(450);
				entity.Property(e => e.WorkflowType).HasMaxLength(200);
				entity.Property(e => e.ErrorCode).HasMaxLength(500);
				entity.Property(e => e.ChargeReason).HasMaxLength(500);
				entity.HasIndex(e => new { e.RunId, e.StepNumber })
					  .HasDatabaseName("IX_AiJobs_RunId_StepNumber");
				entity.HasIndex(e => new { e.CaseId, e.StepType, e.RunId, e.StepNumber })
					  .HasFilter("[Status] IN (0, 1)")
					  .IsUnique()
					  .HasDatabaseName("UX_AiJobs_CaseId_StepType_RunId_StepNumber_Active");
				entity.HasIndex(e => new { e.CaseId, e.StepType, e.CreatedAt })
					  .HasDatabaseName("IX_AiJobs_CaseId_StepType_CreatedAt");

				entity.HasOne(e => e.Case)
					  .WithMany()
					  .HasForeignKey(e => e.CaseId)
					  .OnDelete(DeleteBehavior.Cascade);
			});

			builder.Entity<AiPointTransaction>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.WorkflowType).HasMaxLength(200);
				entity.Property(e => e.WorkflowRunId).HasMaxLength(450);
				entity.Property(e => e.MessageAr).HasMaxLength(500);
				entity.HasIndex(e => e.LawyerId);
				entity.HasIndex(e => e.CreatedAt);
				entity.HasIndex(e => new { e.CaseId, e.WorkflowType, e.WorkflowRunId });
				entity.HasIndex(e => new { e.AiJobId, e.TransactionType })
					  .IsUnique()
					  .HasFilter("[AiJobId] IS NOT NULL AND [TransactionType] = 1")
					  .HasDatabaseName("UX_AiPointTransactions_AiJob_Charge");

				entity.HasOne(e => e.LawyerSubscription)
					  .WithMany()
					  .HasForeignKey(e => e.LawyerSubscriptionId)
					  .OnDelete(DeleteBehavior.Restrict);

				entity.HasOne(e => e.AiJob)
					  .WithMany()
					  .HasForeignKey(e => e.AiJobId)
					  .OnDelete(DeleteBehavior.SetNull);
			});

			builder.Entity<AgendaItem>()
				.HasDiscriminator<string>("Type")
				.HasValue<SessionAgendaItem>("Session")
				.HasValue<ActionAgendaItem>("Action");

			builder.Entity<SessionAgendaItem>()
				.HasOne(s => s.PreviousSession)
				.WithMany()
				.HasForeignKey(s => s.PreviousSessionId)
				.OnDelete(DeleteBehavior.Restrict);




			builder.Entity<AiUsageRecord>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.WorkflowRunId).HasMaxLength(450);
				entity.Property(e => e.WorkflowType).HasMaxLength(200);
				entity.HasIndex(e => e.LawyerId);
				entity.HasIndex(e => e.CreatedAt);
				entity.HasIndex(e => e.AiStepType);
				entity.HasIndex(e => e.Provider);
				entity.HasIndex(e => new { e.LawyerId, e.CreatedAt });
				entity.HasIndex(e => new { e.Provider, e.CreatedAt });
				entity.HasIndex(e => new { e.CaseId, e.WorkflowType, e.WorkflowRunId });
			});

			builder.Entity<AccountEmailEvent>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.HasIndex(e => new { e.EventType, e.BusinessEventId, e.RecipientEmail })
					  .IsUnique()
					  .HasDatabaseName("UX_AccountEmailEvents_Event_Business_Recipient");
				entity.Property(e => e.DeliveryStatus).HasMaxLength(32);
				entity.Property(e => e.EventType).HasMaxLength(128);
				entity.Property(e => e.SubjectTemplateKey).HasMaxLength(128);
			});

			builder.Entity<ManualPhoneVerificationAudit>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.PhoneNumber).HasMaxLength(64).IsRequired();
				entity.Property(e => e.Reason).HasMaxLength(500).IsRequired();
				entity.HasIndex(e => e.UserId)
					.HasDatabaseName("IX_ManualPhoneVerificationAudits_UserId");
				entity.HasIndex(e => new { e.UserId, e.Created })
					.HasDatabaseName("IX_ManualPhoneVerificationAudits_UserId_Created");
				entity.HasIndex(e => e.VerifiedByAdminId)
					.HasDatabaseName("IX_ManualPhoneVerificationAudits_VerifiedByAdminId");

				entity.HasOne(e => e.User)
					.WithMany()
					.HasForeignKey(e => e.UserId)
					.OnDelete(DeleteBehavior.Restrict);

				entity.HasOne(e => e.VerifiedByAdmin)
					.WithMany()
					.HasForeignKey(e => e.VerifiedByAdminId)
					.OnDelete(DeleteBehavior.Restrict);
			});


			builder.Entity<WorkflowSnapshot>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.HasIndex(e => new { e.CaseId, e.WorkflowType })
					  .HasDatabaseName("IX_WorkflowSnapshots_CaseId_WorkflowType");
				entity.HasOne(e => e.Case)
					  .WithMany()
					  .HasForeignKey(e => e.CaseId)
					  .OnDelete(DeleteBehavior.Cascade);
			});

			Action<Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<AppealWorkflow>> configureAppeal = entity =>
			{
				entity.Property(e => e.RunId).HasMaxLength(450);
				entity.Property(e => e.CurrentAccessibleStep).HasDefaultValue(0);
				entity.Property(e => e.LastCompletedStep).HasDefaultValue(0);
				entity.HasIndex(e => new { e.CaseId, e.RunId })
					  .HasDatabaseName("IX_AppealWorkflows_CaseId_RunId");
			};
			builder.Entity<AppealWorkflow>(configureAppeal);

			Action<Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<AdminComplaintWorkflow>> configureAdminComplaint = entity =>
			{
				entity.Property(e => e.RunId).HasMaxLength(450);
				entity.Property(e => e.CurrentAccessibleStep).HasDefaultValue(0);
				entity.Property(e => e.LastCompletedStep).HasDefaultValue(0);
				entity.HasIndex(e => new { e.CaseId, e.RunId })
					  .HasDatabaseName("IX_AdminComplaintWorkflows_CaseId_RunId");
			};
			builder.Entity<AdminComplaintWorkflow>(configureAdminComplaint);

			Action<Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<RulingAnalysisWorkflow>> configureRulingAnalysis = entity =>
			{
				entity.Property(e => e.RunId).HasMaxLength(450);
				entity.Property(e => e.CurrentAccessibleStep).HasDefaultValue(0);
				entity.Property(e => e.LastCompletedStep).HasDefaultValue(0);
				entity.HasIndex(e => new { e.CaseId, e.RunId })
					  .HasDatabaseName("IX_RulingAnalysisWorkflows_CaseId_RunId");
			};
			builder.Entity<RulingAnalysisWorkflow>(configureRulingAnalysis);

			Action<Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<LegalWarningWorkflow>> configureLegalWarning = entity =>
			{
				entity.Property(e => e.RunId).HasMaxLength(450);
				entity.Property(e => e.CurrentAccessibleStep).HasDefaultValue(0);
				entity.Property(e => e.LastCompletedStep).HasDefaultValue(0);
				entity.HasIndex(e => new { e.CaseId, e.RunId })
					  .HasDatabaseName("IX_LegalWarningWorkflows_CaseId_RunId");
			};
			builder.Entity<LegalWarningWorkflow>(configureLegalWarning);

			Action<Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<ExecRequestWorkflow>> configureExecRequest = entity =>
			{
				entity.Property(e => e.RunId).HasMaxLength(450);
				entity.Property(e => e.CurrentAccessibleStep).HasDefaultValue(0);
				entity.Property(e => e.LastCompletedStep).HasDefaultValue(0);
				entity.HasIndex(e => new { e.CaseId, e.RunId })
					  .HasDatabaseName("IX_ExecRequestWorkflows_CaseId_RunId");
			};
			builder.Entity<ExecRequestWorkflow>(configureExecRequest);

			builder.Entity<GuidanceDismissal>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.GuidanceKey).HasMaxLength(200);
				entity.HasIndex(e => new { e.UserId, e.GuidanceKey })
					  .IsUnique()
					  .HasDatabaseName("UX_GuidanceDismissals_UserId_GuidanceKey");
				entity.HasOne(e => e.User)
					  .WithMany()
					  .HasForeignKey(e => e.UserId)
					  .OnDelete(DeleteBehavior.Cascade);
			});

			builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
		}
	
	
	
	}


}
