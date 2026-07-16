using Microsoft.AspNetCore.Http;

namespace ParkingPro.API.Requests;

/// <summary>Model để bind multipart/form-data khi upload avatar.</summary>
public class UpdateAvatarFormRequest
{
    public IFormFile Avatar { get; set; } = default!;
}
