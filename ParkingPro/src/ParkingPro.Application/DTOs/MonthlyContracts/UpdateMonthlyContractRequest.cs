namespace ParkingPro.Application.DTOs.MonthlyContracts;

/// <param name="LicensePlate">Biển số xe — dùng để sửa khi nhập sai lúc tạo hợp đồng.</param>
/// <param name="AutoRenew">Có tự động gia hạn khi hết hạn hay không.</param>
public record UpdateMonthlyContractRequest(string LicensePlate, bool AutoRenew);
