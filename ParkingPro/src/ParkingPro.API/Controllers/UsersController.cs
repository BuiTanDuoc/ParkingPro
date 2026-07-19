using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingPro.API.Common;
using ParkingPro.API.Requests;
using ParkingPro.Application.Common;
using ParkingPro.Application.DTOs.Users;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Infrastructure.Authorization;

namespace ParkingPro.API.Controllers;

/// <summary>Hồ sơ cá nhân (tự quản lý) và quản lý tài khoản nội bộ (Admin).</summary>
[ApiController]
[Authorize]
[Route("api/users")]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ICurrentUserService _currentUser;

    public UsersController(IUserService userService, ICurrentUserService currentUser)
    {
        _userService = userService;
        _currentUser = currentUser;
    }

    /// <summary>Thông tin tài khoản đang đăng nhập, gồm AvatarUrl (ảnh mặc định nếu chưa upload).</summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserProfileDto>> GetMe(CancellationToken ct)
    {
        var result = await _userService.GetProfileAsync(_currentUser.UserId!.Value, ct);
        return Ok(result);
    }

    /// <summary>Upload/thay avatar cho tài khoản đang đăng nhập. Bắt buộc phải có file (không có endpoint này thì cứ dùng ảnh mặc định).</summary>
    [HttpPost("me/avatar")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(AvatarUrlResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<AvatarUrlResponse>> UpdateAvatar([FromForm] UpdateAvatarFormRequest form, CancellationToken ct)
    {
        UploadValidation.EnsureValidImage(form.Avatar);

        var avatarUrl = await _userService.UpdateAvatarAsync(
            _currentUser.UserId!.Value, form.Avatar.OpenReadStream(), form.Avatar.FileName, ct);

        return Ok(new AvatarUrlResponse(avatarUrl));
    }

    /// <summary>Tự sửa hồ sơ (họ tên, số điện thoại) của tài khoản đang đăng nhập.</summary>
    [HttpPut("me")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserProfileDto>> UpdateMe(UpdateProfileRequest request, CancellationToken ct)
    {
        var result = await _userService.UpdateProfileAsync(_currentUser.UserId!.Value, request.FullName, request.PhoneNumber, ct);
        return Ok(result);
    }

    /// <summary>Đổi mật khẩu cho tài khoản đang đăng nhập.</summary>
    [HttpPost("me/change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken ct)
    {
        await _userService.ChangePasswordAsync(_currentUser.UserId!.Value, request.CurrentPassword, request.NewPassword, ct);
        return NoContent();
    }

    /// <summary>Danh sách tài khoản (quản lý nhân sự) — lọc theo role nếu có truyền.</summary>
    [HttpGet]
    [RequireRole("Admin")]
    [ProducesResponseType(typeof(PagedResult<UserProfileDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<UserProfileDto>>> GetAll(
        [FromQuery] string? role, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _userService.GetAllUsersAsync(role, pageNumber, pageSize, ct);
        return Ok(result);
    }

    /// <summary>Tạo tài khoản nội bộ (Staff/Manager/Admin). Chỉ Admin được gọi.</summary>
    [HttpPost]
    [RequireRole("Admin")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<UserProfileDto>> Create(CreateStaffUserRequest request, CancellationToken ct)
    {
        var result = await _userService.CreateStaffUserAsync(request, ct);
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

    /// <summary>Khóa/mở khóa tài khoản.</summary>
    [HttpPut("{id:guid}/active")]
    [RequireRole("Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> SetActive(Guid id, [FromQuery] bool isActive, CancellationToken ct)
    {
        await _userService.SetActiveStatusAsync(id, isActive, ct);
        return NoContent();
    }
}
