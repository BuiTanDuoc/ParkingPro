using Microsoft.AspNetCore.Http;

namespace ParkingPro.API.Requests;

/// <summary>Model để bind multipart/form-data khi tạo hợp đồng vé tháng (có kèm ảnh xe tùy chọn).</summary>
public class CreateMonthlyContractFormRequest
{
    public Guid ParkingLotId { get; set; }
    public Guid CustomerUserId { get; set; }
    public string LicensePlate { get; set; } = default!;
    public Guid? FixedSlotId { get; set; }
    public DateOnly StartDate { get; set; }
    public int NumberOfMonths { get; set; }
    public bool AutoRenew { get; set; }

    /// <summary>Ảnh xe — không bắt buộc, nếu không gửi thì dùng ảnh mặc định.</summary>
    public IFormFile? VehiclePhoto { get; set; }
}
