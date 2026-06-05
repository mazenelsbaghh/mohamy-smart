using Lawyer.Application.Dtos.Case;
using Lawyer.Application.IServices;
using Lawyer.Application.Services;
using Lawyer.Controllers.Base;
using Lawyer.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Lawyer.Application.Common;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace Lawyer.Controllers
{
	[Route("api/v1/[controller]")]
	[ApiController]
	[EnableRateLimiting("AiEndpoints")]
	public class OcrController : AppControllerBase
	{
		private readonly ICaseOcrService _aiService;
		private readonly IVirusScannerService _virusScanner;

		// Mirrors CaseOcrService limits — controller-level fail-fast before we touch the service.
		private const int MaxFileCount = 200;
		private const long MaxFileBytes = 200L * 1024 * 1024; // 200MB
		private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
		{
			"image/jpeg",
			"image/png",
			"image/webp",
			"application/pdf"
		};

		public OcrController(ICaseOcrService aiService, IVirusScannerService virusScanner)
		{
			_aiService = aiService;
			_virusScanner = virusScanner;
		}

		private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

		[Authorize]
		[EnableRateLimiting("OcrEndpoints")]
		[HttpPost("ocr")]
		[Consumes("multipart/form-data")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[RequestSizeLimit(2L * 1024 * 1024 * 1024)] // 2GB — matches Kestrel global limit
		public async Task<IActionResult> ExtractOcrText([FromForm] List<IFormFile> images, CancellationToken cancellationToken)
		{
			var logger = HttpContext.RequestServices.GetRequiredService<ILogger<OcrController>>();

			if (images == null || images.Count == 0)
			{
				// Log all form keys to diagnose field-name mismatch
				var formKeys = Request.HasFormContentType ? string.Join(", ", Request.Form.Files.Select(f => $"{f.Name}({f.ContentType}, {f.Length}b)")) : "(no form)";
				logger.LogWarning("OCR rejected: images list is null/empty. Form file keys: [{FormKeys}]. ContentType={ContentType}", formKeys, Request.ContentType);
				return BadRequest("يجب رفع صورة واحدة على الأقل.");
			}

			logger.LogInformation("OCR request received: {Count} files, total={TotalBytes}b", images.Count, images.Sum(f => f.Length));

			if (images.Count > MaxFileCount)
			{
				logger.LogWarning("OCR rejected: file count {Count} exceeds max {Max}", images.Count, MaxFileCount);
				return BadRequest($"الحد الأقصى لعدد الملفات هو {MaxFileCount}.");
			}

			foreach (var file in images)
			{
				if (file == null || file.Length == 0)
				{
					logger.LogWarning("OCR rejected: empty file detected. FileName={FileName}", file?.FileName);
					return BadRequest("أحد الملفات المرفوعة فارغ.");
				}
				if (file.Length > MaxFileBytes)
				{
					logger.LogWarning("OCR rejected: file too large. FileName={FileName}, Size={Size}b, Max={Max}b", file.FileName, file.Length, MaxFileBytes);
					return BadRequest("حجم الملف كبير جداً. الحد الأقصى 200 ميجابايت لكل ملف.");
				}
				if (string.IsNullOrWhiteSpace(file.ContentType) || !AllowedContentTypes.Contains(file.ContentType))
				{
					logger.LogWarning("OCR rejected: unsupported content type. FileName={FileName}, ContentType={ContentType}", file.FileName, file.ContentType);
					return BadRequest("نوع الملف غير مدعوم. الأنواع المسموحة: JPEG, PNG, WebP, PDF.");
				}

				var safe = await _virusScanner.IsSafeAsync(file, cancellationToken);
				if (!safe)
				{
					logger.LogWarning("OCR rejected: virus detected. FileName={FileName}", file.FileName);
					return BadRequest("الملف يحتوي على محتوى ضار");
				}
			}

			var result = await _aiService.ExtractTextFromImagesAsync(images, GetUserId(), cancellationToken);
			return CreateResponse(result);
		}

		[Authorize]
		[CheckAiQuota]
		[HttpPost("generate-case")]
		public async Task<IActionResult> GenerateCaseFile([FromForm] CaseTextFileUploadRequest request, CancellationToken token)
		{
			var availableCaseTypes = new List<AvailableCaseTypeDto>();
			if (!string.IsNullOrWhiteSpace(request.availableCaseTypesJson))
			{
				try
				{
					availableCaseTypes = JsonSerializer.Deserialize<List<AvailableCaseTypeDto>>(request.availableCaseTypesJson, Application.Common.JsonOptions.Deserialize) ?? new();
				}
				catch (JsonException)
				{
					availableCaseTypes = new();
				}
			}

			var result = await _aiService.GenerateCaseFromTextAsync(request.revisedText, availableCaseTypes, GetUserId(), token);
			return CreateResponse(result);
		}
	}

	public class OcrImageUploadRequest
	{
		public List<IFormFile> Images { get; set; } = new List<IFormFile>();
	}

	public class CaseTextFileUploadRequest
	{
		[MaxLength(200000)]
		public required string revisedText { get; set; }
		public string? availableCaseTypesJson { get; set; }
	}
}
