using System.Net;

namespace Lawyer.Core.Exceptions
{
	public class ApiValidationErrorResponse : Result<string>
		{
			public ApiValidationErrorResponse() : base()
			{
				StatusCode = HttpStatusCode.UnprocessableContent;
				Errors = new List<string>();
			}
		}
	}

