using Lawyer.Core.Enum;
using Lawyer.Core.Models;

namespace Lawyer.Application.IServices
{
    public interface IAiJobNotificationService
    {
        Task NotifyJobStatusChangedAsync(AiJob job);
        Task NotifyJobCompletedAsync(AiJob job);
        Task NotifyJobFailedAsync(AiJob job);
    }
}
