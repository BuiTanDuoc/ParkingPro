using System.Linq.Expressions;
using ParkingPro.Domain.Common;

namespace ParkingPro.Application.Interfaces.Repositories;

/// <summary>
/// Repository generic tối giản — Service layer gọi trực tiếp, không qua CQRS/Mediator.
/// </summary>
public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    IQueryable<T> Query(bool asNoTracking = true);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
