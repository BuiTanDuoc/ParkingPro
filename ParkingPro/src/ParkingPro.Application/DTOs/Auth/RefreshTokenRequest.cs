namespace ParkingPro.Application.DTOs.Auth;

/// <param name="RefreshToken">Refresh token nhận được lúc đăng nhập.</param>
public record RefreshTokenRequest(string RefreshToken);
