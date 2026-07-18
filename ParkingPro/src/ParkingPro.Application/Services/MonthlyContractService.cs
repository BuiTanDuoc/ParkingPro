using ParkingPro.Application.Common;
using ParkingPro.Application.Common.Exceptions;
using ParkingPro.Application.DTOs.MonthlyContracts;
using ParkingPro.Application.Interfaces;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;
using ParkingPro.Shared.Constants;

namespace ParkingPro.Application.Services;

public class MonthlyContractService : IMonthlyContractService
{
    private readonly IUnitOfWork _uow;
    private readonly IPricingService _pricingService;
    private readonly IFileStorageService _fileStorage;

    public MonthlyContractService(IUnitOfWork uow, IPricingService pricingService, IFileStorageService fileStorage)
    {
        _uow = uow;
        _pricingService = pricingService;
        _fileStorage = fileStorage;
    }

    public async Task<MonthlyContractDto> CreateAsync(
        CreateMonthlyContractRequest request, Guid staffUserId,
        Stream? vehiclePhotoStream, string? vehiclePhotoFileName, CancellationToken ct = default)
    {
        if (request.NumberOfMonths <= 0)
            throw new BadRequestException("Số tháng đăng ký phải lớn hơn 0.");

        var customer = await _uow.Users.GetByIdAsync(request.CustomerUserId, ct)
            ?? throw new NotFoundException(nameof(User), request.CustomerUserId);

        var vehicle = await _uow.Vehicles.FirstOrDefaultAsync(v => v.LicensePlate == request.LicensePlate, ct);
        var isNewVehicle = vehicle is null;
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

        // Ảnh xe: ưu tiên ảnh vừa upload (nếu có); nếu xe chưa từng có ảnh thì dùng ảnh mặc định.
        // Không upload lại nếu xe cũ đã có ảnh từ trước và lần này không gửi ảnh mới.
        if (vehiclePhotoStream is not null && !string.IsNullOrWhiteSpace(vehiclePhotoFileName))
        {
            vehicle.PhotoUrl = await _fileStorage.SaveAsync(vehiclePhotoStream, vehiclePhotoFileName, "vehicles", ct);
            if (!isNewVehicle) _uow.Vehicles.Update(vehicle);
        }
        else if (string.IsNullOrEmpty(vehicle.PhotoUrl))
        {
            vehicle.PhotoUrl = AppConstants.DefaultPhotos.DefaultVehiclePhotoUrl;
            if (!isNewVehicle) _uow.Vehicles.Update(vehicle);
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

        // contract vừa tạo đã có sẵn Vehicle/CustomerUser/FixedSlot gán thủ công ở trên nên map trực tiếp được, không cần fetch lại
        return await MapToDtoAsync(contract, ct);
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

        return await MapToDtoAsync(contract, ct);
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

        var items = new List<MonthlyContractDto>();
        foreach (var contract in pageItems)
            items.Add(await MapToDtoAsync(contract, ct));

        return new PagedResult<MonthlyContractDto>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<MonthlyContractDto> GetActiveContractBySlotAsync(Guid slotId, CancellationToken ct = default)
    {
        var contract = await _uow.MonthlyContracts.FirstOrDefaultAsync(
            c => c.FixedSlotId == slotId && c.Status != ContractStatus.DaHuy, ct)
            ?? throw new NotFoundException("Hợp đồng vé tháng cho slot", slotId);

        return await MapToDtoAsync(contract, ct);
    }

    /// <summary>
    /// Map sang DTO, tự fetch Vehicle/CustomerUser/FixedSlot nếu chưa được load kèm (vì
    /// IRepository.Query()/GetByIdAsync không hỗ trợ Include — xem ghi chú tương tự ở SlotService).
    /// Nếu contract được truyền vào đã tự gán sẵn navigation (như lúc CreateAsync) thì không cần fetch lại.
    /// </summary>
    private async Task<MonthlyContractDto> MapToDtoAsync(MonthlyContract c, CancellationToken ct)
    {
        var vehicle = c.Vehicle ?? await _uow.Vehicles.GetByIdAsync(c.VehicleId, ct);
        var customer = c.CustomerUser ?? await _uow.Users.GetByIdAsync(c.CustomerUserId, ct);

        ParkingSlot? fixedSlot = c.FixedSlot;
        if (fixedSlot is null && c.FixedSlotId is not null)
            fixedSlot = await _uow.ParkingSlots.GetByIdAsync(c.FixedSlotId.Value, ct);

        return new MonthlyContractDto(
            c.Id,
            vehicle?.LicensePlate ?? "N/A",
            vehicle?.PhotoUrl,
            customer?.FullName ?? "N/A",
            fixedSlot?.Code,
            c.StartDate,
            c.EndDate,
            c.MonthlyFee,
            c.Status.ToString(),
            c.AutoRenew);
    }
}
