using ParkingPro.Domain.Common;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Domain.Entities;

public class ParkingSlot : BaseEntity
{
    public Guid ZoneId { get; set; }
    public Zone Zone { get; set; } = default!;

    public string Code { get; set; } = default!; // vd: "A-01"
    public SlotType Type { get; set; } = SlotType.Thuong;
    public SlotStatus Status { get; set; } = SlotStatus.Trong;

    public ICollection<ParkingSession> Sessions { get; set; } = new List<ParkingSession>();
    public ICollection<MonthlyContract> MonthlyContracts { get; set; } = new List<MonthlyContract>();
}
