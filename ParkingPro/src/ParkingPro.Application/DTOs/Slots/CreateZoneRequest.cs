namespace ParkingPro.Application.DTOs.Slots;

/// <param name="ParkingLotId">Id bãi xe.</param>
/// <param name="Name">Tên khu vực, vd "Tầng 2", "Khu B".</param>
/// <param name="Floor">Số tầng — dùng để sắp xếp thứ tự hiển thị.</param>
/// <param name="Description">Mô tả thêm (không bắt buộc).</param>
public record CreateZoneRequest(Guid ParkingLotId, string Name, int Floor, string? Description);
