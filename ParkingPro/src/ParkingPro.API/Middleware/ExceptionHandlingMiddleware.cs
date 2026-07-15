using System.Net;
using System.Text.Json;
using ParkingPro.Application.Common.Exceptions;

namespace ParkingPro.API.Middleware;

/// <summary>
/// Bắt toàn bộ exception ném ra từ Service layer và chuyển thành response JSON
/// nhất quán, thay cho việc dùng pipeline behavior của CQRS.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, title, errors) = exception switch
        {
            NotFoundException => (HttpStatusCode.NotFound, exception.Message, null),
            ConflictException => (HttpStatusCode.Conflict, exception.Message, null),
            BadRequestException => (HttpStatusCode.BadRequest, exception.Message, null),
            ValidationAppException validationEx => (HttpStatusCode.BadRequest, exception.Message, (object?)validationEx.Errors),
            UnauthorizedAccessException => (HttpStatusCode.Forbidden, "Bạn không có quyền thực hiện thao tác này.", null),
            _ => (HttpStatusCode.InternalServerError, "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.", null)
        };

        if (statusCode == HttpStatusCode.InternalServerError)
            _logger.LogError(exception, "Lỗi không xác định xảy ra khi xử lý request {Path}", context.Request.Path);
        else
            _logger.LogWarning("Xử lý request thất bại {Path}: {Message}", context.Request.Path, exception.Message);

        context.Response.StatusCode = (int)statusCode;

        var payload = new
        {
            status = (int)statusCode,
            title,
            errors,
            traceId = context.TraceIdentifier
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}
