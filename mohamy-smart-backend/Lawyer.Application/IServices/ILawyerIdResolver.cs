using System;
using System.Threading;
using System.Threading.Tasks;
using Lawyer.Application.Common;
using Lawyer.Core.Common;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;

namespace Lawyer.Application.IServices
{
    public interface ILawyerIdResolver
    {
        Task<Result<Guid>> ResolveAsync(UserContext userContext, Guid? overrideId, CancellationToken cancellationToken);
    }
}
