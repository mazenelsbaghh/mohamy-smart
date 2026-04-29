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
                var poa = new PowerOfAttorney
                {
                    ClientId = dto.ClientId,
                    Number = dto.Number,
                    Title = dto.Title,
                    IssuingAuthority = dto.IssuingAuthority,
                    IssueDate = dto.IssueDate,
                    IsCanceled = false,
                    Created = DateTime.UtcNow
                };

                await _unitOfWork.Repository<PowerOfAttorney>().AddAsync(poa);
                await _unitOfWork.SaveChangesAsync(CancellationToken.None);

                dto.Id = poa.Id;
                dto.CreatedAt = poa.Created;
                return Result<PowerOfAttorneyDto>.Success(dto);
            }
            catch (Exception ex)
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
                        Number = p.Number,
                        Title = p.Title,
                        IssuingAuthority = p.IssuingAuthority,
                        IssueDate = p.IssueDate,
                        IsCanceled = p.IsCanceled,
                        CancellationDate = p.CancellationDate,
                        CreatedAt = p.Created
                    })
                    .ToListAsync();

                return Result<IEnumerable<PowerOfAttorneyDto>>.Success(poas);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<PowerOfAttorneyDto>>.Error(System.Net.HttpStatusCode.InternalServerError, "An error occurred while fetching power of attorneys.");
            }
        }

        public async Task<Result<PowerOfAttorneyDto>> CancelPowerOfAttorneyAsync(Guid poaId)
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
	                await _unitOfWork.Repository<PowerOfAttorney>().Update(poa);
                await _unitOfWork.SaveChangesAsync(CancellationToken.None);

                var dto = new PowerOfAttorneyDto
                {
                    Id = poa.Id,
                    ClientId = poa.ClientId,
                    Number = poa.Number,
                    Title = poa.Title,
                    IssuingAuthority = poa.IssuingAuthority,
                    IssueDate = poa.IssueDate,
                    IsCanceled = poa.IsCanceled,
                    CancellationDate = poa.CancellationDate,
                    CreatedAt = poa.Created
                };

                return Result<PowerOfAttorneyDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return Result<PowerOfAttorneyDto>.Error(System.Net.HttpStatusCode.InternalServerError, "An error occurred while canceling the power of attorney.");
            }
        }
    }
}
