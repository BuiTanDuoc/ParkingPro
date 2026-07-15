using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.Services;

public class MonthlyContractMaintenanceService : IMonthlyContractMaintenanceService
{
    private readonly IUnitOfWork _uow;

    public MonthlyContractMaintenanceService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task RemindExpiringContractsAsync(int withinDays, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var thresholdDate = today.AddDays(withinDays);

        // Chỉ nhắc các hợp đồng còn hiệu lực và chưa được nhắc (Status vẫn DangHoatDong).
        // Job ExpireOverdueContractsAsync sẽ xử lý riêng các hợp đồng đã thật sự quá hạn.
        var expiringContracts = _uow.MonthlyContracts.Query()
            .Where(c => c.Status == ContractStatus.DangHoatDong
                        && c.EndDate <= thresholdDate
                        && c.EndDate >= today)
            .ToList();

        if (expiringContracts.Count == 0)
            return;

        foreach (var contract in expiringContracts)
        {
            var vehicle = await _uow.Vehicles.GetByIdAsync(contract.VehicleId, ct);
            var daysLeft = contract.EndDate.DayNumber - today.DayNumber;

            var notification = new Notification
            {
                RecipientUserId = contract.CustomerUserId,
                Title = "Vé tháng sắp hết hạn",
                Message = $"Hợp đồng vé tháng cho xe {vehicle?.LicensePlate ?? "N/A"} sẽ hết hạn vào " +
                           $"ngày {contract.EndDate:dd/MM/yyyy} (còn {daysLeft} ngày). " +
                           "Vui lòng gia hạn để tiếp tục sử dụng chỗ đậu.",
                SentAtUtc = DateTime.UtcNow
            };
            await _uow.Notifications.AddAsync(notification, ct);

            contract.Status = ContractStatus.SapHetHan;
            _uow.MonthlyContracts.Update(contract);
        }

        await _uow.SaveChangesAsync(ct);
    }

    public async Task ExpireOverdueContractsAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var overdueContracts = _uow.MonthlyContracts.Query()
            .Where(c => (c.Status == ContractStatus.DangHoatDong || c.Status == ContractStatus.SapHetHan)
                        && c.EndDate < today)
            .ToList();

        if (overdueContracts.Count == 0)
            return;

        foreach (var contract in overdueContracts)
        {
            var vehicle = await _uow.Vehicles.GetByIdAsync(contract.VehicleId, ct);

            contract.Status = ContractStatus.HetHan;
            _uow.MonthlyContracts.Update(contract);

            var notification = new Notification
            {
                RecipientUserId = contract.CustomerUserId,
                Title = "Vé tháng đã hết hạn",
                Message = $"Hợp đồng vé tháng cho xe {vehicle?.LicensePlate ?? "N/A"} đã hết hạn vào " +
                           $"ngày {contract.EndDate:dd/MM/yyyy}. Vui lòng liên hệ quầy để gia hạn nếu vẫn còn nhu cầu sử dụng.",
                SentAtUtc = DateTime.UtcNow
            };
            await _uow.Notifications.AddAsync(notification, ct);

            // Giải phóng slot cố định để có thể gán cho hợp đồng khác
            if (contract.FixedSlotId is not null)
            {
                var slot = await _uow.ParkingSlots.GetByIdAsync(contract.FixedSlotId.Value, ct);
                if (slot is not null && slot.Status == SlotStatus.DaDatTruoc)
                {
                    slot.Status = SlotStatus.Trong;
                    slot.Type = SlotType.Thuong;
                    _uow.ParkingSlots.Update(slot);
                }
            }
        }

        await _uow.SaveChangesAsync(ct);
    }
}
