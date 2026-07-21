using ParkingPro.Application.DTOs.ParkingLots;

namespace ParkingPro.Application.Interfaces.Services;

public interface IParkingLotService
{
    /// <summary>Toàn bộ bãi xe đang hoạt động — dùng để app/web chọn bãi xe khi chưa có sẵn Id.</summary>
    Task<IReadOnlyList<ParkingLotDto>> GetAllAsync(CancellationToken ct = default);

    Task<ParkingLotDto> GetByIdAsync(Guid id, CancellationToken ct = default);
}
