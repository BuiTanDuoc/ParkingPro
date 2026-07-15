namespace ParkingPro.Application.DTOs.MonthlyContracts;

public record CreateMonthlyContractRequest(
    Guid ParkingLotId,
    Guid CustomerUserId,
    string LicensePlate,
    Guid? FixedSlotId,
    DateOnly StartDate,
    int NumberOfMonths,
    bool AutoRenew);
