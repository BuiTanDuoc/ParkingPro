using Microsoft.AspNetCore.Http;

namespace ParkingPro.API.Requests;

/// <summary>Model để bind multipart/form-data khi tạo hợp đồng vé tháng (có kèm ảnh xe tùy chọn).</summary>
public class CreateMonthlyContractFormRequest
{
    /// <summary>Id bãi xe.</summary>
    public Guid ParkingLotId { get; set; }

    /// <summary>Id tài khoản khách hàng đã có sẵn — để trống nếu muốn tạo mới khách hàng (dùng các field NewCustomer* bên dưới).</summary>
    public Guid? CustomerUserId { get; set; }

    /// <summary>Họ tên khách hàng mới — bắt buộc nếu không truyền CustomerUserId.</summary>
    public string? NewCustomerFullName { get; set; }

    /// <summary>Email/tên đăng nhập của khách hàng mới — bắt buộc nếu không truyền CustomerUserId, phải là duy nhất.</summary>
    public string? NewCustomerEmail { get; set; }

    /// <summary>Mật khẩu khách hàng mới (tối thiểu 6 ký tự) — bắt buộc nếu không truyền CustomerUserId.</summary>
    public string? NewCustomerPassword { get; set; }

    /// <summary>Số điện thoại khách hàng mới (không bắt buộc).</summary>
    public string? NewCustomerPhoneNumber { get; set; }

    /// <summary>Biển số xe.</summary>
    public string LicensePlate { get; set; } = default!;

    /// <summary>Slot cố định gán cho xe (không bắt buộc).</summary>
    public Guid? FixedSlotId { get; set; }

    /// <summary>Ngày bắt đầu hiệu lực hợp đồng.</summary>
    public DateOnly StartDate { get; set; }

    /// <summary>Số tháng đăng ký, thu tiền trọn gói ngay khi tạo.</summary>
    public int NumberOfMonths { get; set; }

    /// <summary>Có tự động gia hạn khi hết hạn hay không.</summary>
    public bool AutoRenew { get; set; }

    /// <summary>Ảnh xe — không bắt buộc, nếu không gửi thì dùng ảnh mặc định.</summary>
    public IFormFile? VehiclePhoto { get; set; }
}
