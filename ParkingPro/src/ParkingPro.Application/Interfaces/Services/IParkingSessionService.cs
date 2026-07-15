using ParkingPro.Application.Common;
using ParkingPro.Application.DTOs.Sessions;

namespace ParkingPro.Application.Interfaces.Services;

public interface IParkingSessionService
{
    Task<CheckInResponse> CheckInAsync(CheckInRequest request, Guid staffUserId, CancellationToken ct = default);
    Task<CheckOutResponse> CheckOutAsync(Guid sessionId, Guid staffUserId, CancellationToken ct = default);
    Task<ParkingSessionDto> GetByIdAsync(Guid sessionId, CancellationToken ct = default);
    Task<PagedResult<ParkingSessionDto>> GetActiveSessionsAsync(Guid parkingLotId, int pageNumber, int pageSize, CancellationToken ct = default);
}
