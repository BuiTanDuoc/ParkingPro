using ParkingPro.Application.Common.Exceptions;
using ParkingPro.Application.DTOs.Slots;
using ParkingPro.Application.Interfaces;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.Services;

public class SlotService : ISlotService
{
    private readonly IUnitOfWork _uow;
    private readonly IParkingNotifier _notifier;

    public SlotService(IUnitOfWork uow, IParkingNotifier notifier)
    {
        _uow = uow;
        _notifier = notifier;
    }

    public async Task<IReadOnlyList<SlotStatusDto>> GetSlotStatusesAsync(Guid parkingLotId, CancellationToken ct = default)
    {
        var slots = _uow.ParkingSlots.Query()
            .Where(s => s.Zone.ParkingLotId == parkingLotId)
            .OrderBy(s => s.Zone.Floor).ThenBy(s => s.Code)
            .ToList();

        var result = new List<SlotStatusDto>();
        foreach (var slot in slots)
        {
            string? plate = null;
            if (slot.Status == SlotStatus.DangDauXe)
            {
                var activeSession = await _uow.ParkingSessions.FirstOrDefaultAsync(
                    s => s.SlotId == slot.Id && s.Status == SessionStatus.DangGuiXe, ct);
                if (activeSession is not null)
                {
                    var vehicle = await _uow.Vehicles.GetByIdAsync(activeSession.VehicleId, ct);
                    plate = vehicle?.LicensePlate;
                }
            }

            result.Add(new SlotStatusDto(slot.Id, slot.Code, slot.Zone.Name, slot.Status.ToString(), slot.Type.ToString(), plate));
        }

        return result;
    }

    public async Task SetMaintenanceAsync(Guid slotId, bool underMaintenance, CancellationToken ct = default)
    {
        var slot = await _uow.ParkingSlots.GetByIdAsync(slotId, ct)
            ?? throw new NotFoundException(nameof(ParkingSlot), slotId);

        if (slot.Status == SlotStatus.DangDauXe)
            throw new ConflictException("Không thể chuyển sang bảo trì khi slot đang có xe.");

        slot.Status = underMaintenance ? SlotStatus.BaoTri : SlotStatus.Trong;
        _uow.ParkingSlots.Update(slot);
        await _uow.SaveChangesAsync(ct);

        await _notifier.NotifySlotStatusChangedAsync(slot.Zone.ParkingLotId, slot.Id, slot.Status.ToString(), ct);
    }
}
