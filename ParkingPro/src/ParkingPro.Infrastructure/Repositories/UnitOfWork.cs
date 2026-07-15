using Microsoft.EntityFrameworkCore.Storage;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Domain.Entities;
using ParkingPro.Infrastructure.Persistence;

namespace ParkingPro.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(
        AppDbContext context,
        IRepository<ParkingLot> parkingLots,
        IRepository<Zone> zones,
        IRepository<ParkingSlot> parkingSlots,
        IRepository<Vehicle> vehicles,
        IRepository<PricingPlan> pricingPlans,
        IRepository<ParkingSession> parkingSessions,
        IRepository<MonthlyContract> monthlyContracts,
        IRepository<Payment> payments,
        IRepository<User> users,
        IRepository<RefreshToken> refreshTokens,
        IRepository<Shift> shifts,
        IRepository<Notification> notifications)
    {
        _context = context;
        ParkingLots = parkingLots;
        Zones = zones;
        ParkingSlots = parkingSlots;
        Vehicles = vehicles;
        PricingPlans = pricingPlans;
        ParkingSessions = parkingSessions;
        MonthlyContracts = monthlyContracts;
        Payments = payments;
        Users = users;
        RefreshTokens = refreshTokens;
        Shifts = shifts;
        Notifications = notifications;
    }

    public IRepository<ParkingLot> ParkingLots { get; }
    public IRepository<Zone> Zones { get; }
    public IRepository<ParkingSlot> ParkingSlots { get; }
    public IRepository<Vehicle> Vehicles { get; }
    public IRepository<PricingPlan> PricingPlans { get; }
    public IRepository<ParkingSession> ParkingSessions { get; }
    public IRepository<MonthlyContract> MonthlyContracts { get; }
    public IRepository<Payment> Payments { get; }
    public IRepository<User> Users { get; }
    public IRepository<RefreshToken> RefreshTokens { get; }
    public IRepository<Shift> Shifts { get; }
    public IRepository<Notification> Notifications { get; }

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _context.SaveChangesAsync(ct);

    public async Task ExecuteInTransactionAsync(Func<Task> action, CancellationToken ct = default)
    {
        // Nếu đã có transaction đang mở (vd trong test), tránh mở lồng transaction
        if (_context.Database.CurrentTransaction is not null)
        {
            await action();
            return;
        }

        IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            await action();
            await transaction.CommitAsync(ct);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }
}
