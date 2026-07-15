namespace ParkingPro.Application.DTOs.Reports;

public record RevenueReportDto(
    DateOnly Date,
    decimal HourlyRevenue,
    decimal DailyRevenue,
    decimal MonthlyRevenue,
    decimal TotalRevenue);
