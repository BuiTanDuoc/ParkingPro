namespace ParkingPro.Application.DTOs.Auth;

/// <param name="FullName">Họ tên khách hàng.</param>
/// <param name="Email">Email — dùng để đăng nhập, phải là duy nhất trong hệ thống.</param>
/// <param name="Password">Mật khẩu (tối thiểu 6 ký tự).</param>
/// <param name="PhoneNumber">Số điện thoại liên hệ (không bắt buộc).</param>
public record RegisterCustomerRequest(
    string FullName,
    string Email,
    string Password,
    string? PhoneNumber);
