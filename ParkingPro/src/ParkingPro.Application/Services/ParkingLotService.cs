using ParkingPro.Application.Common.Exceptions;
using ParkingPro.Application.DTOs.ParkingLots;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;

namespace ParkingPro.Application.Services;

public class ParkingLotService : IParkingLotService
{
    private readonly IUnitOfWork _uow;

    public ParkingLotService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public Task<IReadOnlyList<ParkingLotDto>> GetAllAsync(CancellationToken ct = default)
    {
        var lots = _uow.ParkingLots.Query()
            .Where(l => !l.IsDeleted)
            .OrderBy(l => l.Name)
            .ToList()
            .Select(MapToDto)
            .ToList();

        return Task.FromResult<IReadOnlyList<ParkingLotDto>>(lots);
    }

    public async Task<ParkingLotDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var lot = await _uow.ParkingLots.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(ParkingLot), id);

        return MapToDto(lot);
    }

    private static ParkingLotDto MapToDto(ParkingLot lot) =>
        new(lot.Id, lot.Name, lot.Address, lot.PhoneNumber, lot.TotalSlots);
}
