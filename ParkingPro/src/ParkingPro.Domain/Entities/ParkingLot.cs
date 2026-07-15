using ParkingPro.Domain.Common;

namespace ParkingPro.Domain.Entities;

public class ParkingLot : BaseEntity
{
    public string Name { get; set; } = default!;
    public string Address { get; set; } = default!;
    public int TotalSlots { get; set; }
    public string? PhoneNumber { get; set; }

    public ICollection<Zone> Zones { get; set; } = new List<Zone>();
    public ICollection<PricingPlan> PricingPlans { get; set; } = new List<PricingPlan>();
}
