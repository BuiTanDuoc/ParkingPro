using Microsoft.EntityFrameworkCore;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;
using ParkingPro.Infrastructure.Persistence;

namespace ParkingPro.Infrastructure.Persistence.Seed;

/// <summary>
/// Tạo dữ liệu mẫu ban đầu để có thể test API ngay: 1 bãi xe, 1 khu, vài slot,
/// bảng giá cho các hình thức gửi xe, và 1 tài khoản Admin.
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

        // 1. Tài khoản Admin đầu tiên
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
            }
        };

        await context.PricingPlans.AddRangeAsync(pricingPlans);

        await context.SaveChangesAsync();
    }
}
