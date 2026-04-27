using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Core.Common
{
	public class PagedResponse<T>
	{
		public IReadOnlyList<T> Data { get; set; }
		public int? PageNumber { get; set; }
		public int? PageSize { get; set; }
		public int TotalRecords { get; set; }
		public int TotalPages { get; set; }
		public bool HasNextPage { get; set; }
		public bool HasPreviousPage { get; set; }

		public PagedResponse(IReadOnlyList<T> data, int pageNumber, int pageSize, int totalRecords)
		{
			Data = data;
			PageNumber = pageNumber;
			PageSize = pageSize;
			TotalRecords = totalRecords;
			TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);
			HasNextPage = pageNumber < TotalPages;
			HasPreviousPage = pageNumber > 1;
		}
	}

}
