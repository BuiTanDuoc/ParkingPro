using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Infrastructure.Authorization;

namespace ParkingPro.API.Controllers;

[ApiController]
[Authorize]
[Route("api/slots")]
public class SlotsController : ControllerBase
{
    private readonly ISlotService _slotService;

    public SlotsController(ISlotService slotService)
    {
        _slotService = slotService;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus([FromQuery] Guid parkingLotId, CancellationToken ct)
    {
        var result = await _slotService.GetSlotStatusesAsync(parkingLotId, ct);
        return Ok(result);
    }

    [HttpPut("{id:guid}/maintenance")]
    [RequireRole("Admin", "Manager")]
    public async Task<IActionResult> SetMaintenance(Guid id, [FromQuery] bool underMaintenance, CancellationToken ct)
    {
        await _slotService.SetMaintenanceAsync(id, underMaintenance, ct);
        return NoContent();
    }
}
