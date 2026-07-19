namespace ParkingPro.Application.DTOs.Reports;

/// <param name="TotalSlots">Tổng số slot của bãi xe.</param>
/// <param name="OccupiedSlots">Số slot đang có xe.</param>
/// <param name="AvailableSlots">Số slot đang trống.</param>
/// <param name="MaintenanceSlots">Số slot đang bảo trì.</param>
/// <param name="OccupancyRatePercent">Tỷ lệ lấp đầy (%) = OccupiedSlots / TotalSlots * 100.</param>
public record OccupancyReportDto(
    int TotalSlots,
    int OccupiedSlots,
    int AvailableSlots,
    int MaintenanceSlots,
    double OccupancyRatePercent);
