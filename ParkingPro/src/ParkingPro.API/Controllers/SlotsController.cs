using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingPro.Application.Common;
using ParkingPro.Application.DTOs.Slots;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Infrastructure.Authorization;

namespace ParkingPro.API.Controllers;

/// <summary>Sơ đồ bãi xe, quản lý khu vực (Zone) và slot.</summary>
[ApiController]
[Authorize]
[Route("api/slots")]
[Produces("application/json")]
public class SlotsController : ControllerBase
{
    private readonly ISlotService _slotService;

    public SlotsController(ISlotService slotService)
    {
        _slotService = slotService;
    }

    /// <summary>Toàn bộ slot của 1 bãi xe kèm trạng thái hiện tại, không phân trang — dùng cho sơ đồ bãi xe realtime.</summary>
    [HttpGet("status")]
    [ProducesResponseType(typeof(IReadOnlyList<SlotStatusDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SlotStatusDto>>> GetStatus([FromQuery] Guid parkingLotId, CancellationToken ct)
    {
        var result = await _slotService.GetSlotStatusesAsync(parkingLotId, ct);
        return Ok(result);
    }

    /// <summary>Danh sách slot có phân trang, lọc theo khu vực và tìm theo mã/mô tả — dùng cho trang quản lý.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<SlotStatusDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<SlotStatusDto>>> GetSlots(
        [FromQuery] Guid parkingLotId, [FromQuery] Guid? zoneId, [FromQuery] string? search,
        [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _slotService.GetSlotsPagedAsync(parkingLotId, zoneId, search, pageNumber, pageSize, ct);
        return Ok(result);
    }

    /// <summary>Bật/tắt trạng thái bảo trì của 1 slot (chặn khi slot đang có xe).</summary>
    [HttpPut("{id:guid}/maintenance")]
    [RequireRole("Admin", "Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> SetMaintenance(Guid id, [FromQuery] bool underMaintenance, CancellationToken ct)
    {
        await _slotService.SetMaintenanceAsync(id, underMaintenance, ct);
        return NoContent();
    }

    /// <summary>Danh sách khu vực (Zone) của 1 bãi xe, kèm số lượng slot mỗi khu.</summary>
    [HttpGet("zones")]
    [ProducesResponseType(typeof(IReadOnlyList<ZoneDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ZoneDto>>> GetZones([FromQuery] Guid parkingLotId, CancellationToken ct)
    {
        var result = await _slotService.GetZonesAsync(parkingLotId, ct);
        return Ok(result);
    }

    /// <summary>Tạo khu vực mới (vd "Tầng 2", "Khu B").</summary>
    [HttpPost("zones")]
    [RequireRole("Admin", "Manager")]
    [ProducesResponseType(typeof(ZoneDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<ZoneDto>> CreateZone(CreateZoneRequest request, CancellationToken ct)
    {
        var result = await _slotService.CreateZoneAsync(request, ct);
        return CreatedAtAction(nameof(GetZones), new { parkingLotId = request.ParkingLotId }, result);
    }

    /// <summary>Sửa tên/tầng/mô tả khu vực.</summary>
    [HttpPut("zones/{id:guid}")]
    [RequireRole("Admin", "Manager")]
    [ProducesResponseType(typeof(ZoneDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ZoneDto>> UpdateZone(Guid id, UpdateZoneRequest request, CancellationToken ct)
    {
        var result = await _slotService.UpdateZoneAsync(id, request, ct);
        return Ok(result);
    }

    /// <summary>Tạo slot mới trong 1 khu vực.</summary>
    [HttpPost]
    [RequireRole("Admin", "Manager")]
    [ProducesResponseType(typeof(SlotStatusDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<SlotStatusDto>> CreateSlot(CreateSlotRequest request, CancellationToken ct)
    {
        var result = await _slotService.CreateSlotAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>Sửa mã/loại/mô tả slot (không sửa được khi slot đang có xe).</summary>
    [HttpPut("{id:guid}")]
    [RequireRole("Admin", "Manager")]
    [ProducesResponseType(typeof(SlotStatusDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SlotStatusDto>> UpdateSlot(Guid id, UpdateSlotRequest request, CancellationToken ct)
    {
        var result = await _slotService.UpdateSlotAsync(id, request, ct);
        return Ok(result);
    }
}
