namespace ParkingPro.Application.DTOs.Slots;

/// <param name="SlotId">Id slot.</param>
/// <param name="ZoneId">Id khu vực chứa slot.</param>
/// <param name="Code">Mã slot, vd "A-01".</param>
/// <param name="ZoneName">Tên khu vực, vd "Tầng trệt".</param>
/// <param name="Status">Trạng thái: Trong, DangDauXe, DaDatTruoc hoặc BaoTri.</param>
/// <param name="Type">Loại slot: Thuong, Vip hoặc DanhChoVeThang.</param>
/// <param name="Description">Mô tả thêm về slot (không bắt buộc).</param>
/// <param name="CurrentLicensePlate">Biển số xe đang đậu — chỉ có giá trị khi Status = DangDauXe.</param>
public record SlotStatusDto(
    Guid SlotId,
    Guid ZoneId,
    string Code,
    string ZoneName,
    string Status,
    string Type,
    string? Description,
    string? CurrentLicensePlate);
