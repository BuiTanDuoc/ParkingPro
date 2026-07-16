using Hangfire;
using Microsoft.EntityFrameworkCore;
using ParkingPro.API.Middleware;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Infrastructure;
using ParkingPro.Infrastructure.Authorization;
using ParkingPro.Infrastructure.Hubs;

var builder = WebApplication.CreateBuilder(args);

// --- Services ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập JWT access token, ví dụ: Bearer {token}"
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
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
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
              //.AllowCredentials(); // cần thiết để SignalR gửi kèm cookie/token
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
