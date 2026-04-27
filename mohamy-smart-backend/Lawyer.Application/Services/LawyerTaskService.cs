using Lawyer.Application.Dtos.LawyerTask;
using Lawyer.Application.IServices;
using Lawyer.Application.Common;
using Lawyer.Core.Common;
using Lawyer.Core.Common.Extension;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
	public class LawyerTaskService : ILawyerTaskService
	{
		private readonly IUnitOfWork _unitOfWork;
		private readonly ILogger<LawyerTaskService> _logger;

		public LawyerTaskService(
			IUnitOfWork unitOfWork,
			ILogger<LawyerTaskService> logger)
		{
			_unitOfWork = unitOfWork;
			_logger = logger;
		}

		public async Task<Result<LawyerTaskDto>> CreateAsync(CreateLawyerTaskDto dto, Guid lawyerId, CancellationToken cancellationToken)
		{
			var entity = new LawyerTask
			{
				Title = dto.Title,
				Date = dto.Date,
				Time = dto.Time,
				Notes = dto.Notes,
				LawyerId = lawyerId
			};

			await _unitOfWork.Repository<LawyerTask>().AddAsync(entity);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("LawyerTask created: {Title} for lawyer {LawyerId}", entity.Title, lawyerId);

			return ApiExceptionResponse.Success(MapToDto(entity), "Task created successfully");
		}

		public async Task<Result<LawyerTaskDto>> GetByIdAsync(Guid id, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<LawyerTask>().FirstOrDefaultAsync(x => x.Id == id);
			if (entity == null)
				return ApiExceptionResponse.NotFound<LawyerTaskDto>("Task not found");

			// Ownership check: lawyers can only read their own tasks.
			if (isLawyer && entity.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية الوصول إلى هذه المهمة.");

			return ApiExceptionResponse.Success(MapToDto(entity));
		}

		public async Task<Result<PagedResponse<LawyerTaskDto>>> GetAllAsync(
			int pageNumber,
			int pageSize,
			Guid? lawyerId,
			CancellationToken cancellationToken)
		{
			if (pageNumber <= 0) pageNumber = 1;
			pageSize = PaginationDefaults.ClampPageSize(pageSize);			

			var query = _unitOfWork.Repository<LawyerTask>()
				.AsQueryable()
				.AsNoTracking()
				.OrderByDescending(x => x.Created);

			if (lawyerId.HasValue)
				query = (IOrderedQueryable<LawyerTask>)query.Where(x => x.LawyerId == lawyerId.Value);

			var pagedResult = await query
				.Select(x => new LawyerTaskDto
				{
					Id = x.Id,
					Title = x.Title,
					Date = x.Date,
					Time = x.Time,
					Notes = x.Notes,
					LawyerId = x.LawyerId,
					IsActive = x.IsActive,
					CreationDate = x.Created
				})
				.ToPagedResponseAsync(pageNumber, pageSize, cancellationToken);

			_logger.LogInformation(
				"Retrieved {Count} tasks for lawyer {LawyerId} on page {PageNumber}",
				pagedResult.Data.Count,
				lawyerId,
				pageNumber);

			return ApiExceptionResponse.Success(pagedResult, "Tasks retrieved successfully");
		}

		public async Task<Result<LawyerTaskDto>> UpdateAsync(Guid id, UpdateLawyerTaskDto dto, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<LawyerTask>().FirstOrDefaultAsync(x => x.Id == id);
			if (entity == null)
				return ApiExceptionResponse.NotFound<LawyerTaskDto>("Task not found");

			// Ownership check: lawyers can only update their own tasks.
			if (isLawyer && entity.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية تعديل هذه المهمة.");

			entity.Title = dto.Title;
			entity.Date = dto.Date;
			entity.Time = dto.Time;
			entity.Notes = dto.Notes;
			entity.IsActive = dto.IsActive;

			await _unitOfWork.Repository<LawyerTask>().Update(entity);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("LawyerTask updated: {Id}", entity.Id);

			return ApiExceptionResponse.Success(MapToDto(entity), "Task updated successfully");
		}

		public async Task<Result<bool>> DeleteAsync(Guid id, bool isLawyer, Guid lawyerId, CancellationToken cancellationToken)
		{
			var entity = await _unitOfWork.Repository<LawyerTask>().FirstOrDefaultAsync(x => x.Id == id);
			if (entity == null)
				return ApiExceptionResponse.NotFound<bool>("Task not found");

			// Ownership check: lawyers can only delete their own tasks.
			if (isLawyer && entity.LawyerId != lawyerId)
				throw new ForbiddenException("لا تملك صلاحية حذف هذه المهمة.");

			entity.IsActive = false;
			await _unitOfWork.SaveChangesAsync(cancellationToken);
			_logger.LogInformation("LawyerTask soft-deleted: {Id}", entity.Id);
			return ApiExceptionResponse.Success(true, "Task deleted successfully");
		}

		public async Task<Result<List<LawyerTaskDto>>> GetByPeriodAsync(
			TaskPeriod period,
			DateTime date,
			Guid? lawyerId,
			CancellationToken cancellationToken)
		{
			var resolvedLawyerId = lawyerId;

			var (start, end) = ComputeDateRange(period, date);

			var tasks = await _unitOfWork.Repository<LawyerTask>()
				.AsQueryable()
				.AsNoTracking()
				.Where(x => x.LawyerId == resolvedLawyerId
					&& x.Date >= start
					&& x.Date < end
					&& x.IsActive)
				.OrderBy(x => x.Date)
				.ThenBy(x => x.Time)
				.Select(x => new LawyerTaskDto
				{
					Id = x.Id,
					Title = x.Title,
					Date = x.Date,
					Time = x.Time,
					Notes = x.Notes,
					LawyerId = x.LawyerId,
					IsActive = x.IsActive,
					CreationDate = x.Created
				})
				.ToListAsync(cancellationToken);

			_logger.LogInformation(
				"Retrieved {Count} tasks for lawyer {LawyerId} in period {Period} around {Date}",
				tasks.Count,
				resolvedLawyerId,
				period,
				date);

			return ApiExceptionResponse.Success(tasks, "Tasks retrieved successfully");
		}

		private static (DateTime start, DateTime end) ComputeDateRange(TaskPeriod period, DateTime date)
		{
			return period switch
			{
				TaskPeriod.Daily => (date.Date, date.Date.AddDays(1)),
				TaskPeriod.Weekly => GetWeekRange(date),
				TaskPeriod.Monthly => (new DateTime(date.Year, date.Month, 1),
					new DateTime(date.Year, date.Month, 1).AddMonths(1)),
				TaskPeriod.Yearly => (new DateTime(date.Year, 1, 1),
					new DateTime(date.Year + 1, 1, 1)),
				_ => (date.Date, date.Date.AddDays(1))
			};
		}

		private static (DateTime start, DateTime end) GetWeekRange(DateTime date)
		{
			int diff = ((int)date.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
			var monday = date.Date.AddDays(-diff);
			var sundayEnd = monday.AddDays(7);
			return (monday, sundayEnd);
		}

		private static LawyerTaskDto MapToDto(LawyerTask entity)
		{
			return new LawyerTaskDto
			{
				Id = entity.Id,
				Title = entity.Title,
				Date = entity.Date,
				Time = entity.Time,
				Notes = entity.Notes,
				LawyerId = entity.LawyerId,
				IsActive = entity.IsActive,
				CreationDate = entity.Created
			};
		}
	}
}
