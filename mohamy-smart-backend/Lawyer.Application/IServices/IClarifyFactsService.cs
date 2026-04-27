using Lawyer.Application.Dtos.Case;
using Lawyer.Core.Exceptions;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    /// <summary>
    /// Pre-flight service that evaluates case facts for material gaps
    /// before starting any workflow (defense memo, lawsuit, appeal, etc.).
    /// </summary>
    public interface IClarifyFactsService
    {
        /// <summary>
        /// Sends the case facts to the AI to generate 3–7 clarification questions
        /// (each with 3 suggested answers). Returns an empty list when no gaps are found.
        /// </summary>
        Task<Result<ClarifyFactsResponseDto>> EvaluateFactsGapsAsync(
            ClarifyFactsRequestDto request,
            string lawyerId,
            CancellationToken cancellationToken);
    }
}
