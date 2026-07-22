namespace ParkingPro.Application.DTOs.MonthlyContracts;

/// <param name="LicensePlate">Biển số xe — dùng để sửa khi nhập sai lúc tạo hợp đồng.</param>
/// <param name="AutoRenew">Có tự động gia hạn khi hết hạn hay không.</param>
/// <param name="FixedSlotId">
/// Slot cố định mới cho hợp đồng — để trống (null) nếu muốn bỏ gán slot (dùng slot tự do).
/// Nếu khác với slot hiện tại: slot cũ được giải phóng về Trống, slot mới phải đang Trống và sẽ chuyển sang DaDatTruoc.
/// </param>
/// <param name="CustomerUserId">Đổi sang khách hàng đã có sẵn — để trống nếu không đổi hoặc dùng NewCustomer* để tạo khách hàng mới.</param>
/// <param name="NewCustomerFullName">Họ tên khách hàng mới, dùng khi muốn tạo tài khoản khách hàng mới thay vì chọn CustomerUserId có sẵn.</param>
/// <param name="NewCustomerEmail">Email/tên đăng nhập của khách hàng mới — phải là duy nhất.</param>
/// <param name="NewCustomerPassword">Mật khẩu khách hàng mới (tối thiểu 6 ký tự).</param>
/// <param name="NewCustomerPhoneNumber">Số điện thoại khách hàng mới (không bắt buộc).</param>
public record UpdateMonthlyContractRequest(
    string LicensePlate,
    bool AutoRenew,
    Guid? FixedSlotId,
    Guid? CustomerUserId,
    string? NewCustomerFullName,
    string? NewCustomerEmail,
    string? NewCustomerPassword,
    string? NewCustomerPhoneNumber);
