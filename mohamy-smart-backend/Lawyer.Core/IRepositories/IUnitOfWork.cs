using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Core.IRepositories
{
	public interface IUnitOfWork : IDisposable
	{
		IGenericRepository<TEntity> Repository<TEntity>() where TEntity : class;
		IUserRepository Users { get; }
		Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
		Task<IDbContextTransaction> BeginTransactionAsync();
		Task<int> ExecuteSqlRawAsync(string sql, IEnumerable<object> parameters, CancellationToken cancellationToken = default);
	}
}
