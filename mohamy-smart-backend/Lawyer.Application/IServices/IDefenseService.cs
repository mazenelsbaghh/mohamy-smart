using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Core.Exceptions;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface IDefenseService
    {
        Task<Result<CaseDefensesResultDto>> GenerateCaseDefensesAsync(CaseDefensesRequestDto request, string userId, CancellationToken cancellationToken);
        Task<Result<CaseDefensesResultDto>> GetDefensesByCaseIdAsync(Guid caseId, string userId, CancellationToken cancellationToken);
        Task<Result<DefenseDetailDto>> CreateDefenseAsync(CreateDefenseRequestDto request, string userId, CancellationToken cancellationToken);
        Task<Result<DefenseDetailDto>> UpdateDefenseTitleAsync(Guid defenseId, UpdateDefenseTitleRequestDto request, string userId, CancellationToken cancellationToken);
        Task<Result<bool>> DeleteDefenseAsync(Guid defenseId, string userId, CancellationToken cancellationToken);
        Task<Result<AnalyzeDefenseResponseDto>> AnalyzeDefenseAsync(AnalyzeDefenseRequestDto request, string userId, CancellationToken cancellationToken);
        Task<Result<AnalyzeDefenseResponseDto>> GetDefenseAnalysisByDefenseIdAsync(Guid defenseId, string userId, CancellationToken cancellationToken);
        Task<Result<FinalRequirementsResponseDto>> GenerateFinalRequirementsAsync(FinalRequirementsRequestDto request, string userId, CancellationToken cancellationToken);
        Task<Result<DefenseMemoDraftResponseDto>> GenerateDefenseMemoDraftAsync(DefenseMemoDraftRequestDto request, string systemUserId, CancellationToken ct);
        Task<Result<bool>> AbandonAnalysisAsync(Guid caseId, string lawyerId, CancellationToken ct);
    }
}
