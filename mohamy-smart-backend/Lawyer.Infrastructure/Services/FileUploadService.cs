using Lawyer.Application.Common.Interface;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Infrastructure.Services
{
	public class FileUploadService : IFileUploadService
	{
		private readonly IWebHostEnvironment _env;

		private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
		{
			".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"
		};

		public FileUploadService(IWebHostEnvironment env)
		{
			_env = env;
		}

		private static string SanitizeFileName(string rawFileName)
		{
			return Path.GetFileName(rawFileName) ?? "unknown";
		}

		private static void ValidateFileExtension(string fileName)
		{
			var ext = Path.GetExtension(fileName);
			if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
				throw new ArgumentException($"نوع الملف '{ext}' غير مسموح به. الأنواع المسموحة: {string.Join(", ", AllowedExtensions)}");
		}

		public async Task<string> UploadClientFileAsync(IFormFile file, string clientId)
		{
			if (file == null || file.Length == 0)
				throw new ArgumentException("الملف غير صالح.");

			if (string.IsNullOrEmpty(clientId))
				throw new ArgumentException("معرف العميل مطلوب.");

			ValidateFileExtension(file.FileName);

			var rootPath = _env.WebRootPath;
			if (string.IsNullOrEmpty(rootPath))
				throw new InvalidOperationException("Root path is not configured.");

			var uploadsFolder = Path.Combine(rootPath, "uploads", "clients", clientId);
			Directory.CreateDirectory(uploadsFolder);

			var safeFileName = SanitizeFileName(file.FileName);
			var fileName = $"{Guid.NewGuid()}_{safeFileName}";
			var fullPath = Path.Combine(uploadsFolder, fileName);

			using (var stream = new FileStream(fullPath, FileMode.Create))
			{
				await file.CopyToAsync(stream);
			}

			return $"/uploads/clients/{clientId}/{fileName}";
		}

		public async Task<string> UploadGeneralFileAsync(IFormFile file, string folderName)
		{
			if (file == null || file.Length == 0)
				throw new ArgumentException("الملف غير صالح.");

			if (string.IsNullOrEmpty(folderName))
				throw new ArgumentException("اسم المجلد مطلوب.");

			ValidateFileExtension(file.FileName);

			var rootPath = _env.WebRootPath;
			if (string.IsNullOrEmpty(rootPath))
				throw new InvalidOperationException("Root path is not configured.");

			var uploadsFolder = Path.Combine(rootPath, "uploads", folderName);
			Directory.CreateDirectory(uploadsFolder);

			var safeFileName = SanitizeFileName(file.FileName);
			var fileName = $"{Guid.NewGuid()}_{safeFileName}";
			var fullPath = Path.Combine(uploadsFolder, fileName);

			using (var stream = new FileStream(fullPath, FileMode.Create))
			{
				await file.CopyToAsync(stream);
			}

			return $"/uploads/{folderName}/{fileName}";
		}
	}
}
