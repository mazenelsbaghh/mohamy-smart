using Lawyer.Application.Dtos.Documents;
using Lawyer.Application.IServices;
using Lawyer.Core.Common;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class DocumentWorkspaceService : IDocumentWorkspaceService
    {
        public Task<Result<PagedResponse<DocumentRecordDto>>> GetDocumentsAsync(Guid lawyerId, Guid? caseId, string state, int pageNumber, int pageSize, CancellationToken cancellationToken)
        {
            // The document entity is not yet backed by EF, return an empty collection
            var emptyResponse = new PagedResponse<DocumentRecordDto>(new List<DocumentRecordDto>(), pageNumber, pageSize, 0);
            return Task.FromResult(Result<PagedResponse<DocumentRecordDto>>.Success(emptyResponse));
        }
    }
}
