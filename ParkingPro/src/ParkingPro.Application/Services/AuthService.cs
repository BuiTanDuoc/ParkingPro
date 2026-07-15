using ParkingPro.Application.Common.Exceptions;
using ParkingPro.Application.DTOs.Auth;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _uow;
    private readonly ITokenGenerator _tokenGenerator;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(IUnitOfWork uow, ITokenGenerator tokenGenerator, IPasswordHasher passwordHasher)
    {
        _uow = uow;
        _tokenGenerator = tokenGenerator;
        _passwordHasher = passwordHasher;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _uow.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct)
            ?? throw new BadRequestException("Email hoặc mật khẩu không đúng.");

        if (!user.IsActive)
            throw new BadRequestException("Tài khoản đã bị khóa.");

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new BadRequestException("Email hoặc mật khẩu không đúng.");

        return await IssueTokensAsync(user, ct);
    }

    public async Task<LoginResponse> RefreshTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        var existingToken = await _uow.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken, ct)
            ?? throw new BadRequestException("Refresh token không hợp lệ.");

        if (!existingToken.IsActive)
        {
            // Phát hiện reuse: nếu token đã bị revoke nhưng vẫn được dùng lại,
            // thu hồi toàn bộ family để chặn tấn công refresh-token-theft.
            if (existingToken.RevokedAtUtc is not null)
                await RevokeTokenFamilyAsync(existingToken.FamilyId, ct);

            throw new BadRequestException("Refresh token đã hết hạn hoặc đã bị thu hồi.");
        }

        var user = await _uow.Users.GetByIdAsync(existingToken.UserId, ct)
            ?? throw new NotFoundException(nameof(User), existingToken.UserId);

        var newRefreshTokenValue = _tokenGenerator.GenerateRefreshToken();

        existingToken.RevokedAtUtc = DateTime.UtcNow;
        existingToken.ReplacedByToken = newRefreshTokenValue;
        _uow.RefreshTokens.Update(existingToken);

        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshTokenValue,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(30),
            FamilyId = existingToken.FamilyId
        };
        await _uow.RefreshTokens.AddAsync(newRefreshToken, ct);

        var (accessToken, expiresAt) = _tokenGenerator.GenerateAccessToken(user);
        await _uow.SaveChangesAsync(ct);

        return new LoginResponse(user.Id, user.FullName, user.Role.ToString(), accessToken, newRefreshTokenValue, expiresAt);
    }

    public async Task RevokeTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        var token = await _uow.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken, ct)
            ?? throw new NotFoundException("Refresh token", refreshToken);

        token.RevokedAtUtc = DateTime.UtcNow;
        token.ReasonRevoked = "Đăng xuất";
        _uow.RefreshTokens.Update(token);
        await _uow.SaveChangesAsync(ct);
    }

    public async Task<Guid> RegisterCustomerAsync(RegisterCustomerRequest request, CancellationToken ct = default)
    {
        var existing = await _uow.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct);
        if (existing is not null)
            throw new ConflictException("Email này đã được đăng ký.");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = UserRole.Customer,
            IsActive = true
        };

        await _uow.Users.AddAsync(user, ct);
        await _uow.SaveChangesAsync(ct);

        return user.Id;
    }

    private async Task<LoginResponse> IssueTokensAsync(User user, CancellationToken ct)
    {
        var (accessToken, expiresAt) = _tokenGenerator.GenerateAccessToken(user);
        var refreshTokenValue = _tokenGenerator.GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(30),
            FamilyId = Guid.NewGuid()
        };

        await _uow.RefreshTokens.AddAsync(refreshToken, ct);
        await _uow.SaveChangesAsync(ct);

        return new LoginResponse(user.Id, user.FullName, user.Role.ToString(), accessToken, refreshTokenValue, expiresAt);
    }

    private async Task RevokeTokenFamilyAsync(Guid familyId, CancellationToken ct)
    {
        var tokens = _uow.RefreshTokens.Query().Where(t => t.FamilyId == familyId && t.RevokedAtUtc == null).ToList();
        foreach (var t in tokens)
        {
            t.RevokedAtUtc = DateTime.UtcNow;
            t.ReasonRevoked = "Phát hiện tái sử dụng refresh token (khả nghi bị đánh cắp).";
            _uow.RefreshTokens.Update(t);
        }
        await _uow.SaveChangesAsync(ct);
    }
}
