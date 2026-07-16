using Microsoft.AspNetCore.Http;
using ParkingPro.Domain.Enums;

namespace ParkingPro.API.Requests;

/// <summary>Model để bind multipart/form-data khi check-in xe (có kèm ảnh check-in tùy chọn).</summary>
public class CheckInFormRequest
{
    public Guid ParkingLotId { get; set; }
    public string LicensePlate { get; set; } = default!;
    public VehicleType VehicleType { get; set; }
    public SessionType SessionType { get; set; }
    public Guid? PreferredSlotId { get; set; }

    /// <summary>Ảnh chụp lúc check-in — không bắt buộc, nếu không gửi thì dùng ảnh mặc định.</summary>
    public IFormFile? Photo { get; set; }
}
