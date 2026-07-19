namespace ParkingPro.Application.DTOs.Sessions;

/// <param name="Id">Id phiên gửi xe.</param>
/// <param name="LicensePlate">Biển số xe.</param>
/// <param name="SlotCode">Mã slot.</param>
/// <param name="SessionType">Hình thức gửi: TheoGio, TheoNgay hoặc TheoThang.</param>
/// <param name="Status">Trạng thái: DangGuiXe, DaThanhToan hoặc DaHuy.</param>
/// <param name="CheckInAtUtc">Giờ check-in (UTC).</param>
/// <param name="CheckOutAtUtc">Giờ check-out (UTC) — null nếu xe chưa checkout.</param>
/// <param name="TotalAmount">Số tiền đã/phải thu — null nếu chưa checkout.</param>
/// <param name="CheckInImageUrl">Ảnh check-in (URL tương đối).</param>
/// <param name="CheckOutImageUrl">Ảnh check-out (URL tương đối) — null nếu chưa checkout.</param>
public record ParkingSessionDto(
    Guid Id,
    string LicensePlate,
    string SlotCode,
    string SessionType,
    string Status,
    DateTime CheckInAtUtc,
    DateTime? CheckOutAtUtc,
    decimal? TotalAmount,
    string? CheckInImageUrl,
    string? CheckOutImageUrl);
