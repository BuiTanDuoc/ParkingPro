using Microsoft.AspNetCore.Http;
using ParkingPro.Domain.Enums;

namespace ParkingPro.API.Requests;

/// <summary>Model để bind multipart/form-data khi check-in xe (có kèm ảnh check-in tùy chọn).</summary>
public class CheckInFormRequest
{
    /// <summary>Id bãi xe.</summary>
    public Guid ParkingLotId { get; set; }

    /// <summary>Biển số xe.</summary>
    public string LicensePlate { get; set; } = default!;

    /// <summary>Loại xe: XeMay, OToDuoi7Cho, OToTren7Cho, XeTai.</summary>
    public VehicleType VehicleType { get; set; }

    /// <summary>Hình thức gửi: TheoGio hoặc TheoNgay.</summary>
    public SessionType SessionType { get; set; }

    /// <summary>Slot mong muốn (không bắt buộc) — không truyền thì hệ thống tự chọn slot trống.</summary>
    public Guid? PreferredSlotId { get; set; }

    /// <summary>Ảnh chụp lúc check-in — không bắt buộc, nếu không gửi thì dùng ảnh mặc định.</summary>
    public IFormFile? Photo { get; set; }
}
