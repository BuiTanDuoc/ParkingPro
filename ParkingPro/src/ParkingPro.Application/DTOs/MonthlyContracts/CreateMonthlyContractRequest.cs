namespace ParkingPro.Application.DTOs.MonthlyContracts;

/// <param name="ParkingLotId">Id bãi xe.</param>
/// <param name="CustomerUserId">Id tài khoản khách hàng (đã đăng ký qua /api/auth/register-customer).</param>
/// <param name="LicensePlate">Biển số xe.</param>
/// <param name="FixedSlotId">Slot cố định gán cho xe (không bắt buộc) — để trống nếu dùng slot tự do.</param>
/// <param name="StartDate">Ngày bắt đầu hiệu lực hợp đồng.</param>
/// <param name="NumberOfMonths">Số tháng đăng ký, thu tiền trọn gói ngay khi tạo.</param>
/// <param name="AutoRenew">Có tự động gia hạn khi hết hạn hay không.</param>
public record CreateMonthlyContractRequest(
    Guid ParkingLotId,
    Guid CustomerUserId,
    string LicensePlate,
    Guid? FixedSlotId,
    DateOnly StartDate,
    int NumberOfMonths,
    bool AutoRenew);
