namespace ParkingPro.Application.DTOs.Slots;

public record CreateZoneRequest(Guid ParkingLotId, string Name, int Floor);
