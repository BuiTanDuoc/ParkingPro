namespace ParkingPro.Application.DTOs.Slots;

/// <param name="Id">Id khu vực.</param>
/// <param name="Name">Tên khu vực, vd "Tầng trệt".</param>
/// <param name="Floor">Số tầng — dùng để sắp xếp thứ tự hiển thị.</param>
/// <param name="Description">Mô tả thêm về khu vực (không bắt buộc).</param>
/// <param name="SlotCount">Tổng số slot thuộc khu vực này.</param>
public record ZoneDto(Guid Id, string Name, int Floor, string? Description, int SlotCount);
