using Microsoft.EntityFrameworkCore;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;
using ParkingPro.Infrastructure.Persistence;

namespace ParkingPro.Infrastructure.Persistence.Seed;

/// <summary>
/// Tạo dữ liệu mẫu ban đầu để có thể test API ngay: bãi xe, khu vực, slot, bảng giá,
/// tài khoản (Admin/Manager/Staff/Customer), xe, hợp đồng vé tháng, phiên gửi xe,
/// thanh toán, ca làm việc và thông báo.
/// Chạy tự động lúc khởi động app (xem Program.cs), tự bỏ qua nếu DB đã có dữ liệu.
/// </summary>
public static class DataSeeder
{
    public const string DefaultAdminEmail = "admin@parkingpro.vn";
    public const string DefaultAdminPassword = "Admin@123";

    public static async Task SeedAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        // Idempotent: nếu đã có ParkingLot rồi thì bỏ qua toàn bộ, tránh seed trùng lặp
        if (await context.ParkingLots.AnyAsync())
            return;

        // 1. Tài khoản mẫu: Admin, Manager, Staff, Customer
        var admin = new User
        {
            FullName = "Quản trị viên hệ thống",
            Email = DefaultAdminEmail,
            PhoneNumber = "0900000000",
            PasswordHash = passwordHasher.Hash(DefaultAdminPassword),
            Role = UserRole.Admin,
            IsActive = true
        };
        await context.Users.AddAsync(admin);

        var manager = new User
        {
            FullName = "Quản lý bãi xe",
            Email = "manager@parkingpro.vn",
            PhoneNumber = "0900000001",
            PasswordHash = passwordHasher.Hash("Manager@123"),
            Role = UserRole.Manager,
            IsActive = true
        };
        await context.Users.AddAsync(manager);

        var staff = new User
        {
            FullName = "Nhân viên bảo vệ",
            Email = "staff@parkingpro.vn",
            PhoneNumber = "0900000002",
            PasswordHash = passwordHasher.Hash("Staff@123"),
            Role = UserRole.Staff,
            IsActive = true
        };
        await context.Users.AddAsync(staff);

        var customer = new User
        {
            FullName = "Nguyễn Văn Khách",
            Email = "customer@parkingpro.vn",
            PhoneNumber = "0900000003",
            PasswordHash = passwordHasher.Hash("Customer@123"),
            Role = UserRole.Customer,
            IsActive = true
        };
        await context.Users.AddAsync(customer);

        // 2. Bãi xe mẫu
        var lot = new ParkingLot
        {
            Name = "Bãi xe Trung Tâm Quận 1",
            Address = "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
            PhoneNumber = "028.3822.1234",
            TotalSlots = 40
        };
        await context.ParkingLots.AddAsync(lot);

        // 3. Khu vực (Zone): 2 tầng
        var zoneTrệt = new Zone { ParkingLot = lot, Name = "Tầng trệt", Floor = 0 };
        var zoneHầm = new Zone { ParkingLot = lot, Name = "Tầng hầm B1", Floor = -1 };
        await context.Zones.AddRangeAsync(zoneTrệt, zoneHầm);

        // 4. Slot: 20 slot thường ở tầng trệt (A-01..A-20),
        //    15 slot thường + 5 slot dành vé tháng ở tầng hầm (B-01..B-20)
        var slots = new List<ParkingSlot>();

        for (var i = 1; i <= 20; i++)
        {
            slots.Add(new ParkingSlot
            {
                Zone = zoneTrệt,
                Code = $"A-{i:00}",
                Type = SlotType.Thuong,
                Status = SlotStatus.Trong
            });
        }

        for (var i = 1; i <= 20; i++)
        {
            slots.Add(new ParkingSlot
            {
                Zone = zoneHầm,
                Code = $"B-{i:00}",
                Type = i <= 15 ? SlotType.Thuong : SlotType.DanhChoVeThang,
                Status = SlotStatus.Trong
            });
        }

        await context.ParkingSlots.AddRangeAsync(slots);

        // 5. Bảng giá: đủ 3 hình thức (giờ/ngày/tháng) cho 2 loại xe phổ biến nhất
        var pricingPlans = new List<PricingPlan>
        {
            // --- Ô tô dưới 7 chỗ ---
            new()
            {
                ParkingLot = lot,
                SessionType = SessionType.TheoGio,
                VehicleType = VehicleType.OToDuoi7Cho,
                Name = "Giá theo giờ - Ô tô dưới 7 chỗ",
                FirstHourPrice = 20000m,
                NextHourPrice = 15000m,
                OvernightSurcharge = 30000m,
                IsActive = true
            },
            new()
            {
                ParkingLot = lot,
                SessionType = SessionType.TheoNgay,
                VehicleType = VehicleType.OToDuoi7Cho,
                Name = "Giá theo ngày - Ô tô dưới 7 chỗ",
                DailyPrice = 150000m,
                IsActive = true
            },
            new()
            {
                ParkingLot = lot,
                SessionType = SessionType.TheoThang,
                VehicleType = VehicleType.OToDuoi7Cho,
                Name = "Vé tháng - Ô tô dưới 7 chỗ",
                MonthlyPrice = 1200000m,
                IsActive = true
            },

            // --- Ô tô trên 7 chỗ ---
            new()
            {
                ParkingLot = lot,
                SessionType = SessionType.TheoGio,
                VehicleType = VehicleType.OToTren7Cho,
                Name = "Giá theo giờ - Ô tô trên 7 chỗ",
                FirstHourPrice = 25000m,
                NextHourPrice = 20000m,
                OvernightSurcharge = 40000m,
                IsActive = true
            },
            new()
            {
                ParkingLot = lot,
                SessionType = SessionType.TheoNgay,
                VehicleType = VehicleType.OToTren7Cho,
                Name = "Giá theo ngày - Ô tô trên 7 chỗ",
                DailyPrice = 200000m,
                IsActive = true
            },
            new()
            {
                ParkingLot = lot,
                SessionType = SessionType.TheoThang,
                VehicleType = VehicleType.OToTren7Cho,
                Name = "Vé tháng - Ô tô trên 7 chỗ",
                MonthlyPrice = 1600000m,
                IsActive = true
            },

            // --- Xe máy ---
            new()
            {
                ParkingLot = lot,
                SessionType = SessionType.TheoGio,
                VehicleType = VehicleType.XeMay,
                Name = "Giá theo giờ - Xe máy",
                FirstHourPrice = 5000m,
                NextHourPrice = 3000m,
                OvernightSurcharge = 10000m,
                IsActive = true
            }
        };

        await context.PricingPlans.AddRangeAsync(pricingPlans);

        // 6. Xe mẫu: xe của khách vé tháng, xe khách vãng lai (ô tô), xe máy vãng lai
        var monthlyCustomerCar = new Vehicle
        {
            LicensePlate = "51H-123.45",
            Type = VehicleType.OToDuoi7Cho,
            Brand = "Toyota Vios",
            Color = "Trắng",
            OwnerUser = customer
        };

        var walkInCar = new Vehicle
        {
            LicensePlate = "51F-678.90",
            Type = VehicleType.OToDuoi7Cho,
            Brand = "Honda City",
            Color = "Đen"
        };

        var walkInMotorbike = new Vehicle
        {
            LicensePlate = "59-X1 123.45",
            Type = VehicleType.XeMay,
            Brand = "Honda Wave",
            Color = "Xanh"
        };

        await context.Vehicles.AddRangeAsync(monthlyCustomerCar, walkInCar, walkInMotorbike);

        // 7. Hợp đồng vé tháng: gắn xe của khách với 1 slot cố định dành cho vé tháng
        var fixedSlot = slots.First(s => s.Type == SlotType.DanhChoVeThang);
        fixedSlot.Status = SlotStatus.DaDatTruoc;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var monthlyContract = new MonthlyContract
        {
            ParkingLot = lot,
            Vehicle = monthlyCustomerCar,
            CustomerUser = customer,
            FixedSlot = fixedSlot,
            StartDate = today,
            EndDate = today.AddMonths(1),
            MonthlyFee = 1200000m,
            Status = ContractStatus.DangHoatDong,
            AutoRenew = true
        };
        await context.MonthlyContracts.AddAsync(monthlyContract);

        // 8. Phiên gửi xe mẫu
        var trệtSlotForWalkInCar = slots.First(s => s.Code == "A-01");
        var trệtSlotForMotorbike = slots.First(s => s.Code == "A-02");
        trệtSlotForWalkInCar.Status = SlotStatus.DangDauXe;
        trệtSlotForMotorbike.Status = SlotStatus.DangDauXe;

        // 8a. Phiên đã hoàn tất (theo giờ) của khách vãng lai, đã thanh toán tiền mặt
        var completedSession = new ParkingSession
        {
            ParkingLot = lot,
            Vehicle = walkInCar,
            Slot = trệtSlotForWalkInCar,
            SessionType = SessionType.TheoGio,
            Status = SessionStatus.DaThanhToan,
            CheckInAtUtc = DateTime.UtcNow.AddHours(-3),
            CheckOutAtUtc = DateTime.UtcNow.AddHours(-1),
            TotalAmount = 35000m,
            CheckInStaff = staff,
            CheckOutStaff = staff
        };
        await context.ParkingSessions.AddAsync(completedSession);

        var payment = new Payment
        {
            ParkingSession = completedSession,
            Amount = 35000m,
            Method = PaymentMethod.TienMat,
            Status = PaymentStatus.DaThanhToan,
            ReceivedByStaff = staff,
            PaidAtUtc = DateTime.UtcNow.AddHours(-1)
        };
        await context.Payments.AddAsync(payment);

        // 8b. Phiên đang gửi (xe máy vãng lai, chưa ra)
        var ongoingSession = new ParkingSession
        {
            ParkingLot = lot,
            Vehicle = walkInMotorbike,
            Slot = trệtSlotForMotorbike,
            SessionType = SessionType.TheoGio,
            Status = SessionStatus.DangGuiXe,
            CheckInAtUtc = DateTime.UtcNow.AddMinutes(-30),
            CheckInStaff = staff
        };
        await context.ParkingSessions.AddAsync(ongoingSession);

        // 8c. Phiên phát sinh hàng ngày từ hợp đồng vé tháng (không tính phí riêng)
        var monthlyDailySession = new ParkingSession
        {
            ParkingLot = lot,
            Vehicle = monthlyCustomerCar,
            Slot = fixedSlot,
            MonthlyContract = monthlyContract,
            SessionType = SessionType.TheoThang,
            Status = SessionStatus.DangGuiXe,
            CheckInAtUtc = DateTime.UtcNow.AddHours(-2),
            CheckInStaff = staff
        };
        await context.ParkingSessions.AddAsync(monthlyDailySession);

        // 9. Ca làm việc: ca của nhân viên bảo vệ đang hoạt động
        var shift = new Shift
        {
            ParkingLot = lot,
            Staff = staff,
            StartAtUtc = DateTime.UtcNow.AddHours(-4),
            ExpectedCashAmount = 500000m,
            Note = "Ca sáng"
        };
        await context.Shifts.AddAsync(shift);

        // 10. Thông báo mẫu gửi cho khách vé tháng
        var notification = new Notification
        {
            RecipientUser = customer,
            Title = "Chào mừng đến với ParkingPro",
            Message = "Hợp đồng vé tháng của bạn đã được kích hoạt thành công. Slot cố định: " + fixedSlot.Code,
            IsRead = false,
            SentAtUtc = DateTime.UtcNow
        };
        await context.Notifications.AddAsync(notification);

        await context.SaveChangesAsync();
    }
}