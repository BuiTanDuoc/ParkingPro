namespace ParkingPro.Application.DTOs.ParkingLots;

/// <param name="Id">Id bãi xe.</param>
/// <param name="Name">Tên bãi xe, vd "Bãi xe Trung Tâm Quận 1".</param>
/// <param name="Address">Địa chỉ bãi xe.</param>
/// <param name="PhoneNumber">Số điện thoại liên hệ (không bắt buộc).</param>
/// <param name="TotalSlots">Tổng số slot của bãi xe.</param>
public record ParkingLotDto(
    Guid Id,
    string Name,
    string Address,
    string? PhoneNumber,
    int TotalSlots);
