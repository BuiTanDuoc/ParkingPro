namespace ParkingPro.Application.DTOs.Sessions;

public record ParkingSessionDto(
    Guid Id,
    string LicensePlate,
    string SlotCode,
    string SessionType,
    string Status,
    DateTime CheckInAtUtc,
    DateTime? CheckOutAtUtc,
    decimal? TotalAmount);
