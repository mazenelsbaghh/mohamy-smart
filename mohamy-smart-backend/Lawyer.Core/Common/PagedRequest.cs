using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Core.Common
{
	public class PagedRequest
	{
		public int PageNumber { get; set; } = 1;
		public int PageSize { get; set; } = 10;

		public PagedRequest()
		{
		}

		public PagedRequest(int pageNumber, int pageSize)
		{
			PageNumber = pageNumber < 1 ? 1 : pageNumber;
			PageSize = pageSize > 100 ? 100 : pageSize; 
		}

	}
}
