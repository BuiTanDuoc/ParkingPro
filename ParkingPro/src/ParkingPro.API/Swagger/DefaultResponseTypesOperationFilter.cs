using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using ParkingPro.API.Common;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ParkingPro.API.Swagger;

/// <summary>
/// Tự động gắn schema <see cref="ErrorResponseDto"/> cho các mã lỗi chuẩn (400/404/409) và mô tả
/// 401/403 cho MỌI endpoint, thay vì phải thêm [ProducesResponseType] thủ công ở từng action.
/// Response 200/201/204 vẫn do chính action quyết định qua kiểu trả về (ActionResult&lt;T&gt;).
/// </summary>
public class DefaultResponseTypesOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var errorSchema = context.SchemaGenerator.GenerateSchema(typeof(ErrorResponseDto), context.SchemaRepository);

        void AddIfMissing(string statusCode, string description, bool withBody = true)
        {
            if (operation.Responses.ContainsKey(statusCode)) return;

            var response = new OpenApiResponse { Description = description };
            if (withBody)
                response.Content.Add("application/json", new OpenApiMediaType { Schema = errorSchema });

            operation.Responses.Add(statusCode, response);
        }

        // 400: mọi endpoint đều có thể trả BadRequestException/ValidationAppException
        AddIfMissing("400", "Dữ liệu đầu vào không hợp lệ.");

        // 401/403: chỉ áp dụng cho endpoint có [Authorize] (tức yêu cầu đăng nhập) — Login/RefreshToken/Register không cần
        var requiresAuth = context.MethodInfo.DeclaringType?.GetCustomAttributes(typeof(AuthorizeAttribute), true).Length > 0
                            || context.MethodInfo.GetCustomAttributes(typeof(AuthorizeAttribute), true).Length > 0;
        if (requiresAuth)
        {
            AddIfMissing("401", "Chưa đăng nhập hoặc access token đã hết hạn.", withBody: false);
            AddIfMissing("403", "Đã đăng nhập nhưng không đủ quyền (role) để thực hiện thao tác này.", withBody: false);
        }

        // 404/409: phổ biến ở các action thao tác theo Id hoặc có ràng buộc nghiệp vụ — an toàn khi khai báo chung
        AddIfMissing("404", "Không tìm thấy tài nguyên.");
        AddIfMissing("409", "Xung đột dữ liệu (vd trùng mã, sai trạng thái để thực hiện thao tác).");

        // 500: lỗi hệ thống không lường trước
        AddIfMissing("500", "Lỗi hệ thống không xác định.");
    }
}
