using Microsoft.AspNetCore.Mvc;
using ParkingPro.Application.DTOs.Auth;
using ParkingPro.Application.Interfaces.Services;

namespace ParkingPro.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
    {
        var result = await _authService.LoginAsync(request, ct);
        return Ok(result);
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken(RefreshTokenRequest request, CancellationToken ct)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken, ct);
        return Ok(result);
    }

    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken(RefreshTokenRequest request, CancellationToken ct)
    {
        await _authService.RevokeTokenAsync(request.RefreshToken, ct);
        return NoContent();
    }

    [HttpPost("register-customer")]
    public async Task<IActionResult> RegisterCustomer(RegisterCustomerRequest request, CancellationToken ct)
    {
        var userId = await _authService.RegisterCustomerAsync(request, ct);
        return CreatedAtAction(nameof(RegisterCustomer), new { id = userId }, new { id = userId });
    }
}
