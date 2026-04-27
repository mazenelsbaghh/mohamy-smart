using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Application.Common.Interface
{
	public interface IFileService
	{
		Task<string> UploadImageAsync(IFormFile file , string folderName , Guid propertyId);
	}

}
