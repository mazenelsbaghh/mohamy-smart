using System;
using System.Threading;
using System.Threading.Tasks;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;

namespace Lawyer.Application.Common
{
    public class LawyerIdResolver : ILawyerIdResolver
    {
        private readonly IUnitOfWork _unitOfWork;

        public LawyerIdResolver(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<Guid>> ResolveAsync(UserContext userContext, Guid? overrideId, CancellationToken cancellationToken)
        {
            if (userContext.IsLawyer)
            {
                if (userContext.UserId == Guid.Empty)
                    return ApiExceptionResponse.Unauthorized<Guid>("User required");

                var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
                    .FirstOrDefaultAsync(x => x.ApplicationUserId == userContext.UserId, cancellationToken);

                if (lawyer == null)
                    return ApiExceptionResponse.NotFound<Guid>("Lawyer profile not found");

                return Result<Guid>.Success(lawyer.Id);
            }

            if (userContext.IsAdmin)
            {
                if (!overrideId.HasValue || overrideId == Guid.Empty)
                    return ApiExceptionResponse.BadRequest<Guid>("LawyerId is required for admin");

                return Result<Guid>.Success(overrideId.Value);
            }

            return ApiExceptionResponse.Unauthorized<Guid>("Unauthorized");
        }
    }
}
