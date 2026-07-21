using ParkingPro.Application.Common;
using ParkingPro.Application.DTOs.MonthlyContracts;

namespace ParkingPro.Application.Interfaces.Services;

public interface IMonthlyContractService
{
    Task<MonthlyContractDto> CreateAsync(
        CreateMonthlyContractRequest request, Guid staffUserId,
        Stream? vehiclePhotoStream, string? vehiclePhotoFileName, CancellationToken ct = default);
    Task<MonthlyContractDto> RenewAsync(Guid contractId, int additionalMonths, Guid staffUserId, CancellationToken ct = default);
    Task<MonthlyContractDto> UpdateAsync(Guid contractId, UpdateMonthlyContractRequest request, CancellationToken ct = default);
    Task CancelAsync(Guid contractId, CancellationToken ct = default);
    Task<PagedResult<MonthlyContractDto>> GetExpiringSoonAsync(Guid parkingLotId, int withinDays, int pageNumber, int pageSize, CancellationToken ct = default);

    /// <summary>Toàn bộ hợp đồng của 1 bãi xe, có thể lọc theo trạng thái và tìm theo biển số/tên khách hàng — dùng cho tab Hợp đồng.</summary>
    Task<PagedResult<MonthlyContractDto>> GetAllAsync(
        Guid parkingLotId, string? status, string? search, int pageNumber, int pageSize, CancellationToken ct = default);

    /// <summary>Hợp đồng đang hoạt động gắn với 1 slot cố định (dùng cho menu "Xem HĐ" trên sơ đồ bãi xe).</summary>
    Task<MonthlyContractDto> GetActiveContractBySlotAsync(Guid slotId, CancellationToken ct = default);
}
