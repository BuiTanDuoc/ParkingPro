namespace ParkingPro.Application.DTOs.Slots;

public record SlotStatusDto(
    Guid SlotId,
    Guid ZoneId,
    string Code,
    string ZoneName,
    string Status,
    string Type,
    string? Description,
    string? CurrentLicensePlate);
