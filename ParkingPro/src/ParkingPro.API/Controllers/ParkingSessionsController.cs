using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingPro.API.Common;
using ParkingPro.API.Requests;
using ParkingPro.Application.Common;
using ParkingPro.Application.DTOs.Sessions;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Infrastructure.Authorization;

namespace ParkingPro.API.Controllers;

/// <summary>Check-in/check-out xe vãng lai (gửi theo giờ hoặc theo ngày).</summary>
[ApiController]
[Authorize]
[Route("api/sessions")]
[Produces("application/json")]
public class ParkingSessionsController : ControllerBase
{
    private readonly IParkingSessionService _sessionService;
    private readonly ICurrentUserService _currentUser;

    public ParkingSessionsController(IParkingSessionService sessionService, ICurrentUserService currentUser)
    {
        _sessionService = sessionService;
        _currentUser = currentUser;
    }

    /// <summary>Check-in xe. Ảnh (Photo) không bắt buộc — không gửi thì dùng ảnh mặc định.</summary>
    [HttpPost("check-in")]
    [Consumes("multipart/form-data")]
    [RequireRole("Admin", "Manager", "Staff")]
    [ProducesResponseType(typeof(CheckInResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<CheckInResponse>> CheckIn([FromForm] CheckInFormRequest form, CancellationToken ct)
    {
        var request = new CheckInRequest(
            form.ParkingLotId, form.LicensePlate, form.VehicleType, form.SessionType, form.PreferredSlotId);

        Stream? photoStream = null;
        string? photoFileName = null;
        if (form.Photo is not null)
        {
            UploadValidation.EnsureValidImage(form.Photo);
            photoStream = form.Photo.OpenReadStream();
            photoFileName = form.Photo.FileName;
        }

        var result = await _sessionService.CheckInAsync(request, _currentUser.UserId!.Value, photoStream, photoFileName, ct);
        return Ok(result);
    }

    /// <summary>Check-out xe theo Id phiên gửi. Ảnh (photo) không bắt buộc — không gửi thì dùng ảnh mặc định.</summary>
    [HttpPost("{id:guid}/check-out")]
    [Consumes("multipart/form-data")]
    [RequireRole("Admin", "Manager", "Staff")]
    [ProducesResponseType(typeof(CheckOutResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<CheckOutResponse>> CheckOut(Guid id, [FromForm] CheckOutFormRequest form, CancellationToken ct)
    {
        Stream? photoStream = null;
        string? photoFileName = null;
        if (form.Photo is not null)
        {
            UploadValidation.EnsureValidImage(form.Photo);
            photoStream = form.Photo.OpenReadStream();
            photoFileName = form.Photo.FileName;
        }

        var result = await _sessionService.CheckOutAsync(id, _currentUser.UserId!.Value, photoStream, photoFileName, ct);
        return Ok(result);
    }

    /// <summary>Chi tiết 1 phiên gửi xe theo Id.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ParkingSessionDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ParkingSessionDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _sessionService.GetByIdAsync(id, ct);
        return Ok(result);
    }

    /// <summary>Danh sách phiên đang gửi xe (chưa checkout) tại 1 bãi xe, có phân trang.</summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(PagedResult<ParkingSessionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<ParkingSessionDto>>> GetActive(
        [FromQuery] Guid parkingLotId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _sessionService.GetActiveSessionsAsync(parkingLotId, pageNumber, pageSize, ct);
        return Ok(result);
    }

    /// <summary>Phiên đang gửi tại 1 slot — dùng cho menu "Check-out" trên sơ đồ bãi xe.</summary>
    [HttpGet("by-slot/{slotId:guid}/active")]
    [ProducesResponseType(typeof(ParkingSessionDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ParkingSessionDto>> GetActiveBySlot(Guid slotId, CancellationToken ct)
    {
        var result = await _sessionService.GetActiveSessionBySlotAsync(slotId, ct);
        return Ok(result);
    }
}
