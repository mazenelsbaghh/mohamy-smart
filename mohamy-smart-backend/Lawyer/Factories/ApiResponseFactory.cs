using Lawyer.Core.Exceptions;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Lawyer.API.Factories
{
	public class ApiResponseFactory
	{
		public static IActionResult CustomValidationErrorResponse(ActionContext context)
		{
			var errors = context.ModelState
				.Where(m => m.Value is { Errors.Count: > 0 })
				.SelectMany(m => m.Value!.Errors)
				.Select(e => e.ErrorMessage)
				.ToList();

			var response = new ApiValidationErrorResponse
			{
				Errors = errors,
				StatusCode = HttpStatusCode.BadRequest
			};

			return new BadRequestObjectResult(response);
		}
	}
}
