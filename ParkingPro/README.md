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

## Lưu ý quan trọng trước khi build

1. **Package `BCrypt.Net-Next`** đã khai báo trong `ParkingPro.Infrastructure.csproj` — cần `dotnet restore` để tải về.
2. **JWT Secret** trong `appsettings.json` chỉ là placeholder — bắt buộc đổi trước khi lên production, nên dùng User Secrets hoặc biến môi trường thay vì commit secret vào git.
3. Sandbox tạo code này **không có .NET SDK** để build/test thử, nên hãy chạy `dotnet build` ở máy local trước để bắt lỗi biên dịch nếu có (thường là do version package không khớp với SDK cài trên máy bạn).
4. Cần seed dữ liệu mẫu ban đầu (1 `ParkingLot`, `Zone`, vài `ParkingSlot`, `PricingPlan` cho từng `SessionType`/`VehicleType`, và 1 tài khoản `Admin`) trước khi test API — có thể viết thêm 1 Data Seeder chạy lúc `app.Run()` nếu cần, hiện chưa có trong bản scaffold này.

## Đã hoàn thành trong bản scaffold này

- Domain: đầy đủ Entities + Enums (ParkingLot, Zone, ParkingSlot, Vehicle, PricingPlan, ParkingSession, MonthlyContract, Payment, User, RefreshToken, Shift, Notification)
- Application: Service Layer đầy đủ cho check-in/check-out theo giờ & ngày, tính phí (bậc giá giờ đầu/giờ sau + phụ phí qua đêm), quản lý hợp đồng vé tháng (tạo/gia hạn/hủy), Auth (login, refresh token với family-based reuse detection, đăng ký khách hàng)
- Infrastructure: EF Core DbContext (soft-delete filter, audit tự động), Generic Repository + UnitOfWork (hỗ trợ transaction), SignalR Hub + Notifier, JWT + BCrypt, RBAC (RequireRoleAttribute/RolePolicyProvider/RoleAuthorizationHandler)
- API: Controllers cho Auth/Sessions/Slots/MonthlyContracts, ExceptionHandlingMiddleware, CORS, Swagger có nút Authorize
- 1 Unit test mẫu cho PricingService (tính phí theo giờ)

## Chưa làm trong bản scaffold này (gợi ý bước tiếp theo)

- ReportsController + logic báo cáo doanh thu/occupancy (DTO đã có sẵn ở `DTOs/Reports`)
- Hangfire job: tự động nhắc gia hạn vé tháng sắp hết hạn, tự khóa hợp đồng quá hạn chưa thanh toán
- Data Seeder cho dữ liệu mẫu (ParkingLot/Zone/Slot/PricingPlan/tài khoản Admin đầu tiên)
- Tích hợp cổng thanh toán thực tế (hiện `PaymentMethod`/`PaymentStatus` mới ở mức model)
- Upload ảnh check-in/check-out (hiện chỉ lưu URL, chưa có endpoint upload)
