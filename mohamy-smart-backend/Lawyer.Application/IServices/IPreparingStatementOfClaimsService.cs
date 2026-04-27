using Lawyer.Application.Dtos.PreparingStatementOfClaims;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public interface IPreparingStatementOfClaimsService
    {
        // LawSuit Case Type
        Task<Result<LawSuitCaseTypeResponseDto>> ClassifyLawSuitCaseTypeAsync(
            LawSuitCaseTypeRequestDto request,
            string userId,
            CancellationToken cancellationToken);

        Task<Result<LawSuitCaseTypeResponseDto>> GetLawSuitCaseTypeByCaseIdAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken);

        // LawSuit Parties
        Task<Result<LawSuitPartiesResponseDto>> ExtractLawSuitPartiesAsync(
            LawSuitPartiesRequestDto request,
            string userId,
            CancellationToken cancellationToken);

        Task<Result<LawSuitPartiesResponseDto>> GetLawSuitPartiesByCaseIdAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken);

        // LawSuit Subjects
        Task<Result<LawSuitSubjectsResponseDto>> GenerateLawSuitSubjectsAsync(
            LawSuitSubjectsRequestDto request,
            string userId,
            CancellationToken cancellationToken);

        Task<Result<LawSuitSubjectsResponseDto>> GetLawSuitSubjectsByCaseIdAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken);

        // LawSuit Facts
        Task<Result<LawSuitFactsResponseDto>> GenerateLawSuitFactsAsync(
            LawSuitFactsRequestDto request,
            string userId,
            CancellationToken cancellationToken);

        Task<Result<LawSuitFactsResponseDto>> GetLawSuitFactsByCaseIdAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken);

        // LawSuit Legal Basis
        Task<Result<LawSuitLegalBasisResponseDto>> GenerateLawSuitLegalBasisAsync(
            LawSuitLegalBasisRequestDto request,
            string userId,
            CancellationToken cancellationToken);

        Task<Result<LawSuitLegalBasisResponseDto>> GetLawSuitLegalBasisByCaseIdAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken);

        // LawSuit Requests
        Task<Result<LawSuitRequestsResponseDto>> GenerateLawSuitRequestsAsync(
            LawSuitRequestsRequestDto request,
            string userId,
            CancellationToken cancellationToken);

        Task<Result<LawSuitRequestsResponseDto>> GetLawSuitRequestsByCaseIdAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken);

        Task<Result<bool>> AbandonWorkflowAsync(Guid caseId, string lawyerId, CancellationToken ct);

        Task<Result<object>> SaveDraftAsync(Guid caseId, int stepNumber, Lawyer.Application.Dtos.Workflows.SaveWorkflowDraftRequest request, string lawyerId, CancellationToken ct);

        /// <summary>Aggregated summary of all step outputs for the given case.</summary>
        Task<Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>> GetSummaryByCaseIdAsync(
            Guid caseId, string lawyerId, CancellationToken ct);

        /// <summary>Lightweight initializer — validates the case and returns a stub summary with caseId.</summary>
        Task<Result<Dtos.PreparingStatementOfClaims.StatementOfClaimsSummaryDto>> InitializeWorkflowAsync(
            Guid caseId, string lawyerId, CancellationToken ct);
    }
}
