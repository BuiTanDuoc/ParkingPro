namespace ParkingPro.Application.DTOs.Slots;

public record ZoneDto(Guid Id, string Name, int Floor, string? Description, int SlotCount);
