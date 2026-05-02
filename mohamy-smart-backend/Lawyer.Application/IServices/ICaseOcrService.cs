using Lawyer.Application.Dtos.Case;
using Lawyer.Core.Exceptions;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.IServices
{
	public interface ICaseOcrService
	{
		Task<Result<List<string>>> ExtractTextFromImagesAsync(
			List<IFormFile> images,
			string? userId,
			CancellationToken cancellationToken,
			bool requireGoogleVision = false);
	
			Task<Result<CaseExtractionResultDto>> GenerateCaseFromTextAsync(string revisedText, List<AvailableCaseTypeDto> availableCaseTypes, string? userId, CancellationToken cancellationToken);
	}

}
