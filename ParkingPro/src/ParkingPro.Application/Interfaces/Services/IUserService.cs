using ParkingPro.Application.Common;
using ParkingPro.Application.DTOs.Users;

namespace ParkingPro.Application.Interfaces.Services;

public interface IUserService
{
    Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Upload/thay avatar cho user. Trả về AvatarUrl mới.</summary>
    Task<string> UpdateAvatarAsync(Guid userId, Stream photoStream, string photoFileName, CancellationToken ct = default);

    /// <summary>Danh sách tài khoản (Admin dùng để quản lý nhân sự). Lọc theo role nếu có truyền vào.</summary>
    Task<PagedResult<UserProfileDto>> GetAllUsersAsync(string? role, int pageNumber, int pageSize, CancellationToken ct = default);

    /// <summary>Tạo tài khoản nội bộ (Staff/Manager/Admin) — chỉ Admin được gọi.</summary>
    Task<UserProfileDto> CreateStaffUserAsync(CreateStaffUserRequest request, CancellationToken ct = default);

    /// <summary>Khóa/mở khóa tài khoản.</summary>
    Task SetActiveStatusAsync(Guid userId, bool isActive, CancellationToken ct = default);
}
