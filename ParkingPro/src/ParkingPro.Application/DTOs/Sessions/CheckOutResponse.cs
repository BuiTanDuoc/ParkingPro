namespace ParkingPro.Application.DTOs.Sessions;

public record CheckOutResponse(
    Guid SessionId,
    string LicensePlate,
    DateTime CheckInAtUtc,
    DateTime CheckOutAtUtc,
    decimal TotalAmount,
    string SlotCode,
    string CheckOutImageUrl);
