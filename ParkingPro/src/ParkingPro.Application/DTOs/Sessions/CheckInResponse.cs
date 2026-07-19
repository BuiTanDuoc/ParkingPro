namespace ParkingPro.Application.DTOs.Sessions;

/// <param name="SessionId">Id phiên gửi xe vừa tạo.</param>
/// <param name="LicensePlate">Biển số xe.</param>
/// <param name="SlotCode">Mã slot được gán.</param>
/// <param name="CheckInAtUtc">Giờ check-in (UTC).</param>
/// <param name="SessionType">Hình thức gửi: TheoGio hoặc TheoNgay.</param>
/// <param name="CheckInImageUrl">Ảnh check-in (URL tương đối) — ảnh mặc định nếu không upload.</param>
public record CheckInResponse(
    Guid SessionId,
    string LicensePlate,
    string SlotCode,
    DateTime CheckInAtUtc,
    string SessionType,
    string CheckInImageUrl);
