using ParkingPro.Application.Common;
using ParkingPro.Application.Common.Exceptions;
using ParkingPro.Application.DTOs.MonthlyContracts;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;

namespace ParkingPro.Application.Services;

public class MonthlyContractService : IMonthlyContractService
{
    private readonly IUnitOfWork _uow;
    private readonly IPricingService _pricingService;

    public MonthlyContractService(IUnitOfWork uow, IPricingService pricingService)
    {
        _uow = uow;
        _pricingService = pricingService;
    }

    public async Task<MonthlyContractDto> CreateAsync(CreateMonthlyContractRequest request, Guid staffUserId, CancellationToken ct = default)
    {
        if (request.NumberOfMonths <= 0)
            throw new BadRequestException("Số tháng đăng ký phải lớn hơn 0.");

        var customer = await _uow.Users.GetByIdAsync(request.CustomerUserId, ct)
            ?? throw new NotFoundException(nameof(User), request.CustomerUserId);

        var vehicle = await _uow.Vehicles.FirstOrDefaultAsync(v => v.LicensePlate == request.LicensePlate, ct);
        if (vehicle is null)
        {
            vehicle = new Vehicle
            {
                LicensePlate = request.LicensePlate,
                Type = VehicleType.OToDuoi7Cho,
                OwnerUserId = customer.Id
            };
            await _uow.Vehicles.AddAsync(vehicle, ct);
        }

        ParkingSlot? fixedSlot = null;
        if (request.FixedSlotId is not null)
        {
            fixedSlot = await _uow.ParkingSlots.GetByIdAsync(request.FixedSlotId.Value, ct)
                ?? throw new NotFoundException(nameof(ParkingSlot), request.FixedSlotId.Value);

            if (fixedSlot.Status != SlotStatus.Trong)
                throw new ConflictException($"Slot {fixedSlot.Code} hiện không thể gán cố định (không trống).");
        }

        var monthlyFee = await _pricingService.GetMonthlyFeeAsync(request.ParkingLotId, vehicle.Type, ct);
        var endDate = request.StartDate.AddMonths(request.NumberOfMonths);

        var contract = new MonthlyContract
        {
            ParkingLotId = request.ParkingLotId,
            VehicleId = vehicle.Id,
            Vehicle = vehicle,
            CustomerUserId = customer.Id,
            CustomerUser = customer,
            FixedSlotId = fixedSlot?.Id,
            FixedSlot = fixedSlot,
            StartDate = request.StartDate,
            EndDate = endDate,
            MonthlyFee = monthlyFee,
            Status = ContractStatus.DangHoatDong,
            AutoRenew = request.AutoRenew
        };

        // Thu tiền trọn gói ngay lúc đăng ký, theo số tháng đã chọn
        var payment = new Payment
        {
            MonthlyContract = contract,
            Amount = monthlyFee * request.NumberOfMonths,
            Method = PaymentMethod.TienMat,
            Status = PaymentStatus.DaThanhToan,
            ReceivedByStaffId = staffUserId,
            PaidAtUtc = DateTime.UtcNow
        };

        await _uow.ExecuteInTransactionAsync(async () =>
        {
            await _uow.MonthlyContracts.AddAsync(contract, ct);
            await _uow.Payments.AddAsync(payment, ct);

            if (fixedSlot is not null)
            {
                fixedSlot.Status = SlotStatus.DaDatTruoc;
                fixedSlot.Type = SlotType.DanhChoVeThang;
                _uow.ParkingSlots.Update(fixedSlot);
            }

            await _uow.SaveChangesAsync(ct);
        }, ct);

        return MapToDto(contract);
    }

    public async Task<MonthlyContractDto> RenewAsync(Guid contractId, int additionalMonths, Guid staffUserId, CancellationToken ct = default)
    {
        if (additionalMonths <= 0)
            throw new BadRequestException("Số tháng gia hạn phải lớn hơn 0.");

        var contract = await _uow.MonthlyContracts.GetByIdAsync(contractId, ct)
            ?? throw new NotFoundException(nameof(MonthlyContract), contractId);

        if (contract.Status == ContractStatus.DaHuy)
            throw new ConflictException("Không thể gia hạn hợp đồng đã bị hủy.");

        var baseDate = contract.EndDate < DateOnly.FromDateTime(DateTime.UtcNow)
            ? DateOnly.FromDateTime(DateTime.UtcNow)
            : contract.EndDate;

        contract.EndDate = baseDate.AddMonths(additionalMonths);
        contract.Status = ContractStatus.DangHoatDong;

        var payment = new Payment
        {
            MonthlyContractId = contract.Id,
            Amount = contract.MonthlyFee * additionalMonths,
            Method = PaymentMethod.TienMat,
            Status = PaymentStatus.DaThanhToan,
            ReceivedByStaffId = staffUserId,
            PaidAtUtc = DateTime.UtcNow
        };

        await _uow.ExecuteInTransactionAsync(async () =>
        {
            _uow.MonthlyContracts.Update(contract);
            await _uow.Payments.AddAsync(payment, ct);
            await _uow.SaveChangesAsync(ct);
        }, ct);

        return MapToDto(contract);
    }

    public async Task CancelAsync(Guid contractId, CancellationToken ct = default)
    {
        var contract = await _uow.MonthlyContracts.GetByIdAsync(contractId, ct)
            ?? throw new NotFoundException(nameof(MonthlyContract), contractId);

        contract.Status = ContractStatus.DaHuy;
        _uow.MonthlyContracts.Update(contract);

        if (contract.FixedSlotId is not null)
        {
            var slot = await _uow.ParkingSlots.GetByIdAsync(contract.FixedSlotId.Value, ct);
            if (slot is not null)
            {
                slot.Status = SlotStatus.Trong;
                slot.Type = SlotType.Thuong;
                _uow.ParkingSlots.Update(slot);
            }
        }

        await _uow.SaveChangesAsync(ct);
    }

    public async Task<PagedResult<MonthlyContractDto>> GetExpiringSoonAsync(Guid parkingLotId, int withinDays, int pageNumber, int pageSize, CancellationToken ct = default)
    {
        var thresholdDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(withinDays);

        var query = _uow.MonthlyContracts.Query()
            .Where(c => c.ParkingLotId == parkingLotId
                        && c.Status == ContractStatus.DangHoatDong
                        && c.EndDate <= thresholdDate)
            .OrderBy(c => c.EndDate);

        var totalCount = query.Count();
        var pageItems = query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        return new PagedResult<MonthlyContractDto>
        {
            Items = pageItems.Select(MapToDto).ToList(),
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    private static MonthlyContractDto MapToDto(MonthlyContract c) => new(
        c.Id,
        c.Vehicle?.LicensePlate ?? "N/A",
        c.CustomerUser?.FullName ?? "N/A",
        c.FixedSlot?.Code,
        c.StartDate,
        c.EndDate,
        c.MonthlyFee,
        c.Status.ToString(),
        c.AutoRenew);
}
