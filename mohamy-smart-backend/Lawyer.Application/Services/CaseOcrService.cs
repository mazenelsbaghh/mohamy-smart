using Hangfire;
using Lawyer.Application.Dtos.Case;
using Lawyer.Application.Common;
using System.Linq;
using Lawyer.Application.IServices;
using Lawyer.Application.IServices.AI;
using Lawyer.Core.Common;
using Lawyer.Core.Enum;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PDFtoImage;
using SkiaSharp;
using System.IO;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Tesseract;


namespace Lawyer.Application.Services
{
	public class CaseOcrService : ICaseOcrService, IDisposable
	{
		private TesseractEngine? _sharedTesseractEngine;
		private readonly ILogger<CaseOcrService> _logger;
		private readonly IAIProviderFactory _aiProviderFactory;
		private readonly IHttpClientFactory _httpClientFactory;
		private readonly string _contentRootPath; 
		private readonly IUnitOfWork _unitOfWork;
        private readonly string? _googleVisionApiKey;
        private readonly bool _enableTesseractFallback;
        private readonly IAiUsageTrackingService _trackingService;
        private readonly PromptTemplateCache _promptCache;
        private readonly IVirusScannerService? _virusScanner;

        // Upload constraints (defense in depth alongside controller-level checks)
        private const int MaxFileCount = 200;
        private const long MaxFileBytes = 200L * 1024 * 1024; // 200MB
        private const int MaxPdfPageImages = 1000;
        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
        };


        public CaseOcrService(
			ILogger<CaseOcrService> logger,
			IAIProviderFactory aiProviderFactory,
			IHttpClientFactory httpClientFactory,
			IConfiguration config,
			IUnitOfWork unitOfWork,
			IAiUsageTrackingService trackingService,
			PromptTemplateCache promptCache,
			IVirusScannerService? virusScanner = null)
		{
			_logger = logger;
			_aiProviderFactory = aiProviderFactory;
			_httpClientFactory = httpClientFactory;
			_trackingService = trackingService;
			_virusScanner = virusScanner;

			 _contentRootPath = config.GetValue<string>(WebHostDefaults.ContentRootKey)
									?? Directory.GetCurrentDirectory(); _unitOfWork = unitOfWork;
            _googleVisionApiKey = config["GoogleVision:ApiKey"];
            _enableTesseractFallback = config.GetValue<bool>("GoogleVision:EnableTesseractFallback", false);
			_promptCache = promptCache;
        }

		public async Task<Result<List<string>>> ExtractTextFromImagesAsync(
			List<IFormFile> images,
			string? userId,
			CancellationToken cancellationToken,
			bool requireGoogleVision = false)
		{
			if (images == null || images.Count == 0)
				return ApiExceptionResponse.BadRequest<List<string>>("يجب رفع صورة واحدة على الأقل.");

			if (images.Count > MaxFileCount)
				return ApiExceptionResponse.BadRequest<List<string>>($"الحد الأقصى لعدد الملفات هو {MaxFileCount}.");

			if (requireGoogleVision && string.IsNullOrWhiteSpace(_googleVisionApiKey))
				return ApiExceptionResponse.ServerError<List<string>>("خدمة Google Vision غير مفعلة على الخادم.");

			var extractedTexts = new List<string>();

			foreach (var file in images)
			{
				if (file == null || file.Length == 0)
					return ApiExceptionResponse.BadRequest<List<string>>("أحد الملفات المرفوعة فارغ.");

				if (file.Length > MaxFileBytes)
					return ApiExceptionResponse.BadRequest<List<string>>("حجم الملف كبير جداً. الحد الأقصى 200 ميجابايت لكل ملف.");

				if (string.IsNullOrWhiteSpace(file.ContentType) || !AllowedContentTypes.Contains(file.ContentType))
					return ApiExceptionResponse.BadRequest<List<string>>("نوع الملف غير مدعوم. الأنواع المسموحة: JPEG, PNG, WebP, PDF.");

				var isPdf = string.Equals(file.ContentType, "application/pdf", StringComparison.OrdinalIgnoreCase);
				var isImage = file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);

				if (!isPdf && !isImage)
					return ApiExceptionResponse.BadRequest<List<string>>("OCR يدعم ملفات الصور و PDF فقط.");

				if (_virusScanner != null)
				{
					var safe = await _virusScanner.IsSafeAsync(file, cancellationToken);
					if (!safe)
						return ApiExceptionResponse.BadRequest<List<string>>("الملف يحتوي على محتوى ضار");
				}

				try
				{
					if (isPdf)
					{
						await using var stream = file.OpenReadStream();
						var pageImages = ConvertPdfToPageImages(stream, MaxPdfPageImages);

						if (pageImages.Count > MaxPdfPageImages)
							return ApiExceptionResponse.BadRequest<List<string>>($"عدد صفحات ملف PDF كبير جداً. الحد الأقصى {MaxPdfPageImages} صفحة.");

						_logger.LogInformation("PDF converted to {PageCount} page images for OCR. File={File}", pageImages.Count, RedactForLog(file.FileName));

						foreach (var pageBytes in pageImages)
						{
				var text = await ExtractBestTextAsync(pageBytes, userId, cancellationToken, requireGoogleVision);
						extractedTexts.Add(text?.Trim() ?? "");
						}
					}
					else
					{
						await using var stream = file.OpenReadStream();
						var imageBytes = await ToByteArrayAsync(stream, cancellationToken);
						var text = await ExtractBestTextAsync(imageBytes, userId, cancellationToken, requireGoogleVision);
						extractedTexts.Add(text?.Trim() ?? "");
					}
				}
				catch (FileNotFoundException ex)
				{
					_logger.LogError(ex, "OCR language data is missing");
					return ApiExceptionResponse.ServerError<List<string>>("ملفات OCR غير مكتملة على الخادم.");
				}
				catch (InvalidOperationException ex) when (ex.Message.Contains("OCR limit", StringComparison.OrdinalIgnoreCase))
				{
					_logger.LogWarning(ex, "OCR upload rejected because it exceeds PDF page limits");
					return ApiExceptionResponse.BadRequest<List<string>>($"عدد صفحات ملف PDF كبير جداً. الحد الأقصى {MaxPdfPageImages} صفحة.");
				}
				catch (InvalidOperationException ex) when (ex.Message.Contains("Google Vision OCR", StringComparison.OrdinalIgnoreCase))
				{
					_logger.LogWarning(ex, "Google Vision OCR failed for file {FileName}", RedactForLog(file.FileName));
					return ApiExceptionResponse.ServerError<List<string>>("تعذر استخراج النص بدقة عبر Google Vision.");
				}
				catch (Exception ex)
				{
					_logger.LogError(ex, "OCR extraction failed for file {FileName}", RedactForLog(file.FileName));
					return ApiExceptionResponse.ServerError<List<string>>("فشل استخراج النص من الملف.");
				}
			}

			_logger.LogInformation("OCR extraction complete for {Count} files/pages", extractedTexts.Count);

			return ApiExceptionResponse.Success(extractedTexts, "Text extracted successfully");
		}

		private async Task<string> ExtractBestTextAsync(byte[] imageBytes, string? userId, CancellationToken cancellationToken, bool requireGoogleVision)
		{
			var optimizedBytes = OptimizeImageForOcr(imageBytes);
			var googleVisionText = await ExtractTextWithGoogleVisionAsync(optimizedBytes, userId, cancellationToken);
			if (!string.IsNullOrWhiteSpace(googleVisionText))
			{
				_logger.LogInformation("✔ Successfully extracted text using Google Vision API.");
				return googleVisionText;
			}

			if (requireGoogleVision)
				throw new InvalidOperationException("Google Vision OCR failed to extract text.");

			if (!_enableTesseractFallback)
			{
				_logger.LogWarning("Google Vision API returned no text or failed, and Tesseract fallback is disabled.");
				throw new Exception("Google Vision OCR didn't extract any text and fallback is disabled.");
			}

			await using var memoryStream = new MemoryStream(imageBytes);
			return await OcrHelper.ExtractTextAsync(GetOrCreateTesseractEngine(), memoryStream, cancellationToken);
		}

		private TesseractEngine GetOrCreateTesseractEngine()
		{
			if (_sharedTesseractEngine == null)
			{
				var tessDataPath = Path.Combine(Directory.GetCurrentDirectory(), "tessdata");
				var langFile = Path.Combine(tessDataPath, "ara.traineddata");
				if (!File.Exists(langFile))
					throw new FileNotFoundException($"ملف اللغة 'ara.traineddata' غير موجود في المسار: {tessDataPath}");

				Environment.SetEnvironmentVariable("TESSDATA_PREFIX", tessDataPath);

				_sharedTesseractEngine = new TesseractEngine(tessDataPath, "ara+eng", EngineMode.LstmOnly);
				_sharedTesseractEngine.DefaultPageSegMode = PageSegMode.Auto;
				_sharedTesseractEngine.SetVariable("preserve_interword_spaces", "1");
				_sharedTesseractEngine.SetVariable("user_defined_dpi", "300");
			}
			return _sharedTesseractEngine;
		}

		public void Dispose()
		{
			_sharedTesseractEngine?.Dispose();
		}

		private static byte[] OptimizeImageForOcr(byte[] imageBytes, int maxDimension = 2000, int quality = 85)
		{
			try
			{
				using var original = SKBitmap.Decode(imageBytes);
				if (original == null) return imageBytes;

				if (original.Width <= maxDimension && original.Height <= maxDimension && imageBytes.Length <= 1_500_000)
					return imageBytes;

				float scale = Math.Min((float)maxDimension / original.Width, (float)maxDimension / original.Height);
				if (scale >= 1f && imageBytes.Length <= 1_500_000) return imageBytes;

				var newWidth = (int)(original.Width * Math.Min(scale, 1f));
				var newHeight = (int)(original.Height * Math.Min(scale, 1f));

				var resized = original.Resize(new SKImageInfo(newWidth, newHeight), SKFilterQuality.High);
				if (resized == null) return imageBytes;

				using var image = SKImage.FromBitmap(resized);
				using var data = image.Encode(SKEncodedImageFormat.Jpeg, quality);
				resized.Dispose();

				return data.ToArray();
			}
			catch
			{
				return imageBytes;
			}
		}

		private async Task<string?> ExtractTextWithGoogleVisionAsync(byte[] imageBytes, string? userId, CancellationToken cancellationToken)
		{
			if (string.IsNullOrWhiteSpace(_googleVisionApiKey))
				return null;

			var requestBody = new
			{
				requests = new object[]
				{
					new
					{
						image = new
						{
							content = Convert.ToBase64String(imageBytes)
						},
						features = new object[]
						{
							new
							{
								type = "DOCUMENT_TEXT_DETECTION"
							}
						}
					}
				}
			};

			// Use a dedicated timeout (3 minutes) rather than the request's cancellation token.
			// This prevents the OCR call from being cancelled when the browser navigates away
			// while still allowing a reasonable timeout for large documents.
			const int visionTimeoutSeconds = 180;

			for (int attempt = 1; attempt <= 2; attempt++)
			{
				try
				{
					using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(visionTimeoutSeconds));
					var client = _httpClientFactory.CreateClient();
					using var response = await client.PostAsync(
						$"https://vision.googleapis.com/v1/images:annotate?key={_googleVisionApiKey}",
						new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"),
						timeoutCts.Token);

					if (!response.IsSuccessStatusCode)
					{
						var error = await response.Content.ReadAsStringAsync(CancellationToken.None);
						_logger.LogWarning("Google Vision OCR failed (attempt {Attempt}). Status={StatusCode}, Error={Error}", attempt, response.StatusCode, error);
						if (attempt < 2) { await Task.Delay(1000); continue; }
						return null;
					}

					var content = await response.Content.ReadAsStringAsync(CancellationToken.None);
					using var parsed = JsonDocument.Parse(content);

					var responseArray = parsed.RootElement.GetProperty("responses");
					var firstResponse = responseArray.EnumerateArray().FirstOrDefault();

					if (firstResponse.TryGetProperty("error", out var errorElem))
					{
						var apiError = errorElem.GetProperty("message").GetString();
						if (!string.IsNullOrWhiteSpace(apiError))
						{
							_logger.LogWarning("Google Vision OCR returned an API error. Error={Error}", apiError);
							return null;
						}
					}

					string? text = null;
					if (firstResponse.TryGetProperty("fullTextAnnotation", out var fullText))
					{
						text = fullText.TryGetProperty("text", out var textElem) ? textElem.GetString()?.Trim() : null;
					}

					if (!string.IsNullOrWhiteSpace(text))
					{
						if (Guid.TryParse(userId, out var lawyerId) && lawyerId != Guid.Empty)
						{
							// Persist via Hangfire so a transient failure doesn't drop usage data.
							try
							{
								BackgroundJob.Enqueue<IAiUsageTrackingService>(s => s.RecordOcrUsageAsync(lawyerId, null, CancellationToken.None));
							}
							catch
							{
								// Hangfire might not be available (tests); fall back inline so usage is not silently dropped.
								await _trackingService.RecordOcrUsageAsync(lawyerId, null, CancellationToken.None);
							}
						}
					}

					return string.IsNullOrWhiteSpace(text) ? null : text;
				}
				catch (TaskCanceledException ex) when (!cancellationToken.IsCancellationRequested)
				{
					// This is a genuine timeout (not a client disconnect)
					_logger.LogWarning(ex, "Google Vision OCR timed out (attempt {Attempt}/{MaxAttempts}, timeout={Timeout}s)", attempt, 2, visionTimeoutSeconds);
					if (attempt < 2) { await Task.Delay(1000); continue; }
					return null;
				}
				catch (HttpRequestException ex)
				{
					// Transient network error — retry once
					_logger.LogWarning(ex, "Google Vision OCR network error (attempt {Attempt}/2)", attempt);
					if (attempt < 2) { await Task.Delay(1000); continue; }
					return null;
				}
				catch (Exception ex)
				{
					_logger.LogWarning(ex, "Google Vision OCR failed unexpectedly.");
					return null;
				}
			}

			return null;
		}


		// 2️⃣ Send revised text + prompt to configured AI provider to generate case JSON
		public async Task<Result<CaseExtractionResultDto>> GenerateCaseFromTextAsync(string revisedText, List<AvailableCaseTypeDto> availableCaseTypes, string? userId, CancellationToken cancellationToken)
		{

			// 📁 قراءة prompt من ملف الجذر
			var promptFilePath = Path.Combine(_contentRootPath, "wwwroot", "prompts", "OCR", "ocr-extraction.txt");
			if (!File.Exists(promptFilePath))
				return ApiExceptionResponse.BadRequest<CaseExtractionResultDto>("Prompt file not found");

			var promptTemplate = await _promptCache.GetAsync(Path.Combine("OCR", "ocr-extraction.txt"), cancellationToken);
			var finalPrompt = promptTemplate.Replace("{facts_text}", SanitizePromptInput(revisedText));

			// Inject available case types so the AI can select and return matching IDs
			if (availableCaseTypes.Count > 0)
			{
				var typesBlock = string.Join("\n", availableCaseTypes.Select(t => $"  - id: {t.Id}, title: \"{t.Title}\""));
				finalPrompt = finalPrompt.Replace("{available_case_types}", typesBlock);
			}
			else
			{
				finalPrompt = finalPrompt.Replace("{available_case_types}", "(لا توجد أنواع متاحة)");
			}

			var aiProvider = _aiProviderFactory.GetProvider();
			var ocrModel = await _aiProviderFactory.GetModelForStepAsync(AiStepType.Ocr);
			var aiResult = await aiProvider.SendChatCompletionAsync(
				finalPrompt,
				"استخرج بيانات القضية بناءً على التعليمات الموضحة وأعد كائن JSON كامل.",
				AIRequestOptions.Default with
				{
					Temperature = 0,
					MaxTokens = 8000,
					Model = ocrModel
				},
				cancellationToken);

			if (!aiResult.Succeeded || string.IsNullOrWhiteSpace(aiResult.Data?.Content))
			{
				_logger.LogError("AI provider failed to generate case data. Provider={Provider}, Error={Error}", aiProvider.ProviderName, aiResult.Message);
				return ApiExceptionResponse.ServerError<CaseExtractionResultDto>("Failed to generate case data");
			}

			string aiResponse = AnalysisHelpers.TryExtractJsonPayload(aiResult.Data.Content);

			var lawyerIdStr = userId;
			var lawyerId = !string.IsNullOrEmpty(lawyerIdStr) ? Guid.Parse(lawyerIdStr) : Guid.Empty;
			try
			{
					BackgroundJob.Enqueue<IAiUsageTrackingService>(s => s.RecordGeminiUsageAsync(lawyerId, null, AiStepType.Ocr, ocrModel, aiResult.Data.Usage, CancellationToken.None, null, null, null));
			}
			catch
			{
				await _trackingService.RecordGeminiUsageAsync(lawyerId, null, AiStepType.Ocr, ocrModel, aiResult.Data.Usage, CancellationToken.None);
			}

			try
			{
				// Gemini sometimes returns just a string array (e.g. ["مدني","صحة توقيع"])
				// instead of the full CaseExtractionResultDto object. Handle gracefully.
				var trimmedResponse = aiResponse.TrimStart();
				if (trimmedResponse.StartsWith("["))
				{
					_logger.LogWarning("AI returned a plain array instead of the expected object. Wrapping into CaseExtractionResultDto.");
					var typeNames = JsonSerializer.Deserialize<List<string>>(aiResponse, Common.JsonOptions.Deserialize);
					var fallbackDto = new CaseExtractionResultDto
					{
						Types = typeNames ?? new List<string>(),
						Type = typeNames?.FirstOrDefault() ?? string.Empty,
					};
					return ApiExceptionResponse.Success(fallbackDto, "Case data generated successfully (partial — types only)");
				}

				var caseData = JsonSerializer.Deserialize<CaseExtractionResultDto>(aiResponse, Common.JsonOptions.Deserialize);
				if (caseData == null)
					return ApiExceptionResponse.ServerError<CaseExtractionResultDto>("Failed to parse generated case data.");

				_logger.LogInformation("Case JSON generated successfully");

				return ApiExceptionResponse.Success(caseData, "Case data generated successfully");
			}
			catch (JsonException ex)
			{
				_logger.LogError(ex, "Failed to deserialize Gemini response. {RedactedPayload}", RedactForLog(aiResponse));
				return ApiExceptionResponse.ServerError<CaseExtractionResultDto>("عذراً، فشل تحليل البيانات المستخرجة من الذكاء الاصطناعي بسبب استجابة غير مكتملة أو غير صالحة. يرجى المحاولة مرة أخرى.");
			}
		}


		private List<byte[]> ConvertPdfToPageImages(Stream pdfStream, int maxPages)
		{
			var pageImages = new List<byte[]>();

			if (pdfStream.CanSeek)
				pdfStream.Position = 0;

				if (!(OperatingSystem.IsWindows() || OperatingSystem.IsLinux() || OperatingSystem.IsMacOS() || OperatingSystem.IsAndroidVersionAtLeast(31)))
					throw new PlatformNotSupportedException("PDF image conversion is only supported on Windows, Linux, macOS, or Android 31+.");

#pragma warning disable CA1416
				var bitmaps = Conversion.ToImages(pdfStream);
#pragma warning restore CA1416

			foreach (var bitmap in bitmaps)
			{
				if (pageImages.Count >= maxPages)
				{
					bitmap.Dispose();
					throw new InvalidOperationException($"PDF page count exceeds the {maxPages} page OCR limit.");
				}

				using var ms = new MemoryStream();
				bitmap.Encode(ms, SKEncodedImageFormat.Png, 100);
				pageImages.Add(ms.ToArray());
				bitmap.Dispose();
			}

			return pageImages;
		}

        public static class OcrHelper
        {
            public static async Task<string> ExtractTextAsync(TesseractEngine engine, Stream imageStream, CancellationToken cancellationToken)
            {
                try
                {

                    // 📸 تحميل الصورة إلى الذاكرة
                    using var img = Pix.LoadFromMemory(await ToByteArrayAsync(imageStream, cancellationToken));

                    // 🔍 تنفيذ عملية OCR
                    var pageModes = new[]
                    {
						PageSegMode.Auto,
						PageSegMode.SingleBlock,
						PageSegMode.SparseText
                    };

					string bestText = string.Empty;

					foreach (var pageMode in pageModes)
					{
						using var page = engine.Process(img, pageMode);
						var candidate = page.GetText()?.Trim() ?? string.Empty;
						if (candidate.Length > bestText.Length)
							bestText = candidate;
					}

                    return bestText;
                }
                catch (TesseractException ex)
                {
                    throw new Exception($"فشل تهيئة محرك Tesseract: {ex.Message}\nتحقق من وجود مجلد tessdata ومسار اللغة العربية.");
                }
            }

            private static async Task<byte[]> ToByteArrayAsync(Stream input, CancellationToken cancellationToken)
            {
                using var ms = new MemoryStream();
                await input.CopyToAsync(ms, cancellationToken);
                return ms.ToArray();
            }
        }

		private static async Task<byte[]> ToByteArrayAsync(Stream input, CancellationToken cancellationToken)
		{
			using var ms = new MemoryStream();
			await input.CopyToAsync(ms, cancellationToken);
			return ms.ToArray();
		}

		private static string RedactForLog(string raw)
		{
			if (string.IsNullOrEmpty(raw)) return "(empty)";
			var preview = raw[..Math.Min(500, raw.Length)];
			var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw)))[..16];
			return $"{preview}... [SHA256:{hash}] (len={raw.Length})";
		}

		private static string SanitizePromptInput(string? raw)
		{
			if (string.IsNullOrEmpty(raw))
				return "<user_facts></user_facts>";

			var sanitized = raw
				.Replace("{facts_text}", string.Empty, StringComparison.OrdinalIgnoreCase)
				.Replace("{available_case_types}", string.Empty, StringComparison.OrdinalIgnoreCase);

			const int maxPromptInputLength = 200_000;
			if (sanitized.Length > maxPromptInputLength)
				sanitized = sanitized[..maxPromptInputLength];

			return $"<user_facts>\n{sanitized}\n</user_facts>";
		}


    }
}
