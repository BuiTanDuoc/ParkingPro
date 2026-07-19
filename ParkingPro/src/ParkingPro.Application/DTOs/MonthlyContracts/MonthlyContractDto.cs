namespace ParkingPro.Application.DTOs.MonthlyContracts;

/// <param name="Id">Id hợp đồng.</param>
/// <param name="LicensePlate">Biển số xe.</param>
/// <param name="VehiclePhotoUrl">Ảnh xe (URL tương đối) — null nếu xe chưa từng có ảnh.</param>
/// <param name="CustomerName">Tên khách hàng.</param>
/// <param name="FixedSlotCode">Mã slot cố định — null nếu dùng slot tự do.</param>
/// <param name="StartDate">Ngày bắt đầu hiệu lực.</param>
/// <param name="EndDate">Ngày hết hạn.</param>
/// <param name="MonthlyFee">Đơn giá/tháng (VNĐ) áp dụng cho hợp đồng này.</param>
/// <param name="Status">Trạng thái: DangHoatDong, SapHetHan, HetHan hoặc DaHuy.</param>
/// <param name="AutoRenew">Có tự động gia hạn khi hết hạn hay không.</param>
public record MonthlyContractDto(
    Guid Id,
    string LicensePlate,
    string? VehiclePhotoUrl,
    string CustomerName,
    string? FixedSlotCode,
    DateOnly StartDate,
    DateOnly EndDate,
    decimal MonthlyFee,
    string Status,
    bool AutoRenew);
