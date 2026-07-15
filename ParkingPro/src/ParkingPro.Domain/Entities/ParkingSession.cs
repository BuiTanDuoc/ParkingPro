using ParkingPro.Domain.Common;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Domain.Entities;

/// <summary>
/// Một lượt gửi xe (theo giờ hoặc theo ngày). Với khách vé tháng, mỗi lần ra/vào
/// trong ngày cũng có thể tạo 1 ParkingSession loại TheoThang để theo dõi lưu lượng,
/// nhưng không tính phí (đã bao gồm trong MonthlyContract).
/// </summary>
public class ParkingSession : BaseEntity
{
    public Guid ParkingLotId { get; set; }
    public ParkingLot ParkingLot { get; set; } = default!;

    public Guid VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = default!;

    public Guid SlotId { get; set; }
    public ParkingSlot Slot { get; set; } = default!;

    public Guid? MonthlyContractId { get; set; }
    public MonthlyContract? MonthlyContract { get; set; }

    public SessionType SessionType { get; set; }
    public SessionStatus Status { get; set; } = SessionStatus.DangGuiXe;

    public DateTime CheckInAtUtc { get; set; }
    public DateTime? CheckOutAtUtc { get; set; }

    public string? CheckInImageUrl { get; set; }
    public string? CheckOutImageUrl { get; set; }

    public decimal? TotalAmount { get; set; }

    public Guid CheckInStaffId { get; set; }
    public User CheckInStaff { get; set; } = default!;
    public Guid? CheckOutStaffId { get; set; }
    public User? CheckOutStaff { get; set; }

    public Payment? Payment { get; set; }
}
