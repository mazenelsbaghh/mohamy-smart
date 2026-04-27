using Lawyer.Core.IRepositories;
using Lawyer.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq.Expressions;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
	protected readonly AppDbContext _context;
	protected readonly DbSet<T> _dbSet;

	public GenericRepository(AppDbContext context)
	{
		_context = context;
		_dbSet = context.Set<T>();
	}

	public async Task<T?> GetByIdAsync(int id) => await _dbSet.FindAsync(id);

	public async Task<T?> GetByIdAsync(Guid id) => await _dbSet.FindAsync(id);

	public async Task<List<T>> GetAllAsync(CancellationToken cancellationToken = default)
		=> await _dbSet.AsNoTracking().ToListAsync(cancellationToken);

	public async Task<List<T>> WhereAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
		=> await _dbSet.AsNoTracking().Where(predicate).ToListAsync(cancellationToken);


	public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate,
								  CancellationToken cancellationToken = default)
	{
		return await _dbSet.AnyAsync(predicate, cancellationToken);
	}
	public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes)
	{
		IQueryable<T> query = _dbSet.AsNoTracking().Where(predicate);

		foreach (var include in includes)
			query = query.Include(include);

		return await query.FirstOrDefaultAsync(cancellationToken);
	}

	public async Task<T?> FirstOrDefaultTrackedAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes)
	{
		IQueryable<T> query = _dbSet.Where(predicate);

		foreach (var include in includes)
			query = query.Include(include);

		return await query.FirstOrDefaultAsync(cancellationToken);
	}

	public async Task<List<T>> WhereTrackedAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
		=> await _dbSet.Where(predicate).ToListAsync(cancellationToken);


	public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);

	public Task Update(T entity)
	{
		_dbSet.Update(entity);
		return Task.CompletedTask;
	}

	public void Delete(T entity) => _dbSet.Remove(entity);

	public IQueryable<T> AsQueryable()
	{
		return _dbSet;
	}

	public async Task<T?> GetByIdIgnoreQueryFiltersAsync(Expression<Func<T, bool>> predicate)
	{
		return await _dbSet
			.IgnoreQueryFilters()
			.FirstOrDefaultAsync(predicate);
	}
}
