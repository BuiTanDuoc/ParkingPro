using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingPro.Domain.Entities;

namespace ParkingPro.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Message).IsRequired().HasMaxLength(1000);

        builder.HasOne(x => x.RecipientUser).WithMany().HasForeignKey(x => x.RecipientUserId).OnDelete(DeleteBehavior.Cascade);
    }
}
