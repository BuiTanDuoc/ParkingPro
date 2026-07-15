using Microsoft.EntityFrameworkCore;
using ParkingPro.Domain.Common;
using ParkingPro.Domain.Entities;

namespace ParkingPro.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ParkingLot> ParkingLots => Set<ParkingLot>();
    public DbSet<Zone> Zones => Set<Zone>();
    public DbSet<ParkingSlot> ParkingSlots => Set<ParkingSlot>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<PricingPlan> PricingPlans => Set<PricingPlan>();
    public DbSet<ParkingSession> ParkingSessions => Set<ParkingSession>();
    public DbSet<MonthlyContract> MonthlyContracts => Set<MonthlyContract>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Shift> Shifts => Set<Shift>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Global query filter: ẩn các bản ghi đã xóa mềm (soft delete)
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(AppDbContext)
                    .GetMethod(nameof(SetSoftDeleteFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                    .MakeGenericMethod(entityType.ClrType);
                method.Invoke(null, new object[] { modelBuilder });
            }
        }

        base.OnModelCreating(modelBuilder);
    }

    private static void SetSoftDeleteFilter<T>(ModelBuilder modelBuilder) where T : BaseEntity
    {
        modelBuilder.Entity<T>().HasQueryFilter(e => !e.IsDeleted);
    }

    public override int SaveChanges()
    {
        ApplyAuditInfo();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditInfo();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyAuditInfo()
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAtUtc = DateTime.UtcNow;

            if (entry.State == EntityState.Deleted)
            {
                // Soft delete: không xóa vật lý dữ liệu tài chính/lịch sử
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
                entry.Entity.UpdatedAtUtc = DateTime.UtcNow;
            }
        }
    }
}
