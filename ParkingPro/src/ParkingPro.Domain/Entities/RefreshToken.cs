using ParkingPro.Domain.Common;

namespace ParkingPro.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public string Token { get; set; } = default!;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public string? ReplacedByToken { get; set; }
    public string? ReasonRevoked { get; set; }

    // Family-based reuse detection (giống pattern đã dùng ở CarBookingApp)
    public Guid FamilyId { get; set; }

    public bool IsActive => RevokedAtUtc is null && DateTime.UtcNow < ExpiresAtUtc;
}
