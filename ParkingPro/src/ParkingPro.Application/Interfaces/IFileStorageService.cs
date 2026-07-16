namespace ParkingPro.Application.Interfaces;

/// <summary>
/// Trừu tượng hóa việc lưu file upload (avatar, ảnh xe, ảnh check-in/out).
/// Implementation thực tế (lưu đĩa cục bộ dưới wwwroot) nằm ở Infrastructure,
/// Application chỉ làm việc với Stream nên không phụ thuộc IFormFile của ASP.NET Core.
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Lưu file và trả về đường dẫn tương đối để truy cập công khai (vd "/uploads/avatars/xxx.jpg").
    /// </summary>
    /// <param name="subFolder">Thư mục con dưới "uploads/", vd "avatars", "vehicles", "sessions/checkin".</param>
    Task<string> SaveAsync(Stream fileStream, string originalFileName, string subFolder, CancellationToken ct = default);
}
