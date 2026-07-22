using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingPro.API.Common;
using ParkingPro.API.Requests;
using ParkingPro.Application.Common;
using ParkingPro.Application.DTOs.MonthlyContracts;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Infrastructure.Authorization;

namespace ParkingPro.API.Controllers;

/// <summary>Quản lý hợp đồng gửi xe theo tháng (vé tháng): tạo, gia hạn, hủy.</summary>
[ApiController]
[Authorize]
[Route("api/monthly-contracts")]
[Produces("application/json")]
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
    [ProducesResponseType(typeof(MonthlyContractDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<MonthlyContractDto>> Create([FromForm] CreateMonthlyContractFormRequest form, CancellationToken ct)
    {
        var request = new CreateMonthlyContractRequest(
            form.ParkingLotId, form.CustomerUserId,
            form.NewCustomerFullName, form.NewCustomerEmail, form.NewCustomerPassword, form.NewCustomerPhoneNumber,
            form.LicensePlate, form.FixedSlotId, form.StartDate, form.NumberOfMonths, form.AutoRenew);

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

    /// <summary>Gia hạn thêm N tháng cho hợp đồng, tự tạo Payment tương ứng.</summary>
    [HttpPost("{id:guid}/renew")]
    [RequireRole("Admin", "Manager", "Staff")]
    [ProducesResponseType(typeof(MonthlyContractDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<MonthlyContractDto>> Renew(Guid id, [FromQuery] int additionalMonths, CancellationToken ct)
    {
        var result = await _contractService.RenewAsync(id, additionalMonths, _currentUser.UserId!.Value, ct);
        return Ok(result);
    }

    /// <summary>Toàn bộ hợp đồng của 1 bãi xe, có phân trang — dùng cho tab Hợp đồng. Lọc theo trạng thái và/hoặc tìm theo biển số/tên khách hàng.</summary>
    [HttpGet]
    [RequireRole("Admin", "Manager", "Staff")]
    [ProducesResponseType(typeof(PagedResult<MonthlyContractDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<MonthlyContractDto>>> GetAll(
        [FromQuery] Guid parkingLotId, [FromQuery] string? status, [FromQuery] string? search,
        [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _contractService.GetAllAsync(parkingLotId, status, search, pageNumber, pageSize, ct);
        return Ok(result);
    }

    /// <summary>
    /// Sửa hợp đồng: biển số xe, tự động gia hạn, slot cố định (gán/đổi/bỏ gán), và/hoặc đổi sang khách hàng khác
    /// (có sẵn hoặc tạo mới). Không đổi được ngày hiệu lực qua endpoint này — dùng /renew để gia hạn.
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequireRole("Admin", "Manager", "Staff")]
    [ProducesResponseType(typeof(MonthlyContractDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<MonthlyContractDto>> Update(Guid id, UpdateMonthlyContractRequest request, CancellationToken ct)
    {
        var result = await _contractService.UpdateAsync(id, request, ct);
        return Ok(result);
    }

    /// <summary>Hủy hợp đồng, giải phóng slot cố định (nếu có) về trạng thái Trống.</summary>
    [HttpPost("{id:guid}/cancel")]
    [RequireRole("Admin", "Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _contractService.CancelAsync(id, ct);
        return NoContent();
    }

    /// <summary>Hợp đồng đang hoạt động sắp/đã hết hạn trong N ngày qua, có phân trang.</summary>
    [HttpGet("expiring-soon")]
    [RequireRole("Admin", "Manager")]
    [ProducesResponseType(typeof(PagedResult<MonthlyContractDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<MonthlyContractDto>>> GetExpiringSoon(
        [FromQuery] Guid parkingLotId, [FromQuery] int withinDays = 7,
        [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _contractService.GetExpiringSoonAsync(parkingLotId, withinDays, pageNumber, pageSize, ct);
        return Ok(result);
    }

    /// <summary>Hợp đồng đang hoạt động gắn với 1 slot cố định — dùng cho menu "Xem HĐ" trên sơ đồ bãi xe.</summary>
    [HttpGet("by-slot/{slotId:guid}")]
    [RequireRole("Admin", "Manager", "Staff")]
    [ProducesResponseType(typeof(MonthlyContractDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<MonthlyContractDto>> GetBySlot(Guid slotId, CancellationToken ct)
    {
        var result = await _contractService.GetActiveContractBySlotAsync(slotId, ct);
        return Ok(result);
    }
}
