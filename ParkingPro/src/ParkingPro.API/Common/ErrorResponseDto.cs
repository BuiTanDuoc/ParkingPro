namespace ParkingPro.API.Common;

/// <summary>Cấu trúc lỗi chuẩn trả về bởi <c>ExceptionHandlingMiddleware</c> cho mọi request thất bại.</summary>
public class ErrorResponseDto
{
    /// <summary>Mã trạng thái HTTP, vd 400, 404, 409.</summary>
    public int Status { get; set; }

    /// <summary>Thông điệp lỗi ngắn gọn, có thể hiển thị trực tiếp cho người dùng.</summary>
    public string Title { get; set; } = default!;

    /// <summary>Chi tiết lỗi validation theo từng field (chỉ có khi lỗi 400 do FluentValidation), dạng {"Email": ["..."]}.</summary>
    public IDictionary<string, string[]>? Errors { get; set; }

    /// <summary>Mã định danh request, dùng để tra log khi báo lỗi cho đội vận hành.</summary>
    public string TraceId { get; set; } = default!;
}
