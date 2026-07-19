using Microsoft.AspNetCore.Mvc;
using ParkingPro.API.Common;
using ParkingPro.Application.DTOs.Auth;
using ParkingPro.Application.Interfaces.Services;

namespace ParkingPro.API.Controllers;

/// <summary>Đăng nhập, làm mới token, đăng xuất, đăng ký tài khoản khách hàng.</summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>Đăng nhập bằng email/mật khẩu, trả về JWT access token + refresh token.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var result = await _authService.LoginAsync(request, ct);
        return Ok(result);
    }

    /// <summary>Đổi refresh token đã hết hạn/access token cũ lấy cặp token mới.</summary>
    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LoginResponse>> RefreshToken(RefreshTokenRequest request, CancellationToken ct)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken, ct);
        return Ok(result);
    }

    /// <summary>Thu hồi refresh token hiện tại (đăng xuất).</summary>
    [HttpPost("revoke-token")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RevokeToken(RefreshTokenRequest request, CancellationToken ct)
    {
        await _authService.RevokeTokenAsync(request.RefreshToken, ct);
        return NoContent();
    }

    /// <summary>Đăng ký tài khoản khách hàng (Role Customer) tự phục vụ — không dùng để tạo tài khoản nội bộ.</summary>
    [HttpPost("register-customer")]
    [ProducesResponseType(typeof(RegisterCustomerResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RegisterCustomerResponse>> RegisterCustomer(RegisterCustomerRequest request, CancellationToken ct)
    {
        var userId = await _authService.RegisterCustomerAsync(request, ct);
        var response = new RegisterCustomerResponse(userId);
        return CreatedAtAction(nameof(RegisterCustomer), new { id = userId }, response);
    }
}
