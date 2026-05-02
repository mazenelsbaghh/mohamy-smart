using Lawyer.Core.IRepositories;
using Lawyer.Application.DTOs.POA;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class PowerOfAttorneyService : IPowerOfAttorneyService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PowerOfAttorneyService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<PowerOfAttorneyDto>> CreatePowerOfAttorneyAsync(PowerOfAttorneyDto dto)
        {
            try
            {
                if (!dto.ClientId.HasValue || dto.ClientId.Value == Guid.Empty)
                {
                    return Result<PowerOfAttorneyDto>.Error(System.Net.HttpStatusCode.BadRequest, "ClientId is required for client power of attorney.");
                }

                var serialNumber = await GetNextSerialNumberAsync();

                var poa = new PowerOfAttorney
                {
                    ClientId = dto.ClientId.Value,
                    SerialNumber = serialNumber,
                    Number = dto.Number,
                    Title = dto.Title,
                    IssuingAuthority = dto.IssuingAuthority,
                    IssueDate = dto.IssueDate,
                    PoAType = dto.PoAType ?? "general",
                    IsCanceled = false,
                    Created = DateTime.UtcNow
                };

                await _unitOfWork.Repository<PowerOfAttorney>().AddAsync(poa);
                await _unitOfWork.SaveChangesAsync(CancellationToken.None);

                dto.Id = poa.Id;
                dto.SerialNumber = poa.SerialNumber;
                dto.PoAType = poa.PoAType;
                dto.ClientId = poa.ClientId;
                dto.CreatedAt = poa.Created;
                return Result<PowerOfAttorneyDto>.Success(dto);
            }
            catch (Exception)
            {
                return Result<PowerOfAttorneyDto>.Error(System.Net.HttpStatusCode.InternalServerError, "An error occurred while creating the power of attorney.");
            }
        }

        public async Task<Result<PowerOfAttorneyDto>> CreateLawyerPowerOfAttorneyAsync(PowerOfAttorneyDto dto, Guid lawyerId)
        {
            try
            {
                var serialNumber = await GetNextSerialNumberAsync();

                var poa = new PowerOfAttorney
                {
                    LawyerId = lawyerId,
                    SerialNumber = serialNumber,
                    Number = dto.Number,
                    Title = dto.Title,
                    IssuingAuthority = dto.IssuingAuthority,
                    IssueDate = dto.IssueDate,
                    PoAType = dto.PoAType ?? "general",
                    IsCanceled = false,
                    Created = DateTime.UtcNow
                };

                await _unitOfWork.Repository<PowerOfAttorney>().AddAsync(poa);
                await _unitOfWork.SaveChangesAsync(CancellationToken.None);

                dto.Id = poa.Id;
                dto.SerialNumber = poa.SerialNumber;
                dto.PoAType = poa.PoAType;
                dto.ClientId = null;
                dto.LawyerId = poa.LawyerId;
                dto.CreatedAt = poa.Created;
                return Result<PowerOfAttorneyDto>.Success(dto);
            }
            catch (Exception)
            {
                return Result<PowerOfAttorneyDto>.Error(System.Net.HttpStatusCode.InternalServerError, "An error occurred while creating the power of attorney.");
            }
        }

        public async Task<Result<IEnumerable<PowerOfAttorneyDto>>> GetPowerOfAttorneysByClientAsync(Guid clientId)
        {
            try
            {
                var poas = await _unitOfWork.Repository<PowerOfAttorney>()
                    .AsQueryable()
                    .Where(p => p.ClientId == clientId)
                    .Select(p => new PowerOfAttorneyDto
                    {
                        Id = p.Id,
                        ClientId = p.ClientId,
                        ClientName = p.Client != null ? p.Client.ClientName : null,
                        LawyerId = p.LawyerId,
                        SerialNumber = p.SerialNumber,
                        Number = p.Number,
                        Title = p.Title,
                        IssuingAuthority = p.IssuingAuthority,
                        IssueDate = p.IssueDate,
                        PoAType = p.PoAType,
                        IsCanceled = p.IsCanceled,
                        CancellationDate = p.CancellationDate,
                        CancellationReason = p.CancellationReason,
                        CreatedAt = p.Created
                    })
                    .ToListAsync();

                return Result<IEnumerable<PowerOfAttorneyDto>>.Success(poas);
            }
            catch (Exception)
            {
                return Result<IEnumerable<PowerOfAttorneyDto>>.Error(System.Net.HttpStatusCode.InternalServerError, "An error occurred while fetching power of attorneys.");
            }
        }

        public async Task<Result<IEnumerable<PowerOfAttorneyDto>>> GetPowerOfAttorneysByLawyerAsync(Guid lawyerId)
        {
            try
            {
                var poas = await _unitOfWork.Repository<PowerOfAttorney>()
                    .AsQueryable()
                    .Where(p => p.LawyerId == lawyerId || (p.ClientId != null && p.Client != null && p.Client.LawyerId == lawyerId))
                    .OrderByDescending(p => p.IssueDate)
                    .Select(p => new PowerOfAttorneyDto
                    {
                        Id = p.Id,
                        ClientId = p.ClientId,
                        ClientName = p.Client != null ? p.Client.ClientName : null,
                        LawyerId = p.LawyerId,
                        SerialNumber = p.SerialNumber,
                        Number = p.Number,
                        Title = p.Title,
                        IssuingAuthority = p.IssuingAuthority,
                        IssueDate = p.IssueDate,
                        PoAType = p.PoAType,
                        IsCanceled = p.IsCanceled,
                        CancellationDate = p.CancellationDate,
                        CancellationReason = p.CancellationReason,
                        CreatedAt = p.Created
                    })
                    .ToListAsync();

                return Result<IEnumerable<PowerOfAttorneyDto>>.Success(poas);
            }
            catch (Exception)
            {
                return Result<IEnumerable<PowerOfAttorneyDto>>.Error(System.Net.HttpStatusCode.InternalServerError, "An error occurred while fetching power of attorneys.");
            }
        }

        public async Task<Result<PowerOfAttorneyDto>> CancelPowerOfAttorneyAsync(Guid poaId, string? reason = null)
        {
            try
            {
                var poa = await _unitOfWork.Repository<PowerOfAttorney>().FirstOrDefaultAsync(p => p.Id == poaId);
                if (poa == null)
                {
                    return Result<PowerOfAttorneyDto>.Error(System.Net.HttpStatusCode.NotFound, "Power of attorney not found.");
                }

                poa.IsCanceled = true;
                poa.CancellationDate = DateTime.UtcNow;
                poa.CancellationReason = reason;
                await _unitOfWork.Repository<PowerOfAttorney>().Update(poa);
                await _unitOfWork.SaveChangesAsync(CancellationToken.None);

                var dto = new PowerOfAttorneyDto
                {
                    Id = poa.Id,
                    ClientId = poa.ClientId,
                    ClientName = poa.Client != null ? poa.Client.ClientName : null,
                    LawyerId = poa.LawyerId,
                    SerialNumber = poa.SerialNumber,
                    Number = poa.Number,
                    Title = poa.Title,
                    IssuingAuthority = poa.IssuingAuthority,
                    IssueDate = poa.IssueDate,
                    PoAType = poa.PoAType,
                    IsCanceled = poa.IsCanceled,
                    CancellationDate = poa.CancellationDate,
                    CancellationReason = poa.CancellationReason,
                    CreatedAt = poa.Created
                };

                return Result<PowerOfAttorneyDto>.Success(dto);
            }
            catch (Exception)
            {
                return Result<PowerOfAttorneyDto>.Error(System.Net.HttpStatusCode.InternalServerError, "An error occurred while canceling the power of attorney.");
            }
        }

        private async Task<int> GetNextSerialNumberAsync()
        {
            var maxSerial = await _unitOfWork.Repository<PowerOfAttorney>()
                .AsQueryable()
                .Select(p => (int?)p.SerialNumber)
                .MaxAsync();

            return (maxSerial ?? 0) + 1;
        }
    }
}
