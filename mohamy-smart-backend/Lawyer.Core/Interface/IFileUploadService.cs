using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Common.Interface
{
	public interface IFileUploadService
	{
		Task<string> UploadClientFileAsync(IFormFile file, string clientId);
		Task<string> UploadGeneralFileAsync(IFormFile file, string folderName);
	}

}
