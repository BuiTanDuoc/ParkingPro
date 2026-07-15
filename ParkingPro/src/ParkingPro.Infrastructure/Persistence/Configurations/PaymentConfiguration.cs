using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingPro.Domain.Entities;

namespace ParkingPro.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.Property(x => x.Amount).HasColumnType("decimal(18,2)");

        builder.HasOne(x => x.MonthlyContract).WithMany(x => x.Payments).HasForeignKey(x => x.MonthlyContractId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ReceivedByStaff).WithMany().HasForeignKey(x => x.ReceivedByStaffId).OnDelete(DeleteBehavior.Restrict);
    }
}
