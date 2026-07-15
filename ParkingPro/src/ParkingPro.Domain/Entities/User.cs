using ParkingPro.Domain.Common;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? PhoneNumber { get; set; }
    public string PasswordHash { get; set; } = default!;
    public UserRole Role { get; set; } = UserRole.Customer;
    public bool IsActive { get; set; } = true;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
