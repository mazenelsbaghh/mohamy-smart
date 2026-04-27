using Lawyer.Application.Dtos.Notification;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public NotificationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<NotificationDto>>> GetUserNotificationsAsync(Guid applicationUserId, CancellationToken cancellationToken)
        {
            var notifications = await _unitOfWork.Repository<Notification>()!
                .WhereAsync(n => n.ReceiverId == applicationUserId, cancellationToken);
            
            var dtos = notifications
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationDto
                {
                    NotificationId = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type.ToString(),
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt,
                })
                .ToList();

            if (dtos.Count == 0)
            {
                return Result<List<NotificationDto>>.Success(dtos, "No notifications found");
            }

            return Result<List<NotificationDto>>.Success(dtos, "Notifications retrieved successfully");
        }

        public async Task<Result<bool>> MarkAsReadAsync(Guid notificationId, Guid applicationUserId, CancellationToken cancellationToken)
        {
            var notification = await _unitOfWork.Repository<Notification>()!
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.ReceiverId == applicationUserId, cancellationToken);

            if (notification == null)
            {
                return Result<bool>.Error(HttpStatusCode.NotFound, "Notification not found or not owned by the current user");
            }

            notification.IsRead = true;
	            await _unitOfWork.Repository<Notification>().Update(notification);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true, "Notification marked as read");
        }

        public async Task<Result<bool>> MarkAllAsReadAsync(Guid applicationUserId, CancellationToken cancellationToken)
        {
            var unreadNotifications = await _unitOfWork.Repository<Notification>()!
                .WhereAsync(n => n.ReceiverId == applicationUserId && !n.IsRead, cancellationToken);

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
	                await _unitOfWork.Repository<Notification>().Update(notification);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true, "All notifications marked as read");
        }

        public async Task<Result<bool>> DeleteNotificationAsync(Guid notificationId, Guid applicationUserId, CancellationToken cancellationToken)
        {
            var notification = await _unitOfWork.Repository<Notification>()!
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.ReceiverId == applicationUserId, cancellationToken);

            if (notification == null)
            {
                return Result<bool>.Error(HttpStatusCode.NotFound, "Notification not found or not owned by the current user");
            }

            _unitOfWork.Repository<Notification>()!.Delete(notification);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true, "Notification deleted successfully");
        }
    }
}
