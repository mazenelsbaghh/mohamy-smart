using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Core.Exceptions;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface ICaseSummaryService
    {
        Task<Result<CaseSmartAnalysisSummaryDto>> GetCaseSmartAnalysisSummaryAsync(Guid caseId, string userId, CancellationToken cancellationToken);
        Task<Result<byte[]>> GenerateCasePdfAsync(GenerateCasePdfRequestDto request, string userId, CancellationToken cancellationToken);
    }
}
