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

        // Query() (dùng ở GetSlotStatusesAsync) load kèm Zone qua Include ngầm của EF khi filter theo
        // s.Zone.ParkingLotId, nhưng GetByIdAsync ở trên KHÔNG kèm Zone — phải lấy riêng để tránh NullReferenceException.
        var zone = await _uow.Zones.GetByIdAsync(slot.ZoneId, ct)
            ?? throw new NotFoundException(nameof(Zone), slot.ZoneId);

        slot.Status = underMaintenance ? SlotStatus.BaoTri : SlotStatus.Trong;
        _uow.ParkingSlots.Update(slot);
        await _uow.SaveChangesAsync(ct);

        await _notifier.NotifySlotStatusChangedAsync(zone.ParkingLotId, slot.Id, slot.Status.ToString(), ct);
    }

    public async Task<IReadOnlyList<ZoneDto>> GetZonesAsync(Guid parkingLotId, CancellationToken ct = default)
    {
        var zones = _uow.Zones.Query()
            .Where(z => z.ParkingLotId == parkingLotId)
            .OrderBy(z => z.Floor)
            .ToList();

        var result = new List<ZoneDto>();
        foreach (var zone in zones)
        {
            var slotCount = _uow.ParkingSlots.Query().Count(s => s.ZoneId == zone.Id);
            result.Add(new ZoneDto(zone.Id, zone.Name, zone.Floor, slotCount));
        }

        return result;
    }

    public async Task<ZoneDto> CreateZoneAsync(CreateZoneRequest request, CancellationToken ct = default)
    {
        var parkingLot = await _uow.ParkingLots.GetByIdAsync(request.ParkingLotId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.ParkingLot), request.ParkingLotId);

        var zone = new Zone
        {
            ParkingLotId = parkingLot.Id,
            Name = request.Name,
            Floor = request.Floor
        };

        await _uow.Zones.AddAsync(zone, ct);
        await _uow.SaveChangesAsync(ct);

        return new ZoneDto(zone.Id, zone.Name, zone.Floor, 0);
    }

    public async Task<SlotStatusDto> CreateSlotAsync(CreateSlotRequest request, CancellationToken ct = default)
    {
        var zone = await _uow.Zones.GetByIdAsync(request.ZoneId, ct)
            ?? throw new NotFoundException(nameof(Zone), request.ZoneId);

        var duplicate = await _uow.ParkingSlots.FirstOrDefaultAsync(
            s => s.ZoneId == request.ZoneId && s.Code == request.Code, ct);
        if (duplicate is not null)
            throw new ConflictException($"Slot với mã '{request.Code}' đã tồn tại trong khu vực này.");

        var slot = new ParkingSlot
        {
            ZoneId = zone.Id,
            Code = request.Code,
            Type = request.Type,
            Status = SlotStatus.Trong
        };

        await _uow.ParkingSlots.AddAsync(slot, ct);
        await _uow.SaveChangesAsync(ct);

        return new SlotStatusDto(slot.Id, slot.Code, zone.Name, slot.Status.ToString(), slot.Type.ToString(), null);
    }

    public async Task<SlotStatusDto> UpdateSlotAsync(Guid slotId, UpdateSlotRequest request, CancellationToken ct = default)
    {
        var slot = await _uow.ParkingSlots.GetByIdAsync(slotId, ct)
            ?? throw new NotFoundException(nameof(ParkingSlot), slotId);

        if (slot.Status == SlotStatus.DangDauXe)
            throw new ConflictException("Không thể sửa slot đang có xe.");

        var zone = await _uow.Zones.GetByIdAsync(slot.ZoneId, ct)
            ?? throw new NotFoundException(nameof(Zone), slot.ZoneId);

        if (!string.Equals(slot.Code, request.Code, StringComparison.OrdinalIgnoreCase))
        {
            var duplicate = await _uow.ParkingSlots.FirstOrDefaultAsync(
                s => s.ZoneId == slot.ZoneId && s.Code == request.Code && s.Id != slotId, ct);
            if (duplicate is not null)
                throw new ConflictException($"Slot với mã '{request.Code}' đã tồn tại trong khu vực này.");
        }

        slot.Code = request.Code;
        slot.Type = request.Type;
        _uow.ParkingSlots.Update(slot);
        await _uow.SaveChangesAsync(ct);

        return new SlotStatusDto(slot.Id, slot.Code, zone.Name, slot.Status.ToString(), slot.Type.ToString(), null);
    }
}
