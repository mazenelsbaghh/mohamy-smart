using Lawyer.Application.Common.Interface;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Infrastructure.Persistence.Repositories
{
	public class UnitOfWork : IUnitOfWork, IDisposable, IAsyncDisposable
	{
		private readonly AppDbContext _context;
		private readonly UserManager<ApplicationUser> _userManager;

		private IUserRepository? _userRepository;
		private readonly Dictionary<string, object> _repositories = new();

		public UnitOfWork(AppDbContext context, UserManager<ApplicationUser> userManager)
		{
			_context = context ?? throw new ArgumentNullException(nameof(context));
			_userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
		}

		public IUserRepository Users
			=> _userRepository ??= new UserRepositories(_context, _userManager, this);

		public IGenericRepository<TEntity> Repository<TEntity>() where TEntity : class
		{
			var typeName = typeof(TEntity).FullName!;
			if (!_repositories.ContainsKey(typeName))
			{
				var repositoryInstance = new GenericRepository<TEntity>(_context);
				_repositories.Add(typeName, repositoryInstance);
			}
			return (IGenericRepository<TEntity>)_repositories[typeName];
		}

		public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
		{
			return await _context.SaveChangesAsync(cancellationToken);
		}

		public Task<IDbContextTransaction> BeginTransactionAsync()
		{
			return _context.Database.BeginTransactionAsync();
		}

		public async Task ExecuteInTransactionAsync(Func<Task> operation, CancellationToken cancellationToken = default)
		{
			var executionStrategy = _context.Database.CreateExecutionStrategy();
			await executionStrategy.ExecuteAsync(async () =>
			{
				await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
				await operation();
				await transaction.CommitAsync(cancellationToken);
			});
		}

		public async Task<int> ExecuteSqlRawAsync(string sql, IEnumerable<object> parameters, CancellationToken cancellationToken = default)
		{
			return await _context.Database.ExecuteSqlRawAsync(sql, parameters, cancellationToken);
		}

		public void Dispose()
		{ 
			_context.Dispose();
		}

		public async ValueTask DisposeAsync()
		{
			await _context.DisposeAsync();
		}
	}
}
