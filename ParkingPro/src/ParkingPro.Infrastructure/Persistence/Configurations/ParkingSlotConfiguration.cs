using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingPro.Domain.Entities;

namespace ParkingPro.Infrastructure.Persistence.Configurations;

public class ParkingSlotConfiguration : IEntityTypeConfiguration<ParkingSlot>
{
    public void Configure(EntityTypeBuilder<ParkingSlot> builder)
    {
        builder.Property(x => x.Code).IsRequired().HasMaxLength(20);
        builder.Property(x => x.Description).HasMaxLength(1000);

        builder.HasIndex(x => new { x.ZoneId, x.Code }).IsUnique();

        builder.HasOne(x => x.Zone)
            .WithMany(x => x.Slots)
            .HasForeignKey(x => x.ZoneId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
