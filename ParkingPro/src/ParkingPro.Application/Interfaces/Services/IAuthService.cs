using ParkingPro.Application.DTOs.Auth;

namespace ParkingPro.Application.Interfaces.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<LoginResponse> RefreshTokenAsync(string refreshToken, CancellationToken ct = default);
    Task RevokeTokenAsync(string refreshToken, CancellationToken ct = default);
    Task<Guid> RegisterCustomerAsync(RegisterCustomerRequest request, CancellationToken ct = default);
}
