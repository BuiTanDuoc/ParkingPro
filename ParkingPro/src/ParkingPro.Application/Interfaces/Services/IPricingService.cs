using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.Interfaces.Services;

public interface IPricingService
{
    /// <summary>Tính tiền cho 1 phiên gửi xe theo giờ hoặc theo ngày, dựa trên PricingPlan còn hiệu lực.</summary>
    Task<decimal> CalculateSessionFeeAsync(ParkingSession session, CancellationToken ct = default);

    /// <summary>Lấy đơn giá vé tháng áp dụng cho loại xe tại 1 bãi.</summary>
    Task<decimal> GetMonthlyFeeAsync(Guid parkingLotId, VehicleType vehicleType, CancellationToken ct = default);
}
