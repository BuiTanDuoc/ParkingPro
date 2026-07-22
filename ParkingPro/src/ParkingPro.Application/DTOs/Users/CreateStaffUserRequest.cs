namespace ParkingPro.Application.DTOs.Users;

/// <summary>
/// Tạo tài khoản (Staff/Manager/Admin/Customer) — chỉ Admin mới gọi được. Ngoài ra khách hàng
/// vẫn có thể tự đăng ký qua /api/auth/register-customer.
/// </summary>
/// <param name="FullName">Họ tên.</param>
/// <param name="Email">Email đăng nhập — phải là duy nhất.</param>
/// <param name="Password">Mật khẩu (tối thiểu 6 ký tự).</param>
/// <param name="PhoneNumber">Số điện thoại (không bắt buộc).</param>
/// <param name="Role">Vai trò: Staff, Manager, Admin hoặc Customer.</param>
public record CreateStaffUserRequest(
    string FullName,
    string Email,
    string Password,
    string? PhoneNumber,
    string Role);
