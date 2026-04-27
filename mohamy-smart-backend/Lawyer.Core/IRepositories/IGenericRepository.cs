using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Lawyer.Core.IRepositories
{
	public interface IGenericRepository<T> where T : class
	{
		Task<T?> GetByIdAsync(int id);
		Task<T?> GetByIdAsync(Guid id);
		Task<List<T>> GetAllAsync(CancellationToken cancellationToken = default);
		Task<List<T>> WhereAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
		Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);
		Task<T?> FirstOrDefaultTrackedAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);
		Task<List<T>> WhereTrackedAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
		Task<bool> AnyAsync(Expression<Func<T, bool>> predicate,
										  CancellationToken cancellationToken = default);
		Task AddAsync(T entity);
		Task Update(T entity);
		void Delete(T entity);

	    IQueryable<T> AsQueryable();
		Task<T?> GetByIdIgnoreQueryFiltersAsync(Expression<Func<T, bool>> predicate);
	}
}
