using Microsoft.AspNetCore.Hosting;
using ParkingPro.Application.Interfaces;

namespace ParkingPro.Infrastructure.FileStorage;

/// <summary>
/// Lưu file trực tiếp trên đĩa, dưới wwwroot/uploads/{subFolder}/{guid}.{ext} của ParkingPro.API
/// (được serve công khai qua app.UseStaticFiles() trong Program.cs).
/// Phù hợp cho 1 server duy nhất; nếu scale nhiều instance/deploy cloud, nên thay bằng
/// implementation khác của IFileStorageService (Azure Blob, S3...) mà không cần đổi gì ở Application/API.
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _env;

    public LocalFileStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveAsync(Stream fileStream, string originalFileName, string subFolder, CancellationToken ct = default)
    {
        var webRootPath = _env.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRootPath))
            webRootPath = Path.Combine(_env.ContentRootPath, "wwwroot");

        // subFolder có thể có dạng "sessions/checkin" (nhiều cấp) — Path.Combine xử lý được luôn
        var folderPath = Path.Combine(webRootPath, "uploads", subFolder);
        Directory.CreateDirectory(folderPath);

        var extension = Path.GetExtension(originalFileName);
        if (string.IsNullOrWhiteSpace(extension))
            extension = ".jpg";

        var storedFileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var fullPath = Path.Combine(folderPath, storedFileName);

        await using (var output = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
        {
            await fileStream.CopyToAsync(output, ct);
        }

        // Luôn trả về đường dẫn dùng dấu "/" (URL), kể cả khi build/chạy trên Windows
        var relativeUrl = $"/uploads/{subFolder}/{storedFileName}".Replace(Path.DirectorySeparatorChar, '/');
        return relativeUrl;
    }
}
