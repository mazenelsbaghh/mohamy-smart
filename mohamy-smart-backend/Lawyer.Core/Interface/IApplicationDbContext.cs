using Lawyer.Core.Models;
using Lawyer.Core.Models.Agenda;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Common.Interface
{
	public interface IApplicationDbContext
	{
		DbSet<ApplicationUser> Users { get; }
		DbSet<AiJob> AiJobs { get; }
		DbSet<AiStageModelConfig> AiStageModelConfigs { get; }
		DbSet<AgendaItem> AgendaItems { get; }
		DbSet<Case> Cases { get; }
		DbSet<AppealWorkflow> AppealWorkflows { get; }
		DbSet<AdminComplaintWorkflow> AdminComplaintWorkflows { get; }
		DbSet<RulingAnalysisWorkflow> RulingAnalysisWorkflows { get; }
		DbSet<LegalWarningWorkflow> LegalWarningWorkflows { get; }
		DbSet<ExecRequestWorkflow> ExecRequestWorkflows { get; }
		DbSet<ProcessServerPaper> ProcessServerPapers { get; }
		Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

	}
}
