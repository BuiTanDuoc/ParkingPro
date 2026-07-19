using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.DTOs.Sessions;

/// <param name="ParkingLotId">Id bãi xe.</param>
/// <param name="LicensePlate">Biển số xe.</param>
/// <param name="VehicleType">Loại xe: XeMay, OToDuoi7Cho, OToTren7Cho, XeTai.</param>
/// <param name="SessionType">Hình thức gửi: TheoGio hoặc TheoNgay (không dùng TheoThang ở API này).</param>
/// <param name="PreferredSlotId">Slot mong muốn (không bắt buộc) — không truyền thì hệ thống tự chọn slot trống đầu tiên.</param>
public record CheckInRequest(
    Guid ParkingLotId,
    string LicensePlate,
    VehicleType VehicleType,
    SessionType SessionType,
    Guid? PreferredSlotId);
