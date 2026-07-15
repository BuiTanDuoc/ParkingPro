using ParkingPro.Domain.Common;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Domain.Entities;

/// <summary>
/// Hợp đồng gửi xe theo tháng (vé tháng): gắn 1 xe cố định, có thể gắn slot cố định.
/// </summary>
public class MonthlyContract : BaseEntity
{
    public Guid ParkingLotId { get; set; }
    public ParkingLot ParkingLot { get; set; } = default!;

    public Guid VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = default!;

    public Guid CustomerUserId { get; set; }
    public User CustomerUser { get; set; } = default!;

    public Guid? FixedSlotId { get; set; } // null nếu là slot tự do (không cố định)
    public ParkingSlot? FixedSlot { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }

    public decimal MonthlyFee { get; set; }
    public ContractStatus Status { get; set; } = ContractStatus.DangHoatDong;
    public bool AutoRenew { get; set; }

    public ICollection<ParkingSession> Sessions { get; set; } = new List<ParkingSession>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
