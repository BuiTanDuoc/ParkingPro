namespace ParkingPro.Application.Interfaces.Services;

/// <summary>
/// Các tác vụ bảo trì hợp đồng vé tháng, được lên lịch chạy định kỳ qua Hangfire
/// (xem RecurringJob.AddOrUpdate trong Program.cs) — không phải API do người dùng gọi trực tiếp.
/// </summary>
public interface IMonthlyContractMaintenanceService
{
    /// <summary>
    /// Tìm các hợp đồng đang hoạt động sắp hết hạn trong vòng <paramref name="withinDays"/> ngày tới,
    /// tạo thông báo nhắc khách hàng gia hạn, và chuyển trạng thái hợp đồng sang SapHetHan.
    /// </summary>
    Task RemindExpiringContractsAsync(int withinDays, CancellationToken ct = default);

    /// <summary>
    /// Tìm các hợp đồng đã quá ngày hết hạn (EndDate &lt; hôm nay) nhưng chưa được gia hạn,
    /// tự động chuyển sang HetHan, giải phóng slot cố định (nếu có) về trạng thái Trống,
    /// và tạo thông báo báo hết hạn cho khách hàng.
    /// </summary>
    Task ExpireOverdueContractsAsync(CancellationToken ct = default);
}
