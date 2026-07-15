# ParkingPro — Backend API (.NET 8)

Backend hệ thống quản lý bãi giữ xe ô tô: gửi xe theo giờ / theo ngày / theo tháng.

## Kiến trúc

Clean Architecture **không dùng CQRS/Mediator** — Controller trong `ParkingPro.API` inject
trực tiếp các Service trong `ParkingPro.Application` (Service Layer truyền thống).

```
ParkingPro.Domain            → Entities, Enums (không phụ thuộc project nào khác)
ParkingPro.Application        → Interfaces + Services (business logic), DTOs
ParkingPro.Infrastructure      → EF Core, Repository/UnitOfWork, SignalR, JWT, RBAC
ParkingPro.API                → Controllers (gọi thẳng Service), Middleware, Program.cs
ParkingPro.Shared             → Constants dùng chung
```

**Luồng gọi:** `Controller` → `IXxxService` (Application) → `IUnitOfWork` / `IRepository<T>` (Infrastructure)
Không có Command/Query/Handler nào ở giữa.

## Yêu cầu môi trường

- .NET 8 SDK
- SQL Server (local hoặc Docker: `docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest`)

## Cách chạy

```bash
# 1. Khôi phục package
dotnet restore

# 2. Cập nhật connection string trong src/ParkingPro.API/appsettings.Development.json
#    (hoặc dùng user-secrets: dotnet user-secrets set "ConnectionStrings:DefaultConnection" "...")

# 3. Tạo migration đầu tiên (chạy tại thư mục gốc solution)
dotnet ef migrations add InitialCreate \
  --project src/ParkingPro.Infrastructure \
  --startup-project src/ParkingPro.API

# 4. Áp dụng migration vào DB
dotnet ef database update \
  --project src/ParkingPro.Infrastructure \
  --startup-project src/ParkingPro.API

# 5. Chạy API
dotnet run --project src/ParkingPro.API
```

Swagger UI: `https://localhost:7080/swagger` (Development).

## Dữ liệu mẫu (Data Seeder)

Khi chạy ở môi trường **Development**, `Program.cs` tự động gọi `dbContext.Database.MigrateAsync()`
rồi `DataSeeder.SeedAsync(...)` (tại `ParkingPro.Infrastructure/Persistence/Seed/DataSeeder.cs`).
Seeder tự bỏ qua nếu đã có `ParkingLot` trong DB (idempotent), nên chạy `dotnet run` nhiều lần vẫn an toàn.

Dữ liệu được tạo sẵn:

| Loại | Chi tiết |
|---|---|
| Tài khoản | `admin@parkingpro.vn` / `Admin@123` (Admin), `manager@parkingpro.vn` / `Manager@123` (Manager), `staff@parkingpro.vn` / `Staff@123` (Staff) |
| Bãi xe | "Bãi xe Trung Tâm Quận 1", 40 slot |
| Khu vực | "Tầng trệt" (Floor 0), "Tầng hầm B1" (Floor -1) |
| Slot | A-01..A-20 (tầng trệt, thường), B-01..B-15 (hầm, thường), B-16..B-20 (hầm, dành vé tháng) |
| Bảng giá | Đủ 3 hình thức (giờ/ngày/tháng) cho Ô tô dưới 7 chỗ & trên 7 chỗ |

⚠️ Đổi mật khẩu các tài khoản mẫu này (hoặc xóa hẳn logic seed user) trước khi lên production.

Ở **Production**, middleware seed/migrate tự động bị tắt (chỉ chạy khi `IsDevelopment()`) — cần chạy
`dotnet ef database update` thủ công như hướng dẫn ở trên.

## Hangfire — Job nhắc gia hạn / tự hết hạn vé tháng

Chạy tự động, không cần gọi API. Được đăng ký lúc khởi động (`Program.cs`) qua `RecurringJob.AddOrUpdate`:

| Job | Lịch chạy | Việc làm |
|---|---|---|
| `remind-expiring-monthly-contracts` | 8h sáng mỗi ngày | Tìm hợp đồng `DangHoatDong` sắp hết hạn trong N ngày tới (cấu hình ở `Jobs:MonthlyContractReminderWithinDays`, mặc định 7), tạo `Notification` nhắc khách hàng, chuyển `Status` sang `SapHetHan` |
| `expire-overdue-monthly-contracts` | 1h sáng mỗi ngày | Tìm hợp đồng đã quá `EndDate` nhưng chưa gia hạn, chuyển `Status` sang `HetHan`, giải phóng slot cố định (`FixedSlot`) về `Trong`, tạo `Notification` báo hết hạn |

Logic nghiệp vụ nằm ở `IMonthlyContractMaintenanceService` (Application layer) — Hangfire chỉ gọi thẳng
2 method này theo lịch, không có gì đặc biệt phải học thêm ngoài cú pháp `RecurringJob.AddOrUpdate`.

**Hangfire Dashboard** (`/hangfire`) để xem lịch sử job, retry job lỗi, trigger chạy thủ công:
- Ở **Development**: mở tự do, không cần đăng nhập.
- Ở **môi trường khác**: bắt buộc HTTP Basic Auth (không dùng chung JWT vì đây là trang trình duyệt truy cập trực tiếp, không tiện đính kèm Bearer token). Đổi tài khoản trong `appsettings.Production.json` → `Hangfire:DashboardUsername` / `Hangfire:DashboardPassword` — **bắt buộc đổi trước khi deploy**, app sẽ ném exception lúc khởi động nếu chưa cấu hình `DashboardPassword` khi không phải Development.

⚠️ Hangfire tự tạo các bảng riêng (schema `HangFire`) trong cùng DB ở `ConnectionStrings:DefaultConnection`
lúc chạy lần đầu — không cần thêm migration thủ công cho phần này.

⚠️ `Cron.Daily(...)` chạy theo giờ UTC theo mặc định (không truyền `TimeZoneInfo`). Nếu muốn job chạy
đúng 8h sáng giờ Việt Nam (UTC+7), sửa lời gọi thành:
```csharp
RecurringJob.AddOrUpdate<IMonthlyContractMaintenanceService>(
    "remind-expiring-monthly-contracts",
    service => service.RemindExpiringContractsAsync(reminderWithinDays, CancellationToken.None),
    Cron.Daily(8),
    new RecurringJobOptions { TimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time") });
```

## Lưu ý quan trọng trước khi build

1. **Package `BCrypt.Net-Next`** đã khai báo trong `ParkingPro.Infrastructure.csproj` — cần `dotnet restore` để tải về.
2. **JWT Secret** trong `appsettings.json` chỉ là placeholder — bắt buộc đổi trước khi lên production, nên dùng User Secrets hoặc biến môi trường thay vì commit secret vào git.
3. Sandbox tạo code này **không có .NET SDK** để build/test thử, nên hãy chạy `dotnet build` ở máy local trước để bắt lỗi biên dịch nếu có (thường là do version package không khớp với SDK cài trên máy bạn).
4. Cần seed dữ liệu mẫu ban đầu (1 `ParkingLot`, `Zone`, vài `ParkingSlot`, `PricingPlan` cho từng `SessionType`/`VehicleType`, và 1 tài khoản `Admin`) trước khi test API — có thể viết thêm 1 Data Seeder chạy lúc `app.Run()` nếu cần, hiện chưa có trong bản scaffold này.

## Đã hoàn thành trong bản scaffold này

- Domain: đầy đủ Entities + Enums (ParkingLot, Zone, ParkingSlot, Vehicle, PricingPlan, ParkingSession, MonthlyContract, Payment, User, RefreshToken, Shift, Notification)
- Application: Service Layer đầy đủ cho check-in/check-out theo giờ & ngày, tính phí (bậc giá giờ đầu/giờ sau + phụ phí qua đêm), quản lý hợp đồng vé tháng (tạo/gia hạn/hủy), Auth (login, refresh token với family-based reuse detection, đăng ký khách hàng)
- Infrastructure: EF Core DbContext (soft-delete filter, audit tự động), Generic Repository + UnitOfWork (hỗ trợ transaction), SignalR Hub + Notifier, JWT + BCrypt, RBAC (RequireRoleAttribute/RolePolicyProvider/RoleAuthorizationHandler)
- API: Controllers cho Auth/Sessions/Slots/MonthlyContracts/Reports, ExceptionHandlingMiddleware, CORS, Swagger có nút Authorize
- Data Seeder tự động chạy ở Development: tài khoản Admin/Manager/Staff mẫu, 1 bãi xe, 2 khu, 40 slot, bảng giá đủ 3 hình thức
- Hangfire: 2 recurring job (nhắc gia hạn vé tháng sắp hết hạn, tự chuyển hợp đồng quá hạn sang HetHan + giải phóng slot), Dashboard bảo vệ bằng Basic Auth ngoài Development
- 1 Unit test mẫu cho PricingService (tính phí theo giờ)

## Chưa làm trong bản scaffold này (gợi ý bước tiếp theo)

- Tích hợp cổng thanh toán thực tế (hiện `PaymentMethod`/`PaymentStatus` mới ở mức model)
- Upload ảnh check-in/check-out (hiện chỉ lưu URL, chưa có endpoint upload)
- Gửi thông báo qua kênh thực tế (SMS/push/email) — hiện `Notification` chỉ lưu vào DB, chưa có tích hợp Twilio/Firebase như dự án Sổ Tiết Kiệm trước đây

**Về báo cáo doanh thu (`GET /api/reports/revenue`):** doanh thu vé tháng (`MonthlyRevenue`) được
tính theo ngày **thanh toán** (`Payment.PaidAtUtc`). `MonthlyContractService.CreateAsync` (thu trọn
gói theo số tháng đăng ký) và `RenewAsync` (thu theo số tháng gia hạn) đều đã tự tạo `Payment` tương
ứng trong cùng transaction, nên số liệu báo cáo phản ánh đúng các giao dịch thực tế.
