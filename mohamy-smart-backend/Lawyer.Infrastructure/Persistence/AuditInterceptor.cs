using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Lawyer.Core.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Lawyer.Infrastructure.Persistence
{
    public class AuditInterceptor : SaveChangesInterceptor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditInterceptor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public override InterceptionResult<int> SavingChanges(
            DbContextEventData eventData,
            InterceptionResult<int> result)
        {
            PopulateAuditFields(eventData);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            PopulateAuditFields(eventData);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private void PopulateAuditFields(DbContextEventData eventData)
        {
            var userId = GetCurrentUserGuid();

            foreach (var entry in eventData.Context.ChangeTracker.Entries())
            {
                if (entry.Entity is BaseEntity<Guid> baseEntity)
                {
                    switch (entry.State)
                    {
                        case EntityState.Added:
                            if (baseEntity.Created == default)
                                baseEntity.Created = DateTime.UtcNow;
                            if (userId.HasValue && baseEntity.CreatedBy == Guid.Empty)
                                baseEntity.CreatedBy = userId.Value;
                            break;
                        case EntityState.Modified:
                            if (userId.HasValue)
                            {
                                baseEntity.UpdatedBy = userId.Value;
                                baseEntity.Updated = DateTime.UtcNow;
                            }
                            break;
                    }
                }
            }
        }

        private Guid? GetCurrentUserGuid()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null) return null;

            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var guid) ? guid : null;
        }
    }
}
