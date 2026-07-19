namespace ParkingPro.Application.DTOs.Users;

/// <summary>Kết quả upload avatar thành công.</summary>
/// <param name="AvatarUrl">Đường dẫn tương đối tới ảnh vừa upload, vd "/uploads/avatars/xxx.jpg".</param>
public record AvatarUrlResponse(string AvatarUrl);
