using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lawyer.Application.DTOs.POA;
using Lawyer.Core.Exceptions;

namespace Lawyer.Application.IServices
{
    public interface IPowerOfAttorneyService
    {
        Task<Result<PowerOfAttorneyDto>> CreatePowerOfAttorneyAsync(PowerOfAttorneyDto dto);
        Task<Result<PowerOfAttorneyDto>> CreateLawyerPowerOfAttorneyAsync(PowerOfAttorneyDto dto, Guid lawyerId);
        Task<Result<IEnumerable<PowerOfAttorneyDto>>> GetPowerOfAttorneysByClientAsync(Guid clientId);
        Task<Result<IEnumerable<PowerOfAttorneyDto>>> GetPowerOfAttorneysByLawyerAsync(Guid lawyerId);
        Task<Result<PowerOfAttorneyDto>> CancelPowerOfAttorneyAsync(Guid poaId, string? reason = null);
    }
}
