using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingPro.Application.DTOs.Sessions;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Infrastructure.Authorization;

namespace ParkingPro.API.Controllers;

[ApiController]
[Authorize]
[Route("api/sessions")]
public class ParkingSessionsController : ControllerBase
{
    private readonly IParkingSessionService _sessionService;
    private readonly ICurrentUserService _currentUser;

    public ParkingSessionsController(IParkingSessionService sessionService, ICurrentUserService currentUser)
    {
        _sessionService = sessionService;
        _currentUser = currentUser;
    }

    [HttpPost("check-in")]
    [RequireRole("Admin", "Manager", "Staff")]
    public async Task<IActionResult> CheckIn(CheckInRequest request, CancellationToken ct)
    {
        var result = await _sessionService.CheckInAsync(request, _currentUser.UserId!.Value, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/check-out")]
    [RequireRole("Admin", "Manager", "Staff")]
    public async Task<IActionResult> CheckOut(Guid id, CancellationToken ct)
    {
        var result = await _sessionService.CheckOutAsync(id, _currentUser.UserId!.Value, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _sessionService.GetByIdAsync(id, ct);
        return Ok(result);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive(
        [FromQuery] Guid parkingLotId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _sessionService.GetActiveSessionsAsync(parkingLotId, pageNumber, pageSize, ct);
        return Ok(result);
    }
}
