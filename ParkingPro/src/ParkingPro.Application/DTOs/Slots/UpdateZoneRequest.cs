namespace ParkingPro.Application.DTOs.Slots;

/// <param name="Name">Tên khu vực.</param>
/// <param name="Floor">Số tầng.</param>
/// <param name="Description">Mô tả thêm (không bắt buộc).</param>
public record UpdateZoneRequest(string Name, int Floor, string? Description);
