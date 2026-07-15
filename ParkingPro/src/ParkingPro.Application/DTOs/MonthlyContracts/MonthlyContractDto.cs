namespace ParkingPro.Application.DTOs.MonthlyContracts;

public record MonthlyContractDto(
    Guid Id,
    string LicensePlate,
    string CustomerName,
    string? FixedSlotCode,
    DateOnly StartDate,
    DateOnly EndDate,
    decimal MonthlyFee,
    string Status,
    bool AutoRenew);
