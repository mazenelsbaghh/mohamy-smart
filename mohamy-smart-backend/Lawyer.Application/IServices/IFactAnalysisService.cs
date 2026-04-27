using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Core.Exceptions;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface IFactAnalysisService
    {
        Task<Result<CaseAnalysisResultDto>> AnalyzeCaseFactsAsync(CaseAnalysisRequestDto request, string userId, CancellationToken cancellationToken);
        Task<Result<CaseAnalysisResultDto>> GetFactAnalysisByCaseIdAsync(Guid caseId, string userId, CancellationToken cancellationToken);
    }
}
