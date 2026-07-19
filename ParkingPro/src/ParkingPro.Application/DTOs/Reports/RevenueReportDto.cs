namespace ParkingPro.Application.DTOs.Reports;

/// <param name="Date">Ngày báo cáo.</param>
/// <param name="HourlyRevenue">Doanh thu xe gửi theo giờ trong ngày (VNĐ).</param>
/// <param name="DailyRevenue">Doanh thu xe gửi theo ngày trong ngày (VNĐ).</param>
/// <param name="MonthlyRevenue">Doanh thu vé tháng thu được trong ngày (theo ngày thanh toán, VNĐ).</param>
/// <param name="TotalRevenue">Tổng doanh thu trong ngày (VNĐ).</param>
public record RevenueReportDto(
    DateOnly Date,
    decimal HourlyRevenue,
    decimal DailyRevenue,
    decimal MonthlyRevenue,
    decimal TotalRevenue);
