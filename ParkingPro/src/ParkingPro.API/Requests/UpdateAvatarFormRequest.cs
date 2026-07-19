using Microsoft.AspNetCore.Http;

namespace ParkingPro.API.Requests;

/// <summary>Model để bind multipart/form-data khi upload avatar.</summary>
public class UpdateAvatarFormRequest
{
    /// <summary>File ảnh avatar — bắt buộc.</summary>
    public IFormFile Avatar { get; set; } = default!;
}
