namespace ParkingPro.Application.DTOs.Slots;

public record SlotStatusDto(
    Guid SlotId,
    string Code,
    string ZoneName,
    string Status,
    string Type,
    string? CurrentLicensePlate);
