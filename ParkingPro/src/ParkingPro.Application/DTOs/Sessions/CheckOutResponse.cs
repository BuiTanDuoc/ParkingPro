namespace ParkingPro.Application.DTOs.Sessions;

/// <param name="SessionId">Id phiên gửi xe.</param>
/// <param name="LicensePlate">Biển số xe.</param>
/// <param name="CheckInAtUtc">Giờ check-in (UTC).</param>
/// <param name="CheckOutAtUtc">Giờ check-out (UTC).</param>
/// <param name="TotalAmount">Số tiền phải thu (VNĐ).</param>
/// <param name="SlotCode">Mã slot vừa được giải phóng.</param>
/// <param name="CheckOutImageUrl">Ảnh check-out (URL tương đối) — ảnh mặc định nếu không upload.</param>
public record CheckOutResponse(
    Guid SessionId,
    string LicensePlate,
    DateTime CheckInAtUtc,
    DateTime CheckOutAtUtc,
    decimal TotalAmount,
    string SlotCode,
    string CheckOutImageUrl);
