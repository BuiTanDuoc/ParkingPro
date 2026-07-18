using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingPro.API.Common;
using ParkingPro.API.Requests;
using ParkingPro.Application.DTOs.MonthlyContracts;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Infrastructure.Authorization;

namespace ParkingPro.API.Controllers;

[ApiController]
[Authorize]
[Route("api/monthly-contracts")]
public class MonthlyContractsController : ControllerBase
{
    private readonly IMonthlyContractService _contractService;
    private readonly ICurrentUserService _currentUser;

    public MonthlyContractsController(IMonthlyContractService contractService, ICurrentUserService currentUser)
    {
        _contractService = contractService;
        _currentUser = currentUser;
    }

    /// <summary>Tạo hợp đồng vé tháng. Ảnh xe (VehiclePhoto) không bắt buộc — không gửi thì dùng ảnh mặc định.</summary>
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequireRole("Admin", "Manager", "Staff")]
    public async Task<IActionResult> Create([FromForm] CreateMonthlyContractFormRequest form, CancellationToken ct)
    {
        var request = new CreateMonthlyContractRequest(
            form.ParkingLotId, form.CustomerUserId, form.LicensePlate,
            form.FixedSlotId, form.StartDate, form.NumberOfMonths, form.AutoRenew);

        Stream? photoStream = null;
        string? photoFileName = null;
        if (form.VehiclePhoto is not null)
        {
            UploadValidation.EnsureValidImage(form.VehiclePhoto);
            photoStream = form.VehiclePhoto.OpenReadStream();
            photoFileName = form.VehiclePhoto.FileName;
        }

        var result = await _contractService.CreateAsync(request, _currentUser.UserId!.Value, photoStream, photoFileName, ct);
        return CreatedAtAction(nameof(Create), new { id = result.Id }, result);
    }

    [HttpPost("{id:guid}/renew")]
    [RequireRole("Admin", "Manager", "Staff")]
    public async Task<IActionResult> Renew(Guid id, [FromQuery] int additionalMonths, CancellationToken ct)
    {
        var result = await _contractService.RenewAsync(id, additionalMonths, _currentUser.UserId!.Value, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/cancel")]
    [RequireRole("Admin", "Manager")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _contractService.CancelAsync(id, ct);
        return NoContent();
    }

    [HttpGet("expiring-soon")]
    [RequireRole("Admin", "Manager")]
    public async Task<IActionResult> GetExpiringSoon(
        [FromQuery] Guid parkingLotId, [FromQuery] int withinDays = 7,
        [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _contractService.GetExpiringSoonAsync(parkingLotId, withinDays, pageNumber, pageSize, ct);
        return Ok(result);
    }

    /// <summary>Hợp đồng đang hoạt động gắn với 1 slot cố định — dùng cho menu "Xem HĐ" trên sơ đồ bãi xe.</summary>
    [HttpGet("by-slot/{slotId:guid}")]
    [RequireRole("Admin", "Manager", "Staff")]
    public async Task<IActionResult> GetBySlot(Guid slotId, CancellationToken ct)
    {
        var result = await _contractService.GetActiveContractBySlotAsync(slotId, ct);
        return Ok(result);
    }
}
