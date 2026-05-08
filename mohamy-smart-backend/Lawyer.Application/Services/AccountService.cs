using Lawyer.Application.Dto.Auth;
using Lawyer.Application.Dtos.Account;
using Lawyer.Application.IServices;
using Lawyer.Application.Common;
using Lawyer.Application.Common.Interface;
using Lawyer.Core.Common;
using Lawyer.Core.Common.Extension;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
	public class AccountService : IAccountService
	{
		private readonly IUnitOfWork _unitOfWork;
		private readonly UserManager<ApplicationUser> _userManager;
		private readonly ILogger<AccountService> _logger;
        private readonly ISmsSender _smsSender;
        private readonly IEmailService _emailService;
        private readonly IDateTimeProvider _dateTimeProvider;

		public AccountService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager,
  ILogger<AccountService> logger, ISmsSender smsSender, IEmailService emailService, IDateTimeProvider dateTimeProvider)
		{
			_unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
			_userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
			_logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _smsSender = smsSender;
            _emailService = emailService;
            _dateTimeProvider = dateTimeProvider;
		}

        private static string MaskPhone(string phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber) || phoneNumber.Length < 4)
                return "****";

            return $"***{phoneNumber[^4..]}";
        }



		public async Task<Result<PagedResponse<UserToReturnDto>>> GetAllUsersAsync(
	UserType? filterByUserType,
	int pageNumber,
	int pageSize,
	CancellationToken cancellationToken)
		{
			if (pageNumber <= 0) pageNumber = 1;
			pageSize = PaginationDefaults.ClampPageSize(pageSize);

			var query = _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.AsNoTracking()
				.Include(u => u.Lawyer)
					.ThenInclude(l => l!.LawyerSubscriptions)
						.ThenInclude(ls => ls.Subscription)
				.OrderByDescending(u => u.CreatedAt);

			// Prefer the actual linked profile for lawyer filtering so legacy rows with
			// a missing/stale UserType still appear in admin listings.
			if (filterByUserType.HasValue)
			{
				query = filterByUserType.Value switch
				{
					UserType.Lawyer => (IOrderedQueryable<ApplicationUser>)query.Where(u => u.Lawyer != null),
					UserType.Admin => (IOrderedQueryable<ApplicationUser>)query.Where(u => u.UserType == UserType.Admin),
					_ => query
				};
			}

			var caseCounts = await _unitOfWork.Repository<Case>().AsQueryable()
				.Where(c => c.IsActive)
				.GroupBy(c => c.LawyerId)
				.Select(g => new { LawyerId = g.Key, Count = g.Count() })
				.ToDictionaryAsync(x => x.LawyerId, x => x.Count, cancellationToken);

			// Project to DTO including lawyer info
			var projected = query.Select(u => new UserToReturnDto
			{
				Id = u.Id,
				FullName = u.FullName,
				Email = u.Email,
				PhoneNumber = u.PhoneNumber,
				IsActive = u.IsActive,
				UserType = u.UserType,
				LawyerId = u.Lawyer != null ? u.Lawyer.Id : null,
				LawyerCreatedAt = u.Lawyer != null ? u.Lawyer.Created : null,

				// Lawyer specific fields
				BarNumber = u.Lawyer != null ? u.Lawyer.BarNumber : null,
				Specialization = u.Lawyer != null ? u.Lawyer.Specialization : null,
				ExperienceNumber = u.Lawyer != null ? u.Lawyer.ExperienceNumber : null,
				LawFirmName = u.Lawyer != null ? u.Lawyer.LawFirmName : null,
				BirthDate = u.Lawyer != null ? u.Lawyer.BirthDate : null,

				// Subscription info
				SubscriptionPlanName = u.Lawyer != null
					? u.Lawyer.LawyerSubscriptions.Where(ls => ls.IsActive).Select(ls => ls.Subscription.Name).FirstOrDefault()
					: null,
				SubscriptionIsActive = u.Lawyer != null
					? u.Lawyer.LawyerSubscriptions.Any(ls => ls.IsActive)
					: (bool?)null,

				// Cases count — populated from caseCounts dictionary after materialization
				NumberOfCases = 0
			});

			// Paginate
			var pagedResult = await projected.ToPagedResponseAsync(pageNumber, pageSize, cancellationToken);

			// Hydrate NumberOfCases from the pre-computed dictionary (avoids N+1 correlated subquery)
			foreach (var dto in pagedResult.Data)
			{
				if (dto.LawyerId.HasValue)
					dto.NumberOfCases = caseCounts.GetValueOrDefault(dto.LawyerId.Value);
			}

			_logger.LogInformation("Retrieved {Count} users for page {PageNumber}", pagedResult.Data.Count, pageNumber);

			return ApiExceptionResponse.Success(pagedResult, "Users retrieved successfully");
		}




		public async Task<Result<UserToReturnDto>> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken)
		{
			var user = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.Include(u => u.Lawyer)
				.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

			if (user == null)
				return ApiExceptionResponse.BadRequest<UserToReturnDto>($"User with ID '{userId}' not found.");

			var roles = await _userManager.GetRolesAsync(user);

			var dto = new UserToReturnDto
			{
				Id = user.Id,
				FullName = user.FullName,
				Email = user.Email,
				PhoneNumber = user.PhoneNumber,
				IsActive = user.IsActive,
				UserType = user.UserType,
				LawyerId = user.Lawyer?.Id,
				LawyerCreatedAt = user.Lawyer?.Created,

				// Lawyer specific fields
				BarNumber = user.Lawyer?.BarNumber,
				Specialization = user.Lawyer?.Specialization,
				ExperienceNumber = user.Lawyer?.ExperienceNumber,
				LawFirmName = user.Lawyer?.LawFirmName,
				BirthDate = user.Lawyer?.BirthDate
			};

			return ApiExceptionResponse.Success(dto, "User retrieved successfully.");
		}



		public async Task<Result<UserToReturnDto>> UpdateUserAsync(Guid userId, UpdateUserDto dto, CancellationToken cancellationToken)
		{
			var user = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.Include(u => u.Lawyer)
					.ThenInclude(l => l!.LawyerSubscriptions.Where(ls => ls.IsActive))
					.ThenInclude(ls => ls.Subscription)
				.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

			if (user == null)
				return ApiExceptionResponse.NotFound<UserToReturnDto>("User not found.");

			if (ContainsUnsafePlainText(dto.FullName, dto.BarNumber, dto.Specialization, dto.ExperienceNumber, dto.LawFirmName, dto.BirthDate))
				return ApiExceptionResponse.BadRequest<UserToReturnDto>("One or more text fields contain invalid characters.");

			if (dto.FullName != null) user.FullName = PlainTextInputGuard.NormalizePlainText(dto.FullName);
			if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
			if (dto.Email != null) user.Email = dto.Email;
			if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;

			if (user.Lawyer != null)
			{
					if (dto.BarNumber != null) user.Lawyer.BarNumber = PlainTextInputGuard.NormalizePlainText(dto.BarNumber);
					if (dto.Specialization != null) user.Lawyer.Specialization = PlainTextInputGuard.NormalizePlainText(dto.Specialization);
					if (dto.ExperienceNumber != null) user.Lawyer.ExperienceNumber = PlainTextInputGuard.NormalizePlainText(dto.ExperienceNumber);
					if (dto.LawFirmName != null) user.Lawyer.LawFirmName = PlainTextInputGuard.NormalizePlainText(dto.LawFirmName);
					if (dto.BirthDate != null) user.Lawyer.BirthDate = PlainTextInputGuard.NormalizePlainText(dto.BirthDate);
			}

			await _userManager.UpdateAsync(user);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("User {UserId} updated by admin.", userId);

			var activeSubscription = user.Lawyer?.LawyerSubscriptions?
				.Where(ls => ls.IsActive)
				.Select(ls => ls.Subscription)
				.FirstOrDefault();

			var numberOfCases = user.Lawyer != null
				? await _unitOfWork.Repository<Case>().AsQueryable().CountAsync(c => c.LawyerId == user.Lawyer.Id, cancellationToken)
				: 0;

			var result = new UserToReturnDto
			{
				Id = user.Id,
				FullName = user.FullName,
				Email = user.Email ?? string.Empty,
				PhoneNumber = user.PhoneNumber ?? string.Empty,
				IsActive = user.IsActive,
				UserType = user.UserType,
				LawyerId = user.Lawyer?.Id,
				LawyerCreatedAt = user.Lawyer?.Created,
				BarNumber = user.Lawyer?.BarNumber,
				Specialization = user.Lawyer?.Specialization,
				ExperienceNumber = user.Lawyer?.ExperienceNumber,
				LawFirmName = user.Lawyer?.LawFirmName,
				BirthDate = user.Lawyer?.BirthDate,
				SubscriptionPlanName = activeSubscription?.Name,
				SubscriptionIsActive = user.Lawyer?.LawyerSubscriptions?.Any(ls => ls.IsActive),
				NumberOfCases = numberOfCases
			};

			return ApiExceptionResponse.Success(result, "User updated successfully.");
		}

		public async Task<Result<string>> DeleteUserAsync(Guid userId, CancellationToken cancellationToken)
		{
			var user = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

			if (user == null)
				return ApiExceptionResponse.NotFound<string>("User not found.");

			if (!user.IsActive)
				return ApiExceptionResponse.BadRequest<string>("User is already deactivated.");

			user.IsActive = false;
			user.RefreshToken = null;
			user.RefreshTokenExpiresAt = null;

			await _userManager.UpdateAsync(user);

			_logger.LogInformation("User {UserId} soft-deleted by admin.", userId);
			return ApiExceptionResponse.Success("User deactivated successfully.");
		}

		public async Task<Result<string>> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, string confirmPassword, string otpCode, CancellationToken cancellationToken)
		{
			var user = await _userManager.FindByIdAsync(userId.ToString());
			if (user == null)
				return ApiExceptionResponse.BadRequest<string>("User not found.");

			if (newPassword != confirmPassword)
				return ApiExceptionResponse.BadRequest<string>("كلمة المرور الجديدة وتأكيدها غير متطابقين.");

			var passwordValid = await _userManager.CheckPasswordAsync(user, currentPassword);
			if (!passwordValid)
				return ApiExceptionResponse.BadRequest<string>("Current password is incorrect.");

            var otpEntity = await _unitOfWork.Repository<Otp>()
                .FirstOrDefaultAsync(
                    x => x.UserId == userId &&
                         x.Type == OtpType.sensitiveAction &&
                         x.ConsumedAtUtc == null &&
                         x.InvalidatedAtUtc == null,
                    cancellationToken);

            if (otpEntity == null ||
                otpEntity.ExpirationDate < _dateTimeProvider.UtcNow ||
                !otpEntity.IsVerified ||
                !OtpHelper.MatchesOtp(otpCode, otpEntity.Code, otpEntity.CodeSalt))
            {
                return ApiExceptionResponse.BadRequest<string>("OTP verification is required before changing the password.");
            }

			var changeResult = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
			if (!changeResult.Succeeded)
			{
				var error = changeResult.Errors.FirstOrDefault()?.Description ?? "Password change failed.";
				return ApiExceptionResponse.BadRequest<string>(error);
			}

			user.RefreshToken = null;
			user.RefreshTokenExpiresAt = null;

            otpEntity.ConsumedAtUtc = _dateTimeProvider.UtcNow;
            otpEntity.IsVerified = false;
            await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("Password changed successfully for user {UserId}", userId);
			return ApiExceptionResponse.Success("Password changed successfully.");
		}

        public async Task<Result<string>> RequestAccountOtpAsync(Guid userId, RequestAccountOtpDto dto, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Repository<ApplicationUser>()
                .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

            if (user == null)
                return ApiExceptionResponse.NotFound<string>("User not found.");

            var oneHourAgo = _dateTimeProvider.UtcNow.AddHours(-1);
            var recentOtps = await _unitOfWork.Repository<Otp>()
                .WhereAsync(o => o.UserId == userId && o.Type == OtpType.sensitiveAction && o.Created > oneHourAgo, cancellationToken);

            if (recentOtps.Count >= 5)
                return ApiExceptionResponse.BadRequest<string>("تم تجاوز الحد الأقصى لطلبات التحقق. حاول مرة أخرى بعد ساعة.");

            var fifteenMinutesAgo = _dateTimeProvider.UtcNow.AddMinutes(-15);
            var lockedOut = recentOtps.Count(o =>
                o.FailureReason == "AttemptLimitExceeded" && o.Created > fifteenMinutesAgo);

            if (lockedOut >= 3)
                return ApiExceptionResponse.BadRequest<string>("تم تجاوز الحد الأقصى لمحاولات التحقق الخاطئة. حاول مرة أخرى بعد 15 دقيقة.");

            var existing = await _unitOfWork.Repository<Otp>()
                .WhereAsync(x => x.UserId == userId && x.Type == OtpType.sensitiveAction && x.ConsumedAtUtc == null && x.InvalidatedAtUtc == null, cancellationToken);
            foreach (var otp in existing)
            {
                otp.InvalidatedAtUtc = _dateTimeProvider.UtcNow;
                otp.FailureReason = "SupersededByNewOtp";
                await _unitOfWork.Repository<Otp>().Update(otp);
            }

            var code = OtpHelper.GenerateOtpCode();
            var accountSalt = OtpHelper.GenerateSalt();
            var entity = new Otp
            {
                UserId = userId,
                Code = OtpHelper.HashOtpCode(code, accountSalt),
                CodeSalt = accountSalt,
                Type = OtpType.sensitiveAction,
                ExpirationDate = _dateTimeProvider.UtcNow.AddMinutes(5),
                DeliveryChannel = "Sms",
                MaskedDestination = MaskPhone(user.PhoneNumber ?? string.Empty),
                MaxAttempts = 5,
                AttemptCount = 0,
                IsVerified = false
            };

            await _unitOfWork.Repository<Otp>().AddAsync(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var sent = await _smsSender.SendOtpAsync(user.PhoneNumber ?? string.Empty, $"رمز التحقق الخاص بك هو {code}", $"account-otp:{userId}", cancellationToken);
            if (!sent)
            {
                entity.FailureReason = "SmsDeliveryFailed";
            }

            await _unitOfWork.Repository<Otp>().Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiExceptionResponse.Success($"تم إرسال رمز التحقق إلى {entity.MaskedDestination} إذا كانت وسيلة التواصل متاحة.");
        }

        public async Task<Result<bool>> VerifyAccountOtpAsync(Guid userId, VerifyAccountOtpDto dto, CancellationToken cancellationToken)
        {
            var otpEntity = await _unitOfWork.Repository<Otp>()
                .FirstOrDefaultAsync(
                    x => x.UserId == userId &&
                         x.Type == OtpType.sensitiveAction &&
                         x.ConsumedAtUtc == null &&
                         x.InvalidatedAtUtc == null,
                    cancellationToken);

            if (otpEntity == null || otpEntity.ExpirationDate < _dateTimeProvider.UtcNow)
                return ApiExceptionResponse.BadRequest<bool>("OTP is invalid or expired.");

            if (!OtpHelper.MatchesOtp(dto.Code, otpEntity.Code, otpEntity.CodeSalt))
            {
                otpEntity.AttemptCount++;
                if (otpEntity.AttemptCount >= otpEntity.MaxAttempts)
                {
                    otpEntity.InvalidatedAtUtc = _dateTimeProvider.UtcNow;
                    otpEntity.FailureReason = "AttemptLimitExceeded";
                }

                await _unitOfWork.Repository<Otp>().Update(otpEntity);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return ApiExceptionResponse.BadRequest<bool>("OTP is invalid or expired.");
            }

            otpEntity.IsVerified = true;
            await _unitOfWork.Repository<Otp>().Update(otpEntity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiExceptionResponse.Success(true, "OTP verified successfully.");
        }

        public async Task<Result<string>> RequestChangePhoneAsync(Guid userId, ChangePhoneRequestDto dto, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Repository<ApplicationUser>()
                .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

            if (user == null)
                return ApiExceptionResponse.NotFound<string>("User not found.");

            var passwordValid = await _userManager.CheckPasswordAsync(user, dto.CurrentPassword);
            if (!passwordValid)
                return ApiExceptionResponse.BadRequest<string>("كلمة المرور الحالية غير صحيحة.");

            if (string.IsNullOrWhiteSpace(dto.NewPhoneNumber))
                return ApiExceptionResponse.BadRequest<string>("رقم الهاتف الجديد مطلوب.");

            var oneHourAgo = _dateTimeProvider.UtcNow.AddHours(-1);
            var recentOtps = await _unitOfWork.Repository<Otp>()
                .WhereAsync(o => o.UserId == userId && o.Type == OtpType.sensitiveAction && o.Created > oneHourAgo, cancellationToken);

            if (recentOtps.Count >= 5)
                return ApiExceptionResponse.BadRequest<string>("تم تجاوز الحد الأقصى لطلبات التحقق. حاول مرة أخرى بعد ساعة.");

            var fifteenMinutesAgo = _dateTimeProvider.UtcNow.AddMinutes(-15);
            var lockedOut = recentOtps.Count(o => o.FailureReason == "AttemptLimitExceeded" && o.Created > fifteenMinutesAgo);
            if (lockedOut >= 3)
                return ApiExceptionResponse.BadRequest<string>("تم تجاوز الحد الأقصى لمحاولات التحقق الخاطئة. حاول مرة أخرى بعد 15 دقيقة.");

            var existing = await _unitOfWork.Repository<Otp>()
                .WhereAsync(x => x.UserId == userId && x.Type == OtpType.sensitiveAction && x.ConsumedAtUtc == null && x.InvalidatedAtUtc == null, cancellationToken);
            foreach (var otp in existing)
            {
                otp.InvalidatedAtUtc = _dateTimeProvider.UtcNow;
                otp.FailureReason = "SupersededByNewOtp";
                await _unitOfWork.Repository<Otp>().Update(otp);
            }

            var code = OtpHelper.GenerateOtpCode();
            var accountSalt = OtpHelper.GenerateSalt();
            var entity = new Otp
            {
                UserId = userId,
                Code = OtpHelper.HashOtpCode(code, accountSalt),
                CodeSalt = accountSalt,
                Type = OtpType.sensitiveAction,
                ExpirationDate = _dateTimeProvider.UtcNow.AddMinutes(5),
                DeliveryChannel = "SmsPhoneChange:" + dto.NewPhoneNumber,
                MaskedDestination = MaskPhone(dto.NewPhoneNumber),
                MaxAttempts = 5,
                AttemptCount = 0,
                IsVerified = false
            };

            await _unitOfWork.Repository<Otp>().AddAsync(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var sent = await _smsSender.SendOtpAsync(dto.NewPhoneNumber, $"رمز التحقق لتغيير رقم الهاتف هو {code}", $"change-phone-otp:{userId}", cancellationToken);
            if (!sent)
            {
                entity.FailureReason = "SmsDeliveryFailed";
            }

            await _unitOfWork.Repository<Otp>().Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiExceptionResponse.Success($"تم إرسال رمز التحقق إلى {entity.MaskedDestination}");
        }

        public async Task<Result<string>> VerifyChangePhoneAsync(Guid userId, ChangePhoneVerifyDto dto, CancellationToken cancellationToken)
        {
            var otpEntity = await _unitOfWork.Repository<Otp>()
                .FirstOrDefaultAsync(
                    x => x.UserId == userId &&
                         x.Type == OtpType.sensitiveAction &&
                         x.ConsumedAtUtc == null &&
                         x.InvalidatedAtUtc == null,
                    cancellationToken);

            if (otpEntity == null || otpEntity.ExpirationDate < _dateTimeProvider.UtcNow || !otpEntity.DeliveryChannel.StartsWith("SmsPhoneChange:"))
                return ApiExceptionResponse.BadRequest<string>("OTP is invalid or expired.");

            if (!OtpHelper.MatchesOtp(dto.OtpCode, otpEntity.Code, otpEntity.CodeSalt))
            {
                otpEntity.AttemptCount++;
                if (otpEntity.AttemptCount >= otpEntity.MaxAttempts)
                {
                    otpEntity.InvalidatedAtUtc = _dateTimeProvider.UtcNow;
                    otpEntity.FailureReason = "AttemptLimitExceeded";
                }
                await _unitOfWork.Repository<Otp>().Update(otpEntity);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return ApiExceptionResponse.BadRequest<string>("OTP is invalid or expired.");
            }

            var newPhone = otpEntity.DeliveryChannel.Substring("SmsPhoneChange:".Length);

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user != null)
            {
                user.PhoneNumber = newPhone;
                await _userManager.UpdateAsync(user);
            }

            otpEntity.IsVerified = true;
            otpEntity.ConsumedAtUtc = _dateTimeProvider.UtcNow;
            await _unitOfWork.Repository<Otp>().Update(otpEntity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiExceptionResponse.Success("تم تغيير رقم الهاتف بنجاح.");
        }

		public async Task<bool> LogoutAsync(string userId)
		{
			if (string.IsNullOrEmpty(userId)) return false;

			try
			{
				var user = await _userManager.FindByIdAsync(userId);
				if (user != null)
				{
					user.RefreshToken = null;
					user.RefreshTokenExpiresAt = _dateTimeProvider.UtcNow;
					await _userManager.UpdateAsync(user);
				}
			}
			catch (Exception)
			{
				return false;
			}

			return true;
		}



		public async Task<bool> LogoutAllDevicesAsync(string userId)
		{
			if (string.IsNullOrEmpty(userId)) return false;

			var user = await _userManager.FindByIdAsync(userId);
			if (user != null)
			{
				user.RefreshToken = null;
				user.RefreshTokenExpiresAt = _dateTimeProvider.UtcNow;
				await _userManager.UpdateAsync(user);
			}

			return true;
		}



		public async Task<Result<ProfileDto>> GetProfileAsync(Guid userId, CancellationToken cancellationToken)
		{
			var user = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.Include(u => u.Lawyer)
				.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

			if (user == null)
				return ApiExceptionResponse.NotFound<ProfileDto>("User profile not found.");

			var dto = new ProfileDto
			{
				LawyerId = user.Lawyer?.Id ?? Guid.Empty,
				ApplicationUserId = user.Id.ToString(),
				FullName = user.FullName,
				Email = user.Email ?? string.Empty,
				PhoneNumber = user.PhoneNumber ?? string.Empty,
				OfficeName = user.Lawyer?.LawFirmName ?? string.Empty,
				Address = string.Empty
			};

			return ApiExceptionResponse.Success(dto, "تم جلب الملف الشخصي بنجاح");
		}

		public async Task<Result<ProfileDto>> UpdateProfileAsync(Guid userId, UpdateProfileDto dto, CancellationToken cancellationToken)
		{
			var user = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.Include(u => u.Lawyer)
				.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

			if (user == null)
				return ApiExceptionResponse.NotFound<ProfileDto>("User profile not found.");

			if (ContainsUnsafePlainText(dto.FullName, dto.OfficeName, dto.Address))
				return ApiExceptionResponse.BadRequest<ProfileDto>("One or more text fields contain invalid characters.");

			if (dto.FullName != null) user.FullName = PlainTextInputGuard.NormalizePlainText(dto.FullName);
			if (dto.Email != null) user.Email = dto.Email;
			
			if (dto.OfficeName != null && user.Lawyer != null) user.Lawyer.LawFirmName = PlainTextInputGuard.NormalizePlainText(dto.OfficeName);

			await _userManager.UpdateAsync(user);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			var updatedDto = new ProfileDto
			{
				LawyerId = user.Lawyer?.Id ?? Guid.Empty,
				ApplicationUserId = user.Id.ToString(),
				FullName = user.FullName,
				Email = user.Email ?? string.Empty,
				PhoneNumber = user.PhoneNumber ?? string.Empty,
				OfficeName = user.Lawyer?.LawFirmName ?? string.Empty,
				Address = string.Empty
			};

			return ApiExceptionResponse.Success(updatedDto, "تم تحديث الملف الشخصي بنجاح");
		}

		private static bool ContainsUnsafePlainText(params string?[] values)
		{
			return values.Any(value => !PlainTextInputGuard.IsSafePlainText(value));
		}
	}
}
