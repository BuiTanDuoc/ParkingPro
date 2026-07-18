using ParkingPro.Application.Common;
using ParkingPro.Application.DTOs.Slots;

namespace ParkingPro.Application.Interfaces.Services;

public interface ISlotService
{
    /// <summary>Toàn bộ slot của 1 bãi xe, không phân trang — dùng cho sơ đồ bãi xe realtime.</summary>
    Task<IReadOnlyList<SlotStatusDto>> GetSlotStatusesAsync(Guid parkingLotId, CancellationToken ct = default);

    /// <summary>Danh sách slot có phân trang, lọc theo khu vực và tìm theo mã/mô tả — dùng cho trang quản lý.</summary>
    Task<PagedResult<SlotStatusDto>> GetSlotsPagedAsync(
        Guid parkingLotId, Guid? zoneId, string? search, int pageNumber, int pageSize, CancellationToken ct = default);

    Task SetMaintenanceAsync(Guid slotId, bool underMaintenance, CancellationToken ct = default);

    Task<IReadOnlyList<ZoneDto>> GetZonesAsync(Guid parkingLotId, CancellationToken ct = default);
    Task<ZoneDto> CreateZoneAsync(CreateZoneRequest request, CancellationToken ct = default);
    Task<ZoneDto> UpdateZoneAsync(Guid zoneId, UpdateZoneRequest request, CancellationToken ct = default);

    Task<SlotStatusDto> CreateSlotAsync(CreateSlotRequest request, CancellationToken ct = default);
    Task<SlotStatusDto> UpdateSlotAsync(Guid slotId, UpdateSlotRequest request, CancellationToken ct = default);
}
