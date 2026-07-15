using ParkingPro.Domain.Common;

namespace ParkingPro.Domain.Entities;

public class Shift : BaseEntity
{
    public Guid ParkingLotId { get; set; }
    public ParkingLot ParkingLot { get; set; } = default!;

    public Guid StaffId { get; set; }
    public User Staff { get; set; } = default!;

    public DateTime StartAtUtc { get; set; }
    public DateTime? EndAtUtc { get; set; }

    public decimal ExpectedCashAmount { get; set; }
    public decimal? ActualCashAmount { get; set; }
    public string? Note { get; set; }
}
