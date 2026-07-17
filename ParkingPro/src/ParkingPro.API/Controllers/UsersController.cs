using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingPro.API.Common;
using ParkingPro.API.Requests;
using ParkingPro.Application.DTOs.Users;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Infrastructure.Authorization;

namespace ParkingPro.API.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
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
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var result = await _userService.GetProfileAsync(_currentUser.UserId!.Value, ct);
        return Ok(result);
    }

    /// <summary>Upload/thay avatar cho tài khoản đang đăng nhập. Bắt buộc phải có file (không có endpoint này thì cứ dùng ảnh mặc định).</summary>
    [HttpPost("me/avatar")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateAvatar([FromForm] UpdateAvatarFormRequest form, CancellationToken ct)
    {
        UploadValidation.EnsureValidImage(form.Avatar);

        var avatarUrl = await _userService.UpdateAvatarAsync(
            _currentUser.UserId!.Value, form.Avatar.OpenReadStream(), form.Avatar.FileName, ct);

        return Ok(new { avatarUrl });
    }

    /// <summary>Danh sách tài khoản (quản lý nhân sự) — lọc theo role nếu có truyền.</summary>
    [HttpGet]
    [RequireRole("Admin")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? role, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _userService.GetAllUsersAsync(role, pageNumber, pageSize, ct);
        return Ok(result);
    }

    /// <summary>Tạo tài khoản nội bộ (Staff/Manager/Admin). Chỉ Admin được gọi.</summary>
    [HttpPost]
    [RequireRole("Admin")]
    public async Task<IActionResult> Create(CreateStaffUserRequest request, CancellationToken ct)
    {
        var result = await _userService.CreateStaffUserAsync(request, ct);
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

    /// <summary>Khóa/mở khóa tài khoản.</summary>
    [HttpPut("{id:guid}/active")]
    [RequireRole("Admin")]
    public async Task<IActionResult> SetActive(Guid id, [FromQuery] bool isActive, CancellationToken ct)
    {
        await _userService.SetActiveStatusAsync(id, isActive, ct);
        return NoContent();
    }
}
