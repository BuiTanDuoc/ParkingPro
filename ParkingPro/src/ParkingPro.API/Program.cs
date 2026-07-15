using Microsoft.EntityFrameworkCore;
using ParkingPro.API.Middleware;
using ParkingPro.Infrastructure;
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
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // cần thiết để SignalR gửi kèm cookie/token
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
app.UseCors("AdminWebCors");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ParkingHub>("/hubs/parking");

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
