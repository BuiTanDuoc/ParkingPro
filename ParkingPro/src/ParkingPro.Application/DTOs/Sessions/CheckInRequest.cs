using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.DTOs.Sessions;

public record CheckInRequest(
    Guid ParkingLotId,
    string LicensePlate,
    VehicleType VehicleType,
    SessionType SessionType,
    Guid? PreferredSlotId);
