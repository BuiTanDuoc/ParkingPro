namespace ParkingPro.Application.DTOs.Auth;

/// <param name="UserId">Id tài khoản.</param>
/// <param name="FullName">Họ tên hiển thị.</param>
/// <param name="Role">Vai trò: Admin, Manager, Staff hoặc Customer.</param>
/// <param name="AccessToken">JWT access token — đính kèm header "Authorization: Bearer {AccessToken}" cho các request tiếp theo.</param>
/// <param name="RefreshToken">Dùng để lấy access token mới khi hết hạn, qua /api/auth/refresh-token.</param>
/// <param name="AccessTokenExpiresAtUtc">Thời điểm access token hết hạn (UTC).</param>
public record LoginResponse(
    Guid UserId,
    string FullName,
    string Role,
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAtUtc);
