using ParkingPro.Domain.Common;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid? ParkingSessionId { get; set; }
    public ParkingSession? ParkingSession { get; set; }

    public Guid? MonthlyContractId { get; set; }
    public MonthlyContract? MonthlyContract { get; set; }

    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.ChoThanhToan;

    public string? TransactionRef { get; set; }
    public Guid ReceivedByStaffId { get; set; }
    public User ReceivedByStaff { get; set; } = default!;

    public DateTime? PaidAtUtc { get; set; }
}
