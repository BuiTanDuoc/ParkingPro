using Microsoft.AspNetCore.Http;
using ParkingPro.Application.Common.Exceptions;

namespace ParkingPro.API.Common;

/// <summary>Kiểm tra cơ bản cho ảnh upload (avatar, ảnh xe, ảnh check-in/out) — dùng chung ở các Controller.</summary>
public static class UploadValidation
{
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5MB

    public static void EnsureValidImage(IFormFile file)
    {
        if (file.Length <= 0)
            throw new BadRequestException("File ảnh rỗng.");

        if (file.Length > MaxFileSizeBytes)
            throw new BadRequestException("Kích thước ảnh vượt quá giới hạn cho phép (tối đa 5MB).");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
            throw new BadRequestException("Định dạng ảnh không được hỗ trợ (chỉ chấp nhận .jpg, .jpeg, .png, .webp).");
    }
}
