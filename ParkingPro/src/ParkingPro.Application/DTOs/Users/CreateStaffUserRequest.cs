namespace ParkingPro.Application.DTOs.Users;

/// <summary>
/// Tạo tài khoản nội bộ (Staff/Manager/Admin) — chỉ Admin mới gọi được, khác với
/// đăng ký Customer tự phục vụ qua /api/auth/register-customer.
/// </summary>
/// <param name="FullName">Họ tên.</param>
/// <param name="Email">Email đăng nhập — phải là duy nhất.</param>
/// <param name="Password">Mật khẩu (tối thiểu 6 ký tự).</param>
/// <param name="PhoneNumber">Số điện thoại (không bắt buộc).</param>
/// <param name="Role">Vai trò: Staff, Manager hoặc Admin.</param>
public record CreateStaffUserRequest(
    string FullName,
    string Email,
    string Password,
    string? PhoneNumber,
    string Role);
