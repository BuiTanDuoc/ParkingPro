using ParkingPro.Application.Common;
using ParkingPro.Application.DTOs.MonthlyContracts;

namespace ParkingPro.Application.Interfaces.Services;

public interface IMonthlyContractService
{
    Task<MonthlyContractDto> CreateAsync(
        CreateMonthlyContractRequest request, Guid staffUserId,
        Stream? vehiclePhotoStream, string? vehiclePhotoFileName, CancellationToken ct = default);
    Task<MonthlyContractDto> RenewAsync(Guid contractId, int additionalMonths, Guid staffUserId, CancellationToken ct = default);
    Task CancelAsync(Guid contractId, CancellationToken ct = default);
    Task<PagedResult<MonthlyContractDto>> GetExpiringSoonAsync(Guid parkingLotId, int withinDays, int pageNumber, int pageSize, CancellationToken ct = default);
}
