namespace ParkingPro.Application.Interfaces.Services;

/// <summary>Truy cập thông tin user hiện tại từ HttpContext, implement ở Infrastructure/API layer.</summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Role { get; }
}
