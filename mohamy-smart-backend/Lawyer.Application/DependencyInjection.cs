using Lawyer.Application.Services.SmartAnalysis;
using FluentValidation;
using Lawyer.Application.Dto.Auth;
using Lawyer.Application.Dtos;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Application.Services;
using Lawyer.Application.Services.AI;
using Lawyer.Application.Validators;
using Lawyer.Application.Common;
using Lawyer.Core.Exceptions;
using Microsoft.Extensions.DependencyInjection;

namespace Lawyer.Application
{
	public static class DependencyInjection
	{
		public static IServiceCollection AddApplication(this IServiceCollection services)
		{
				services.AddScoped<IBackgroundJobService, BackgroundJobService>();
			services.AddScoped<IProcessServerPaperService, ProcessServerPaperService>();
			services.AddScoped<IAccountService, AccountService>();
			services.AddScoped<IAuthService, AuthService>();
			services.AddScoped<ICaseOcrService, CaseOcrService>();
			services.AddScoped<ICaseService, CaseService>();
			services.AddScoped<ICaseTypeService, CaseTypeService>();
			services.AddScoped<IClientService, ClientService>();
			services.AddScoped<ILawyerTaskService, LawyerTaskService>();
			services.AddScoped<ISubscriptionService, SubscriptionService>();
			services.AddScoped<IPaymobService, PaymobService>();
			services.AddScoped<IAdminReportService, AdminReportService>();
			services.AddScoped<IAdminLawyerService, AdminLawyerService>();
			services.AddScoped<IDocumentWorkspaceService, DocumentWorkspaceService>();
			services.AddScoped<ILegalContractService, LegalContractService>();

			// Register AI Providers (Strategy Pattern)
			services.AddScoped<GeminiProvider>();
			services.AddScoped<OpenAIProvider>();
			services.AddScoped<IAIProviderFactory, AIProviderFactory>();

			services.AddScoped<IPromptService, PromptService>();
			services.AddScoped<IFactAnalysisService, FactAnalysisService>();
			services.AddScoped<IDefenseService, DefenseService>();
			services.AddScoped<ICaseSummaryService, CaseSummaryService>();
			services.AddScoped<ISmartChatService, SmartChatService>();
			services.AddScoped<IDraftAutoSaveService, DraftAutoSaveService>();

			// Pre-flight facts gap evaluation (clarification questions before analysis)
			services.AddScoped<IClarifyFactsService, ClarifyFactsService>();

			// PreparingStatementOfClaimsService - Second level analysis
			services.AddScoped<IPreparingStatementOfClaimsService, PreparingStatementOfClaimsService>();

			services.AddScoped<INotificationService, NotificationService>();
			services.AddScoped<IContactService, ContactService>();
			services.AddScoped<IAgendaService, AgendaService>();
			services.AddScoped<IPowerOfAttorneyService, PowerOfAttorneyService>();
			services.AddScoped<IDocumentHandoffService, DocumentHandoffService>();
			services.AddScoped<IClientTransactionService, ClientTransactionService>();

			services.AddScoped<IAiJobService, AiJobService>();
			services.AddScoped<IAiJobWorker, AiJobWorker>();

			services.AddScoped<IAiModelConfigService, AiModelConfigService>();
            services.AddScoped<ICaseAccessValidator, CaseAccessValidator>();

			services.AddScoped<IAppealBriefService, AppealBriefService>();
			services.AddScoped<IAdminComplaintService, AdminComplaintService>();
			services.AddScoped<IRulingAnalysisService, RulingAnalysisService>();
			services.AddScoped<ILegalWarningService, LegalWarningService>();
			services.AddScoped<IExecRequestService, ExecRequestService>();
			services.AddScoped<IValidationFailureService, ValidationFailureService>();

			services.AddScoped<IAiUsageTrackingService, AiUsageTrackingService>();
            services.AddScoped<IAiUsageReportService, AiUsageReportService>();
            services.AddScoped<IAnalyticsService, AnalyticsService>();
            services.AddScoped<IReviewService, ReviewService>();
            services.AddScoped<ILawyerIdResolver, LawyerIdResolver>();
            services.AddScoped<IWorkflowSnapshotService, WorkflowSnapshotService>();
		services.AddSingleton<PromptTemplateCache>();

		services.AddMemoryCache();

			services.AddValidatorsFromAssembly(typeof(LoginValidator).Assembly);

			return services;
		}
	}
}
