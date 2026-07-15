using ParkingPro.Application.Common.Exceptions;
using ParkingPro.Application.DTOs.Reports;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.Services;

public class ReportService : IReportService
{
    private const int MaxRangeDays = 366;

    private readonly IUnitOfWork _uow;

    public ReportService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<IReadOnlyList<RevenueReportDto>> GetRevenueReportAsync(
        Guid parkingLotId, DateOnly fromDate, DateOnly toDate, CancellationToken ct = default)
    {
        if (toDate < fromDate)
            throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu.");

        if (toDate.DayNumber - fromDate.DayNumber > MaxRangeDays)
            throw new BadRequestException($"Khoảng thời gian báo cáo tối đa là {MaxRangeDays} ngày.");

        // Mốc theo UTC vì CheckOutAtUtc/PaidAtUtc đều lưu UTC trong DB
        var rangeStartUtc = fromDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var rangeEndUtcExclusive = toDate.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        // 1. Doanh thu xe vãng lai (theo giờ/theo ngày) — lấy theo giờ checkout
        var sessions = _uow.ParkingSessions.Query()
            .Where(s => s.ParkingLotId == parkingLotId
                        && s.Status == SessionStatus.DaThanhToan
                        && s.CheckOutAtUtc != null
                        && s.CheckOutAtUtc >= rangeStartUtc
                        && s.CheckOutAtUtc < rangeEndUtcExclusive)
            .ToList();

        // 2. Doanh thu vé tháng — lấy theo giờ thanh toán (Payment.PaidAtUtc) của các hợp đồng thuộc bãi xe này
        var contractIdsOfLot = _uow.MonthlyContracts.Query()
            .Where(c => c.ParkingLotId == parkingLotId)
            .Select(c => c.Id)
            .ToList();

        var monthlyPayments = _uow.Payments.Query()
            .Where(p => p.MonthlyContractId != null
                        && contractIdsOfLot.Contains(p.MonthlyContractId.Value)
                        && p.Status == PaymentStatus.DaThanhToan
                        && p.PaidAtUtc != null
                        && p.PaidAtUtc >= rangeStartUtc
                        && p.PaidAtUtc < rangeEndUtcExclusive)
            .ToList();

        // 3. Gộp theo từng ngày trong khoảng
        var result = new List<RevenueReportDto>();
        for (var date = fromDate; date <= toDate; date = date.AddDays(1))
        {
            var dayStartUtc = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var dayEndUtc = date.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

            var hourlyRevenue = sessions
                .Where(s => s.SessionType == SessionType.TheoGio
                            && s.CheckOutAtUtc >= dayStartUtc && s.CheckOutAtUtc < dayEndUtc)
                .Sum(s => s.TotalAmount ?? 0m);

            var dailyRevenue = sessions
                .Where(s => s.SessionType == SessionType.TheoNgay
                            && s.CheckOutAtUtc >= dayStartUtc && s.CheckOutAtUtc < dayEndUtc)
                .Sum(s => s.TotalAmount ?? 0m);

            var monthlyRevenue = monthlyPayments
                .Where(p => p.PaidAtUtc >= dayStartUtc && p.PaidAtUtc < dayEndUtc)
                .Sum(p => p.Amount);

            result.Add(new RevenueReportDto(
                date, hourlyRevenue, dailyRevenue, monthlyRevenue,
                hourlyRevenue + dailyRevenue + monthlyRevenue));
        }

        return result;
    }

    public async Task<OccupancyReportDto> GetOccupancyReportAsync(Guid parkingLotId, CancellationToken ct = default)
    {
        var slots = _uow.ParkingSlots.Query()
            .Where(s => s.Zone.ParkingLotId == parkingLotId)
            .ToList();

        var totalSlots = slots.Count;
        var occupiedSlots = slots.Count(s => s.Status == SlotStatus.DangDauXe);
        var availableSlots = slots.Count(s => s.Status == SlotStatus.Trong);
        var maintenanceSlots = slots.Count(s => s.Status == SlotStatus.BaoTri);

        var occupancyRate = totalSlots == 0
            ? 0d
            : Math.Round((double)occupiedSlots / totalSlots * 100, 2);

        await Task.CompletedTask; // giữ signature async cho nhất quán với các Service khác, sẵn sàng mở rộng I/O sau này

        return new OccupancyReportDto(totalSlots, occupiedSlots, availableSlots, maintenanceSlots, occupancyRate);
    }
}
