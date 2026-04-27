using Lawyer.Application.Dtos.Documents;
using Lawyer.Core.Common;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
    public interface IDocumentWorkspaceService
    {
        Task<Result<PagedResponse<DocumentRecordDto>>> GetDocumentsAsync(Guid lawyerId, Guid? caseId, string state, int pageNumber, int pageSize, CancellationToken cancellationToken);
    }
}
