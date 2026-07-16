using Microsoft.AspNetCore.Http;

namespace ParkingPro.API.Requests;

/// <summary>Model để bind multipart/form-data khi check-out xe (có kèm ảnh check-out tùy chọn).</summary>
public class CheckOutFormRequest
{
    /// <summary>Ảnh chụp lúc check-out — không bắt buộc, nếu không gửi thì dùng ảnh mặc định.</summary>
    public IFormFile? Photo { get; set; }
}
