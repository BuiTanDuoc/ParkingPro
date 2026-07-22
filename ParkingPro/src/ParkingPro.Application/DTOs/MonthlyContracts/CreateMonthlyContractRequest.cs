namespace ParkingPro.Application.DTOs.MonthlyContracts;

/// <param name="ParkingLotId">Id bãi xe.</param>
/// <param name="CustomerUserId">Id tài khoản khách hàng đã có sẵn — để trống nếu muốn tạo mới khách hàng (dùng các field NewCustomer* bên dưới).</param>
/// <param name="NewCustomerFullName">Họ tên khách hàng mới — bắt buộc nếu không truyền CustomerUserId.</param>
/// <param name="NewCustomerEmail">Email/tên đăng nhập của khách hàng mới — bắt buộc nếu không truyền CustomerUserId, phải là duy nhất.</param>
/// <param name="NewCustomerPassword">Mật khẩu khách hàng mới (tối thiểu 6 ký tự) — bắt buộc nếu không truyền CustomerUserId.</param>
/// <param name="NewCustomerPhoneNumber">Số điện thoại khách hàng mới (không bắt buộc).</param>
/// <param name="LicensePlate">Biển số xe.</param>
/// <param name="FixedSlotId">Slot cố định gán cho xe (không bắt buộc) — để trống nếu dùng slot tự do, có thể gán sau qua API sửa hợp đồng.</param>
/// <param name="StartDate">Ngày bắt đầu hiệu lực hợp đồng.</param>
/// <param name="NumberOfMonths">Số tháng đăng ký, thu tiền trọn gói ngay khi tạo.</param>
/// <param name="AutoRenew">Có tự động gia hạn khi hết hạn hay không.</param>
public record CreateMonthlyContractRequest(
    Guid ParkingLotId,
    Guid? CustomerUserId,
    string? NewCustomerFullName,
    string? NewCustomerEmail,
    string? NewCustomerPassword,
    string? NewCustomerPhoneNumber,
    string LicensePlate,
    Guid? FixedSlotId,
    DateOnly StartDate,
    int NumberOfMonths,
    bool AutoRenew);
