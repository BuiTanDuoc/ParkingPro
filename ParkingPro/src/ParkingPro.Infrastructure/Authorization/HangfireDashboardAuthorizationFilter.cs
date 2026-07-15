using System.Text;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace ParkingPro.Infrastructure.Authorization;

/// <summary>
/// Bảo vệ Hangfire Dashboard (/hangfire) bằng HTTP Basic Auth độc lập với JWT Bearer.
/// Lý do dùng Basic Auth riêng: hệ thống chỉ có JWT Bearer (không có cookie/session),
/// trong khi truy cập Dashboard là qua trình duyệt nên không thể đính kèm Authorization header JWT như gọi API.
/// Đổi username/password qua cấu hình "Hangfire:DashboardUsername" / "Hangfire:DashboardPassword".
/// </summary>
public class HangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter
{
    private readonly string _username;
    private readonly string _password;

    public HangfireDashboardAuthorizationFilter(IConfiguration configuration)
    {
        _username = configuration["Hangfire:DashboardUsername"] ?? "admin";
        _password = configuration["Hangfire:DashboardPassword"]
            ?? throw new InvalidOperationException(
                "Chưa cấu hình 'Hangfire:DashboardPassword' — bắt buộc phải đặt trước khi bật Dashboard ngoài môi trường Development.");
    }

    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        var header = httpContext.Request.Headers["Authorization"].ToString();

        if (string.IsNullOrEmpty(header) || !header.StartsWith("Basic ", StringComparison.OrdinalIgnoreCase))
        {
            httpContext.Response.Headers["WWW-Authenticate"] = "Basic realm=\"Hangfire Dashboard\"";
            httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return false;
        }

        try
        {
            var encoded = header["Basic ".Length..].Trim();
            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(encoded));
            var separatorIndex = decoded.IndexOf(':');
            if (separatorIndex < 0) return false;

            var username = decoded[..separatorIndex];
            var password = decoded[(separatorIndex + 1)..];

            return username == _username && password == _password;
        }
        catch
        {
            return false;
        }
    }
}
