using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Domain.Common;
using ParkingPro.Infrastructure.Persistence;

namespace ParkingPro.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    private readonly AppDbContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _dbSet.FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default) =>
        await _dbSet.FirstOrDefaultAsync(predicate, ct);

    public IQueryable<T> Query(bool asNoTracking = true) =>
        asNoTracking ? _dbSet.AsNoTracking() : _dbSet;

    public async Task AddAsync(T entity, CancellationToken ct = default) =>
        await _dbSet.AddAsync(entity, ct);

    public void Update(T entity) => _dbSet.Update(entity);

    public void Remove(T entity) => _dbSet.Remove(entity);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _context.SaveChangesAsync(ct);
}
