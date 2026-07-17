namespace ParkingPro.Application.DTOs.Users;

/// <summary>
/// Tạo tài khoản nội bộ (Staff/Manager/Admin) — chỉ Admin mới gọi được, khác với
/// đăng ký Customer tự phục vụ qua /api/auth/register-customer.
/// </summary>
public record CreateStaffUserRequest(
    string FullName,
    string Email,
    string Password,
    string? PhoneNumber,
    string Role);
