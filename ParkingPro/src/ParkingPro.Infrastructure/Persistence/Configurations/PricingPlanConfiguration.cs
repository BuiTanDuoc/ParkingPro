using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingPro.Domain.Entities;

namespace ParkingPro.Infrastructure.Persistence.Configurations;

public class PricingPlanConfiguration : IEntityTypeConfiguration<PricingPlan>
{
    public void Configure(EntityTypeBuilder<PricingPlan> builder)
    {
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.FirstHourPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.NextHourPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.OvernightSurcharge).HasColumnType("decimal(18,2)");
        builder.Property(x => x.DailyPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.MonthlyPrice).HasColumnType("decimal(18,2)");

        builder.HasOne(x => x.ParkingLot)
            .WithMany(x => x.PricingPlans)
            .HasForeignKey(x => x.ParkingLotId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
