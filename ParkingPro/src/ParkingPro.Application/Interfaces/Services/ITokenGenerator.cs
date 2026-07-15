using ParkingPro.Domain.Entities;

namespace ParkingPro.Application.Interfaces.Services;

public interface ITokenGenerator
{
    (string Token, DateTime ExpiresAtUtc) GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
