using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingPro.Domain.Entities;

namespace ParkingPro.Infrastructure.Persistence.Configurations;

public class ShiftConfiguration : IEntityTypeConfiguration<Shift>
{
    public void Configure(EntityTypeBuilder<Shift> builder)
    {
        builder.Property(x => x.ExpectedCashAmount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.ActualCashAmount).HasColumnType("decimal(18,2)");

        builder.HasOne(x => x.ParkingLot).WithMany().HasForeignKey(x => x.ParkingLotId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Staff).WithMany().HasForeignKey(x => x.StaffId).OnDelete(DeleteBehavior.Restrict);
    }
}
