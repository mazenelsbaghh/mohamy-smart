using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Lawyer.Hubs
{
    [Authorize]
    public class AiJobHub : Hub
    {
        public async Task JoinCase(Guid caseId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"case-{caseId}");
        }

        public async Task LeaveCase(Guid caseId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"case-{caseId}");
        }
    }
}
