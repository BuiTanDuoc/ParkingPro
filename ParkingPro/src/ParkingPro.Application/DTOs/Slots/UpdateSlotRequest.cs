using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.DTOs.Slots;

public record UpdateSlotRequest(string Code, SlotType Type);
