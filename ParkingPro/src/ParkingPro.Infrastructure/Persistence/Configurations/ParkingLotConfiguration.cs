using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingPro.Domain.Entities;

namespace ParkingPro.Infrastructure.Persistence.Configurations;

public class ParkingLotConfiguration : IEntityTypeConfiguration<ParkingLot>
{
    public void Configure(EntityTypeBuilder<ParkingLot> builder)
    {
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Address).IsRequired().HasMaxLength(500);
    }
}
