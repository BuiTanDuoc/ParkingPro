using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingPro.Domain.Entities;

namespace ParkingPro.Infrastructure.Persistence.Configurations;

public class ZoneConfiguration : IEntityTypeConfiguration<Zone>
{
    public void Configure(EntityTypeBuilder<Zone> builder)
    {
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);

        builder.HasOne(x => x.ParkingLot)
            .WithMany(x => x.Zones)
            .HasForeignKey(x => x.ParkingLotId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
