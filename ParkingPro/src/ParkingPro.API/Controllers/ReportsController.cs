using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Infrastructure.Authorization;

namespace ParkingPro.API.Controllers;

[ApiController]
[Authorize]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>Doanh thu theo từng ngày trong khoảng [fromDate, toDate], tách theo hình thức gửi xe.</summary>
    [HttpGet("revenue")]
    [RequireRole("Admin", "Manager")]
    public async Task<IActionResult> GetRevenue(
        [FromQuery] Guid parkingLotId,
        [FromQuery] DateOnly fromDate,
        [FromQuery] DateOnly toDate,
        CancellationToken ct)
    {
        var result = await _reportService.GetRevenueReportAsync(parkingLotId, fromDate, toDate, ct);
        return Ok(result);
    }

    /// <summary>Tình trạng lấp đầy bãi xe (số slot trống/đang dùng/bảo trì) tại thời điểm hiện tại.</summary>
    [HttpGet("occupancy")]
    [RequireRole("Admin", "Manager", "Staff")]
    public async Task<IActionResult> GetOccupancy([FromQuery] Guid parkingLotId, CancellationToken ct)
    {
        var result = await _reportService.GetOccupancyReportAsync(parkingLotId, ct);
        return Ok(result);
    }
}
