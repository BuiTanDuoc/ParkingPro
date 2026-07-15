namespace ParkingPro.Application.DTOs.Auth;

public record LoginResponse(
    Guid UserId,
    string FullName,
    string Role,
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAtUtc);
