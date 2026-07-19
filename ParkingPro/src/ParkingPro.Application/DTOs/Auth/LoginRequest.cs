namespace ParkingPro.Application.DTOs.Auth;

/// <param name="Email">Email đăng nhập.</param>
/// <param name="Password">Mật khẩu.</param>
public record LoginRequest(string Email, string Password);
