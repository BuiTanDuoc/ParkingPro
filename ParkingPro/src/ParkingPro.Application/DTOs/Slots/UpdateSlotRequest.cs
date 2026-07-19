using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.DTOs.Slots;

/// <param name="Code">Mã slot mới.</param>
/// <param name="Type">Loại slot: Thuong, Vip hoặc DanhChoVeThang.</param>
/// <param name="Description">Mô tả thêm (không bắt buộc).</param>
public record UpdateSlotRequest(string Code, SlotType Type, string? Description);
