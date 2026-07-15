namespace ParkingPro.Domain.Enums;

public enum SlotStatus
{
    Trong = 0,          // Slot trống, sẵn sàng nhận xe
    DangDauXe = 1,      // Đang có xe đậu
    DaDatTruoc = 2,     // Đã được đặt trước / gán cho hợp đồng tháng
    BaoTri = 3          // Đang bảo trì, không sử dụng được
}
