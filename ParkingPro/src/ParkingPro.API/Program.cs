using System.Reflection;
using System.Text.Json.Serialization;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using ParkingPro.API.Middleware;
using ParkingPro.API.Swagger;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Infrastructure;
using ParkingPro.Infrastructure.Authorization;
using ParkingPro.Infrastructure.Hubs;

var builder = WebApplication.CreateBuilder(args);

// --- Services ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Enum trả về/nhận vào dạng tên chuỗi (vd "TheoGio") thay vì số (0) — cả request lẫn response,
        // đồng thời Swagger tự nhận diện converter này để hiển thị đúng schema enum dạng string.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ParkingPro API",
        Version = "v1",
        Description = "API quản lý bãi giữ xe ô tô: gửi xe theo giờ/ngày, vé tháng, khu vực & slot, báo cáo, người dùng."
    });

    // Đọc XML doc comment (///) từ cả 2 assembly để hiển thị mô tả action + field DTO đầy đủ trên Swagger UI.
    // Yêu cầu <GenerateDocumentationFile>true</GenerateDocumentationFile> ở cả 2 csproj (API và Application).
    var apiXmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var apiXmlPath = Path.Combine(AppContext.BaseDirectory, apiXmlFile);
    if (File.Exists(apiXmlPath))
        options.IncludeXmlComments(apiXmlPath);

    var applicationXmlFile = "ParkingPro.Application.xml";
    var applicationXmlPath = Path.Combine(AppContext.BaseDirectory, applicationXmlFile);
    if (File.Exists(applicationXmlPath))
        options.IncludeXmlComments(applicationXmlPath);

    // Đánh dấu property không nullable trong DTO là "required" trên schema (rõ ràng hơn cho FE khi đọc Swagger).
    options.SupportNonNullableReferenceTypes();

    // Tự động gắn response 400/401/403/404/409/500 (kèm schema lỗi chuẩn) cho mọi endpoint.
    options.OperationFilter<DefaultResponseTypesOperationFilter>();

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT access token, ví dụ: Bearer {token}"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AdminWebCors", policy =>
    {
        // ⚠️ TẠM THỜI cho phép MỌI origin để dễ test — dùng SetIsOriginAllowed thay vì
        // AllowAnyOrigin() vì AllowAnyOrigin() không thể kết hợp với AllowCredentials()
        // (mà AllowCredentials() vẫn cần thiết cho SignalR gửi kèm token qua query string).
        // PHẢI đổi lại thành whitelist domain cụ thể (Cors:AllowedOrigins) trước khi lên production.
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// --- Middleware pipeline ---
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Serve file tĩnh dưới wwwroot/uploads (avatar, ảnh xe, ảnh check-in/out, ảnh mặc định)
// qua đường dẫn "/uploads/..." — dùng bởi LocalFileStorageService.
app.UseStaticFiles();

app.UseCors("AdminWebCors");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ParkingHub>("/hubs/parking");

// --- Hangfire Dashboard ---
// Ở Development mở tự do để tiện debug job. Ngoài Development bắt buộc Basic Auth
// (xem HangfireDashboardAuthorizationFilter — cấu hình username/password ở "Hangfire" section).
if (app.Environment.IsDevelopment())
{
    app.UseHangfireDashboard("/hangfire");
}
else
{
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = new[] { new HangfireDashboardAuthorizationFilter(app.Configuration) }
    });
}

// --- Đăng ký 2 recurring job bảo trì hợp đồng vé tháng ---
// Giờ theo cấu hình server (mặc định UTC nếu không set TimeZoneInfo) — điều chỉnh nếu cần chạy đúng giờ VN (UTC+7).
var reminderWithinDays = builder.Configuration.GetValue("Jobs:MonthlyContractReminderWithinDays", 7);

RecurringJob.AddOrUpdate<IMonthlyContractMaintenanceService>(
    "remind-expiring-monthly-contracts",
    service => service.RemindExpiringContractsAsync(reminderWithinDays, CancellationToken.None),
    Cron.Daily(8)); // 8h sáng mỗi ngày: tạo thông báo nhắc gia hạn

RecurringJob.AddOrUpdate<IMonthlyContractMaintenanceService>(
    "expire-overdue-monthly-contracts",
    service => service.ExpireOverdueContractsAsync(CancellationToken.None),
    Cron.Daily(1)); // 1h sáng mỗi ngày: tự chuyển hợp đồng quá hạn sang HetHan + giải phóng slot cố định

// --- Tự động áp dụng migration + seed dữ liệu mẫu (chỉ ở Development) ---
// Ở Production nên chạy migration thủ công (dotnet ef database update) để tránh
// rủi ro tự đổi schema DB thật lúc deploy.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ParkingPro.Infrastructure.Persistence.AppDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<ParkingPro.Application.Interfaces.Services.IPasswordHasher>();

    await dbContext.Database.MigrateAsync();
    await ParkingPro.Infrastructure.Persistence.Seed.DataSeeder.SeedAsync(dbContext, passwordHasher);
}

app.Run();
