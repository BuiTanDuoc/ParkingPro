namespace ParkingPro.Application.DTOs.Users;

/// <param name="Id">Id tài khoản.</param>
/// <param name="FullName">Họ tên hiển thị.</param>
/// <param name="Email">Email đăng nhập.</param>
/// <param name="PhoneNumber">Số điện thoại — có thể null.</param>
/// <param name="Role">Vai trò: Admin, Manager, Staff hoặc Customer.</param>
/// <param name="AvatarUrl">Ảnh đại diện (URL tương đối) — ảnh mặc định nếu chưa upload.</param>
/// <param name="IsActive">Tài khoản có đang hoạt động (chưa bị khóa) hay không.</param>
public record UserProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string? PhoneNumber,
    string Role,
    string AvatarUrl,
    bool IsActive);
