using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingPro.Domain.Entities;

namespace ParkingPro.Infrastructure.Persistence.Configurations;

public class ParkingSessionConfiguration : IEntityTypeConfiguration<ParkingSession>
{
    public void Configure(EntityTypeBuilder<ParkingSession> builder)
    {
        builder.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");

        builder.HasOne(x => x.ParkingLot).WithMany().HasForeignKey(x => x.ParkingLotId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Vehicle).WithMany(x => x.Sessions).HasForeignKey(x => x.VehicleId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Slot).WithMany(x => x.Sessions).HasForeignKey(x => x.SlotId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.MonthlyContract).WithMany(x => x.Sessions).HasForeignKey(x => x.MonthlyContractId).OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.CheckInStaff).WithMany().HasForeignKey(x => x.CheckInStaffId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.CheckOutStaff).WithMany().HasForeignKey(x => x.CheckOutStaffId).OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Payment).WithOne(x => x.ParkingSession).HasForeignKey<Payment>(x => x.ParkingSessionId);
    }
}
