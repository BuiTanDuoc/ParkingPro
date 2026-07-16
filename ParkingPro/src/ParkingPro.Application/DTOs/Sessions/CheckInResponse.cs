namespace ParkingPro.Application.DTOs.Sessions;

public record CheckInResponse(
    Guid SessionId,
    string LicensePlate,
    string SlotCode,
    DateTime CheckInAtUtc,
    string SessionType,
    string CheckInImageUrl);
