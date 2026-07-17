using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingPro.Application.DTOs.Slots;
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

    /// <summary>Danh sách khu vực (Zone) của 1 bãi xe, kèm số lượng slot mỗi khu.</summary>
    [HttpGet("zones")]
    public async Task<IActionResult> GetZones([FromQuery] Guid parkingLotId, CancellationToken ct)
    {
        var result = await _slotService.GetZonesAsync(parkingLotId, ct);
        return Ok(result);
    }

    /// <summary>Tạo khu vực mới (vd "Tầng 2", "Khu B").</summary>
    [HttpPost("zones")]
    [RequireRole("Admin", "Manager")]
    public async Task<IActionResult> CreateZone(CreateZoneRequest request, CancellationToken ct)
    {
        var result = await _slotService.CreateZoneAsync(request, ct);
        return CreatedAtAction(nameof(GetZones), new { parkingLotId = request.ParkingLotId }, result);
    }

    /// <summary>Tạo slot mới trong 1 khu vực.</summary>
    [HttpPost]
    [RequireRole("Admin", "Manager")]
    public async Task<IActionResult> CreateSlot(CreateSlotRequest request, CancellationToken ct)
    {
        var result = await _slotService.CreateSlotAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>Sửa mã/loại slot (không sửa được khi slot đang có xe).</summary>
    [HttpPut("{id:guid}")]
    [RequireRole("Admin", "Manager")]
    public async Task<IActionResult> UpdateSlot(Guid id, UpdateSlotRequest request, CancellationToken ct)
    {
        var result = await _slotService.UpdateSlotAsync(id, request, ct);
        return Ok(result);
    }
}
