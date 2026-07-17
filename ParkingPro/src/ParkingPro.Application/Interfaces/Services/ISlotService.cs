using ParkingPro.Application.DTOs.Slots;

namespace ParkingPro.Application.Interfaces.Services;

public interface ISlotService
{
    Task<IReadOnlyList<SlotStatusDto>> GetSlotStatusesAsync(Guid parkingLotId, CancellationToken ct = default);
    Task SetMaintenanceAsync(Guid slotId, bool underMaintenance, CancellationToken ct = default);

    Task<IReadOnlyList<ZoneDto>> GetZonesAsync(Guid parkingLotId, CancellationToken ct = default);
    Task<ZoneDto> CreateZoneAsync(CreateZoneRequest request, CancellationToken ct = default);

    Task<SlotStatusDto> CreateSlotAsync(CreateSlotRequest request, CancellationToken ct = default);
    Task<SlotStatusDto> UpdateSlotAsync(Guid slotId, UpdateSlotRequest request, CancellationToken ct = default);
}
