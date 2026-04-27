using Lawyer.Application.Common;
using Lawyer.Core.Exceptions;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface ICaseAccessValidator
    {
        /// <summary>
        /// Validates that a specific lawyer is authorized to access a required case context.
        /// </summary>
        /// <param name="caseId">The unique identifier of the case.</param>
        /// <param name="lawyerId">The unique identifier of the lawyer requesting access.</param>
        /// <param name="ct">Cancellation token.</param>
        /// <returns>Result indicating whether access is granted natively.</returns>
        Task<Result<bool>> ValidateAsync(Guid caseId, string lawyerId, bool isAdmin, CancellationToken ct);
    }
}
