using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingPro.Application.DTOs.ParkingLots;
using ParkingPro.Application.Interfaces.Services;

namespace ParkingPro.API.Controllers;

/// <summary>Danh sách bãi xe — dùng để app/web cho người dùng chọn bãi xe đang phụ trách.</summary>
[ApiController]
[Authorize]
[Route("api/parking-lots")]
[Produces("application/json")]
public class ParkingLotsController : ControllerBase
{
    private readonly IParkingLotService _parkingLotService;

    public ParkingLotsController(IParkingLotService parkingLotService)
    {
        _parkingLotService = parkingLotService;
    }

    /// <summary>Toàn bộ bãi xe đang hoạt động, sắp xếp theo tên.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ParkingLotDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ParkingLotDto>>> GetAll(CancellationToken ct)
    {
        var result = await _parkingLotService.GetAllAsync(ct);
        return Ok(result);
    }

    /// <summary>Chi tiết 1 bãi xe theo Id.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ParkingLotDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParkingLotDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _parkingLotService.GetByIdAsync(id, ct);
        return Ok(result);
    }
}
