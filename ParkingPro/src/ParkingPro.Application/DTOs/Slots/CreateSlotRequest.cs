using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.DTOs.Slots;

/// <param name="ZoneId">Id khu vực chứa slot.</param>
/// <param name="Code">Mã slot, vd "A-01" — phải duy nhất trong khu vực.</param>
/// <param name="Type">Loại slot: Thuong, Vip hoặc DanhChoVeThang.</param>
/// <param name="Description">Mô tả thêm (không bắt buộc).</param>
public record CreateSlotRequest(Guid ZoneId, string Code, SlotType Type, string? Description);
