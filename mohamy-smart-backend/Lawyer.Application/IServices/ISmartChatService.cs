using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Core.Exceptions;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface ISmartChatService
    {
        Task<Result<ChatResponseDto>> ChatAsync(Guid lawyerId, ChatRequestDto request, CancellationToken cancellationToken);
    }
}
