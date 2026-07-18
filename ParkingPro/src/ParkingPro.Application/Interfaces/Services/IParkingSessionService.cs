using ParkingPro.Application.Common;
using ParkingPro.Application.DTOs.Sessions;

namespace ParkingPro.Application.Interfaces.Services;

public interface IParkingSessionService
{
    Task<CheckInResponse> CheckInAsync(
        CheckInRequest request, Guid staffUserId,
        Stream? photoStream, string? photoFileName, CancellationToken ct = default);

    Task<CheckOutResponse> CheckOutAsync(
        Guid sessionId, Guid staffUserId,
        Stream? photoStream, string? photoFileName, CancellationToken ct = default);
    Task<ParkingSessionDto> GetByIdAsync(Guid sessionId, CancellationToken ct = default);
    Task<PagedResult<ParkingSessionDto>> GetActiveSessionsAsync(Guid parkingLotId, int pageNumber, int pageSize, CancellationToken ct = default);

    /// <summary>Phiên đang gửi (DangGuiXe) tại 1 slot — dùng cho menu "Check-out" trên sơ đồ bãi xe.</summary>
    Task<ParkingSessionDto> GetActiveSessionBySlotAsync(Guid slotId, CancellationToken ct = default);
}
