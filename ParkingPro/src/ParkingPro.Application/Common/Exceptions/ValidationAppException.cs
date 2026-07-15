namespace ParkingPro.Application.Common.Exceptions;

/// <summary>
/// Ném ra khi FluentValidation phát hiện dữ liệu đầu vào không hợp lệ.
/// Được ExceptionHandlingMiddleware bắt và trả về 400 kèm chi tiết lỗi từng field.
/// </summary>
public class ValidationAppException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationAppException(IDictionary<string, string[]> errors)
        : base("Đã xảy ra một hoặc nhiều lỗi validation.")
    {
        Errors = errors;
    }
}
