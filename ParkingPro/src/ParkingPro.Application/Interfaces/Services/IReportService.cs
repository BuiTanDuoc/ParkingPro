using ParkingPro.Application.DTOs.Reports;

namespace ParkingPro.Application.Interfaces.Services;

public interface IReportService
{
    /// <summary>Doanh thu theo từng ngày trong khoảng [fromDate, toDate], tách theo hình thức gửi xe.</summary>
    Task<IReadOnlyList<RevenueReportDto>> GetRevenueReportAsync(
        Guid parkingLotId, DateOnly fromDate, DateOnly toDate, CancellationToken ct = default);

    /// <summary>Tình trạng lấp đầy bãi xe tại thời điểm hiện tại.</summary>
    Task<OccupancyReportDto> GetOccupancyReportAsync(Guid parkingLotId, CancellationToken ct = default);
}
