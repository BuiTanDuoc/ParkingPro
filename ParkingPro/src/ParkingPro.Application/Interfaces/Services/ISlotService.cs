using ParkingPro.Application.DTOs.Slots;

namespace ParkingPro.Application.Interfaces.Services;

public interface ISlotService
{
    Task<IReadOnlyList<SlotStatusDto>> GetSlotStatusesAsync(Guid parkingLotId, CancellationToken ct = default);
    Task SetMaintenanceAsync(Guid slotId, bool underMaintenance, CancellationToken ct = default);
}
