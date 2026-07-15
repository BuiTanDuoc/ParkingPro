# ĐỀ XUẤT DỰ ÁN: HỆ THỐNG QUẢN LÝ BÃI GIỮ XE Ô TÔ (ParkingPro)

## 1. Tổng quan

**ParkingPro** là hệ thống quản lý bãi giữ xe ô tô hỗ trợ 3 hình thức gửi xe:
- **Theo giờ**: xe vãng lai, tính tiền theo giờ/phút thực tế gửi
- **Theo ngày**: khách gửi xe qua đêm hoặc theo ngày cố định
- **Theo tháng**: khách thuê chỗ cố định (vé tháng), có thể gắn biển số cụ thể

Hệ thống gồm 3 phần:
| Thành phần | Vai trò | Công nghệ |
|---|---|---|
| **Backend API** | Xử lý nghiệp vụ, tính phí, quản lý slot | .NET 8, Clean Architecture, EF Core, Service Layer (inject trực tiếp vào Controller) |
| **Web Admin (React)** | Quản trị viên/nhân viên bãi xe vận hành | React dựa trên template [Airframe React](https://github.com/0wczar/airframe-react) (Bootstrap 4 + reactstrap) + SignalR client |
| **Mobile App (React Native)** | Khách hàng đặt chỗ, xem vé; bảo vệ quét xe vào/ra | React Native CLI |

---

## 2. Đối tượng sử dụng

1. **Chủ bãi xe / Admin**: cấu hình bãi, giá, báo cáo doanh thu
2. **Nhân viên/bảo vệ (Staff)**: check-in/check-out xe, thu tiền, xử lý sự cố
3. **Khách vãng lai (Guest)**: gửi xe theo giờ/ngày, không cần tài khoản
4. **Khách thuê tháng (Subscriber)**: đăng ký vé tháng, có tài khoản mobile app

---

## 3. Chức năng chính

### 3.1. Quản lý bãi xe & sơ đồ chỗ đậu
- Cấu hình nhiều bãi xe (multi-lot), nhiều tầng/khu (Zone)
- Sơ đồ chỗ đậu (`ParkingSlot`) dạng lưới, trạng thái realtime: Trống / Đang đậu / Đã đặt trước / Bảo trì
- Cập nhật trạng thái slot qua **SignalR** để Admin Web thấy thay đổi tức thời

### 3.2. Gửi xe theo giờ (Hourly)
- Nhân viên tạo phiên gửi xe (`ParkingSession`) khi xe vào: chụp ảnh biển số, ghi giờ vào
- Khi xe ra: hệ thống tự tính tiền = số giờ thực tế × đơn giá (có bậc giá: giờ đầu, giờ tiếp theo, giá qua đêm)
- In/gửi hóa đơn điện tử, hỗ trợ nhiều phương thức thanh toán (tiền mặt, chuyển khoản, QR)

### 3.3. Gửi xe theo ngày (Daily)
- Áp dụng gói giá cố định theo ngày hoặc theo đêm (qua 22h–6h tính thêm phụ phí)
- Cho phép gia hạn thêm ngày trong lúc xe vẫn đang gửi

### 3.4. Gửi xe theo tháng (Monthly Pass)
- Đăng ký vé tháng (`MonthlyContract`): gắn 1–2 biển số cố định, chỉ định slot cố định hoặc slot tự do
- Tự động gia hạn / nhắc hết hạn qua thông báo (push notification / SMS qua Twilio)
- Quản lý công nợ, xuất hóa đơn định kỳ, khóa xe nếu quá hạn chưa thanh toán

### 3.5. Thanh toán & Hóa đơn
- Tích hợp cổng thanh toán (VNPay/Momo — tùy chọn) hoặc thanh toán tại chỗ
- Lịch sử giao dịch, đối soát cuối ca (`Shift` / `CashReconciliation`)

### 3.6. Báo cáo & Thống kê
- Doanh thu theo ngày/tháng/loại hình gửi xe
- Công suất sử dụng bãi xe (occupancy rate), giờ cao điểm
- Dashboard realtime cho Admin: số xe hiện có, doanh thu hôm nay, slot trống

### 3.7. Quản lý người dùng & phân quyền
- JWT Bearer Auth + Refresh Token rotation (theo kinh nghiệm đã triển khai ở CarBookingApp)
- RBAC: Admin, Manager, Staff, Customer — dùng lại pattern `RequireRoleAttribute` / `RolePolicyProvider`

### 3.8. Mobile App (React Native)
**Dành cho khách thuê tháng:**
- Đăng ký/gia hạn vé tháng, xem lịch sử thanh toán
- Nhận thông báo sắp hết hạn, tìm bãi xe gần nhất (Google Maps)

**Dành cho nhân viên/bảo vệ:**
- Quét mã QR/biển số để check-in/check-out nhanh
- Xem sơ đồ slot trống theo thời gian thực

---

## 4. Kiến trúc hệ thống

```
ParkingPro/
├── src/
│   ├── ParkingPro.Domain/              # Entities, Enums, Domain events
│   ├── ParkingPro.Application/         # Services (business logic), DTOs, Validators, Interfaces
│   ├── ParkingPro.Infrastructure/      # EF Core, Repositories, SignalR Hub, Payment gateway
│   ├── ParkingPro.API/                 # Controllers (inject Service trực tiếp), Middleware, JWT, DI setup
│   └── ParkingPro.Shared/              # Constants, Common utils
├── tests/
│   ├── ParkingPro.UnitTests/
│   └── ParkingPro.IntegrationTests/
├── parkingpro-admin-web/               # React Admin (dựa trên Airframe React) + SignalR client
└── parkingpro-mobile/                  # React Native app (Customer + Staff)
```

**Pattern áp dụng (kế thừa kinh nghiệm CarBookingApp/BookingApp, đã điều chỉnh):**
- Clean Architecture nhưng **không dùng CQRS/Mediator** — Controller inject thẳng các Service (`IParkingSessionService`, `IMonthlyContractService`, `IPricingService`...) theo mô hình Service Layer truyền thống
- Mỗi Service xử lý toàn bộ logic nghiệp vụ của 1 domain (vd: `ParkingSessionService.CheckIn()`, `.CheckOut()`, `.CalculateFee()`)
- FluentValidation vẫn dùng nhưng gọi trực tiếp trong Service hoặc qua Model Validation attribute, không cần pipeline behavior
- `ExceptionHandlingMiddleware` xử lý lỗi tập trung
- EF Core + SQL Server, `IDesignTimeDbContextFactory` cho migration
- SignalR cho cập nhật trạng thái slot/dashboard realtime
- Hangfire cho job nền: tự động tính phí quá hạn, nhắc gia hạn vé tháng

---

## 5. Thiết kế cơ sở dữ liệu (rút gọn)

| Bảng | Mô tả |
|---|---|
| `ParkingLots` | Thông tin bãi xe (tên, địa chỉ, tổng số slot) |
| `Zones` | Khu vực/tầng trong bãi |
| `ParkingSlots` | Chỗ đậu: mã slot, zone, trạng thái, loại (thường/VIP/tháng) |
| `PricingPlans` | Bảng giá: loại hình (Hourly/Daily/Monthly), đơn giá, bậc giá |
| `Vehicles` | Biển số, loại xe, chủ xe (nếu có tài khoản) |
| `ParkingSessions` | Phiên gửi xe vãng lai: giờ vào, giờ ra, slot, tổng tiền, trạng thái |
| `MonthlyContracts` | Hợp đồng vé tháng: khách hàng, biển số, slot, ngày bắt đầu/kết thúc |
| `Payments` | Giao dịch thanh toán: phương thức, số tiền, trạng thái |
| `Users` | Tài khoản: Admin/Manager/Staff/Customer |
| `Shifts` | Ca làm việc, đối soát tiền mặt |
| `Notifications` | Log thông báo (nhắc gia hạn, hết hạn) |

---

## 6. API chính (ví dụ)

```
POST   /api/sessions/check-in         # Xe vào (theo giờ/ngày)
POST   /api/sessions/{id}/check-out   # Xe ra, tính tiền
GET    /api/slots/status              # Trạng thái slot realtime
POST   /api/monthly-contracts         # Đăng ký vé tháng
POST   /api/monthly-contracts/{id}/renew
GET    /api/reports/revenue?from=&to=
GET    /api/reports/occupancy
POST   /api/auth/login
POST   /api/auth/refresh-token
```

SignalR Hub: `/hubs/parking` — broadcast sự kiện `SlotStatusChanged`, `SessionCheckedIn`, `SessionCheckedOut`

**Ví dụ Controller gọi thẳng Service (không qua CQRS/Mediator):**

```csharp
[ApiController]
[Route("api/sessions")]
public class ParkingSessionsController : ControllerBase
{
    private readonly IParkingSessionService _sessionService;

    public ParkingSessionsController(IParkingSessionService sessionService)
    {
        _sessionService = sessionService;
    }

    [HttpPost("check-in")]
    public async Task<IActionResult> CheckIn(CheckInRequest request, CancellationToken ct)
    {
        var result = await _sessionService.CheckInAsync(request, ct);
        return Ok(result);
    }

    [HttpPost("{id}/check-out")]
    public async Task<IActionResult> CheckOut(Guid id, CancellationToken ct)
    {
        var result = await _sessionService.CheckOutAsync(id, ct);
        return Ok(result);
    }
}
```

`IParkingSessionService` chứa toàn bộ logic tính phí, cập nhật slot, phát sự kiện SignalR — Controller chỉ đóng vai trò điều phối HTTP request/response.

---

## 7. Giao diện (UI/UX)

- Admin Web xây dựng trên nền template **[Airframe React](https://github.com/0wczar/airframe-react)** (Bootstrap 4 + reactstrap + React Router, có sẵn `ThemeProvider` hỗ trợ theme `light` / `dark` / `color`)
- Chọn theme `dark` làm mặc định để giữ phong cách dashboard tối, đồng nhất với các dự án trước
- Tận dụng các component có sẵn của Airframe: bảng dữ liệu (react-bootstrap-table-next), calendar (react-big-calendar) cho lịch vé tháng, charts (recharts) cho báo cáo doanh thu, datepicker, toast thông báo (react-toastify)
- Tùy biến thêm: **Sơ đồ bãi xe realtime** (custom grid component hiển thị slot theo trạng thái, subscribe qua SignalR) — đặt trong `app/components/ParkingMap`
- Nhãn giao diện tiếng Việt, code/namespace tiếng Anh
- Routing: định nghĩa page trong `app/routes/` theo cấu trúc sẵn có của Airframe (`ParkingMap`, `Sessions`, `MonthlyContracts`, `Reports`, `Settings`)

---

## 8. Lộ trình triển khai đề xuất

| Giai đoạn | Nội dung | Thời gian ước tính |
|---|---|---|
| 1 | Setup Clean Architecture, Auth/RBAC, DB schema | 1 tuần |
| 2 | Module gửi xe theo giờ + tính phí + check-in/out | 1.5 tuần |
| 3 | Module theo ngày + theo tháng (hợp đồng, gia hạn) | 1.5 tuần |
| 4 | SignalR realtime + Dashboard + Báo cáo | 1 tuần |
| 5 | Admin Web React hoàn thiện UI | 1.5 tuần |
| 6 | Mobile App (Customer + Staff QR scan) | 2 tuần |
| 7 | Testing, đối soát ca, thanh toán, triển khai | 1 tuần |

**Tổng ước tính**: ~9–10 tuần (1 dev full-stack)

---

## 9. Yêu cầu phi chức năng

- Hỗ trợ nhiều bãi xe cùng lúc (multi-tenant theo `ParkingLotId`)
- Realtime cập nhật slot < 1 giây qua SignalR
- Backup dữ liệu giao dịch định kỳ
- Log đầy đủ giao dịch tài chính (audit trail) — quan trọng do liên quan tiền
- Có thể triển khai on-premise (server tại bãi xe) hoặc cloud

---

## 10. Điểm mở rộng trong tương lai

- Nhận diện biển số tự động (ALPR/OCR) khi xe vào/ra — tích hợp camera AI (có thể liên kết định hướng sản phẩm CAM4A đã làm trước đó)
- Đặt chỗ trước (reservation) qua mobile app
- Tích hợp cổng thanh toán trực tuyến (VNPay, Momo, ZaloPay)
- Barrier/gate tự động (tích hợp phần cứng cổng chắn)
