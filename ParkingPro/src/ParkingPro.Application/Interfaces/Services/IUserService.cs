using ParkingPro.Application.DTOs.Users;

namespace ParkingPro.Application.Interfaces.Services;

public interface IUserService
{
    Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Upload/thay avatar cho user. Trả về AvatarUrl mới.</summary>
    Task<string> UpdateAvatarAsync(Guid userId, Stream photoStream, string photoFileName, CancellationToken ct = default);
}
