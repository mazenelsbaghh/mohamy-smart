using Lawyer.Application.Common;
using Lawyer.Application.IServices;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Lawyer.Core.Exceptions;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Lawyer.Application.Services
{
    public class CaseAccessValidator : ICaseAccessValidator
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CaseAccessValidator> _logger;

        public CaseAccessValidator(IUnitOfWork unitOfWork, ILogger<CaseAccessValidator> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<bool>> ValidateAsync(Guid caseId, string lawyerId, bool isAdmin, CancellationToken ct)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<bool>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork.Repository<Case>().FirstOrDefaultAsync(x => x.Id == caseId, ct);
                if (caseEntity == null)
                    return Result<bool>.Error(System.Net.HttpStatusCode.NotFound, "القضية غير موجودة");

                if (isAdmin)
                    return new Result<bool> { Data = true, Succeeded = true, StatusCode = System.Net.HttpStatusCode.OK };

                if (!Guid.TryParse(lawyerId, out var parsedUserId) || parsedUserId == Guid.Empty)
                    return Result<bool>.Error(System.Net.HttpStatusCode.Forbidden, "معرف المستخدم غير صالح");

                var lawyer = await _unitOfWork.Repository<Lawyer.Core.Models.Lawyer>()
                    .FirstOrDefaultAsync(x => x.ApplicationUserId == parsedUserId, ct);

                if (lawyer == null)
                    return Result<bool>.Error(System.Net.HttpStatusCode.NotFound, "حساب المحامي غير موجود");

                if (caseEntity.LawyerId != lawyer.Id)
                    return Result<bool>.Error(System.Net.HttpStatusCode.Forbidden, "ليس لديك صلاحية على هذه القضية");

                return new Result<bool> { Data = true, Succeeded = true, StatusCode = System.Net.HttpStatusCode.OK };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating case access for case {CaseId}", caseId);
                return Result<bool>.Error(System.Net.HttpStatusCode.InternalServerError, "حدث خطأ أثناء التحقق من الصلاحيات");
            }
        }
    }
}
