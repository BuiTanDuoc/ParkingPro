namespace ParkingPro.Application.DTOs.Reports;

/// <param name="TotalSlots">Tổng số slot của bãi xe.</param>
/// <param name="OccupiedSlots">Số slot đang có xe (vãng lai).</param>
/// <param name="ReservedSlots">Số slot đang gán cố định cho vé tháng (DaDatTruoc).</param>
/// <param name="AvailableSlots">Số slot đang trống.</param>
/// <param name="MaintenanceSlots">Số slot đang bảo trì.</param>
/// <param name="OccupancyRatePercent">Tỷ lệ lấp đầy (%) = (OccupiedSlots + ReservedSlots) / TotalSlots * 100.</param>
public record OccupancyReportDto(
    int TotalSlots,
    int OccupiedSlots,
    int ReservedSlots,
    int AvailableSlots,
    int MaintenanceSlots,
    double OccupancyRatePercent);
