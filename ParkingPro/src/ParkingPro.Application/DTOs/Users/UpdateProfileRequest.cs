namespace ParkingPro.Application.DTOs.Users;

/// <param name="FullName">Họ tên mới.</param>
/// <param name="PhoneNumber">Số điện thoại mới (không bắt buộc).</param>
public record UpdateProfileRequest(string FullName, string? PhoneNumber);
