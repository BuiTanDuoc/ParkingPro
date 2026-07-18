using ParkingPro.Application.Common;
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
        var zones = GetZoneLookup(parkingLotId);
        var zoneIds = zones.Keys.ToList();

        var slots = _uow.ParkingSlots.Query()
            .Where(s => zoneIds.Contains(s.ZoneId))
            .ToList()
            .OrderBy(s => zones[s.ZoneId].Floor)
            .ThenBy(s => s.Code)
            .ToList();

        var result = new List<SlotStatusDto>();
        foreach (var slot in slots)
            result.Add(await MapToStatusDtoAsync(slot, zones[slot.ZoneId], ct));

        return result;
    }

    public async Task<PagedResult<SlotStatusDto>> GetSlotsPagedAsync(
        Guid parkingLotId, Guid? zoneId, string? search, int pageNumber, int pageSize, CancellationToken ct = default)
    {
        var zones = GetZoneLookup(parkingLotId);
        var zoneIds = zoneId is not null ? new List<Guid> { zoneId.Value } : zones.Keys.ToList();

        var query = _uow.ParkingSlots.Query().Where(s => zoneIds.Contains(s.ZoneId));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim().ToLower();
            query = query.Where(s =>
                s.Code.ToLower().Contains(keyword) ||
                (s.Description != null && s.Description.ToLower().Contains(keyword)));
        }

        var totalCount = query.Count();

        var pageSlots = query
            .ToList() // sắp xếp theo tầng khu vực cần dữ liệu Zone nên chuyển sang xử lý trong bộ nhớ
            .OrderBy(s => zones[s.ZoneId].Floor)
            .ThenBy(s => s.Code)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var items = new List<SlotStatusDto>();
        foreach (var slot in pageSlots)
            items.Add(await MapToStatusDtoAsync(slot, zones[slot.ZoneId], ct));

        return new PagedResult<SlotStatusDto>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task SetMaintenanceAsync(Guid slotId, bool underMaintenance, CancellationToken ct = default)
    {
        var slot = await _uow.ParkingSlots.GetByIdAsync(slotId, ct)
            ?? throw new NotFoundException(nameof(ParkingSlot), slotId);

        if (slot.Status == SlotStatus.DangDauXe)
            throw new ConflictException("Không thể chuyển sang bảo trì khi slot đang có xe.");

        // GetByIdAsync không Include Zone (IRepository không hỗ trợ Include) — phải lấy Zone riêng để tránh NullReferenceException.
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
            result.Add(new ZoneDto(zone.Id, zone.Name, zone.Floor, zone.Description, slotCount));
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
            Floor = request.Floor,
            Description = request.Description
        };

        await _uow.Zones.AddAsync(zone, ct);
        await _uow.SaveChangesAsync(ct);

        return new ZoneDto(zone.Id, zone.Name, zone.Floor, zone.Description, 0);
    }

    public async Task<ZoneDto> UpdateZoneAsync(Guid zoneId, UpdateZoneRequest request, CancellationToken ct = default)
    {
        var zone = await _uow.Zones.GetByIdAsync(zoneId, ct)
            ?? throw new NotFoundException(nameof(Zone), zoneId);

        zone.Name = request.Name;
        zone.Floor = request.Floor;
        zone.Description = request.Description;
        _uow.Zones.Update(zone);
        await _uow.SaveChangesAsync(ct);

        var slotCount = _uow.ParkingSlots.Query().Count(s => s.ZoneId == zone.Id);
        return new ZoneDto(zone.Id, zone.Name, zone.Floor, zone.Description, slotCount);
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
            Status = SlotStatus.Trong,
            Description = request.Description
        };

        await _uow.ParkingSlots.AddAsync(slot, ct);
        await _uow.SaveChangesAsync(ct);

        return new SlotStatusDto(slot.Id, zone.Id, slot.Code, zone.Name, slot.Status.ToString(), slot.Type.ToString(), slot.Description, null);
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
        slot.Description = request.Description;
        _uow.ParkingSlots.Update(slot);
        await _uow.SaveChangesAsync(ct);

        return await MapToStatusDtoAsync(slot, zone, ct);
    }

    // ---- Helpers ----

    private Dictionary<Guid, Zone> GetZoneLookup(Guid parkingLotId) =>
        _uow.Zones.Query().Where(z => z.ParkingLotId == parkingLotId).ToList().ToDictionary(z => z.Id);

    private async Task<SlotStatusDto> MapToStatusDtoAsync(ParkingSlot slot, Zone zone, CancellationToken ct)
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

        return new SlotStatusDto(slot.Id, zone.Id, slot.Code, zone.Name, slot.Status.ToString(), slot.Type.ToString(), slot.Description, plate);
    }
}
