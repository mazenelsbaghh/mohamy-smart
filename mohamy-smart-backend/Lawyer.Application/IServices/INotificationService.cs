using Lawyer.Application.Dtos.Notification;
using Lawyer.Core.Exceptions;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface INotificationService
    {
        Task<Result<List<NotificationDto>>> GetUserNotificationsAsync(Guid applicationUserId, CancellationToken cancellationToken);
        Task<Result<bool>> MarkAsReadAsync(Guid notificationId, Guid applicationUserId, CancellationToken cancellationToken);
        Task<Result<bool>> MarkAllAsReadAsync(Guid applicationUserId, CancellationToken cancellationToken);
        Task<Result<bool>> DeleteNotificationAsync(Guid notificationId, Guid applicationUserId, CancellationToken cancellationToken);
    }
}
