using ParkingPro.Application.Common.Exceptions;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.Services;

public class PricingService : IPricingService
{
    private readonly IUnitOfWork _uow;

    public PricingService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<decimal> CalculateSessionFeeAsync(ParkingSession session, CancellationToken ct = default)
    {
        if (session.CheckOutAtUtc is null)
            throw new BadRequestException("Không thể tính phí khi xe chưa checkout.");

        var vehicle = await _uow.Vehicles.GetByIdAsync(session.VehicleId, ct)
            ?? throw new NotFoundException(nameof(Vehicle), session.VehicleId);

        var plan = await _uow.PricingPlans.FirstOrDefaultAsync(p =>
                p.ParkingLotId == session.ParkingLotId &&
                p.SessionType == session.SessionType &&
                p.VehicleType == vehicle.Type &&
                p.IsActive,
                ct);

        if (plan is null)
            throw new NotFoundException("Bảng giá phù hợp cho loại xe/hình thức gửi này");

        var duration = session.CheckOutAtUtc.Value - session.CheckInAtUtc;

        return session.SessionType switch
        {
            SessionType.TheoGio => CalculateHourlyFee(duration, plan, session.CheckInAtUtc, session.CheckOutAtUtc.Value),
            SessionType.TheoNgay => CalculateDailyFee(duration, plan),
            SessionType.TheoThang => 0m, // đã thu qua MonthlyContract, không tính thêm
            _ => throw new BadRequestException("Loại hình gửi xe không hợp lệ.")
        };
    }

    private static decimal CalculateHourlyFee(TimeSpan duration, PricingPlan plan, DateTime checkIn, DateTime checkOut)
    {
        var firstHour = plan.FirstHourPrice ?? 0m;
        var nextHour = plan.NextHourPrice ?? 0m;

        var totalHours = Math.Ceiling((decimal)duration.TotalMinutes / 60m);
        if (totalHours < 1) totalHours = 1;

        var fee = firstHour + Math.Max(0m, totalHours - 1) * nextHour;

        // Phụ phí qua đêm: nếu khoảng thời gian gửi giao với 22h-6h
        if (plan.OvernightSurcharge is > 0 && OverlapsOvernight(checkIn, checkOut))
            fee += plan.OvernightSurcharge.Value;

        return fee;
    }

    private static bool OverlapsOvernight(DateTime checkIn, DateTime checkOut)
    {
        var cur = checkIn;
        while (cur < checkOut)
        {
            var hour = cur.Hour;
            if (hour >= 22 || hour < 6) return true;
            cur = cur.AddHours(1);
        }
        return false;
    }

    private static decimal CalculateDailyFee(TimeSpan duration, PricingPlan plan)
    {
        var days = Math.Ceiling((decimal)duration.TotalHours / 24m);
        if (days < 1) days = 1;
        return days * (plan.DailyPrice ?? 0m);
    }

    public async Task<decimal> GetMonthlyFeeAsync(Guid parkingLotId, VehicleType vehicleType, CancellationToken ct = default)
    {
        var plan = await _uow.PricingPlans.FirstOrDefaultAsync(p =>
                p.ParkingLotId == parkingLotId &&
                p.SessionType == SessionType.TheoThang &&
                p.VehicleType == vehicleType &&
                p.IsActive,
                ct);

        if (plan?.MonthlyPrice is null)
            throw new NotFoundException("Bảng giá vé tháng phù hợp cho loại xe này");

        return plan.MonthlyPrice.Value;
    }
}
