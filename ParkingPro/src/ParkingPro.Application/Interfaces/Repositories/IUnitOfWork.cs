namespace ParkingPro.Application.Interfaces.Repositories;

/// <summary>
/// Gói toàn bộ repository dùng chung một DbContext, đảm bảo các thao tác
/// trong 1 Service method (vd CheckOut: update slot + update session + tạo payment)
/// được lưu trong cùng 1 transaction khi gọi SaveChangesAsync.
/// </summary>
public interface IUnitOfWork
{
    IRepository<Domain.Entities.ParkingLot> ParkingLots { get; }
    IRepository<Domain.Entities.Zone> Zones { get; }
    IRepository<Domain.Entities.ParkingSlot> ParkingSlots { get; }
    IRepository<Domain.Entities.Vehicle> Vehicles { get; }
    IRepository<Domain.Entities.PricingPlan> PricingPlans { get; }
    IRepository<Domain.Entities.ParkingSession> ParkingSessions { get; }
    IRepository<Domain.Entities.MonthlyContract> MonthlyContracts { get; }
    IRepository<Domain.Entities.Payment> Payments { get; }
    IRepository<Domain.Entities.User> Users { get; }
    IRepository<Domain.Entities.RefreshToken> RefreshTokens { get; }
    IRepository<Domain.Entities.Shift> Shifts { get; }
    IRepository<Domain.Entities.Notification> Notifications { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);

    /// <summary>Chạy 1 khối thao tác trong cùng transaction DB (dùng cho check-out: trừ slot + tạo payment).</summary>
    Task ExecuteInTransactionAsync(Func<Task> action, CancellationToken ct = default);
}
