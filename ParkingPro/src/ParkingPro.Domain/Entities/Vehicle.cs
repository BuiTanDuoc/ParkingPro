using ParkingPro.Domain.Common;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Domain.Entities;

public class Vehicle : BaseEntity
{
    public string LicensePlate { get; set; } = default!;
    public VehicleType Type { get; set; } = VehicleType.OToDuoi7Cho;
    public string? Brand { get; set; }
    public string? Color { get; set; }

    /// <summary>Đường dẫn tương đối (vd "/uploads/vehicles/xxx.jpg"). Null/rỗng = dùng ảnh mặc định.</summary>
    public string? PhotoUrl { get; set; }

    // Chủ xe (tùy chọn, có thể null với khách vãng lai không có tài khoản)
    public Guid? OwnerUserId { get; set; }
    public User? OwnerUser { get; set; }

    public ICollection<ParkingSession> Sessions { get; set; } = new List<ParkingSession>();
    public ICollection<MonthlyContract> MonthlyContracts { get; set; } = new List<MonthlyContract>();
}
