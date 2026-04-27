using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class WorkflowSnapshotService : IWorkflowSnapshotService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<WorkflowSnapshotService> _logger;

        public WorkflowSnapshotService(IUnitOfWork unitOfWork, ILogger<WorkflowSnapshotService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<WorkflowSnapshotDto>> CreateSnapshotAsync(
            Guid caseId, string lawyerId, string workflowType, string outputsJson, int currentStep, string? label, CancellationToken ct)
        {
            try
            {
                // Verify the case belongs to the lawyer before creating snapshot
                var caseEntity = await _unitOfWork.Repository<Case>()
                    .FirstOrDefaultAsync(c => c.Id == caseId, ct);
                if (caseEntity == null)
                    return Result<WorkflowSnapshotDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");
                if (!string.Equals(caseEntity.LawyerId.ToString(), lawyerId, StringComparison.OrdinalIgnoreCase))
                    return Result<WorkflowSnapshotDto>.Error(HttpStatusCode.Forbidden, "ليس لديك صلاحية على هذه القضية");

                var snapshot = new WorkflowSnapshot
                {
                    CaseId = caseId,
                    LawyerId = lawyerId,
                    WorkflowType = workflowType,
                    OutputsJson = outputsJson,
                    CurrentStep = currentStep,
                    Label = label,
                    CreatedAt = DateTime.UtcNow,
                };

                await _unitOfWork.Repository<WorkflowSnapshot>().AddAsync(snapshot);
                await _unitOfWork.SaveChangesAsync(ct);

                _logger.LogInformation("Created WorkflowSnapshot {Id} for Case {CaseId}, type {Type}", snapshot.Id, caseId, workflowType);

                return Result<WorkflowSnapshotDto>.Success(MapToDto(snapshot), "تم حفظ النسخة بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating snapshot for Case {CaseId}", caseId);
                return Result<WorkflowSnapshotDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء حفظ النسخة");
            }
        }

        public async Task<Result<List<WorkflowSnapshotDto>>> GetSnapshotsByCaseAsync(Guid caseId, string lawyerId, CancellationToken ct)
        {
            try
            {
                var snapshots = await _unitOfWork.Repository<WorkflowSnapshot>()
                    .WhereAsync(x => x.CaseId == caseId && x.LawyerId == lawyerId, ct);

                var dtos = snapshots
                    .OrderByDescending(s => s.CreatedAt)
                    .Select(MapToDto)
                    .ToList();

                return Result<List<WorkflowSnapshotDto>>.Success(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting snapshots for Case {CaseId}", caseId);
                return Result<List<WorkflowSnapshotDto>>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب النسخ");
            }
        }

        public async Task<Result<WorkflowSnapshotDto>> GetSnapshotByIdAsync(int id, string lawyerId, CancellationToken ct)
        {
            try
            {
                var snapshot = await _unitOfWork.Repository<WorkflowSnapshot>()
                    .FirstOrDefaultAsync(x => x.Id == id, ct);
                if (snapshot == null)
                    return Result<WorkflowSnapshotDto>.Error(HttpStatusCode.NotFound, "النسخة غير موجودة");
                if (snapshot.LawyerId != lawyerId)
                    return Result<WorkflowSnapshotDto>.Error(HttpStatusCode.Forbidden, "ليس لديك صلاحية");

                return Result<WorkflowSnapshotDto>.Success(MapToDto(snapshot));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting snapshot {Id}", id);
                return Result<WorkflowSnapshotDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب النسخة");
            }
        }

        public async Task<Result<bool>> DeleteSnapshotAsync(int id, string lawyerId, CancellationToken ct)
        {
            try
            {
                var snapshot = await _unitOfWork.Repository<WorkflowSnapshot>()
                    .FirstOrDefaultAsync(x => x.Id == id, ct);
                if (snapshot == null)
                    return Result<bool>.Error(HttpStatusCode.NotFound, "النسخة غير موجودة");
                if (snapshot.LawyerId != lawyerId)
                    return Result<bool>.Error(HttpStatusCode.Forbidden, "ليس لديك صلاحية");

                _unitOfWork.Repository<WorkflowSnapshot>().Delete(snapshot);
                await _unitOfWork.SaveChangesAsync(ct);

                return Result<bool>.Success(true, "تم حذف النسخة");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting snapshot {Id}", id);
                return Result<bool>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء حذف النسخة");
            }
        }

        public async Task<Result<bool>> UpdateLabelAsync(int id, string lawyerId, string label, CancellationToken ct)
        {
            try
            {
                var snapshot = await _unitOfWork.Repository<WorkflowSnapshot>()
                    .FirstOrDefaultAsync(x => x.Id == id, ct);
                if (snapshot == null)
                    return Result<bool>.Error(HttpStatusCode.NotFound, "النسخة غير موجودة");
                if (snapshot.LawyerId != lawyerId)
                    return Result<bool>.Error(HttpStatusCode.Forbidden, "ليس لديك صلاحية");

                snapshot.Label = label;
                await _unitOfWork.Repository<WorkflowSnapshot>().Update(snapshot);
                await _unitOfWork.SaveChangesAsync(ct);

                return Result<bool>.Success(true, "تم تحديث اسم النسخة");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating snapshot label {Id}", id);
                return Result<bool>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء تحديث الاسم");
            }
        }

        private static WorkflowSnapshotDto MapToDto(WorkflowSnapshot s) => new()
        {
            Id = s.Id,
            CaseId = s.CaseId,
            WorkflowType = s.WorkflowType,
            OutputsJson = s.OutputsJson,
            CurrentStep = s.CurrentStep,
            Label = s.Label,
            CreatedAt = s.CreatedAt,
        };
    }

    public class WorkflowSnapshotDto
    {
        public int Id { get; set; }
        public Guid CaseId { get; set; }
        public string WorkflowType { get; set; } = string.Empty;
        public string OutputsJson { get; set; } = "{}";
        public int CurrentStep { get; set; }
        public string? Label { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
