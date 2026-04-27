using Lawyer.Application.Dtos.Notification;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Lawyer.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : AppControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public NotificationController(INotificationService notificationService, IUnitOfWork unitOfWork)
        {
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications(CancellationToken cancellationToken)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

            var result = await _notificationService.GetUserNotificationsAsync(userId, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPut("{id:guid}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

            var result = await _notificationService.MarkAsReadAsync(id, userId, cancellationToken);
            return CreateResponse(result);
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

            var result = await _notificationService.MarkAllAsReadAsync(userId, cancellationToken);
            return CreateResponse(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteNotification(Guid id, CancellationToken cancellationToken)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(Result<string>.Error(System.Net.HttpStatusCode.Unauthorized, "User not authenticated."));

            var result = await _notificationService.DeleteNotificationAsync(id, userId, cancellationToken);
            return CreateResponse(result);
        }
    }
}
