using ParkingPro.Application.Interfaces.Services;

namespace ParkingPro.Infrastructure.Security;

/// <summary>
/// Lưu ý: cần thêm package "BCrypt.Net-Next" vào ParkingPro.Infrastructure.csproj
/// (đã liệt kê trong README) trước khi build.
/// </summary>
public class BcryptPasswordHasher : IPasswordHasher
{
    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool Verify(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
}
