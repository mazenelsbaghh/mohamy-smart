using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Core.Common.Extension
{
	public static class QueryableExtensions
	{
		public static async Task<PagedResponse<T>> ToPagedResponseAsync<T>(
			this IQueryable<T> query,
			int pageNumber,
			int pageSize,
			CancellationToken cancellationToken = default)
		{
			var totalRecords = await query.CountAsync();

			var data = await query
				.Skip((pageNumber - 1) * pageSize)
				.Take(pageSize)
				.ToListAsync(cancellationToken);

			return new PagedResponse<T>(data, pageNumber, pageSize, totalRecords);
		}
	}
}
