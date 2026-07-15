namespace ParkingPro.Application.DTOs.Reports;

public record OccupancyReportDto(
    int TotalSlots,
    int OccupiedSlots,
    int AvailableSlots,
    int MaintenanceSlots,
    double OccupancyRatePercent);
