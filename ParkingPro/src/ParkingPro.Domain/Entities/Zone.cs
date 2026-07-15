using ParkingPro.Domain.Common;

namespace ParkingPro.Domain.Entities;

public class Zone : BaseEntity
{
    public Guid ParkingLotId { get; set; }
    public ParkingLot ParkingLot { get; set; } = default!;

    public string Name { get; set; } = default!; // vd: "Tầng 1", "Khu A"
    public int Floor { get; set; }

    public ICollection<ParkingSlot> Slots { get; set; } = new List<ParkingSlot>();
}
