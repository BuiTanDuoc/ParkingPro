using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.DTOs.Slots;

public record CreateSlotRequest(Guid ZoneId, string Code, SlotType Type);
