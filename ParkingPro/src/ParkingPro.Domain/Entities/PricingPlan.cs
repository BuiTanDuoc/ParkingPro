using ParkingPro.Domain.Common;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Domain.Entities;

/// <summary>
/// Bảng giá áp dụng cho 1 bãi xe, theo loại hình gửi xe (giờ/ngày/tháng) và loại xe.
/// </summary>
public class PricingPlan : BaseEntity
{
    public Guid ParkingLotId { get; set; }
    public ParkingLot ParkingLot { get; set; } = default!;

    public SessionType SessionType { get; set; }
    public VehicleType VehicleType { get; set; }

    public string Name { get; set; } = default!;

    // --- Theo giờ ---
    public decimal? FirstHourPrice { get; set; }      // Giá giờ đầu
    public decimal? NextHourPrice { get; set; }        // Giá mỗi giờ tiếp theo
    public decimal? OvernightSurcharge { get; set; }   // Phụ phí qua đêm (22h-6h)

    // --- Theo ngày ---
    public decimal? DailyPrice { get; set; }

    // --- Theo tháng ---
    public decimal? MonthlyPrice { get; set; }

    public bool IsActive { get; set; } = true;
}
