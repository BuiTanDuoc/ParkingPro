using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingPro.Domain.Entities;

namespace ParkingPro.Infrastructure.Persistence.Configurations;

public class MonthlyContractConfiguration : IEntityTypeConfiguration<MonthlyContract>
{
    public void Configure(EntityTypeBuilder<MonthlyContract> builder)
    {
        builder.Property(x => x.MonthlyFee).HasColumnType("decimal(18,2)");

        builder.HasOne(x => x.ParkingLot).WithMany().HasForeignKey(x => x.ParkingLotId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Vehicle).WithMany(x => x.MonthlyContracts).HasForeignKey(x => x.VehicleId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.CustomerUser).WithMany().HasForeignKey(x => x.CustomerUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.FixedSlot).WithMany(x => x.MonthlyContracts).HasForeignKey(x => x.FixedSlotId).OnDelete(DeleteBehavior.SetNull);
    }
}
