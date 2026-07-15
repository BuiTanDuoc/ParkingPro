using ParkingPro.Domain.Common;

namespace ParkingPro.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid RecipientUserId { get; set; }
    public User RecipientUser { get; set; } = default!;

    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public bool IsRead { get; set; }
    public DateTime? SentAtUtc { get; set; }
}
