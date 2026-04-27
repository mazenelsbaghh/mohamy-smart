using Lawyer.Application.Common.Interface;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Infrastructure.Services
{
	public class FileService : IFileService
	{
		private readonly IWebHostEnvironment _env;
		private readonly IHttpContextAccessor _httpContextAccessor;
		private readonly string[] _allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
		private const long MaxFileSize = 10 * 1024 * 1024;

		public FileService(
			IWebHostEnvironment env,
			IHttpContextAccessor httpContextAccessor)
		{
			_env = env;
			_httpContextAccessor = httpContextAccessor;
		}

		public async Task<string> UploadImageAsync(IFormFile file , string folderName,Guid propertyid)
		{
			if (file == null || file.Length == 0)
				throw new ArgumentException("Empty file");

			if (file.Length > MaxFileSize)
				throw new ArgumentException("File size exceeds limit");

			var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

			if (!_allowedExtensions.Contains(extension))
				throw new ArgumentException("Unsupported file format");

			var fileName = $"{propertyid}{extension}";
			var uploadPath = Path.Combine(_env.WebRootPath, $"uploads/{folderName}");

			if (!Directory.Exists(uploadPath))
				Directory.CreateDirectory(uploadPath);

			var fullPath = Path.Combine(uploadPath, fileName);

			using (var stream = new FileStream(fullPath, FileMode.Create))
			{
				await file.CopyToAsync(stream);
			}

			// Build full URL
			var request = _httpContextAccessor.HttpContext?.Request;
			var baseUrl = $"{request?.Scheme}://{request?.Host.Value}";
			var relativePath = $"/uploads/{folderName}/{fileName}";

			return $"{baseUrl}{relativePath}";
		}
	}

}
 