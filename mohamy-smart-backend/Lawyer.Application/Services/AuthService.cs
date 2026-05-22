using Lawyer.Application.Common;
using Lawyer.Application.Common.Interface;
using Lawyer.Application.Dto.Auth;
using Lawyer.Application.IServices;
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
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AuthService> _logger;
        private readonly IAuditService _audit;
        private readonly IDateTimeProvider _dateTimeProvider;
        private readonly IUserContextProvider _userContextProvider;
        private readonly IEmailService _emailService;
        private readonly ISmsSender _smsSender;

        private const string PhoneNotRegisteredMessage = "رقم الهاتف غير مسجّل. يرجى إنشاء حساب أولًا.";


        public AuthService(UserManager<ApplicationUser> userManager, ITokenService tokenService,
            IUnitOfWork unitOfWork, ILogger<AuthService> logger, IAuditService audit, IDateTimeProvider dateTimeProvider, IUserContextProvider userContextProvider, IEmailService emailService, ISmsSender smsSender)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _audit = audit;
            _dateTimeProvider = dateTimeProvider;
            _userContextProvider = userContextProvider;
            _emailService = emailService;
            _smsSender = smsSender;
        }

        private static string HashRefreshToken(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(bytes);
        }

        private string GetClientIp()
        {
            return _userContextProvider.GetCurrentContext().ClientIp ?? string.Empty;
        }

        private static string MaskPhone(string phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber) || phoneNumber.Length < 4)
                return "****";

            var visible = phoneNumber[^4..];
            return $"***{visible}";
        }

        // Normalize Arabic-Indic (٠-٩) and Extended Arabic-Indic (۰-۹) digits to Latin 0-9,
        // and strip whitespace. Users paste SMS codes or type with a localized keyboard — the hash
        // comparison fails silently without this.
        private static string NormalizeDigits(string? input)
        {
            if (string.IsNullOrEmpty(input)) return string.Empty;
            var sb = new StringBuilder(input.Length);
            foreach (var ch in input)
            {
                if (char.IsWhiteSpace(ch)) continue;
                if (ch >= '\u0660' && ch <= '\u0669') sb.Append((char)('0' + (ch - '\u0660')));
                else if (ch >= '\u06F0' && ch <= '\u06F9') sb.Append((char)('0' + (ch - '\u06F0')));
                else sb.Append(ch);
            }
            return sb.ToString();
        }

        private async Task<Result<string>> EnforceOtpRateLimitAsync(Guid userId, OtpType type, CancellationToken cancellationToken)
        {
            var oneHourAgo = _dateTimeProvider.UtcNow.AddHours(-1);

            var recentOtps = await _unitOfWork.Repository<Otp>()
                .WhereAsync(o => o.UserId == userId && o.Type == type && o.Created > oneHourAgo, cancellationToken);

            if (recentOtps.Count >= 10)
                return ApiExceptionResponse.BadRequest<string>("تم تجاوز الحد الأقصى لطلبات إرسال رمز التحقق. يرجى المحاولة بعد ساعة.");

            var fifteenMinutesAgo = _dateTimeProvider.UtcNow.AddMinutes(-15);
            var failedVerifications = recentOtps.Count(o =>
                o.FailureReason == "AttemptLimitExceeded" && o.Created > fifteenMinutesAgo);

            if (failedVerifications >= 5)
                return ApiExceptionResponse.BadRequest<string>("تم تجاوز الحد الأقصى لمحاولات التحقق الخاطئة. يرجى المحاولة بعد 15 دقيقة.");

            var lastOtp = recentOtps.OrderByDescending(o => o.Created).FirstOrDefault();
            if (lastOtp != null)
            {
                var secondsSinceLast = (int)(_dateTimeProvider.UtcNow - lastOtp.Created).TotalSeconds;
                if (secondsSinceLast < 30)
                    return ApiExceptionResponse.BadRequest<string>($"يرجى الانتظار {30 - secondsSinceLast} ثانية قبل طلب رمز جديد.");
            }

            return ApiExceptionResponse.Success("");
        }

        private async Task<Otp?> GetActiveOtpAsync(Guid userId, OtpType type, CancellationToken cancellationToken)
        {
            return await _unitOfWork.Repository<Otp>()
                .FirstOrDefaultAsync(
                    o => o.UserId == userId &&
                         o.Type == type &&
                         o.ConsumedAtUtc == null &&
                         o.InvalidatedAtUtc == null,
                    cancellationToken);
        }

        private async Task InvalidateActiveOtpsAsync(Guid userId, OtpType type, string reason, CancellationToken cancellationToken)
        {
            var activeOtps = await _unitOfWork.Repository<Otp>()
                .WhereAsync(
                    o => o.UserId == userId &&
                         o.Type == type &&
                         o.ConsumedAtUtc == null &&
                         o.InvalidatedAtUtc == null,
                    cancellationToken);

            foreach (var otp in activeOtps)
            {
                otp.InvalidatedAtUtc = _dateTimeProvider.UtcNow;
                otp.FailureReason = reason;
                await _unitOfWork.Repository<Otp>().Update(otp);
            }
        }

        private async Task<Result<string>> SendRegistrationOtpAsync(ApplicationUser user, CancellationToken cancellationToken)
        {
            var rateLimitResult = await EnforceOtpRateLimitAsync(user.Id, OtpType.register, cancellationToken);
            if (!rateLimitResult.Succeeded)
                return ApiExceptionResponse.BadRequest<string>(rateLimitResult.Errors.FirstOrDefault() ?? "تم تجاوز الحد الأقصى.");

            await InvalidateActiveOtpsAsync(user.Id, OtpType.register, "SupersededByNewOtp", cancellationToken);

            var otpCode = OtpHelper.GenerateOtpCode();
            _logger.LogInformation("OTP generated for {Phone}", MaskPhone(user.PhoneNumber ?? string.Empty));
            var salt = OtpHelper.GenerateSalt();
            var otp = new Otp
            {
                Code = OtpHelper.HashOtpCode(otpCode, salt),
                CodeSalt = salt,
                ExpirationDate = _dateTimeProvider.UtcNow.AddMinutes(5),
                Created = _dateTimeProvider.UtcNow,
                UserId = user.Id,
                Type = OtpType.register,
                DeliveryChannel = "Sms",
                MaskedDestination = MaskPhone(user.PhoneNumber ?? string.Empty),
                AttemptCount = 0,
                MaxAttempts = 5,
                IsVerified = false
            };

            await _unitOfWork.Repository<Otp>().AddAsync(otp);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var sent = await _smsSender.SendOtpAsync(
                user.PhoneNumber ?? string.Empty,
                $"رمز تأكيد رقم الهاتف في محامي سمارت هو {otpCode} وصالح لمدة 5 دقائق.",
                $"register:{user.Id}",
                cancellationToken);

            if (!sent)
            {
                otp.FailureReason = "SmsDeliveryFailed";
                await _unitOfWork.Repository<Otp>().Update(otp);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return ApiExceptionResponse.Success("تم إنشاء الحساب، لكن تعذر إرسال رمز التأكيد حاليًا. يمكنك إعادة المحاولة بعد لحظات.");
            }

            return ApiExceptionResponse.Success($"تم إرسال رمز تأكيد الرقم إلى {otp.MaskedDestination}.");
        }

        public async Task<Result<AuthResponseDto>> Login(LoginDto request, CancellationToken cancellationToken)
			{
            var clientIp = GetClientIp();
            var phone = NormalizeDigits(request.PhoneNumber);

			var existingUser = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.Include(x => x.Lawyer!)
				.FirstOrDefaultAsync(x => x.PhoneNumber == phone, cancellationToken);

            if (existingUser is null || existingUser.UserType != UserType.Lawyer || existingUser.Lawyer is null)
            {
                _logger.LogWarning("Login failed: Lawyer account with phone {Phone} not found. IP: {ClientIp}", phone, clientIp);
                return ApiExceptionResponse.BadRequest<AuthResponseDto>(PhoneNotRegisteredMessage);
            }

            if (!existingUser.PhoneNumberConfirmed)
            {
                _logger.LogWarning("Login failed: User {Phone} has not confirmed phone number. IP: {ClientIp}", phone, clientIp);
                return ApiExceptionResponse.BadRequest<AuthResponseDto>("يجب تأكيد رقم الهاتف أولًا قبل تسجيل الدخول.");
            }

            if (!existingUser.IsActive)
            {
                _logger.LogWarning("Login failed: User {Phone} is inactive. IP: {ClientIp}", phone, clientIp);
                return ApiExceptionResponse.BadRequest<AuthResponseDto>("هذا الحساب موقوف حاليًا. تواصل مع الدعم الفني.");
            }

            if (await _userManager.IsLockedOutAsync(existingUser))
            {
                _logger.LogWarning("Login failed: User {Phone} is locked out. IP: {ClientIp}", phone, clientIp);
                return ApiExceptionResponse.Forbidden<AuthResponseDto>("تم إغلاق الحساب مؤقتًا بسبب محاولات دخول خاطئة. يرجى المحاولة لاحقًا.");
            }

            var passwordValid = await _userManager.CheckPasswordAsync(existingUser, request.Password);
            if (!passwordValid)
            {
                await _userManager.AccessFailedAsync(existingUser);
                _logger.LogWarning("Login failed: Incorrect password for user {Phone}. IP: {ClientIp}", phone, clientIp);
                return ApiExceptionResponse.BadRequest<AuthResponseDto>("رقم الهاتف أو كلمة المرور غير صحيحة.");
            }

            await _userManager.ResetAccessFailedCountAsync(existingUser);

            var roles = await _userManager.GetRolesAsync(existingUser);

            if (!roles.Contains("Lawyer"))
            {
                _logger.LogWarning("Login failed: User {Phone} does not have Lawyer role. IP: {ClientIp}", phone, clientIp);
                return ApiExceptionResponse.BadRequest<AuthResponseDto>("هذا الحساب لا يملك صلاحية الدخول هنا.");
            }

            var token = await _tokenService.CreateToken(existingUser, roles.ToList());
            var refreshToken = await _tokenService.GenerateRefreshToken();

            existingUser.RefreshToken = HashRefreshToken(refreshToken);
            existingUser.RefreshTokenExpiresAt = _dateTimeProvider.UtcNow.AddDays(7);
            await _unitOfWork.Repository<ApplicationUser>().Update(existingUser);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dismissedGuidance = await _unitOfWork.Repository<GuidanceDismissal>()
                .WhereAsync(g => g.UserId == existingUser.Id, cancellationToken);

            var response = new AuthResponseDto
            {
                UserId = existingUser.Id.ToString(),
                ProfileId = existingUser.Lawyer?.Id.ToString() ?? string.Empty,
                FullName = existingUser.FullName,
                Phone = existingUser.PhoneNumber ?? string.Empty,
                PhoneNumberConfirmed = existingUser.PhoneNumberConfirmed,
                AccessToken = token,
                RefreshToken = refreshToken,
                Roles = roles.ToList(),
                DismissedGuidanceKeys = dismissedGuidance.Select(g => g.GuidanceKey).ToList()
            };

            _audit.Log("User logged in", new { UserId = existingUser.Id, Phone = existingUser.PhoneNumber });
            _logger.LogInformation("User {Phone} logged in successfully as Lawyer", request.PhoneNumber);
            return Result<AuthResponseDto>.Success(response);
        }

        public async Task<Result<AuthResponseDto>> AdminLogin(AdminLoginDto request, CancellationToken cancellationToken)
        {
            var clientIp = GetClientIp();

            var existingUser = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(x=>x.Email==request.Email);
			if (existingUser is null)
            {
                _logger.LogWarning("Admin login failed: User with email {Email} not found. IP: {ClientIp}", request.Email, clientIp);
                return ApiExceptionResponse.BadRequest<AuthResponseDto>("البريد الإلكتروني غير مسجّل.");
            }

            if (!existingUser.IsActive)
            {
                _logger.LogWarning("Admin login failed: User {Email} is inactive. IP: {ClientIp}", request.Email, clientIp);
                return ApiExceptionResponse.BadRequest<AuthResponseDto>("هذا الحساب موقوف حاليًا. تواصل مع الدعم الفني.");
            }

            if (await _userManager.IsLockedOutAsync(existingUser))
            {
                _logger.LogWarning("Admin login failed: User {Email} is locked out. IP: {ClientIp}", request.Email, clientIp);
                return ApiExceptionResponse.Forbidden<AuthResponseDto>("تم إغلاق الحساب مؤقتًا بسبب محاولات دخول خاطئة. يرجى المحاولة لاحقًا.");
            }

            var passwordValid = await _userManager.CheckPasswordAsync(existingUser, request.Password);
            if (!passwordValid)
            {
                await _userManager.AccessFailedAsync(existingUser);
                _logger.LogWarning("Admin login failed: Incorrect password for user {Email}. IP: {ClientIp}", request.Email, clientIp);
                return ApiExceptionResponse.BadRequest<AuthResponseDto>("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
            }

            await _userManager.ResetAccessFailedCountAsync(existingUser);

            var roles = await _userManager.GetRolesAsync(existingUser);

            if (!roles.Contains("Admin"))
            {
                _logger.LogWarning("Admin login failed: User {Email} does not have Admin role. IP: {ClientIp}", request.Email, clientIp);
                return ApiExceptionResponse.BadRequest<AuthResponseDto>("هذا الحساب لا يملك صلاحية الدخول هنا.");
            }

            var token = await _tokenService.CreateToken(existingUser, roles.ToList());
            var refreshToken = await _tokenService.GenerateRefreshToken();

            existingUser.RefreshToken = HashRefreshToken(refreshToken);
            existingUser.RefreshTokenExpiresAt = _dateTimeProvider.UtcNow.AddDays(7);
            await _unitOfWork.Repository<ApplicationUser>().Update(existingUser);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dismissedGuidance = await _unitOfWork.Repository<GuidanceDismissal>()
                .WhereAsync(g => g.UserId == existingUser.Id, cancellationToken);

            var response = new AuthResponseDto
            {
                UserId = existingUser.Id.ToString(),
                FullName = existingUser.FullName,
                Phone = existingUser.PhoneNumber ?? string.Empty,
                PhoneNumberConfirmed = existingUser.PhoneNumberConfirmed,
                AccessToken = token,
                RefreshToken = refreshToken,
                Roles = roles.ToList(),
                DismissedGuidanceKeys = dismissedGuidance.Select(g => g.GuidanceKey).ToList()
            };

            _audit.Log("Admin logged in", new { UserId = existingUser.Id, Email = existingUser.Email });
            _logger.LogInformation("Admin {Email} logged in successfully", request.Email);
            return Result<AuthResponseDto>.Success(response);
        }


		public async Task<Result<AuthResponseDto>> Register(RegisterDto request, CancellationToken cancellationToken)
		{
			var phone = NormalizeDigits(request.PhoneNumber);
			var email = (request.Email ?? string.Empty).Trim();
			var fullName = PlainTextInputGuard.NormalizePlainText(request.FullName);
			var governorate = PlainTextInputGuard.NormalizePlainText(request.Governorate);
			_logger.LogInformation("Starting registration for {Phone}", phone);

			var existingByPhone = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.FirstOrDefaultAsync(x => x.PhoneNumber == phone, cancellationToken);

			if (existingByPhone != null)
			{
				if (existingByPhone.PhoneNumberConfirmed)
				{
					_logger.LogWarning("Registration blocked: phone {Phone} already has a confirmed account.", phone);
					return Result<AuthResponseDto>.Error(System.Net.HttpStatusCode.Conflict, "رقم الهاتف مسجّل بالفعل. يمكنك تسجيل الدخول أو استعادة كلمة المرور.");
				}

				existingByPhone.FullName = fullName;
				existingByPhone.Governorate = governorate;
				existingByPhone.AgreedToTerms = request.AgreeToTerms;
				existingByPhone.Email = email;
				existingByPhone.UserName = phone;
				existingByPhone.NormalizedUserName = phone.ToUpperInvariant();
				existingByPhone.NormalizedEmail = email.ToUpperInvariant();

				var resetToken = await _userManager.GeneratePasswordResetTokenAsync(existingByPhone);
				var resetResult = await _userManager.ResetPasswordAsync(existingByPhone, resetToken, request.Password);
				if (!resetResult.Succeeded)
					return ApiExceptionResponse.BadRequest<AuthResponseDto>(resetResult.Errors.First().Description);

				await _unitOfWork.SaveChangesAsync(cancellationToken);

				return await CompleteRegistrationAsync(existingByPhone, "تم تحديث بياناتك وإعادة إرسال رمز تأكيد الرقم.", cancellationToken);
			}

			var existingByEmail = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

			if (existingByEmail != null)
			{
				if (existingByEmail.PhoneNumberConfirmed)
				{
					_logger.LogWarning("Registration blocked: email {Email} already used by confirmed account.", email);
					return Result<AuthResponseDto>.Error(System.Net.HttpStatusCode.Conflict, "البريد الإلكتروني مستخدم بالفعل. جرّب بريدًا آخر أو قم بتسجيل الدخول.");
				}

				existingByEmail.FullName = fullName;
				existingByEmail.Governorate = governorate;
				existingByEmail.AgreedToTerms = request.AgreeToTerms;
				existingByEmail.UserName = phone;
				existingByEmail.PhoneNumber = phone;
				existingByEmail.NormalizedUserName = phone.ToUpperInvariant();

				var resetToken = await _userManager.GeneratePasswordResetTokenAsync(existingByEmail);
				var resetResult = await _userManager.ResetPasswordAsync(existingByEmail, resetToken, request.Password);
				if (!resetResult.Succeeded)
					return ApiExceptionResponse.BadRequest<AuthResponseDto>(resetResult.Errors.First().Description);

				await _unitOfWork.SaveChangesAsync(cancellationToken);

				return await CompleteRegistrationAsync(existingByEmail, "تم تحديث رقم الهاتف وإرسال رمز تأكيد جديد.", cancellationToken);
			}

			var user = new ApplicationUser
			{
				UserName = phone,
				PhoneNumber = phone,
				PhoneNumberConfirmed = false,
				Email = email,
				FullName = fullName,
				Governorate = governorate,
				AgreedToTerms = request.AgreeToTerms,
				IsActive = false,
				UserType = UserType.Lawyer
			};

			var createResult = await _userManager.CreateAsync(user, request.Password);
			if (!createResult.Succeeded)
			{
				var identityErrors = string.Join("; ", createResult.Errors.Select(e => $"{e.Code}: {e.Description}"));
				_logger.LogError("User creation failed for {Phone}. Errors: {Errors}", phone, identityErrors);
				return ApiExceptionResponse.BadRequest<AuthResponseDto>(createResult.Errors.First().Description);
			}

			await _userManager.AddToRoleAsync(user, "Lawyer");

			var regResult = await CompleteRegistrationAsync(user, "تم إنشاء الحساب وإرسال رمز تأكيد الرقم.", cancellationToken);

			if (regResult.Succeeded && regResult.Data != null)
			{
				_logger.LogInformation("Pending registration for {Phone}, Lawyer {LawyerId}. Awaiting phone verification.", phone, regResult.Data.ProfileId);
				_audit.Log("UserRegistered_Pending", new
				{
					user.Id,
					user.PhoneNumber,
					LawyerProfileId = Guid.Parse(regResult.Data.ProfileId),
				});
			}

			return regResult;
		}

		private async Task<Result<AuthResponseDto>> CompleteRegistrationAsync(ApplicationUser user, string successMessage, CancellationToken cancellationToken)
		{
			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.FirstOrDefaultAsync(l => l.ApplicationUserId == user.Id, cancellationToken);

			if (lawyer == null)
			{
				lawyer = new Core.Models.Lawyer { ApplicationUserId = user.Id, IsActive = false };
				await _unitOfWork.Repository<Core.Models.Lawyer>().AddAsync(lawyer);
				await _unitOfWork.SaveChangesAsync(cancellationToken);
			}

			var otpResult = await SendRegistrationOtpAsync(user, cancellationToken);

			var roles = await _userManager.GetRolesAsync(user);

			return ApiExceptionResponse.Success(new AuthResponseDto
			{
				UserId = user.Id.ToString(),
				FullName = user.FullName,
				Phone = user.PhoneNumber ?? string.Empty,
				PhoneNumberConfirmed = false,
				RequiresPhoneVerification = true,
				Roles = roles.ToList(),
				ProfileId = lawyer.Id.ToString(),
			}, otpResult.Message ?? successMessage);
		}

        public async Task<Result<string>> RequestPhoneVerificationAsync(RequestPhoneVerificationDto request, CancellationToken cancellationToken)
        {
            var phone = NormalizeDigits(request.PhoneNumber);
            // Pre-verification users have IsActive=false — bypass the global filter.
            var user = await _unitOfWork.Repository<ApplicationUser>()
                .AsQueryable()
                .IgnoreQueryFilters()
                .Include(x => x.Lawyer!)
                .FirstOrDefaultAsync(x => x.PhoneNumber == phone, cancellationToken);

            if (user == null || user.UserType != UserType.Lawyer || user.Lawyer is null)
                return ApiExceptionResponse.BadRequest<string>(PhoneNotRegisteredMessage);

            if (user.PhoneNumberConfirmed)
                return ApiExceptionResponse.Success("رقم الهاتف مؤكد بالفعل. يمكنك تسجيل الدخول.");

            return await SendRegistrationOtpAsync(user, cancellationToken);
        }

        public async Task<Result<bool>> VerifyPhoneNumberAsync(VerifyPhoneNumberDto request, CancellationToken cancellationToken)
        {
            var phone = NormalizeDigits(request.PhoneNumber);
            var user = await _unitOfWork.Repository<ApplicationUser>()
                .AsQueryable()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.PhoneNumber == phone, cancellationToken);

            if (user == null)
                return ApiExceptionResponse.BadRequest<bool>("رمز التحقق غير صحيح أو منتهي الصلاحية.");

            var otpEntity = await GetActiveOtpAsync(user.Id, OtpType.register, cancellationToken);
            if (otpEntity == null)
                return ApiExceptionResponse.BadRequest<bool>("رمز التحقق غير صحيح أو منتهي الصلاحية.");

            if (otpEntity.ExpirationDate < _dateTimeProvider.UtcNow)
            {
                otpEntity.InvalidatedAtUtc = _dateTimeProvider.UtcNow;
                otpEntity.FailureReason = "Expired";
                await _unitOfWork.Repository<Otp>().Update(otpEntity);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return ApiExceptionResponse.BadRequest<bool>("رمز التحقق غير صحيح أو منتهي الصلاحية.");
            }

            var trimmedCode = NormalizeDigits(request.Code);
            bool isValid = OtpHelper.MatchesOtp(trimmedCode, otpEntity.Code, otpEntity.CodeSalt);
            _logger.LogInformation("OTP verification attempted for {Phone}, IsValid: {IsValid}", MaskPhone(phone), isValid);

            if (!isValid)
            {
                otpEntity.AttemptCount++;
                if (otpEntity.AttemptCount >= otpEntity.MaxAttempts)
                {
                    otpEntity.InvalidatedAtUtc = _dateTimeProvider.UtcNow;
                    otpEntity.FailureReason = "AttemptLimitExceeded";
                }

                await _unitOfWork.Repository<Otp>().Update(otpEntity);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return ApiExceptionResponse.BadRequest<bool>("رمز التحقق غير صحيح أو منتهي الصلاحية.");
            }

            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                otpEntity.IsVerified = true;
                otpEntity.ConsumedAtUtc = _dateTimeProvider.UtcNow;
                user.PhoneNumberConfirmed = true;
                user.IsActive = true;

                await _unitOfWork.Repository<Otp>().Update(otpEntity);
                await _userManager.UpdateAsync(user);

                var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
                    .FirstOrDefaultAsync(l => l.ApplicationUserId == user.Id, cancellationToken);
                if (lawyer != null && !lawyer.IsActive)
                {
                    lawyer.IsActive = true;
                    await _unitOfWork.Repository<Core.Models.Lawyer>().Update(lawyer);

                    const string trialPlanName = "الباقة التجريبية";
                    const string legacyTrialPlanName = "Free Trial";

                    var freeTrialPlan = await _unitOfWork.Repository<Subscription>()
                        .FirstOrDefaultTrackedAsync(x => x.Name == trialPlanName || x.Name == legacyTrialPlanName, cancellationToken);

                    if (freeTrialPlan == null)
                    {
                        freeTrialPlan = new Subscription
                        {
                            Name = trialPlanName,
                            Price = 0,
                            Features = "Basic Features",
                            AiRequestsLimit = 10,
                            DurationDays = 7,
                            IsActive = true
                        };
                        await _unitOfWork.Repository<Subscription>().AddAsync(freeTrialPlan);
                        _logger.LogInformation("Trial plan created automatically (first-time setup) with 10 AI requests limit.");
                    }
                    else
                    {
                        bool updated = false;
                        if (freeTrialPlan.Name == legacyTrialPlanName)
                        {
                            freeTrialPlan.Name = trialPlanName;
                            updated = true;
                        }
                        if (freeTrialPlan.AiRequestsLimit == 1)
                        {
                            freeTrialPlan.AiRequestsLimit = 10;
                            updated = true;
                        }
                        if (updated)
                        {
                            await _unitOfWork.Repository<Subscription>().Update(freeTrialPlan);
                            _logger.LogInformation("Trial plan properties updated: name normalized or limit set to 10.");
                        }
                    }

                    var freeTrialSub = new LawyerSubscription
                    {
                        Lawyer = lawyer,
                        LawyerId = lawyer.Id,
                        Subscription = freeTrialPlan,
                        SubscriptionId = freeTrialPlan.Id,
                        UsedAiRequests = 0,
                        StartDate = DateTime.UtcNow,
                        EndDate = DateTime.UtcNow.AddDays(freeTrialPlan.DurationDays),
                        IsActive = true
                    };

                    await _unitOfWork.Repository<LawyerSubscription>().AddAsync(freeTrialSub);
                    _logger.LogInformation("Lawyer {LawyerId} activated and subscribed to trial plan after phone verification.", lawyer.Id);
                }

                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }

            if (!string.IsNullOrWhiteSpace(user.Email))
            {
                var encodedFullName = WebUtility.HtmlEncode(user.FullName ?? string.Empty);
                var emailContent = $@"
                    <h2>مرحباً {encodedFullName}،</h2>
                    <p>يسعدنا انضمامك إلى منصة <strong>محامي سمارت</strong>.</p>
                    <p>تم <span style=""color: #34BF49; font-weight: bold;"">تأكيد رقم هاتفك وتفعيل حسابك بنجاح</span>.</p>
                    <p>يمكنك الآن تسجيل الدخول إلى المنصة والبدء في إدارة أعمالك القانونية بكل احترافية وسهولة.</p>";

                await _emailService.SendEmailAsync(
                    user.Email,
                    "مرحباً بك في محامي سمارت",
                    EmailTemplateBuilder.BuildEmailTemplate("مرحباً بك في محامي سمارت", emailContent),
                    "WelcomeEmail",
                    $"register:{user.Id}",
                    user.Id,
                    "welcome-email",
                    "phone-verification",
                    cancellationToken);
            }

            return ApiExceptionResponse.Success(true, "تم تأكيد رقم الهاتف بنجاح. يمكنك الآن تسجيل الدخول.");
        }


		public async Task<Result<string>> ForgetPasswordAsync(ForgetPasswordDto request, CancellationToken cancellationToken)
		{
            var phone = NormalizeDigits(request.PhoneNumber);
            if (string.IsNullOrWhiteSpace(phone))
                return ApiExceptionResponse.Success("إذا كان الحساب موجودًا، فسيتم إرسال رمز الاستعادة إلى وسيلة التواصل المسجلة.");

			var user = await _unitOfWork.Repository<ApplicationUser>()
				.FirstOrDefaultAsync(u =>
					u.PhoneNumber == phone,
					cancellationToken);

			if (user is null)
				return ApiExceptionResponse.Success("إذا كان الحساب موجودًا، فسيتم إرسال رمز الاستعادة إلى وسيلة التواصل المسجلة.");

            var rateLimitResult = await EnforceOtpRateLimitAsync(user.Id, OtpType.forgetPassword, cancellationToken);
            if (!rateLimitResult.Succeeded)
            {
                _logger.LogWarning("OTP rate limit exceeded for user {UserId} on forget-password", user.Id);
                return ApiExceptionResponse.Success("إذا كان الحساب موجودًا، فسيتم إرسال رمز الاستعادة إلى وسيلة التواصل المسجلة.");
            }

			var otpCode = OtpHelper.GenerateOtpCode();
			var expiry = _dateTimeProvider.UtcNow.AddMinutes(5);
            var existingOtps = await _unitOfWork.Repository<Otp>()
                .WhereAsync(o => o.UserId == user.Id && o.Type == OtpType.forgetPassword && o.ConsumedAtUtc == null && o.InvalidatedAtUtc == null, cancellationToken);
            foreach (var existing in existingOtps)
            {
                existing.InvalidatedAtUtc = _dateTimeProvider.UtcNow;
                existing.FailureReason = "SupersededByNewOtp";
                await _unitOfWork.Repository<Otp>().Update(existing);
            }

            var forgetSalt = OtpHelper.GenerateSalt();
			var otp = new Otp
			{
					Code = OtpHelper.HashOtpCode(otpCode, forgetSalt),
					CodeSalt = forgetSalt,
					ExpirationDate = expiry,
                    Created = _dateTimeProvider.UtcNow,
					UserId = user.Id,
                Type = OtpType.forgetPassword,
                DeliveryChannel = "Sms",
                MaskedDestination = MaskPhone(user.PhoneNumber ?? string.Empty),
                AttemptCount = 0,
                MaxAttempts = 5,
                FailureReason = null,
                IsVerified = false,
			};
			await _unitOfWork.Repository<Otp>().AddAsync(otp);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

            var smsMessage = $"رمز استعادة كلمة المرور في محامي سمارت هو {otpCode} وصالح لمدة 5 دقائق.";
            var smsSent = await _smsSender.SendOtpAsync(user.PhoneNumber ?? string.Empty, smsMessage, $"forgot-password:{user.Id}", cancellationToken);

            if (!smsSent)
            {
                otp.FailureReason = "SmsDeliveryFailed";
            }

            await _unitOfWork.Repository<Otp>().Update(otp);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Password reset OTP generated for user {UserId}", user.Id);
			return ApiExceptionResponse.Success("إذا كان الحساب موجودًا، فسيتم إرسال رمز الاستعادة إلى وسيلة التواصل المسجلة.");
		}

		// ---------------------
		// Verify OTP
		// ---------------------
		public async Task<Result<bool>> VerifyOtpAsync(VerifyOtpDto request, CancellationToken cancellationToken)
		{
            var phone = NormalizeDigits(request.PhoneNumber);
            var code = NormalizeDigits(request.Code);
            var user = await _unitOfWork.Repository<ApplicationUser>()
                .FirstOrDefaultAsync(u => u.PhoneNumber == phone, cancellationToken);

            if (user == null)
                return ApiExceptionResponse.BadRequest<bool>("رمز التحقق غير صحيح أو منتهي الصلاحية.");

			var otpEntity = await _unitOfWork.Repository<Otp>()
				.FirstOrDefaultAsync(o =>
					o.UserId == user.Id &&
                    o.Type == OtpType.forgetPassword &&
                    o.ConsumedAtUtc == null &&
                    o.InvalidatedAtUtc == null,
                    cancellationToken);

			if (otpEntity == null)
				return ApiExceptionResponse.BadRequest<bool>("رمز التحقق غير صحيح أو منتهي الصلاحية.");

            if (otpEntity.ExpirationDate < _dateTimeProvider.UtcNow)
            {
                otpEntity.InvalidatedAtUtc = _dateTimeProvider.UtcNow;
                otpEntity.FailureReason = "Expired";
                await _unitOfWork.Repository<Otp>().Update(otpEntity);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
				return ApiExceptionResponse.BadRequest<bool>("رمز التحقق غير صحيح أو منتهي الصلاحية.");
            }

            if (!OtpHelper.MatchesOtp(code, otpEntity.Code, otpEntity.CodeSalt))
            {
                otpEntity.AttemptCount++;
                if (otpEntity.AttemptCount >= otpEntity.MaxAttempts)
                {
                    otpEntity.InvalidatedAtUtc = _dateTimeProvider.UtcNow;
                    otpEntity.FailureReason = "AttemptLimitExceeded";
                }
                await _unitOfWork.Repository<Otp>().Update(otpEntity);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
				return ApiExceptionResponse.BadRequest<bool>("رمز التحقق غير صحيح أو منتهي الصلاحية.");
            }

            otpEntity.IsVerified = true;
            await _unitOfWork.Repository<Otp>().Update(otpEntity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
			return ApiExceptionResponse.Success(true, "تم التحقق من الرمز بنجاح.");
		}

		// ---------------------
		// Reset Password
		// ---------------------
		public async Task<Result<string>> ResetPasswordAsync(ResetPasswordDto request, CancellationToken cancellationToken)
		{
            var phone = NormalizeDigits(request.PhoneNumber);
            var otpCode = NormalizeDigits(request.OtpCode);
            var user = await _unitOfWork.Repository<ApplicationUser>()
                .FirstOrDefaultAsync(u => u.PhoneNumber == phone, cancellationToken);

            if (user is null)
                return ApiExceptionResponse.BadRequest<string>("رمز التحقق غير صحيح أو منتهي الصلاحية.");

			var otpEntity = await _unitOfWork.Repository<Otp>()
				.FirstOrDefaultAsync(o =>
					o.UserId == user.Id &&
                    o.Type == OtpType.forgetPassword &&
                    o.ConsumedAtUtc == null &&
                    o.InvalidatedAtUtc == null,
					cancellationToken);

			if (otpEntity == null ||
                otpEntity.ExpirationDate < _dateTimeProvider.UtcNow ||
                !OtpHelper.MatchesOtp(otpCode, otpEntity.Code, otpEntity.CodeSalt) ||
                !otpEntity.IsVerified)
				return ApiExceptionResponse.BadRequest<string>("رمز التحقق غير صحيح أو منتهي الصلاحية.");

			var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
			var resetResult = await _userManager.ResetPasswordAsync(user, resetToken, request.NewPassword);

			if (!resetResult.Succeeded)
				return ApiExceptionResponse.BadRequest<string>("تعذر إعادة تعيين كلمة المرور.");

			user.RefreshToken = null;
			user.RefreshTokenExpiresAt = null;
			await _unitOfWork.Repository<ApplicationUser>().Update(user);

            otpEntity.ConsumedAtUtc = _dateTimeProvider.UtcNow;
            otpEntity.IsVerified = false;
			await _unitOfWork.SaveChangesAsync(cancellationToken);

            if (!string.IsNullOrWhiteSpace(user.Email))
            {
                var emailContent = $@"
                    <h2>مرحباً،</h2>
                    <p>نعلمك بأنه قد <span style=""color: #34BF49; font-weight: bold;"">تم تغيير كلمة المرور</span> الخاصة بحسابك بنجاح.</p>
                    <p style=""background-color: #FBFAE8; padding: 16px; border-radius: 8px; border-right: 4px solid #EF950A; margin-top: 24px;"">
                        <strong>ملاحظة أمنية:</strong> إذا لم تقم بهذا الإجراء، يرجى التواصل مع فريق الدعم الفني فوراً لحماية حسابك.
                    </p>";

                await _emailService.SendEmailAsync(
                    user.Email,
                    "تم تغيير كلمة المرور - محامي سمارت",
                    EmailTemplateBuilder.BuildEmailTemplate("تم تغيير كلمة المرور", emailContent),
                    "PasswordResetCompleted",
                    $"password-reset:{user.Id}:{otpEntity.Id}",
                    user.Id,
                    "password-reset-completed",
                    "reset-password",
                    cancellationToken);
            }

			_logger.LogInformation("Password reset successfully for user {UserId}", user.Id);
			return ApiExceptionResponse.Success("تمت إعادة تعيين كلمة المرور بنجاح.");
		}


		public async Task<Result<AuthResponseDto>> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken)
		{
			var hashedToken = HashRefreshToken(request.RefreshToken);

			var user = await _unitOfWork.Repository<ApplicationUser>()
				.AsQueryable()
				.Include(x => x.Lawyer!)
				.FirstOrDefaultAsync(u => u.RefreshToken == hashedToken, cancellationToken);

			if (user == null || !user.IsActive || user.RefreshTokenExpiresAt <= _dateTimeProvider.UtcNow)
				return ApiExceptionResponse.BadRequest<AuthResponseDto>("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.");

			// generate new JWT and RefreshToken
			var roles = await _userManager.GetRolesAsync(user);
			var newJwt = await _tokenService.CreateToken(user, roles);
			var newRefreshToken = await _tokenService.GenerateRefreshToken();

			user.RefreshToken = HashRefreshToken(newRefreshToken);
			user.RefreshTokenExpiresAt = _dateTimeProvider.UtcNow.AddDays(7);
			await _unitOfWork.Repository<ApplicationUser>().Update(user);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			var dismissedGuidance = await _unitOfWork.Repository<GuidanceDismissal>()
				.WhereAsync(g => g.UserId == user.Id, cancellationToken);

			var response = new AuthResponseDto
			{
				UserId = user.Id.ToString(),
				ProfileId = user.Lawyer?.Id.ToString() ?? string.Empty,
				FullName = user.FullName,
				Phone = user.PhoneNumber ?? string.Empty,
				AccessToken = newJwt,
				RefreshToken = newRefreshToken,
				Roles = roles.ToList(),
				DismissedGuidanceKeys = dismissedGuidance.Select(g => g.GuidanceKey).ToList()
			};

			_logger.LogInformation("Refresh token renewed for user {UserId}", user.Id);
			return ApiExceptionResponse.Success(response, "تم تجديد الجلسة بنجاح.");
		}

		public async Task<Result<bool>> RevokeRefreshTokenAsync(RevokeRefreshTokenRequest request, CancellationToken cancellationToken)
		{
			var hashedToken = HashRefreshToken(request.RefreshToken);

			var user = await _unitOfWork.Repository<ApplicationUser>()
				.FirstOrDefaultAsync(u => u.RefreshToken == hashedToken, cancellationToken);

			if (user == null)
				return ApiExceptionResponse.BadRequest<bool>("جلسة غير صالحة.");

			user.RefreshToken = null;
			user.RefreshTokenExpiresAt = null;
			await _unitOfWork.Repository<ApplicationUser>().Update(user);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("Refresh token revoked for user {UserId}", user.Id);
			return ApiExceptionResponse.Success(true, "تم إنهاء الجلسة بنجاح.");
		}



	}
}
